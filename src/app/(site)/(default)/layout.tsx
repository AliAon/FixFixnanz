import React from "react";
import Sidebar from "@/components/sidebar/page";
import ScrollToTop from "@/components/shared/ScrollToTop";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <main className="my-48 w-full px-[20px] max-w-[1330px] mx-auto">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
        <div className="flex sm:flex-col pt-12 sm:gap-10 xsm:flex-col xsm:gap-10">
          <Sidebar />
          <div className="w-full pl-[20px] xsm:pl-[0px] xsm:justify-center xsm:flex xsm:items-center xsm:flex-col sm:pl-[0px]">
            {children}
          </div>
        </div>
        <ScrollToTop />
      </main>
    </ProtectedRoute>
  );
}
