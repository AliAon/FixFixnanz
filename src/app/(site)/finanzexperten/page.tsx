"use client";

import React, { useState, useEffect } from "react";
import SidebarPage from "../experts/sidebar/page";
import Card from "@/components/shared/ExpertCard/page";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "@/redux/slices/usersSlice";
import { RootState, AppDispatch } from "@/redux/store";

const ExpertsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, isLoading } = useSelector((state: RootState) => state.users);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);
  // const [filters, setFilters] = useState({
  //   selectedRatings: [] as number[],
  //   selectedCategories: [] as string[],
  //   searchTerm: "",
  //   location: ""
  // });

  // const handleFilterChange = (newFilters: Partial<typeof filters>) => {
  //   setFilters(prev => ({ ...prev, ...newFilters }));
  // };

  // Fetch users with role financial-advisor
  useEffect(() => {
    dispatch(fetchUsers({ roles: ["financial-advisor"] }));
  }, [dispatch]);

  // Get category_id and name from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get("category_id");
    const name = urlParams.get("name");
    setSelectedCategory(categoryId || null);
    setCategoryName(name || "");
    setIsInitialized(true);
  }, []);

  // Filter users by category_id
  const filteredUsers = selectedCategory
    ? users.filter((user) => user.category_id === selectedCategory)
    : users;

  // Helper for category name (optional, if you want to show it)
  // const getCurrentCategoryName = (): string => {
  //   if (selectedCategory === null) return "All Experts";
  //   const category = categories.find((cat) => cat.id === selectedCategory);
  //   return category ? `${category.name} Experts` : "All Experts";
  // };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  console.log(filteredUsers, "filteredUsers");
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex my-12 w-full px-[20px] mt-40 sm:flex-col sm:gap-10 xsm:flex-col xsm:gap-10 max-w-[1330px] mx-auto">
        <SidebarPage />

        <div className="w-full pl-[30px] xsm:pl-[0px] sm:pl-[0px]">
          {!isInitialized ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-2 xsm:grid-cols-1 gap-4 xsm:justify-center xsm:flex xsm:items-center xsm:flex-col">
              {filteredUsers.map((user) => (
                <Card
                  key={user.id}
                  image={"/images/agent-2.jpg"}
                  name={user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name || user.last_name || "No Name"}
                  title={categoryName || "Financial Advisor"}
                  address={"Bad Hersfeld Hessen"}
                  total_reviews={0}
                  id={user.id}
                  onCardClick={(id) => console.log("Card clicked:", id)}
                  average_rating={0}
                  userId={user.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                No experts found for this category
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="mt-4 px-6 py-2 bg-[#1879BD] text-white rounded-md hover:bg-[#1567A3] transition-colors"
              >
                Show All Experts
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertsPage;
