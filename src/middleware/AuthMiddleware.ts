import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parse } from "cookie";

const publicPaths = [
  "/registration",
  "/password-reset",
  "/",
  "/auth/google/callback",
  "/not-found",
];

const loginPath = "/login";

const adminOnlyRoutes = [
  "/admin/categories",
  "/admin/sub-category",
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

const roleRouteMap: Record<string, string[]> = {
  user: ["/customer-dashboard"],
  "financial-advisor": [
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
  ],
  admin: ["*"],
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const cookies = parse(request.headers.get("cookie") || "");
  const token = cookies["token"];
  const userDataStr = cookies["userData"];

  if (path === loginPath || path.startsWith(`${loginPath}/`)) {
    if (token && userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        const userRole = userData?.role;

        if (userRole === "admin" || userRole === "financial-advisor") {
          return NextResponse.redirect(new URL("/admin", request.url));
        } else if (userRole === "user") {
          return NextResponse.redirect(
            new URL("/customer-dashboard", request.url)
          );
        }
      } catch (error) {
        console.error("Error in middleware:", error);
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  if (publicPaths.some((p) => path === p || path.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const userData = userDataStr ? JSON.parse(userDataStr) : null;
    const userRole = userData?.role;

    if (!userData || !userRole) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (userRole === "financial-advisor") {
      const isAdminOnlyRoute = adminOnlyRoutes.some(
        (route) => path === route || path.startsWith(`${route}/`)
      );

      if (isAdminOnlyRoute) {
        return NextResponse.redirect(new URL("/not-found", request.url));
      }
    }

    const allowedRoutes = roleRouteMap[userRole] || [];

    if (userRole === "admin") {
      return NextResponse.next();
    }

    const hasAccess = allowedRoutes.some(
      (route) => route === "*" || path === route || path.startsWith(`${route}/`)
    );

    if (!hasAccess) {
      return NextResponse.redirect(new URL("/not-found", request.url));
    }
  } catch (error) {
    console.error("Error in middleware:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
