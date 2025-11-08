import { ReactNode } from "react";

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
  <div className={`bg-gray-800 shadow-lg rounded-xl h-full flex flex-col p-4 md:p-6 ${className}`}>
    <div className="flex items-center mb-4">
      <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg mr-3">
        {icon}
      </div>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
    </div>
    <div className="text-gray-300 grow space-y-2">{children}</div>
  </div>
);

export default InfoCard;