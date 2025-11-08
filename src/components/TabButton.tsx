const TabButton: React.FC<{
  title: string;
  tabName: string;
  active: boolean;
  setActiveTab: (tabName: string) => void;
}> = ({ title, tabName, active, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(tabName)}
    className={`font-semibold py-2 px-4 rounded-t-lg transition-colors duration-200 ${
      active ? "text-white bg-gray-800" : "text-gray-400 hover:text-white"
    }`}
  >
    {title}
  </button>
);

export default TabButton;
