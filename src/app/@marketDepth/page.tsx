"use client";
import { InfoCard } from "@components";
import { Newspaper } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import LoadingSpinner from "./loading";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ErrorMessage from "./error";

const inDepthAnalysis: string = "...";

const MarketDepth = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marketDepth, setMarketDepth] = useState<string>(inDepthAnalysis);

  const retryHandler = () => {
    fetchMarketData();
  };

  /**
   * Fetches the market depth.
   */
  const fetchMarketData = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("Fetching new market data from /api/marketDepth...");

    try {
      const response = await fetch("/api/marketDepth");

      if (!response.ok) {
        // Handle API errors (like 500)
        const errorData = await response.json();
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
      }

      const jsonData = await response.json();

      setMarketDepth(jsonData?.inDepthAnalysis);
      console.log("Data fetched successfully:", jsonData);
    } catch (err: unknown) {
      console.error("Failed to fetch sector performance:", err);
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
      {/* --- In-Depth Market Analysis --- */}
      <InfoCard
        title="In-Depth Market Analysis"
        icon={<Newspaper className="w-6 h-6" />}
        className="lg:col-span-3"
      >
        <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {marketDepth}
          </ReactMarkdown>
        </div>
      </InfoCard>
    </div>
  );
};

export default MarketDepth;
