// ContractDashboard.tsx
import { fetchContracts } from "@/redux/slices/contractsSlice";
import { fetchCategories, ContractCategory } from "@/redux/slices/contractCategoriesSlice";
import { AppDispatch, RootState } from "@/redux/store";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaPlus, FaUpload, FaCheck } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

const CategoryIcon = ({ imageUrl, name }: { imageUrl?: string; name: string }) => {
  return (
    <div className="text-blue-500">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={name} className="w-full h-full object-contain" />
      ) : (
        // Fallback icon if no image is provided
        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-500 text-sm">{name}</span>
        </div>
      )}
    </div>
  );
};

const Tooltip = ({
  content,
  visible,
}: {
  content: string;
  visible: boolean;
}) => {
  if (!visible) return null;

  return (
    <div className="absolute -top-4 left-1/2 transform font-roboto -translate-x-1/2 bg-base text-white px-3 py-1 rounded text-sm whitespace-nowrap z-10">
      {content}
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-base rotate-45"></div>
    </div>
  );
};

const CategoryCard = ({ category, hasContracts }: { category: ContractCategory; hasContracts: boolean }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="bg-[#EFF0F0] rounded-xl p-2 cursor-pointer  relative flex flex-col items-center justify-center w-full h-full max-w-[110px] max-h-[110px] sm:max-w-full sm:max-h-full xsm:max-w-full xsm:max-h-full"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Tooltip content={category.name} visible={showTooltip} />
      <div className="relative w-32 h-32">
        <CategoryIcon imageUrl={category.image} name={category.name} />
      </div>
      <div className={`absolute bottom-3 right-3 rounded-full w-5 h-5 flex items-center justify-center shadow-md ${
        hasContracts 
          ? 'bg-green-500 text-white' 
          : 'bg-base text-white'
      }`}>
        {hasContracts ? (
          <FaCheck size={12} />
        ) : (
          <FaPlus size={14} />
        )}
      </div>
    </div>
  );
};

const ProgressCircle = ({
  current,
  total,
}: {
  current: number;
  total: number;
}) => {
  const percentage = (current / total) * 100;
  const circumference = 2 * Math.PI * 120; // radius = 120
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="w-full h-full" viewBox="0 0 256 256">
        <circle
          cx="128"
          cy="128"
          r="120"
          fill="none"
          stroke="#F3F4F6"
          strokeWidth="16"
        />
        {current > 0 && (
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="16"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 128 128)"
          />
        )}
        <text
          x="128"
          y="128"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-3xl font-bold fle"
          fill="#4B5563"
        >
          {current}/{total}
        </text>
      </svg>
    </div>
  );
};

const ContractDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const contractsData = useSelector(
    (state: RootState) => state.contracts.contracts
  );
  const categoriesData = useSelector(
    (state: RootState) => state.contractCategories.categories
  );
  const categoriesLoading = useSelector(
    (state: RootState) => state.contractCategories.loading
  );

  // Helper function to check if contracts exist for a category
  const checkCategoryHasContracts = (categoryId: number): boolean => {
    return contractsData.some(contract => 
      // Check multiple possible relationships between contracts and categories
      contract.service_id === categoryId.toString() ||
      contract.category === categoryId.toString() ||
      contract.category?.toLowerCase() === categoriesData.find(cat => cat.id === categoryId)?.name.toLowerCase()
    );
  };

  useEffect(() => {
    async function fetchData() {
      await dispatch(fetchContracts());
      await dispatch(fetchCategories());
    }
    fetchData();
  }, [dispatch]);

  return (
    <div className="flex w-full justify-between gap-8 sm:flex-col xsm:flex-col">
      <div className="bg-white rounded-lg px-6 py-3 shadow-sm flex flex-col items-center justify-center w-full max-w-[270px] sm:max-w-full xsm:max-w-full ">
        <h2 className="text-xl font-bold mb-4 text-center">No contracts yet</h2>
        <ProgressCircle current={contractsData.length} total={6} />
        {contractsData.length === 0 && (
          <Link 
            href="/contract/create" 
            className="mt-6 bg-[#1477BC] hover:bg-[#0F5A93] text-white py-2 px-4 rounded-lg flex items-center transition-colors"
          >
            <FaUpload className="mr-2" />
            Upload contracts now
          </Link>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-2 sm:max-w-full gap-4 w-full max-w-xl xsm:max-w-full xsm:grid-cols-2">
        {categoriesLoading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-gray-200 rounded-xl p-2 animate-pulse flex flex-col items-center justify-center w-full h-full max-w-[110px] max-h-[110px] sm:max-w-full sm:max-h-full xsm:max-w-full xsm:max-h-full"
            >
              <div className="relative w-32 h-32 bg-gray-300 rounded"></div>
            </div>
          ))
        ) : (
          categoriesData.map((category) => (
            <CategoryCard 
              key={category.id} 
              category={category} 
              hasContracts={checkCategoryHasContracts(category.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ContractDashboard;
