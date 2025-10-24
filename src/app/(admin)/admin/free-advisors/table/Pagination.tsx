import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchFinancialAdvisorUsers } from "@/redux/slices/usersSlice";

const Pagination: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    financialAdvisorCurrentPage, 
    financialAdvisorTotalPages,
    financialAdvisorCurrentFilters
  } = useSelector((state: RootState) => state.users);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= financialAdvisorTotalPages) {
      // Preserve current filters when changing pages
      dispatch(fetchFinancialAdvisorUsers({ 
        ...financialAdvisorCurrentFilters,
        page, 
        limit: 10 
      }));
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, financialAdvisorCurrentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(financialAdvisorTotalPages, startPage + maxVisiblePages - 1);
    
    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 mx-1 rounded ${
            i === financialAdvisorCurrentPage
              ? "bg-primary text-white"
              : "bg-white text-primary border border-gray-300 hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  if (financialAdvisorTotalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <div className="flex items-center">
        <span className="text-sm text-gray-700">
          Page {financialAdvisorCurrentPage} of {financialAdvisorTotalPages}
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Previous button */}
        <button
          onClick={() => handlePageChange(financialAdvisorCurrentPage - 1)}
          disabled={financialAdvisorCurrentPage === 1}
          className={`px-3 py-2 rounded ${
            financialAdvisorCurrentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-primary border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Previous
        </button>

        {/* Page numbers */}
        {renderPageNumbers()}

        {/* Next button */}
        <button
          onClick={() => handlePageChange(financialAdvisorCurrentPage + 1)}
          disabled={financialAdvisorCurrentPage === financialAdvisorTotalPages}
          className={`px-3 py-2 rounded ${
            financialAdvisorCurrentPage === financialAdvisorTotalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-primary border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination; 