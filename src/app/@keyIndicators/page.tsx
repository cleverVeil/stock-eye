"use client";
import { InfoCard } from "@components";
import { useCallback, useEffect, useState } from "react";
import LoadingSpinner from "./loading";
import ErrorMessage from "./error";
import { Activity } from "lucide-react";

type KeyIndicatorsProp = {
  indiaVix: { current: string; change: string; changePercent: string };
  putCallRatio: { nifty: string };
  marketBreadth: { advancers: number; decliners: number; unchanged: number };
};

const initialKeyIndicators: KeyIndicatorsProp = {
  indiaVix: { current: "...", change: "...", changePercent: "..." },
  putCallRatio: { nifty: "..." },
  marketBreadth: { advancers: 0, decliners: 0, unchanged: 0 },
};

const KeyIndicators = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyIndicators, setKeyIndicators] =
    useState<KeyIndicatorsProp>(initialKeyIndicators);

  const retryHandler = () => {
    fetchMarketData();
  };
  /**
   * Fetches the global indices.
   */
  const fetchMarketData = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("Fetching new market data from /api/keyIndicators...");

    try {
      const response = await fetch("/api/keyIndicators");

      if (!response.ok) {
        // Handle API errors (like 500)
        const errorData = await response.json();
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
      }

      const jsonData = await response.json();

      setKeyIndicators(jsonData?.keyIndicators);
      console.log("Data fetched successfully:", jsonData);
    } catch (err: unknown) {
      console.error("Failed to fetch key indicators:", err);
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage onRetry={retryHandler} />;
  }

  return (
    <div>
      {/* --- Key Indicators (NEW) --- */}
      <InfoCard title="Key Indicators" icon={<Activity className="w-6 h-6" />}>
        <div className="space-y-3">
          {/* India VIX */}
          <div className="flex items-center justify-between">
            <span className="text-gray-300 font-medium">India VIX</span>
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
            <span className="text-gray-300 font-medium">Nifty PCR</span>
            <span className="text-lg font-semibold text-white">
              {keyIndicators.putCallRatio.nifty}
            </span>
          </div>
          {/* Market Breadth */}
          <div className="flex items-center justify-between">
            <span className="text-gray-300 font-medium">Market Breadth</span>
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
  );
};

export default KeyIndicators;
