"use client";
import { InfoCard } from "@components";
import { Globe, Landmark } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import LoadingSpinner from "./loading";
import ErrorMessage from "./error";

type MarketOutlookData = {
  india: { nifty: string; bankNifty: string; tone: string };
  global: string;
};

const initialMarketOutlook: MarketOutlookData = {
  india: { nifty: "...", bankNifty: "...", tone: "..." },
  global: "...",
};

const MarketOutlook = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marketOutlook, setMarketOutlook] =
    useState<MarketOutlookData>(initialMarketOutlook);

  const retryHandler = () => {
    fetchMarketData();
  };

  /**
   * Fetches the market outlook.
   */
  const fetchMarketData = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("Fetching new market data from /api/marketOutlook...");

    try {
      const response = await fetch("/api/marketOutlook");

      if (!response.ok) {
        // Handle API errors (like 500)
        const errorData = await response.json();
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
      }

      const jsonData = await response.json();

      setMarketOutlook(jsonData?.marketOutlook);
      console.log("Data fetched successfully:", jsonData);
    } catch (err: unknown) {
      console.error("Failed to fetch market outlook:", err);
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
            {marketOutlook?.india?.nifty}
          </p>
          <p>
            <strong className="text-gray-200">Bank Nifty:</strong>{" "}
            {marketOutlook?.india?.bankNifty}
          </p>
          <p>
            <strong className="text-gray-200">Tone:</strong>{" "}
            {marketOutlook?.india?.tone}
          </p>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <Globe className="w-5 h-5 mr-2" /> Global
          </h3>
          <p>{marketOutlook?.global}</p>
        </div>
      </InfoCard>
    </div>
  );
};

export default MarketOutlook;
