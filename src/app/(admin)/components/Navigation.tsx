import Link from "next/link";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation = ({ activeTab, setActiveTab }: NavigationProps) => {
  const tabs = [
    "Advisors",
    "Calendar",
    "Graph & Overview",
    "Offers",
    "AV Vertag",
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <ul className="flex flex-wrap -mb-px">
        {tabs.map((tab) => (
          <li key={tab} className="mr-2">
            <Link
              href=""
              onClick={() => setActiveTab(tab)}
              className={`inline-block py-2 px-4  rounded-t-lg ${
                activeTab === tab
                  ? "text-blue-500 border-gray-300 border border-b-0"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
            >
              {tab}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Navigation;
