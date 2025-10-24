"use client";
import { useState, useEffect } from "react";
import StarRating from "@/components/shared/StarRating";
import React from "react";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "@/redux/slices/categoriesSlice";
import { AppDispatch, RootState } from "@/redux/store";

interface FilterState {
  selectedRatings: number[];
  selectedCategories: string[];
  searchTerm: string;
  location: string;
}

interface SidebarProps {
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  filters: FilterState;
}

interface RatingFilterItem {
  id: number;
  rating: number;
  selected: boolean;
}

export function SidebarComponent({ onFilterChange, filters }: SidebarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const categories = useSelector(
    (state: RootState) => state.categories.categories
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    dispatch(fetchCategories());
  }, [dispatch]);

  // Ensure all filter properties have default values
  const safeFilters = {
    selectedRatings: filters?.selectedRatings || [],
    selectedCategories: filters?.selectedCategories || [],
    searchTerm: filters?.searchTerm || "",
    location: filters?.location || "",
  };

  const [ratingItems, setRatingItems] = useState<RatingFilterItem[]>([
    { id: 1, rating: 5, selected: false },
    { id: 2, rating: 4, selected: false },
    { id: 3, rating: 3, selected: false },
    { id: 4, rating: 2, selected: false },
    { id: 5, rating: 1, selected: false },
  ]);

  // Handle rating change
  const handleRatingChange = (id: number, newRating: number) => {
    setRatingItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, rating: newRating } : item
      )
    );
  };

  // Toggle rating selection
  const toggleRatingSelection = (rating: number) => {
    const newSelectedRatings = safeFilters.selectedRatings.includes(rating)
      ? safeFilters.selectedRatings.filter((r) => r !== rating)
      : [...safeFilters.selectedRatings, rating];

    onFilterChange({ selectedRatings: newSelectedRatings });
  };

  // Handle category selection
  const handleCategoryChange = (categoryName: string, isChecked: boolean) => {
    const newSelectedCategories = isChecked
      ? [...safeFilters.selectedCategories, categoryName]
      : safeFilters.selectedCategories.filter((cat) => cat !== categoryName);

    onFilterChange({ selectedCategories: newSelectedCategories });
  };

  // Handle search input
  const handleSearchChange = (searchTerm: string) => {
    onFilterChange({ searchTerm });
  };

  // Handle location input
  const handleLocationChange = (location: string) => {
    onFilterChange({ location });
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="w-full md:max-w-[285px] h-full lg:max-w-[300px] xl:max-w-[325px] bg-white py-6 px-8 rounded-lg shadow">
        <h2 className="text-[24px] font-bold font-roboto text-secondary mb-5">
          Financial expert Find
        </h2>
        <div className="border-t border-[#E7E7E7] "></div>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-6 mt-5"></div>
          <div className="h-6 bg-gray-200 rounded mb-3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:max-w-[285px] h-full lg:max-w-[300px] xl:max-w-[325px] bg-white py-6 px-8 rounded-lg shadow">
      <h2 className="text-[24px] font-bold font-roboto text-secondary mb-5">
        Financial expert Find
      </h2>
      <div className="border-t border-[#E7E7E7] "></div>

      <div className="relative mb-6 mt-5">
        <input
          type="text"
          placeholder="search"
          value={safeFilters.searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-3 pr-10 py-3 bg-[#FFF0F3] text-[#757585] font-roboto rounded-lg focus:outline-none"
        />
        <button className="absolute right-1 top-[5px] p-2">
          <FaSearch size={20} />
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-[24px] font-bold font-roboto text-secondary mb-3">
          Financial services select
        </h3>
        <div className="border-t border-[#E7E7E7] my-5 "></div>

        <div className="space-y-4">
          {categories?.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between"
            >
              <label className="flex items-center space-x-2 text-[10px] text-gray-600 hover:text-gray-800">
                <input
                  type="checkbox"
                  checked={safeFilters.selectedCategories.includes(category.id)}
                  onChange={(e) =>
                    handleCategoryChange(category.id, e.target.checked)
                  }
                  className="rounded border-gray-200 cursor-pointer"
                />
                <span className="text-[#647082] text-[16px] font-roboto font-normal cursor-pointer">
                  {category.name}
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 pt-8 ">
        <h3 className="text-[24px] font-bold font-roboto text-secondary mb-3">
          Sort rating
        </h3>
        <div className="border-t border-[#E7E7E7] my-4"></div>

        <div className="space-y-4 p-4">
          <h3 className="font-semibold">Filter by Rating</h3>

          {ratingItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between space-x-4"
            >
              <input
                type="checkbox"
                checked={safeFilters.selectedRatings.includes(item.rating)}
                onChange={() => toggleRatingSelection(item.rating)}
                className="form-checkbox rounded border-gray-300"
              />

              <StarRating
                initialRating={item.rating}
                onChange={(rating) => handleRatingChange(item.id, rating)}
                size="md"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[26px] capitalize font-bold font-roboto text-secondary mb-3">
          Location
        </h3>

        <div className="border-t border-[#E7E7E7] mt-3 mb-5"></div>

        <input
          type="text"
          placeholder="Enter the location ..."
          value={safeFilters.location}
          onChange={(e) => handleLocationChange(e.target.value)}
          className="w-full px-3 font-roboto py-2 border border-gray-400 rounded-sm focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
}
