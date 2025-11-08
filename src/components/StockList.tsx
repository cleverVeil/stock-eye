import { AlertTriangle, TrendingUp } from "lucide-react";

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
          <Icon className={`w-5 h-5 mr-2 shrink-0 ${color}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
};

export default StockList;