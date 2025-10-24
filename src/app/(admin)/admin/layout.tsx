"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "@/components/admin/sidebar/page";
import Header from "@/components/admin/header/page";
import ScrollToTop from "@/components/shared/ScrollToTop";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { RootState, AppDispatch } from "@/redux/store";
import { fetchAdvisorProfile } from "@/redux/slices/advisorsSlice";
import Loader from "@/components/shared/Loader/Loader";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentAdvisor } = useSelector((state: RootState) => state.advisors);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isCheckingContract, setIsCheckingContract] = useState(true);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1000);
      if (window.innerWidth < 1000) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Check contract acceptance status
  useEffect(() => {
    const checkContractStatus = async () => {
      if (user?.role === "financial-advisor") {
        try {
          await dispatch(fetchAdvisorProfile()).unwrap();
        } catch (error) {
          console.error("Error fetching advisor profile:", error);
        } finally {
          setIsCheckingContract(false);
        }
      } else {
        setIsCheckingContract(false);
      }
    };

    checkContractStatus();
  }, [dispatch, user?.role]);

  // Redirect if contract not accepted
  useEffect(() => {
    if (!isCheckingContract && user?.role === "financial-advisor" && currentAdvisor) {
      const hasNotAcceptedContract =
        !currentAdvisor.advisor_contract_accepted ||
        !currentAdvisor.contract_accepted_at;

      if (hasNotAcceptedContract) {
        router.push('/admin');
      }
    }
  }, [currentAdvisor, user?.role, isCheckingContract, router]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Show loader while checking contract status
  if (isCheckingContract && user?.role === "financial-advisor") {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">Checking contract status...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "financial-advisor"]}>
      <div className="min-h-screen bg-[#F1F5F9]">
        <Header toggleSidebar={toggleSidebar} />

        <div className="flex relative">
          {isMobile && sidebarOpen && (
            <div
              className="fixed inset-0 bg-gray-800 bg-opacity-50 z-10"
              onClick={toggleSidebar}
            />
          )}

          <div
            className={`
            transition-all duration-300 ease-in-out 
            ${isMobile ? "fixed top-0 left-0 h-full z-20 pt-16" : "relative"} 
            ${sidebarOpen ? "w-64" : "w-0 overflow-hidden"}
          `}
          >
            <Sidebar isOpen={sidebarOpen} />
          </div>

          <main
            className={`
            flex-1 transition-all duration-300  overflow-x-hidden  py-10
            ${isMobile ? "w-full" : sidebarOpen ? "ml-0" : "ml-0"}
          `}
          >
            <div className="pt-12 sm:gap-10 xsm:gap-10">
              <div className="w-full pl-[0px] xsm:pl-[0px] xsm:justify-center xsm:flex xsm:flex-col sm:pl-[0px]">
                {children}
              </div>
            </div>
            <ScrollToTop />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}