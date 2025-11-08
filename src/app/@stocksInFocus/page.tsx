"use client";
import { InfoCard, StockList } from "@components";
import { Target } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import LoadingSpinner from "./loading";
import ErrorMessage from "./error";

type StocksInFocusProps = { positive: string[]; caution: string[] };

const initialStocksInFocus: StocksInFocusProps = {
  positive: ["..."],
  caution: ["..."],
};

const StocksInFocus = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stocksInFocus, setStocksInFocus] =
    useState<StocksInFocusProps>(initialStocksInFocus);

  const retryHandler = () => {
    fetchMarketData();
  };

  /**
   * Fetches the sector in focus.
   */
  const fetchMarketData = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("Fetching new market data from /api/stocksInFocus...");

    try {
      const response = await fetch("/api/stocksInFocus");

      if (!response.ok) {
        // Handle API errors (like 500)
        const errorData = await response.json();
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
      }

      const jsonData = await response.json();

      setStocksInFocus(jsonData?.stocksInFocus);
      console.log("Data fetched successfully:", jsonData);
    } catch (err: unknown) {
      console.error("Failed to fetch stocks in focus:", err);
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
    <InfoCard
      title="Stocks in Focus"
      icon={<Target className="w-6 h-6" />}
      className="lg:col-span-1"
    >
      <h3 className="text-lg font-semibold text-green-400 mb-2">Positive</h3>
      <StockList items={stocksInFocus.positive} type="positive" />
      <h3 className="text-lg font-semibold text-yellow-400 mt-4 mb-2">
        Caution
      </h3>
      <StockList items={stocksInFocus.caution} type="caution" />
    </InfoCard>
  );
};

export default StocksInFocus;
