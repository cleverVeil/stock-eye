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
  BarChart,
  Bar,
  Legend,
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
  BarChart as BarChartIcon,
  Package,
  Calendar,
  Layers,
  Activity,
  Ratio,
  Percent,
} from "lucide-react";

// --- Mock Data ---
// Updated to include all new fields from the API schema
const getInitialData = () => ({
  reportDate: "Loading...",
  marketOutlook: {
    india: { nifty: "...", bankNifty: "...", tone: "..." },
    global: "...",
  },
  globalIndices: [
    { name: "Dow Jones", last: "...", change: "...", changePercent: "..." },
    { name: "NASDAQ", last: "...", change: "...", changePercent: "..." },
  ],
  keyIndicators: {
    indiaVix: { current: "...", change: "...", changePercent: "..." },
    putCallRatio: { nifty: "..." },
    marketBreadth: { advancers: 0, decliners: 0, unchanged: 0 },
  },
  fiiDiiFlows: [
    { date: "YYYY-MM-DD", fiiNet: "...", diiNet: "..." },
    { date: "YYYY-MM-DD", fiiNet: "...", diiNet: "..." },
  ],
  sectoralPerformance: [
    { sector: "Nifty IT", changePercent: "..." },
    { sector: "Nifty Bank", changePercent: "..." },
  ],
  sectorOutlook: {
    positive: ["..."],
    caution: ["..."],
  },
  stocksInFocus: {
    positive: ["..."],
    caution: ["..."],
  },
  tradingView: {
    nifty: "...",
    bankNifty: "...",
    strategy: "...",
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
      support2: 57200,
      resistance1: 58200,
      resistance2: 58500,
    },
  },
  ipoListings: [
    {
      ipoName: "...",
      gmp: "...",
      applyStartDate: "...",
      applyEndDate: "...",
      listingDate: "...",
      companySummary: "...",
      companyDetailsUrl: "#",
    },
  ],
  inDepthAnalysis: "Loading analysis...",
});

// --- Type Definitions ---
// Define types for the data structures
type GlobalIndex = {
  name: string;
  last: string;
  change: string;
  changePercent: string;
};
type FiiDiiFlow = {
  date: string;
  fiiNet: string;
  diiNet: string;
};
type SectorPerformance = {
  sector: string;
  changePercent: string;
};
type IpoListing = {
  ipoName: string;
  gmp: string;
  applyStartDate: string;
  applyEndDate: string;
  listingDate: string;
  companySummary: string;
  companyDetailsUrl: string;
};
type ReportData = {
  reportDate: string;
  marketOutlook: {
    india: { nifty: string; bankNifty: string; tone: string };
    global: string;
  };
  globalIndices: GlobalIndex[];
  keyIndicators: {
    indiaVix: { current: string; change: string; changePercent: string };
    putCallRatio: { nifty: string };
    marketBreadth: { advancers: number; decliners: number; unchanged: number };
  };
  fiiDiiFlows: FiiDiiFlow[];
  sectoralPerformance: SectorPerformance[];
  sectorOutlook: { positive: string[]; caution: string[] };
  stocksInFocus: { positive: string[]; caution: string[] };
  tradingView: {
    nifty: string;
    bankNifty: string;
    strategy: string;
    niftyLevels: {
      current: number;
      support1: number;
      support2: number;
      resistance1: number;
      resistance2: number;
    };
    bankNiftyLevels: {
      current: number;
      support1: number;
      support2: number;
      resistance1: number;
      resistance2: number;
    };
  };
  ipoListings: IpoListing[];
  inDepthAnalysis: string;
};

// --- Helper Components ---

/**
 * A reusable card component for displaying content sections.
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
        <li key={index} className="flex items-start">
          <Icon className={`w-5 h-5 mr-2 flex-shrink-0 ${color}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
};

/**
 * Gets the color for FII/DII flow values.
 */
const getFlowColor = (value: number) => {
  if (value > 0) return "text-green-400";
  if (value < 0) return "text-red-400";
  return "text-gray-400";
};

/**
 * Parses a currency string (e.g., "1,234 Cr" or "-567 Cr") into a number.
 */
const parseFlow = (flowStr: string): number => {
  if (!flowStr || typeof flowStr !== "string") return 0;
  const num = parseFloat(flowStr.replace(/,/g, "").replace(" Cr", ""));
  return isNaN(num) ? 0 : num;
};

/**
 * Gets the Tailwind CSS background color class for a sector's performance.
 */
const getHeatmapColor = (percentStr: string): string => {
  if (!percentStr || typeof percentStr !== "string") return "bg-gray-700";
  const value = parseFloat(percentStr.replace("%", ""));
  if (isNaN(value)) return "bg-gray-700";

  if (value > 2) return "bg-green-700 hover:bg-green-600";
  if (value > 0.5) return "bg-green-600 hover:bg-green-500";
  if (value > 0) return "bg-green-800 hover:bg-green-700";
  if (value < -2) return "bg-red-700 hover:bg-red-600";
  if (value < -0.5) return "bg-red-600 hover:bg-red-500";
  if (value < 0) return "bg-red-800 hover:bg-red-700";
  return "bg-gray-700 hover:bg-gray-600";
};

/**
 * Displays the sectoral performance as a heatmap.
 */
const SectorHeatmap: React.FC<{ sectors: SectorPerformance[] }> = ({
  sectors,
}) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
    {sectors.map((sector) => (
      <div
        key={sector.sector}
        className={`rounded-lg p-3 text-white transition-all duration-200 ${getHeatmapColor(
          sector.changePercent
        )}`}
      >
        <div className="font-semibold">{sector.sector}</div>
        <div className="text-lg">{sector.changePercent}</div>
      </div>
    ))}
  </div>
);

/**
 * Displays the IPO listings in a table.
 */
const IpoTable: React.FC<{ ipos: IpoListing[] }> = ({ ipos }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-700">
      <thead className="bg-gray-800">
        <tr>
          <th
            scope="col"
            className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
          >
            IPO Name
          </th>
          <th
            scope="col"
            className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
          >
            Apply Dates
          </th>
          <th
            scope="col"
            className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
          >
            Listing Date
          </th>
          <th
            scope="col"
            className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
          >
            GMP
          </th>
        </tr>
      </thead>
      <tbody className="bg-gray-900 divide-y divide-gray-700">
        {ipos.map((ipo) => (
          <tr key={ipo.ipoName} className="hover:bg-gray-800">
            <td className="py-4 px-4 whitespace-nowrap">
              <a
                href={ipo.companyDetailsUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-white hover:text-blue-400 hover:underline inline-flex items-center"
              >
                {ipo.ipoName}
                <ExternalLink className="w-4 h-4 ml-1.5 flex-shrink-0" />
              </a>
              <div className="text-xs text-gray-400 truncate max-w-xs">
                {ipo.companySummary}
              </div>
            </td>
            <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-300">
              {ipo.applyStartDate} to {ipo.applyEndDate}
            </td>
            <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-300">
              {ipo.listingDate}
            </td>
            <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-white">
              {ipo.gmp}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// --- Main Application Component ---

export default function App() {
  const [reportData, setReportData] = useState<ReportData>(getInitialData());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("market");

  /**
   * Fetches the market report from the Next.js API route.
   */
  const fetchMarketData = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("Fetching new market data from /api/marketReport...");

    try {
      const response = await fetch("/api/marketReport");

      if (!response.ok) {
        // Handle API errors (like 500)
        const errorData = await response.json();
        throw new Error(
          errorData.error || `API Error: ${response.statusText}`
        );
      }

      const jsonData: ReportData = await response.json();

      // --- DATA VALIDATION ---
      // Ensure all required top-level keys are present
      const requiredKeys: (keyof ReportData)[] = [
        "tradingView",
        "globalIndices",
        "sectorOutlook",
        "stocksInFocus",
        "keyIndicators",
        "fiiDiiFlows",
        "sectoralPerformance",
        "ipoListings",
      ];

      for (const key of requiredKeys) {
        if (!jsonData[key]) {
          console.error(`API Response missing key: ${key}`, jsonData);
          throw new Error(`API response missing required data: ${key}.`);
        }
      }

      setReportData(jsonData);
      console.log("Data fetched successfully:", jsonData);
    } catch (err: unknown) {
      console.error("Failed to fetch market data:", err);
      let message = "Something went wrong";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "string") {
        message = err;
      }
      setError(message);
      // Keep old data on error, don't reset
      // setReportData(getInitialData());
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
    textArea.style.position = "fixed";
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
      alert("Failed to copy. Please copy the text manually.");
    }

    document.body.removeChild(textArea);
  };

  // --- Memoized Data for Charts ---

  // Safely get chart levels from report data
  const niftyLevels = reportData.tradingView?.niftyLevels || {};
  const bankNiftyLevels = reportData.tradingView?.bankNiftyLevels || {};

  // Create dynamic chart data based on API's current value
  const dynamicNiftyChartData = useMemo(
    () => [
      { time: "Start", value: niftyLevels.current - 20 },
      { time: "Mid", value: niftyLevels.current + 30 },
      { time: "Current", value: niftyLevels.current },
    ],
    [niftyLevels.current]
  );

  const dynamicBankNiftyChartData = useMemo(
    () => [
      { time: "Start", value: bankNiftyLevels.current - 50 },
      { time: "Mid", value: bankNiftyLevels.current + 80 },
      { time: "Current", value: bankNiftyLevels.current },
    ],
    [bankNiftyLevels.current]
  );

  // Define Y-axis domain for charts
  const niftyDomain: [number, number] = [
    Math.min(niftyLevels.support2 || 25500) - 50,
    Math.max(niftyLevels.resistance2 || 26100) + 50,
  ];
  const bankNiftyDomain: [number, number] = [
    Math.min(bankNiftyLevels.support2 || 57200) - 100,
    Math.max(bankNiftyLevels.resistance2 || 58500) + 100,
  ];

  // Process FII/DII data for the bar chart
  const fiiDiiChartData = useMemo(() => {
    return (reportData.fiiDiiFlows || [])
      .map((flow) => ({
        date: new Date(flow.date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
        FII: parseFlow(flow.fiiNet),
        DII: parseFlow(flow.diiNet),
      }))
      .reverse(); // Show oldest data first
  }, [reportData.fiiDiiFlows]);

  // Safely get all other data
  const sectorOutlook = reportData.sectorOutlook || {
    positive: [],
    caution: [],
  };
  const stocksInFocus = reportData.stocksInFocus || {
    positive: [],
    caution: [],
  };
  const keyIndicators = reportData.keyIndicators || {
    indiaVix: {},
    putCallRatio: {},
    marketBreadth: {},
  };
  const globalIndices = reportData.globalIndices || [];
  const sectoralPerformance = reportData.sectoralPerformance || [];
  const ipoListings = reportData.ipoListings || [];

  // --- Tab Button Component ---
  const TabButton: React.FC<{
    title: string;
    tabName: string;
    active: boolean;
  }> = ({ title, tabName, active }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`font-semibold py-2 px-4 rounded-t-lg transition-colors duration-200 ${
        active
          ? "text-white bg-gray-800"
          : "text-gray-400 hover:text-white"
      }`}
    >
      {title}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 md:p-8 relative pb-20">
      <header className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Things to Know Today
          </h1>
          <p className="text-md text-gray-400">{reportData.reportDate}</p>
        </div>
        <button
          onClick={fetchMarketData}
          disabled={loading}
          className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
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

      {/* --- Tabs --- */}
      <nav className="flex border-b border-gray-700 mb-6">
        <TabButton
          title="Market Report"
          tabName="market"
          active={activeTab === "market"}
        />
        <TabButton
          title="IPO Listings"
          tabName="ipo"
          active={activeTab === "ipo"}
        />
      </nav>

      {/* --- Main Content --- */}
      <main className="space-y-6">
        {/* --- Market Tab Content --- */}
        {activeTab === "market" && (
          <div className="space-y-6">
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

              {/* --- Global Indices --- */}
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
                      {globalIndices.map((index) => {
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

              {/* --- Key Indicators (NEW) --- */}
              <InfoCard
                title="Key Indicators"
                icon={<Activity className="w-6 h-6" />}
              >
                <div className="space-y-3">
                  {/* India VIX */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium">
                      India VIX
                    </span>
                    <div className="text-right">
                      <span className="text-lg font-semibold text-white">
                        {keyIndicators.indiaVix.current}
                      </span>
                      <span
                        className={`ml-2 text-sm ${
                          keyIndicators.indiaVix.change?.startsWith("-")
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      >
                        {keyIndicators.indiaVix.change} (
                        {keyIndicators.indiaVix.changePercent})
                      </span>
                    </div>
                  </div>
                  {/* Put-Call Ratio */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium">
                      Nifty PCR
                    </span>
                    <span className="text-lg font-semibold text-white">
                      {keyIndicators.putCallRatio.nifty}
                    </span>
                  </div>
                  {/* Market Breadth */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium">
                      Market Breadth
                    </span>
                    <div className="text-right">
                      <span className="text-green-400">
                        {keyIndicators.marketBreadth.advancers} Adv
                      </span>{" "}
                      /{" "}
                      <span className="text-red-400">
                        {keyIndicators.marketBreadth.decliners} Dec
                      </span>
                    </div>
                  </div>
                </div>
              </InfoCard>
            </div>

            {/* --- Second Row --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* --- Charts --- */}
              <InfoCard
                title="Index Charts"
                icon={<TrendingUp className="w-6 h-6" />}
                className="lg:col-span-2"
              >
                <p className="text-sm text-gray-400 mb-4">
                  Illustrative charts showing current value against key
                  API-provided levels.
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
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#4B5563"
                        />
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
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#4B5563"
                        />
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

              {/* --- Trading View --- */}
              <InfoCard
                title="Trading View"
                icon={<Target className="w-6 h-6" />}
              >
                <h3 className="text-lg font-semibold text-white">Nifty 50</h3>
                <p className="text-sm">{reportData.tradingView.nifty}</p>
                <h3 className="text-lg font-semibold text-white mt-3">
                  Bank Nifty
                </h3>
                <p className="text-sm">{reportData.tradingView.bankNifty}</p>
                <h3 className="text-lg font-semibold text-white mt-3">
                  Strategy
                </h3>
                <p className="text-sm">{reportData.tradingView.strategy}</p>
              </InfoCard>
            </div>

            {/* --- Third Row --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* --- FII/DII Flows (NEW) --- */}
              <InfoCard
                title="FII/DII Net Flows (Last 5 Days)"
                icon={<BarChartIcon className="w-6 h-6" />}
                className="lg:col-span-2"
              >
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={fiiDiiChartData}
                      margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#4B5563"
                      />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" label={{ value: 'Net Flow (Cr)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "none",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#F9FAFB" }}
                        formatter={(value: number) => [
                          `${value.toFixed(0)} Cr`,
                          null,
                        ]}
                      />
                      <Legend />
                      <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="3 3" />
                      <Bar dataKey="FII" fill="#818CF8" />
                      <Bar dataKey="DII" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </InfoCard>

              {/* --- Sector Outlook --- */}
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

            {/* --- Fourth Row --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* --- Sector Heatmap (NEW) --- */}
              <InfoCard
                title="Sector Performance"
                icon={<Layers className="w-6 h-6" />}
                className="lg:col-span-2"
              >
                <SectorHeatmap sectors={sectoralPerformance} />
              </InfoCard>

              {/* --- Stocks in Focus --- */}
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
            </div>

            {/* --- Fifth Row --- */}
            <InfoCard
              title="In-Depth Market Analysis"
              icon={<Newspaper className="w-6 h-6" />}
              className="lg:col-span-3"
            >
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {reportData.inDepthAnalysis}
              </div>
            </InfoCard>
          </div>
        )}

        {/* --- IPO Tab Content --- */}
        {activeTab === "ipo" && (
          <div className="space-y-6">
            <InfoCard
              title="IPO Listings"
              icon={<Package className="w-6 h-6" />}
            >
              <IpoTable ipos={ipoListings} />
            </InfoCard>
          </div>
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

