"use client";
import { InfoCard } from "@components";
import {
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
import { BarChart as BarChartIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import LoadingSpinner from "./loading";
import ErrorMessage from "./error";

type FiiDiiFlow = {
  date: string;
  fiiNet: string;
  diiNet: string;
};

const initialInstitutionOutlook: FiiDiiFlow[] = [
  { date: "YYYY-MM-DD", fiiNet: "...", diiNet: "..." },
  { date: "YYYY-MM-DD", fiiNet: "...", diiNet: "..." },
];

/**
 * Parses a currency string (e.g., "1,234 Cr" or "-567 Cr") into a number.
 */
const parseFlow = (flowStr: string): number => {
  if (!flowStr || typeof flowStr !== "string") return 0;
  const num = parseFloat(flowStr.replace(/,/g, "").replace(" Cr", ""));
  return isNaN(num) ? 0 : num;
};

const InstitutionOutlook = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [institutionOutlook, setInstitutionOutlook] = useState<FiiDiiFlow[]>(
    initialInstitutionOutlook
  );

  // Process FII/DII data for the bar chart
  const fiiDiiChartData = useMemo(() => {
    return (institutionOutlook || [])
      .map((flow) => ({
        date: new Date(flow.date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
        FII: parseFlow(flow.fiiNet),
        DII: parseFlow(flow.diiNet),
      }))
      .reverse(); // Show oldest data first
  }, [institutionOutlook]);

  const retryHandler = () => {
    fetchMarketData();
  };

  /**
   * Fetches the market outlook.
   */
  const fetchMarketData = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("Fetching new market data from /api/institutionOutlook...");

    try {
      const response = await fetch("/api/institutionOutlook");

      if (!response.ok) {
        // Handle API errors (like 500)
        const errorData = await response.json();
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
      }

      const jsonData = await response.json();

      setInstitutionOutlook(jsonData?.fiiDiiFlows);
      console.log("Data fetched successfully:", jsonData);
    } catch (err: unknown) {
      console.error("Failed to fetch institution outlook:", err);
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
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis
              stroke="#9CA3AF"
              label={{
                value: "Net Flow (Cr)",
                angle: -90,
                position: "insideLeft",
                fill: "#9CA3AF",
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "none",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#F9FAFB" }}
              formatter={(value: number) => [`${value.toFixed(0)} Cr`, null]}
            />
            <Legend />
            <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="3 3" />
            <Bar dataKey="FII" fill="#818CF8" />
            <Bar dataKey="DII" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </InfoCard>
  );
};

export default InstitutionOutlook;
