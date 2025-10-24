"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { checkAuthStatus } from "@/redux/slices/authSlice";
import NotFound from "@/components/shared/NotFound";

const adminOnlyRoutes = [
  "/admin/categories",
  "/admin/sub-category",
  "/admin/contract-categories",
  "/admin/company",
  "/admin/support",
  "/admin/support-categories",
  "/admin/support-question-answer",
  "/admin/welcome-message",
  "/admin/roles",
  "/admin/users",
  "/admin/free-advisors",
  "/admin/advisors-manager",
  "/admin/lead",
  "/admin/forms",
  "/admin/leadpool-pipeline",
  "/admin/agency",
  "/admin/user-report",
  "/admin/agency-advisor",
  "/admin/active-meta-campaigns",
  "/admin/agency-pipeline",
  "/admin/co-admin",
  "/admin/co-admin-appoinment",
];

const financeAdvisorRoutes = [
  "/admin",
  "/admin/manage-profile",
  "/admin/consultations",
  "/admin/active-orders",
  "/admin/orders",
  "/admin/management",
  "/admin/calender",
  "/admin/email-templates",
  "/admin/signatures",
  "/admin/meeting",
  "/admin/pipelines",
  "/admin/overview",
  "/admin/pipeline",
  "/admin/package-marketing",
  "/admin/external-leads",
  "/admin/contracts",
  "/admin/advisor-contracts",
  "/admin/ratings",
  "/admin/settings",
  "/admin/admin-chat",
];

interface AuthState {
  isAuthenticated: boolean;
  user: {
    role: "user" | "financial-advisor" | "admin";
  } | null;
  isLoading: boolean;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("user" | "financial-advisor" | "admin")[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = ["user", "financial-advisor", "admin"],
}) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, isLoading } = useSelector(
    (state: RootState) => state.auth as AuthState
  );
  const [accessDenied, setAccessDenied] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await dispatch(checkAuthStatus());
      setInitialized(true);
    };
    init();
  }, [dispatch]);

  useEffect(() => {
    // Wait until authentication is checked and not loading
    if (!initialized || isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user) {
      const currentPath = window.location.pathname;

      // Check if user's role is allowed for this route
      if (!allowedRoles.includes(user.role)) {
        setAccessDenied(true);
        return;
      }

      // Handle role-specific permissions
      if (user.role === "user") {
        // If user tries to access any admin routes, deny access
        if (currentPath.startsWith("/admin")) {
          setAccessDenied(true);
          return;
        }
        // Users can access all non-admin routes
      } else if (user.role === "financial-advisor") {
        // Check if trying to access admin-only routes
        const isAttemptingAdminRoute = adminOnlyRoutes.some(
          (route) =>
            currentPath === route || currentPath.startsWith(`${route}/`)
        );

        if (isAttemptingAdminRoute) {
          setAccessDenied(true);
          return;
        }

        // For finance-advisors trying to access other admin routes
        if (currentPath.startsWith("/admin")) {
          const hasAccess = financeAdvisorRoutes.some(
            (route) =>
              currentPath === route || currentPath.startsWith(`${route}/`)
          );

          if (!hasAccess) {
            setAccessDenied(true);
            return;
          }
        }
        // Finance advisors can access all non-admin routes
      }
      // Admin role can access everything, no additional checks needed
    }
  }, [isAuthenticated, user, initialized, isLoading, router, allowedRoles]);

  // Show loading state
  if (isLoading || !initialized || (!isAuthenticated && !accessDenied)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show access denied
  if (accessDenied) {
    return <NotFound />;
  }

  // Render children if authenticated and has access
  return <>{children}</>;
};

export default ProtectedRoute;
