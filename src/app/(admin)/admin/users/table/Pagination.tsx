"use client";

import { useDispatch, useSelector } from "react-redux";
import { setCurrentPage, fetchUsersInfo, setCurrentFilters } from "@/redux/slices/usersSlice";
import { RootState } from "@/redux/store";
import { AppDispatch } from "@/redux/store";

const Pagination: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentPage, totalPages, totalUsers, currentFilters } = useSelector(
    (state: RootState) => state.users
  );

  // Get current page size from Redux state
  const currentPageSize = currentFilters.limit || 20;

  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      dispatch(setCurrentPage(page));
      // Fetch new data for the selected page using current filters
      dispatch(fetchUsersInfo({ 
        ...currentFilters,
        page: page, 
        limit: currentPageSize 
      }));
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    dispatch(setCurrentPage(1)); // Reset to first page
    // Fetch new data with new page size and update filters
    const newFilters = {
      ...currentFilters,
      page: 1,
      limit: newPageSize 
    };

    // Update the current filters in Redux
    dispatch(setCurrentFilters(newFilters));

    // Fetch with new filters
    dispatch(fetchUsersInfo(newFilters));
  };

  // Calculate correct display values
  const startEntry = (currentPage - 1) * currentPageSize + 1;
  const endEntry = Math.min(currentPage * currentPageSize, totalUsers);

  // Get page numbers to display
  const getPageNumbers = () => {
    const pages: (number | null)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        endPage = Math.min(5, totalPages - 1);
      }

      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 4);
      }

      if (startPage > 2) {
        pages.push(null);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push(null);
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex justify-between items-center py-4 px-2">
      {/* Left side - Page info and page size selector */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-500">
          Showing {startEntry} to {endEntry} of {totalUsers} entries
        </div>

        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Show:</span>
          <select
            value={currentPageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-500">per page</span>
        </div>
      </div>
      
      {/* Right side - Pagination buttons */}
      <div className="flex">
        {/* Previous button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative px-3 py-1 border-gray-300 border text-sm ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          Previous
        </button>
        
        {/* Page numbers */}
        {getPageNumbers().map((page, index) => (
          page === null ? (
            <span
              key={`ellipsis-${index}`}
              className="px-3 py-1 border-t border-b border-gray-300 text-gray-500 bg-white text-sm"
            >
              ...
            </span>
          ) : (
            <button
              key={`page-${page}`}
              onClick={() => handlePageChange(page as number)}
              className={`relative px-3 py-1 border border-gray-300 text-sm ${
                page === currentPage
                  ? "bg-blue-600 text-white border-blue-600 z-10"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              } ${index > 0 ? "-ml-px" : ""}`}
            >
              {page}
            </button>
          )
        ))}
        
        {/* Next button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative px-3 py-1 border-gray-300 border text-sm -ml-px ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;