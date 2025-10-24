"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SidebarComponent as Sidebar } from "@/components/experts/SidebarComponent";
import Card from "@/components/shared/ExpertCard/page";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPublicAdvisors,
  fetchPublicAdvisorProfile,
} from "@/redux/slices/advisorsSlice";
import { AppDispatch, RootState } from "@/redux/store";

// Types
interface FilterState {
  selectedRatings: number[];
  selectedCategories: string[];
  searchTerm: string;
  location: string;
}

interface PublicAdvisor {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  broker: boolean;
  freelancer: boolean;
  average_rating: number;
  total_reviews: number;
  total_views: number;
  location?: string;
  categories: {
    name: string;
    image?: string;
  };
  about?: string;
  service_title?: string;
  experience?: string;
  website?: string;
  languages?: string;
  specialties?: string;
  service_category_id?: string;
}

const ExpertsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redux states
  const publicAdvisors = useSelector(
    (state: RootState) => state.advisors.publicAdvisors
  ) as PublicAdvisor[];
  const isLoading = useSelector((state: RootState) => state.advisors.isLoading);
  const error = useSelector((state: RootState) => state.advisors.error);

  const [isMounted, setIsMounted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const [filters, setFilters] = useState<FilterState>({
    selectedRatings: [],
    selectedCategories: [],
    searchTerm: "",
    location: "",
  });

  // Fetch advisors on mount
  useEffect(() => {
    setIsMounted(true);
    dispatch(fetchPublicAdvisors({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Handle URL parameters
  useEffect(() => {
    const query = searchParams.get("query") || "";
    const categoryId = searchParams.get("categoryId");
    const rating = searchParams.get("rating");

    setFilters((prev) => ({
      ...prev,
      searchTerm: query,
      selectedCategories: categoryId ? [categoryId] : [],
      selectedRatings: rating ? [parseFloat(rating)] : [],
    }));
  }, [searchParams]);

  // Retry mechanism
  const handleRetry = useCallback(() => {
    if (retryCount < 3) {
      setRetryCount((prev) => prev + 1);
      dispatch(fetchPublicAdvisors({ page: 1, limit: 100 }));
    }
  }, [dispatch, retryCount]);

  // Filtering logic
  const filteredAdvisors = React.useMemo(() => {
    if (!Array.isArray(publicAdvisors)) return [];

    return publicAdvisors.filter((advisor) => {
      // Filter by rating
      if (filters.selectedRatings.length > 0) {
        const matchRating = filters.selectedRatings.some(
          (rating) => advisor.average_rating >= rating
        );
        if (!matchRating) return false;
      }

      // Filter by category
      if (filters.selectedCategories.length > 0) {
        const matchCategory = filters.selectedCategories.includes(
          advisor.service_category_id || ""
        );
        if (!matchCategory) return false;
      }

      // Filter by search term (name/title/about)
      if (filters.searchTerm) {
        const fullName = `${advisor.first_name || ""} ${
          advisor.last_name || ""
        }`.toLowerCase();
        const serviceTitle = (advisor.service_title || "").toLowerCase();
        const about = (advisor.about || "").toLowerCase();
        const searchTerm = filters.searchTerm.toLowerCase();

        if (
          !fullName.includes(searchTerm) &&
          !serviceTitle.includes(searchTerm) &&
          !about.includes(searchTerm)
        ) {
          return false;
        }
      }

      // Filter by location
      if (filters.location) {
        if (
          !advisor.location
            ?.toLowerCase()
            .includes(filters.location.toLowerCase())
        ) {
          return false;
        }
      }

      return true;
    });
  }, [publicAdvisors, filters]);

  // Update filters and sync URL
  const handleFilterChange = useCallback(
    (newFilters: Partial<FilterState>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));

      const params = new URLSearchParams(window.location.search);

      // Search term
      if (newFilters.searchTerm !== undefined) {
        if (newFilters.searchTerm) params.set("query", newFilters.searchTerm);
        else params.delete("query");
      }

      // Category
      if (newFilters.selectedCategories) {
        if (newFilters.selectedCategories.length > 0)
          params.set("categoryId", newFilters.selectedCategories[0]);
        else params.delete("categoryId");
      }

      // Rating
      if (newFilters.selectedRatings) {
        if (newFilters.selectedRatings.length > 0)
          params.set("rating", newFilters.selectedRatings[0].toString());
        else params.delete("rating");
      }

      router.push(`/experts?${params.toString()}`);
    },
    [router]
  );

  const handleCardClick = useCallback(
    (advisorId: string, userId: string) => {
      dispatch(fetchPublicAdvisorProfile(userId));
      router.push(`/experts/profile/${userId}`);
    },
    [dispatch, router]
  );

  // Skeleton
  const renderLoadingSkeleton = () => (
    <div className="flex my-48 w-full px-[20px] sm:flex-col sm:gap-10 xsm:flex-col xsm:gap-10 max-w-[1330px] mx-auto">
      <div className="w-full md:max-w-[285px] h-full lg:max-w-[300px] xl:max-w-[325px] bg-white py-6 px-8 rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="w-full grid grid-cols-3 sm:grid-cols-2 xsm:grid-cols-1 pl-[30px] gap-4 xsm:pl-[0px]">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-lg p-4 animate-pulse"
          >
            <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );

  // Error
  const renderErrorState = () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-red-500 text-center max-w-md mx-auto px-4">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold mb-2">Unable to Load Advisors</h2>
        <p className="text-gray-600 mb-4">
          {error?.includes("500")
            ? "Server error occurred. Please try again later."
            : error || "Something went wrong while loading the advisors."}
        </p>
        {retryCount < 3 ? (
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry ({3 - retryCount} attempts left)
          </button>
        ) : (
          <p className="text-sm text-gray-500 mt-2">
            Maximum retry attempts reached. Please refresh the page or contact
            support.
          </p>
        )}
      </div>
    </div>
  );

  // Empty
  const renderEmptyState = () => (
    <div className="col-span-full text-center py-16">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        No Advisors Found
      </h3>
      <p className="text-gray-500 mb-4">
        No approved financial advisors match your current filters.
      </p>
      <button
        onClick={() =>
          setFilters({
            selectedRatings: [],
            selectedCategories: [],
            searchTerm: "",
            location: "",
          })
        }
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );

  if (!isMounted || isLoading) return renderLoadingSkeleton();
  if (error) return renderErrorState();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex my-48 w-full px-[20px] sm:flex-col sm:gap-10 max-w-[1330px] mx-auto">
        {/* Sidebar */}
        <div className="w-full md:max-w-[285px] lg:max-w-[300px] xl:max-w-[325px]">
          <Sidebar onFilterChange={handleFilterChange} filters={filters} />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6 pl-[30px]">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Financial Advisors
            </h1>
          </div>

          <div className="w-full grid grid-cols-3 sm:grid-cols-2 xsm:grid-cols-1 pl-[30px] gap-4">
            {filteredAdvisors.length > 0
              ? filteredAdvisors.map((expert) => (
                  <Card
                    key={expert.user_id}
                    id={expert.id}
                    userId={expert.user_id}
                    image={expert.avatar_url || ""}
                    name={
                      `${expert.first_name || ""} ${
                        expert.last_name || ""
                      }`.trim() || "Financial Advisor"
                    }
                    title={
                      expert.categories?.name ||
                      expert.service_title ||
                      "Financial Advisor"
                    }
                    address={expert.location || ""}
                    total_reviews={expert.total_reviews || 0}
                    average_rating={expert.average_rating || 0}
                    onCardClick={handleCardClick}
                  />
                ))
              : renderEmptyState()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertsPage;
