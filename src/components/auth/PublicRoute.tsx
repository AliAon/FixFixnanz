"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAuthenticated && user) {
      if (user.role === "financial-advisor" || user.role === "admin") {
        window.location.href = "/admin";
      } else if (user.role === "user") {
        window.location.href = "/customer-dashboard";
      }
      return;
    }

    if (!isLoading && !isAuthenticated) {
      setShouldRender(true);
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (!shouldRender) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PublicRoute;
