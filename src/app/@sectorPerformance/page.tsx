"use client";
import { InfoCard } from "@components";
import { Layers } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import LoadingSpinner from "./loading";
import ErrorMessage from "./error";

type SectorPerformanceProps = {
  sector: string;
  changePercent: string;
};

const initialSectorPerformance: SectorPerformanceProps[] = [
  { sector: "Nifty IT", changePercent: "..." },
  { sector: "Nifty Bank", changePercent: "..." },
];

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
const SectorHeatmap: React.FC<{ sectors: SectorPerformanceProps[] }> = ({
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

const SectorPerformance = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectorPerformance, setSectorPerformance] = useState<
    SectorPerformanceProps[]
  >(initialSectorPerformance);

  const retryHandler = () => {
    fetchMarketData();
  };

  /**
   * Fetches the sector outlook.
   */
  const fetchMarketData = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("Fetching new market data from /api/sectorPerformance...");

    try {
      const response = await fetch("/api/sectorPerformance");

      if (!response.ok) {
        // Handle API errors (like 500)
        const errorData = await response.json();
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
      }

      const jsonData = await response.json();

      setSectorPerformance(jsonData?.sectoralPerformance);
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
    <InfoCard
      title="Sector Performance"
      icon={<Layers className="w-6 h-6" />}
      className="lg:col-span-2"
    >
      <SectorHeatmap sectors={sectorPerformance} />
    </InfoCard>
  );
};

export default SectorPerformance;
