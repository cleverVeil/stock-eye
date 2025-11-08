"use client";
import { InfoCard } from "@components";
import { ExternalLink, Package } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import LoadingSpinner from "./loading";
import ErrorMessage from "./error";

type IpoListing = {
  ipoName: string;
  gmp: string;
  applyStartDate: string;
  applyEndDate: string;
  listingDate: string;
  companySummary: string;
  companyDetailsUrl: string;
};

const ipoListings: IpoListing[] = [];

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
                <ExternalLink className="w-4 h-4 ml-1.5 shrink-0" />
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

const IpoWatch = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ipoListing, setIpoListing] =
    useState<IpoListing[]>(ipoListings);

  const retryHandler = () => {
    fetchMarketData();
  }

  /**
   * Fetches the global indices.
   */
  const fetchMarketData = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("Fetching new market data from /api/ipoWatch...");

    try {
      const response = await fetch("/api/ipoWatch");

      if (!response.ok) {
        // Handle API errors (like 500)
        const errorData = await response.json();
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
      }

      const jsonData = await response.json();

      setIpoListing(jsonData?.ipoListings);
      console.log("Data fetched successfully:", jsonData);
    } catch (err: unknown) {
      console.error("Failed to fetch ipo watch:", err);
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
    return <ErrorMessage  onRetry={retryHandler} />;
  }

  return (
    <InfoCard title="IPO Listings" icon={<Package className="w-6 h-6" />}>
      <IpoTable ipos={ipoListing} />
    </InfoCard>
  );
};

export default IpoWatch;
