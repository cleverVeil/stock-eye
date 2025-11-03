"use client";
import { useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import {
  RefreshCw,
  Share2,
  TrendingUp,
  AlertTriangle,
  Target,
  Globe,
  Landmark,
  Newspaper,
  Check,
  ExternalLink,
} from "lucide-react";

// --- Mock Data based on your provided text ---
// This is used for the initial state before the first API call
const getInitialData = () => ({
  reportDate: "November 3, 2025 (Monday)",
  marketOutlook: {
    india: {
      nifty: "Nifty close: 25,722 | Range: 25,500–26,100",
      bankNifty: "Fatigued after rally, 57,500 key support.",
      tone: "Cautious consolidation, profit-booking likely.",
    },
    global:
      "Fed cut (25 bps) → liquidity positive, but hawkish commentary tempers mood. US-India trade talks rhetoric positive, but 50% tariffs hurting exports. Rupee weak, importers under pressure. (Near all-time low ~88.70/USD)",
  },
  // New section for Global Indices
  globalIndices: [
    {
      name: "Dow Jones",
      last: "45,952.24",
      change: "-301.07",
      changePercent: "-0.65%",
    },
    {
      name: "NASDAQ",
      last: "17,800.12",
      change: "+50.45",
      changePercent: "+0.28%",
    },
    {
      name: "FTSE 100",
      last: "8,300.50",
      change: "-12.10",
      changePercent: "-0.15%",
    },
    {
      name: "Nikkei 225",
      last: "39,450.00",
      change: "+150.20",
      changePercent: "+0.38%",
    },
  ],
  // NEW: Split Sector and Stock data
  sectorOutlook: {
    positive: ["PSU Banks (Resilience)", "IT (Rupee tailwind)"],
    caution: ["Small-caps (SEBI overhang)", "Rupee-sensitive (Chemicals)"],
  },
  stocksInFocus: {
    positive: [
      "ITC (Strong outlook)",
      "L&T (Order book)",
      "DLF (Pre-sales)",
      "Ashoka Buildcon (Breakout)",
    ],
    caution: ["Select Small-caps"],
  },
  tradingView: {
    nifty: "Support: 25,700–25,500 | Resistance: 26,000–26,100",
    bankNifty: "Resistance: 58,200–58,500",
    strategy: "Stay stock-specific, use strict SL (volatility high).",
    // New structured data for charts
    niftyLevels: {
      current: 25722,
      support1: 25700,
      support2: 25500,
      resistance1: 26000,
      resistance2: 26100,
    },
    bankNiftyLevels: {
      current: 57776,
      support1: 57500,
      support2: 57200, // Added mock S2
      resistance1: 58200,
      resistance2: 58500,
    },
  },
  inDepthAnalysis:
    "Deconstructing the Previous Session (October 31, 2025): The Anatomy of a Pullback\n\nThe Indian equity markets concluded the previous week on a decidedly weak footing, with headline indices ending sharply lower for the second consecutive session. This pullback signals that profit-booking has gained significant momentum following a robust rally throughout October...\n\n(Full analysis would be populated here by the API)",
});

// --- Helper Functions ---

/**
 * A reusable card component for displaying content sections.
 * @param {{title: string, icon: React.ReactNode, children: React.ReactNode, className?: string}} props
 */
interface InfoCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  icon,
  children,
  className = "",
}) => (
  <div className={`bg-gray-800 shadow-lg rounded-xl p-4 md:p-6 ${className}`}>
    <div className="flex items-center mb-4">
      <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg mr-3">
        {icon}
      </div>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
    </div>
    <div className="text-gray-300 space-y-2">{children}</div>
  </div>
);

/**
 * A component for the list items in the "Stocks in Focus" card.
 * @param {{items: string[], type: 'positive' | 'caution'}} props
 */
interface StockListProps {
  items: string[];
  type: "positive" | "caution";
}

const StockList: React.FC<StockListProps> = ({ items, type }) => {
  const Icon = type === "positive" ? TrendingUp : AlertTriangle;
  const color = type === "positive" ? "text-green-400" : "text-yellow-400";

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-center">
          <Icon className={`w-5 h-5 mr-2 ${color}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
};

/**
 * Extracts a JSON object from a string that might contain other text or markdown.
 * @param {string} text - The raw text response from the API.
 * @returns {object} The parsed JSON object.
 */
function extractJson(text: string) {
  // Find the first '{' and the last '}' to extract the JSON block
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch && jsonMatch[0]) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("Failed to parse extracted JSON:", e);
      throw new Error("Response was not valid JSON.");
    }
  }
  console.error("No JSON object found in response:", text);
  throw new Error("No valid JSON object found in the response.");
}

// --- Removed TradingView Widget Component ---

// --- Main Application Component ---

export default function App() {
  const [reportData, setReportData] = useState(getInitialData());
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  /**
   * Fetches the market report from the Gemini API.
   */
  const fetchMarketData = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("Fetching new market data...");

    try {
      const response = await fetch("/api/marketReport");
      const result = await response.json();

      const candidate = result?.candidates?.[0];
      if (!candidate?.content?.parts?.[0]?.text) {
        throw new Error("Invalid response format");
      }

      if (candidate && candidate.content?.parts?.[0]?.text) {
        // 1. Extract the JSON data
        const responseText = candidate.content.parts[0].text;
        const jsonData = extractJson(responseText);

        // --- DATA VALIDATION ---
        // Ensure the nested level objects exist before setting state
        if (
          !jsonData.tradingView ||
          !jsonData.tradingView.niftyLevels ||
          !jsonData.tradingView.bankNiftyLevels ||
          !jsonData.globalIndices ||
          !Array.isArray(jsonData.globalIndices) ||
          !jsonData.sectorOutlook || // Added validation
          !jsonData.stocksInFocus // Added validation
        ) {
          console.error("API Response missing structured data:", jsonData);
          throw new Error(
            "API did not return the required structured data (levels, indices, sectors, or stocks)."
          );
        }

        setReportData(jsonData);

        // 2. Extract grounding sources
        let sourceLinks = [];
        const groundingMetadata = candidate.groundingMetadata;
        if (groundingMetadata && groundingMetadata.groundingChunks) {
          sourceLinks = groundingMetadata.groundingChunks
            .map((chunk: { web: { uri: string; title: string } }) => ({
              uri: chunk.web?.uri,
              title: chunk.web?.title,
            }))
            .filter(
              (source: { uri: string; title: string }) =>
                source.uri && source.title
            ) // Ensure sources are valid
            .filter(
              (
                source: { uri: string; title: string },
                index: number,
                self: Array<{ uri: string }>
              ) =>
                index ===
                self.findIndex((s: { uri: string }) => s.uri === source.uri)
            );
        }
        setSources(sourceLinks);
        console.log("Data fetched successfully:", jsonData);
        console.log("Sources found:", sourceLinks);
      } else if (result.promptFeedback) {
        // Handle cases where the prompt was blocked
        console.error("Request blocked:", result.promptFeedback);
        throw new Error(
          `Request was blocked: ${result.promptFeedback.blockReason}`
        );
      } else {
        throw new Error("Invalid response structure from API.");
      }
    } catch (err: unknown) {
      console.error("Failed to fetch market data:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "string") {
        setError(err);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on initial component mount
  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  /**
   * Handles the share button click.
   */
  const handleShare = () => {
    const shareText = `Market Outlook (${reportData.reportDate}):\nNifty: ${reportData.marketOutlook.india.nifty}\nBank Nifty: ${reportData.marketOutlook.india.bankNifty}\nTone: ${reportData.marketOutlook.india.tone}`;

    // Create a temporary textarea to use document.execCommand('copy')
    const textArea = document.createElement("textarea");
    textArea.value = shareText;
    textArea.style.position = "fixed"; // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      } else {
        throw new Error("Copy command failed");
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // Fallback for browsers that don't support execCommand
      alert("Failed to copy. Please copy the text manually.");
    }

    document.body.removeChild(textArea);
  };

  // Safely get chart levels from report data
  const niftyLevels = reportData.tradingView?.niftyLevels || {};
  const bankNiftyLevels = reportData.tradingView?.bankNiftyLevels || {};

  // Create dynamic chart data based on API's current value
  const dynamicNiftyChartData = useMemo(
    () => [
      {
        time: "Start",
        value: niftyLevels.current ? niftyLevels.current - 20 : 25700,
      },
      {
        time: "Mid",
        value: niftyLevels.current ? niftyLevels.current + 30 : 25750,
      },
      { time: "Current", value: niftyLevels.current || 25722 },
    ],
    [niftyLevels.current]
  );

  const dynamicBankNiftyChartData = useMemo(
    () => [
      {
        time: "Start",
        value: bankNiftyLevels.current ? bankNiftyLevels.current - 50 : 57700,
      },
      {
        time: "Mid",
        value: bankNiftyLevels.current ? bankNiftyLevels.current + 80 : 57850,
      },
      { time: "Current", value: bankNiftyLevels.current || 57776 },
    ],
    [bankNiftyLevels.current]
  );

  // Define Y-axis domain for charts
  const niftyDomain = [
    Math.min(niftyLevels.support2 || 25500) - 50,
    Math.max(niftyLevels.resistance2 || 26100) + 50,
  ];
  const bankNiftyDomain = [
    Math.min(bankNiftyLevels.support2 || 57200) - 100,
    Math.max(bankNiftyLevels.resistance2 || 58500) + 100,
  ];

  // Safely get sector and stock data
  const sectorOutlook = reportData.sectorOutlook || {
    positive: [],
    caution: [],
  };
  const stocksInFocus = reportData.stocksInFocus || {
    positive: [],
    caution: [],
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 md:p-8 relative pb-20">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Things to Know Today
          </h1>
          <p className="text-md text-gray-400">{reportData.reportDate}</p>
        </div>
        <button
          onClick={fetchMarketData}
          disabled={loading}
          className="flex items-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5 mr-2" />
          )}
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {error && (
        <div
          className="bg-red-800 border border-red-600 text-red-100 px-4 py-3 rounded-lg relative mb-6"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* --- Main Content Grid --- */}
      <main className="space-y-6">
        {/* --- Top Row --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* --- Market Outlook --- */}
          <InfoCard
            title="Market Outlook"
            icon={<Landmark className="w-6 h-6" />}
            className="lg:col-span-1"
          >
            <div>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                <span className="w-5 h-5 mr-2 rounded-full">🇮🇳</span> India
              </h3>
              <p>
                <strong className="text-gray-200">Nifty:</strong>{" "}
                {reportData.marketOutlook.india.nifty}
              </p>
              <p>
                <strong className="text-gray-200">Bank Nifty:</strong>{" "}
                {reportData.marketOutlook.india.bankNifty}
              </p>
              <p>
                <strong className="text-gray-200">Tone:</strong>{" "}
                {reportData.marketOutlook.india.tone}
              </p>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                <Globe className="w-5 h-5 mr-2" /> Global
              </h3>
              <p>{reportData.marketOutlook.global}</p>
            </div>
          </InfoCard>

          {/* --- Global Indices (NEW) --- */}
          <InfoCard
            title="Global Market Snapshot"
            icon={<Globe className="w-6 h-6" />}
            className="lg:col-span-1"
          >
            <div className="flow-root">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-2 pr-2 text-left text-sm font-semibold text-white"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-2 py-2 text-right text-sm font-semibold text-white"
                    >
                      Last
                    </th>
                    <th
                      scope="col"
                      className="px-2 py-2 text-right text-sm font-semibold text-white"
                    >
                      Chg. %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {reportData.globalIndices &&
                    reportData.globalIndices.map((index) => {
                      const isNegative =
                        index.change && index.change.startsWith("-");
                      return (
                        <tr key={index.name}>
                          <td className="py-2 pr-2 whitespace-nowrap text-sm font-medium text-gray-200">
                            {index.name}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300 text-right">
                            {index.last}
                          </td>
                          <td
                            className={`px-2 py-2 whitespace-nowrap text-sm font-medium text-right ${
                              isNegative ? "text-red-400" : "text-green-400"
                            }`}
                          >
                            {index.changePercent}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </InfoCard>

          {/* --- Trading View --- */}
          <InfoCard title="Trading View" icon={<Target className="w-6 h-6" />}>
            <h3 className="text-lg font-semibold text-white">Nifty 50</h3>
            <p className="text-sm">{reportData.tradingView.nifty}</p>
            <h3 className="text-lg font-semibold text-white mt-3">
              Bank Nifty
            </h3>
            <p className="text-sm">{reportData.tradingView.bankNifty}</p>
            <h3 className="text-lg font-semibold text-white mt-3">Strategy</h3>
            <p className="text-sm">{reportData.tradingView.strategy}</p>
          </InfoCard>
        </div>

        {/* --- Second Row (NEW LAYOUT) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* --- Charts --- */}
          <InfoCard
            title="Index Charts"
            icon={<TrendingUp className="w-6 h-6" />}
            className="lg:col-span-2"
          >
            <p className="text-sm text-gray-400 mb-4">
              Illustrative charts showing current value against key API-provided
              levels.
            </p>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Nifty 50 Chart */}
              <div className="w-full h-64 md:h-80">
                <h3 className="text-lg font-semibold text-white mb-2 text-center">
                  Nifty 50
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dynamicNiftyChartData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" domain={niftyDomain} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#F9FAFB" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Nifty 50"
                      stroke="#818CF8"
                      strokeWidth={2}
                      dot={true}
                    />

                    {/* Support and Resistance Lines */}
                    {niftyLevels.support1 && (
                      <ReferenceLine
                        y={niftyLevels.support1}
                        label={{
                          value: `S1 (${niftyLevels.support1})`,
                          position: "insideBottomLeft",
                          fill: "#CA8A04",
                        }}
                        stroke="#CA8A04"
                        strokeDasharray="3 3"
                      />
                    )}
                    {niftyLevels.support2 && (
                      <ReferenceLine
                        y={niftyLevels.support2}
                        label={{
                          value: `S2 (${niftyLevels.support2})`,
                          position: "insideBottomLeft",
                          fill: "#CA8A04",
                        }}
                        stroke="#CA8A04"
                        strokeDasharray="5 5"
                      />
                    )}
                    {niftyLevels.resistance1 && (
                      <ReferenceLine
                        y={niftyLevels.resistance1}
                        label={{
                          value: `R1 (${niftyLevels.resistance1})`,
                          position: "insideTopLeft",
                          fill: "#16A34A",
                        }}
                        stroke="#16A34A"
                        strokeDasharray="3 3"
                      />
                    )}
                    {niftyLevels.resistance2 && (
                      <ReferenceLine
                        y={niftyLevels.resistance2}
                        label={{
                          value: `R2 (${niftyLevels.resistance2})`,
                          position: "insideTopLeft",
                          fill: "#16A34A",
                        }}
                        stroke="#16A34A"
                        strokeDasharray="5 5"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Bank Nifty Chart */}
              <div className="w-full h-64 md:h-80">
                <h3 className="text-lg font-semibold text-white mb-2 text-center">
                  Bank Nifty
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dynamicBankNiftyChartData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" domain={bankNiftyDomain} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#F9FAFB" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Bank Nifty"
                      stroke="#F472B6"
                      strokeWidth={2}
                      dot={true}
                    />

                    {/* Support and Resistance Lines */}
                    {bankNiftyLevels.support1 && (
                      <ReferenceLine
                        y={bankNiftyLevels.support1}
                        label={{
                          value: `S1 (${bankNiftyLevels.support1})`,
                          position: "insideBottomLeft",
                          fill: "#CA8A04",
                        }}
                        stroke="#CA8A04"
                        strokeDasharray="3 3"
                      />
                    )}
                    {bankNiftyLevels.support2 && (
                      <ReferenceLine
                        y={bankNiftyLevels.support2}
                        label={{
                          value: `S2 (${bankNiftyLevels.support2})`,
                          position: "insideBottomLeft",
                          fill: "#CA8A04",
                        }}
                        stroke="#CA8A04"
                        strokeDasharray="5 5"
                      />
                    )}
                    {bankNiftyLevels.resistance1 && (
                      <ReferenceLine
                        y={bankNiftyLevels.resistance1}
                        label={{
                          value: `R1 (${bankNiftyLevels.resistance1})`,
                          position: "insideTopLeft",
                          fill: "#16A34A",
                        }}
                        stroke="#16A34A"
                        strokeDasharray="3 3"
                      />
                    )}
                    {bankNiftyLevels.resistance2 && (
                      <ReferenceLine
                        y={bankNiftyLevels.resistance2}
                        label={{
                          value: `R2 (${bankNiftyLevels.resistance2})`,
                          position: "insideTopLeft",
                          fill: "#16A34A",
                        }}
                        stroke="#16A34A"
                        strokeDasharray="5 5"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </InfoCard>

          {/* --- Sector Outlook (NEW) --- */}
          <InfoCard
            title="Sector Outlook"
            icon={<TrendingUp className="w-6 h-6" />}
            className="lg:col-span-1"
          >
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              Positive
            </h3>
            <StockList items={sectorOutlook.positive} type="positive" />
            <h3 className="text-lg font-semibold text-yellow-400 mt-4 mb-2">
              Caution
            </h3>
            <StockList items={sectorOutlook.caution} type="caution" />
          </InfoCard>
        </div>

        {/* --- Third Row (NEW LAYOUT) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* --- Stocks in Focus (MOVED & RENAMED) --- */}
          <InfoCard
            title="Stocks in Focus"
            icon={<Target className="w-6 h-6" />}
            className="lg:col-span-1"
          >
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              Positive
            </h3>
            <StockList items={stocksInFocus.positive} type="positive" />
            <h3 className="text-lg font-semibold text-yellow-400 mt-4 mb-2">
              Caution
            </h3>
            <StockList items={stocksInFocus.caution} type="caution" />
          </InfoCard>

          {/* --- In-Depth Analysis --- */}
          <InfoCard
            title="In-Depth Market Analysis"
            icon={<Newspaper className="w-6 h-6" />}
            className="lg:col-span-2"
          >
            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {reportData.inDepthAnalysis}
            </div>
          </InfoCard>
        </div>

        {/* --- Sources --- */}
        {sources.length > 0 && (
          <InfoCard
            title="Research Sources"
            icon={<ExternalLink className="w-6 h-6" />}
          >
            <ul className="space-y-2 list-disc list-inside">
              {sources.map((source: { uri: string; title: string }, index) => (
                <li key={index}>
                  <a
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    {source.title || source.uri}
                  </a>
                </li>
              ))}
            </ul>
          </InfoCard>
        )}
      </main>

      {/* --- Share Button --- */}
      <button
        onClick={handleShare}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white font-bold p-4 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 z-50"
        aria-label="Share Report"
      >
        {copied ? (
          <Check className="w-6 h-6" />
        ) : (
          <Share2 className="w-6 h-6" />
        )}
      </button>

      {/* --- Copied Tooltip --- */}
      {copied && (
        <div className="fixed bottom-20 right-6 bg-gray-700 text-white text-sm py-2 px-3 rounded-lg shadow-lg z-50">
          Copied summary to clipboard!
        </div>
      )}
    </div>
  );
}
