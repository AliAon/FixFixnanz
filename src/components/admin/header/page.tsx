"use client";
import React, { useState, useRef, useEffect } from "react";
//import Image from "next/image";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { logout } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import { FaBars } from "react-icons/fa6";
import { toast } from "react-toastify";
import { fetchCategoryById, fetchCategories } from "@/redux/slices/categoriesSlice";
import { fetchProfileData } from "@/redux/slices/profileSlice";
import { MdAdminPanelSettings } from "react-icons/md";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropDownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Get user data from Redux store
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { categories, category, isLoading: categoriesLoading } = useSelector(
    (state: RootState) => state.categories
  );
  const hasAdminTokens =
    typeof window !== "undefined" &&
    localStorage.getItem("admin_token") !== null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // Close the dropdown when clicking outside, not the sidebar
        setIsDropDownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    toggleSidebar();
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Successfully logged out");
    router.push("/login");
  };

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProfileData());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Fetch all categories on component mount to ensure we have the category data
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  useEffect(() => {
    if (user?.category_id) {
      // Fetch the specific category for this user
      dispatch(fetchCategoryById(user.category_id));
      
      // Also ensure we have all categories if they haven't been fetched yet
      if (categories.length === 0) {
        dispatch(fetchCategories());
      }
    }
  }, [dispatch, user, categories.length]);

  const getFirstName = () => {
    if (!user) return "";

    // Check if profile exists and has first_name
    if (user && user.first_name) {
      return user.first_name;
    }

    // Fallback to username if available
    if (user && user.username) {
      return user.username;
    }

    return "";
  };

  // Handle switching back to admin account
  const handleSwitchBackToAdmin = async () => {
    try {
      // Display loading toast to indicate process is happening
      const loadingToast = toast.loading("Switching back to admin account...");
      // Retrieve admin tokens
      const adminToken = localStorage.getItem("admin_token");
      const adminUserStr = localStorage.getItem("admin_user");
      const adminRefreshToken = localStorage.getItem("admin_refresh_token");

      if (!adminToken || !adminUserStr) {
        toast.error("No admin session found");
        toast.dismiss(loadingToast);
        return;
      }

      // Parse admin user data
      const adminUser = JSON.parse(adminUserStr);

      // Restore admin tokens
      localStorage.setItem("token", adminToken);
      localStorage.setItem("user", adminUserStr);
      if (adminRefreshToken)
        localStorage.setItem("refreshToken", adminRefreshToken);

      // Clear impersonation flags and backup tokens
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      localStorage.removeItem("admin_refresh_token");
      localStorage.removeItem("isImpersonating");

      // Update API headers
      // if (window && window.api) {
      //   window.api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
      // }

      // Update Redux state
      dispatch({
        type: "auth/setCredentials",
        payload: {
          user: adminUser,
          token: adminToken,
          refreshToken: adminRefreshToken || "",
        },
      });

      // Add a slight delay before reloading to give time for state updates
      setTimeout(() => {
        toast.dismiss(loadingToast);
        toast.success("Switched back to admin account");

        // Force a full page reload to refresh all data and API calls
        window.location.href = "/admin";
      }, 800);
    } catch (error) {
      console.error("Switch back error:", error);
      toast.error("Failed to switch back to admin");
    }
  };

  // Get category name (without using hooks inside)
  const getCategoryName = () => {
    if (!user || user.role !== "financial-advisor" || !user.category_id) {
      return "";
    }

    // Debug logging
    console.log('Getting category name for user:', {
      userId: user.id,
      categoryId: user.category_id,
      role: user.role,
      individualCategory: category,
      categoriesArray: categories,
      categoriesCount: categories.length
    });

    // First check if we have the individual category from fetchCategoryById
    if (category && category.id === user.category_id) {
      console.log('Found category from individual fetch:', category.name);
      return category.name;
    }

    // Fallback to searching in categories array from fetchCategories
    const foundCategory = categories.find((cat) => cat.id === user.category_id);
    if (foundCategory) {
      console.log('Found category from categories array:', foundCategory.name);
      return foundCategory.name;
    }

    console.log('No category found, returning empty string');
    return "";
  };

  {console.log("User Avatar URL:", user?.avatar_url)}

  return (
    <header className="fixed top-0 left-0 right-0 bg-base text-white z-30">
      <div className="flex justify-between items-center px-4 py-2">
        <div className="flex flex-row-reverse justify-between items-center w-full max-w-[260px] xsm:flex-row xsm:justify-start">
          <button
            onClick={handleToggle}
            className="mr-4 text-[#8096A8] bg-transparent border-none transition-colors"
            aria-label="Toggle sidebar"
          >
            <FaBars size={18} />
          </button>

          <Link href="/" className="text-xl font-semibold">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt=""
              className="h-[56px] xsm:h-[36px]  ml-3"
            />
          </Link>
        </div>
        <div className="flex items-center">
        {hasAdminTokens && (
            <button
              onClick={handleSwitchBackToAdmin}
              className="bg-[#28a745] text-white text-sm px-4 py-3 rounded-xl font-roboto flex items-center font-medium"
            >
              <MdAdminPanelSettings size={18} className="mr-1" />
              Back to Admin
            </button>
          )}
        <div className="relative" ref={dropdownRef}>
          
          <div
            className="flex items-center justify-between cursor-pointer bg-base text-white p-3"
            onClick={() => setIsDropDownOpen(!isDropdownOpen)}
          >
            <div className="flex items-center">
              <div className="mr-2 text-[1.25rem] font-bold leading-5 flex flex-col">
                {getFirstName() || ""}
                {user?.role === "financial-advisor" ? (
                  <span className="font-medium text-[1rem]">
                    {categoriesLoading ? "Loading..." : (getCategoryName() || "Finance Advisor")}
                  </span>
                ) : null}
              </div>
              <div className="rounded-full bg-white flex items-center justify-center overflow-hidden h-12 w-12 border-2 border-white">
                <img
                  src={user?.avatar_url && user.avatar_url !== '' ? user.avatar_url : "/images/agent-2.jpg"}
                  alt="User Avatar"
                  width={45}
                  height={45}
                  className="object-cover"
                />
              </div>
            </div>
            <div className="ml-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                className={`transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              >
                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
              </svg>
            </div>
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 w-40 bg-white rounded shadow-lg mt-1 z-50 overflow-hidden border border-gray-200">
              <Link
                href="/"
                className="block px-4 py-2 text-gray-800 bg-white hover:bg-[#E9ECEF]"
              >
                Go to HomePage
              </Link>
              {/* Add conditional rendering for admin users page */}
              {user?.role === "admin" && (
                <Link
                  href="/admin/users"
                  className="block px-4 py-2 text-gray-800 bg-white hover:bg-[#E9ECEF]"
                >
                  Manage Users
                </Link>
              )}
              <Link
                href="/admin/manage-profile"
                className="block px-4 py-2 text-gray-800 bg-white hover:bg-[#E9ECEF] border-b-[1.5px] border-black"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 bg-white duration-0 border-none text-gray-800 hover:bg-[#E9ECEF]"
              >
                Logout
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
