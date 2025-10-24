"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
// import api from "@/redux/api/axiosConfig";
import { IoMdMail, IoMdCall } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { toast, ToastContainer } from "react-toastify";

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();

  // Get authentication state from Redux
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  // Check if admin tokens exist in localStorage
  const hasAdminTokens = typeof window !== 'undefined' && localStorage.getItem('admin_token') !== null;

  useEffect(() => {
    const handleScroll = (): void => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getLinkClass = (path: string): string => {
    const isActive = pathname === path;
    return isActive
      ? "text-[#8CD3FF] font-bold hover:text-[#8CD3FF] text-[16px] duration-300"
      : "text-white hover:text-[#8CD3FF] font-normal text-[16px] duration-300";
  };

  // Determine the dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!user || !isAuthenticated) return "/login";

    if (user.role === "admin" || user.role === "financial-advisor") {
      return "/admin";
    } else {
      return "/customer-dashboard";
    }
  };

  // Button text based on authentication state
  const getAuthButtonText = () => {
    if (isAuthenticated) {
      return "Dashboard";
    } else {
      return "Login / To register";
    }
  };

  // Handle switching back to admin account
  const handleSwitchBackToAdmin = async () => {

    try {
      // Display loading toast to indicate process is happening
      const loadingToast = toast.loading("Switching back to admin account...");
      // Retrieve admin tokens
      const adminToken = localStorage.getItem('admin_token');
      const adminUserStr = localStorage.getItem('admin_user');
      const adminRefreshToken = localStorage.getItem('admin_refresh_token');
  
      if (!adminToken || !adminUserStr) {
        toast.error("No admin session found");
        toast.dismiss(loadingToast);
        return;
      }
  
      // Parse admin user data
      const adminUser = JSON.parse(adminUserStr);
  
      // Restore admin tokens
      localStorage.setItem('token', adminToken);
      localStorage.setItem('user', adminUserStr);
      if (adminRefreshToken) localStorage.setItem('refreshToken', adminRefreshToken);
  
      // Clear impersonation flags and backup tokens
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('isImpersonating');
  
      // Update API headers
      // if (window && window.api) {
      //   window.api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
      // }
  
      // Update Redux state
      dispatch({
        type: 'auth/setCredentials',
        payload: {
          user: adminUser,
          token: adminToken,
          refreshToken: adminRefreshToken || ""
        }
      });
  
      // Add a slight delay before reloading to give time for state updates
      setTimeout(() => {
        toast.dismiss(loadingToast);
        toast.success("Switched back to admin account");
        
        // Force a full page reload to refresh all data and API calls
        window.location.href = '/admin';
      }, 800);
    } catch (error) {
      console.error("Switch back error:", error);
      toast.error("Failed to switch back to admin");
    }
  };

  return (
    <header className="w-full fixed top-0 left-0 right-0 z-50">
        <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div
        className={`bg-white transition-all duration-300 ${
          scrolled ? "-translate-y-full" : "translate-y-0"
        }`}
        style={{ padding: "12px 0" }}
      >
        <div className="w-full px-4 h-full max-w-[1330px] mx-auto">
          <div className="flex justify-start items-center sm:justify-center xsm:flex-col xsm:gap-2 w-full h-full gap-6">
            <a
              href="tel:+49341581193401"
              className="text-md font-medium hover:opacity-[0.8] transition text-black flex items-center gap-1"
            >
              <IoMdCall className="rotate-[-100deg]" fill="#2D5A84" size={20} />{" "}
              +49 341 58193401
            </a>
            <a
              href="mailto:contact@fixfinanz.de"
              className="text-md font-medium hover:opacity-[0.8] transition text-black flex items-center gap-1"
            >
              <IoMdMail fill="#2D5A84" size={20} /> contact@fixfinanz.de
            </a>
          </div>
        </div>
      </div>

      <nav
        className={`bg-[#002B4E] transition-all duration-300 ${
          scrolled ? "fixed top-0 left-0 right-0 shadow-lg z-50" : ""
        }`}
      >
        <div className="px-4 max-w-[1330px] mx-auto">
          <div className="flex justify-between items-center h-20 sm:h-16">
            <div className="flex items-center max-w-[800px] w-full justify-between">
              <Link href="/" className="flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="Fixfinanz"
                  className="max-w-[215px] max-h-[50px] w-auto"
                />
              </Link>

              <div
                className={`hidden lg:block xl:block md:block items-center space-x-8 font-ppagrandir`}
              >
                <Link href="/" className={getLinkClass("/")}>
                  Home
                </Link>
                <Link href="/experts" className={getLinkClass("/experts")}>
                  Financial advisor
                </Link>
                <Link
                  href="/financial-services"
                  className={getLinkClass("/financial-services")}
                >
                  Financial services
                </Link>
                <Link
                  href="/financial-check"
                  className="bg-[#F30A21] text-white px-4 py-2 rounded-md text-[18px] duration-300"
                >
                  Financial check
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Back to Admin button - only show when admin tokens exist */}
              {hasAdminTokens && (
                <button
                  onClick={handleSwitchBackToAdmin}
                  className="bg-[#28a745] text-white text-sm px-4 py-3 rounded-xl font-roboto hidden md:flex lg:flex xl:flex items-center font-medium"
                >
                  <MdAdminPanelSettings size={18} className="mr-1" />
                  Back to Admin
                </button>
              )}

              <Link
                href={getDashboardUrl()}
                className="bg-white text-sm px-5 py-3 rounded-xl text-secondary font-roboto hidden md:flex lg:flex xl:flex items-center font-medium"
              >
                <FaUser fill="#2D5A84" size={14} className="mr-1" />
                {getAuthButtonText()}
              </Link>

              <button
                className="lg:hidden xl:hidden md:hidden text-white bg-[#244E76] py-[6px]"
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div
          className={`fixed top-0 left-0 h-full w-80 bg-[#002B4E] transform transition-transform duration-300 ease-in-out z-50 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } [min-width:1070px]:hidden`}
        >
          <div className="p-8">
            <div className="flex items-center justify-between w-full">
              <Link href="/" className="flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Fixfinanz" className=" h-16" />
              </Link>
              <button
                onClick={toggleMobileMenu}
                className="text-black bg-transparent border-none mb-8"
                aria-label="Close mobile menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className={`flex flex-col space-y-4 mt-12 font-ppagrandir`}>
              {/* Back to Admin button in mobile menu */}
              {hasAdminTokens && (
                <div className="border-b-[1px] pb-3 border-[#7E8F9D]">
                  <button
                    onClick={handleSwitchBackToAdmin}
                    className="bg-[#28a745] text-white p-2 rounded-lg flex items-center justify-center w-full"
                  >
                    <MdAdminPanelSettings size={18} className="mr-2" />
                    Back to Admin
                  </button>
                </div>
              )}
              
              <div className="border-b-[1px] pb-3 border-[#7E8F9D]">
                <Link
                  href="/"
                  className={getLinkClass("/")}
                  onClick={toggleMobileMenu}
                >
                  Home
                </Link>
              </div>
              <div className="border-b-[1px] pb-3 border-[#7E8F9D]">
                <Link
                  href="experts"
                  className={getLinkClass("/experts")}
                  onClick={toggleMobileMenu}
                >
                  Financial advisor
                </Link>
              </div>
              <div className="border-b-[1px] pb-3 border-[#7E8F9D]">
                <Link
                  href="/financial-services"
                  className={getLinkClass("/financial-services")}
                  onClick={toggleMobileMenu}
                >
                  Financial services
                </Link>
              </div>
              <div className="border-b-[1px] pb-5 border-[#7E8F9D]">
                <Link
                  href="/financial-check"
                  className="bg-[#F30A21] text-white px-4 py-2 rounded-md text-md w-fit"
                  onClick={toggleMobileMenu}
                >
                  Financial check
                </Link>
              </div>
              <Link
                href={getDashboardUrl()}
                className="bg-[#1477BC] p-2 text-sm rounded-lg text-white flex items-center justify-center"
              >
                <FaUser fill="#fff" size={14} className="mr-2" />
                {getAuthButtonText()}
              </Link>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 [min-width:1070px]:hidden"
            onClick={toggleMobileMenu}
          />
        )}
      </nav>
    </header>
  );
};

export default Header;