"use client";
import { InfoCard } from "@components";
import { Globe } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import LoadingSpinner from "./loading";
import ErrorMessage from "./error";

type GlobalIndex = {
  name: string;
  last: string;
  change: string;
  changePercent: string;
};

type globalIndices = GlobalIndex[];

const initialGlobalIndices: globalIndices = [];

const GlobalIndices = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalIndices, setGlobalIndices] =
    useState<globalIndices>(initialGlobalIndices);

  const retryHandler = () => {
    fetchMarketData();
  };

  /**
   * Fetches the global indices.
   */
  const fetchMarketData = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("Fetching new market data from /api/globalIndices...");

    try {
      const response = await fetch("/api/globalIndices");

      if (!response.ok) {
        // Handle API errors (like 500)
        const errorData = await response.json();
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
      }

      const jsonData = await response.json();

      setGlobalIndices(jsonData?.globalIndices);
      console.log("Data fetched successfully:", jsonData);
    } catch (err: unknown) {
      console.error("Failed to fetch global indices:", err);
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
              {globalIndices?.map((index) => {
                const isNegative = index.change && index.change.startsWith("-");
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
    </div>
  );
};

export default GlobalIndices;
