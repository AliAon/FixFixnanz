"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import api from "@/redux/api/axiosConfig";
import { setCredentials } from "@/redux/slices/authSlice";
import { AppDispatch } from "@/redux/store";

const GoogleCallbackContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Debug: Log the entire URL and all parameters
        console.log("Full callback URL:", window.location.href);
        console.log(
          "All search params:",
          Object.fromEntries([...searchParams.entries()])
        );

        // Debug: Check URL hash for tokens (sometimes used for security)
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        console.log(
          "Hash parameters:",
          Object.fromEntries(hashParams.entries())
        );

        // Check if this is part of an impersonation flow
        const isImpersonating =
          localStorage.getItem("isImpersonating") === "true";
        console.log("Is impersonation flow:", isImpersonating);

        // Try to find the token in various possible locations
        let accessToken = searchParams.get("access_token");
        let refreshToken = searchParams.get("refresh_token");

        // Check other common parameter names if access_token is not found
        if (!accessToken) {
          accessToken =
            searchParams.get("token") ||
            searchParams.get("id_token") ||
            searchParams.get("auth_token") ||
            hashParams.get("access_token") ||
            hashParams.get("token");

          console.log("Found alternative token:", accessToken);
        }

        // Check if there's a code parameter (OAuth flow)
        const authCode = searchParams.get("code");
        if (authCode && !accessToken) {
          console.log("Found auth code, will exchange for token:", authCode);
          try {
            // Exchange code for token if using authorization code flow
            const tokenResponse = await api.post("/auth/token", {
              code: authCode,
            });
            accessToken = tokenResponse.data.access_token;
            refreshToken = tokenResponse.data.refresh_token;
            console.log("Exchanged code for token:", accessToken);
          } catch (codeExchangeError) {
            console.error(
              "Failed to exchange code for token:",
              codeExchangeError
            );
          }
        }

        if (!accessToken) {
          console.error("No access token found in any parameter");
          toast.error("Authentication failed: No access token received");
          router.push("/login");
          return;
        }

        // Store tokens in localStorage
        localStorage.setItem("token", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

        // Update API headers for subsequent requests
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        try {
          // Fetch user profile with the new token
          console.log("Fetching user profile with token");
          const profileResponse = await api.get("/auth/profile");
          console.log("Profile response:", profileResponse.data);
          const userData = profileResponse.data;

          // Store user data
          localStorage.setItem("user", JSON.stringify(userData));

          // Update Redux store
          dispatch(
            setCredentials({
              user: userData,
              token: accessToken,
              refreshToken: refreshToken || "",
              // Removed isImpersonating to match your type definition
            })
          );

          // Success message
          if (isImpersonating) {
            toast.success(
              `Successfully logged in as ${
                userData.first_name || userData.email || "user"
              }`
            );
          } else {
            toast.success("Authentication successful");
          }

          // Redirect based on user role
          if (userData.role === "admin") {
            router.push("/admin");
          } else if (userData.role === "financial-advisor") {
            router.push("/admin");
          } else {
            router.push("/customer-dashboard");
          }
        } catch (profileError) {
          console.error("Error fetching user profile:", profileError);

          // Even if profile fetch fails, we still have a valid token
          toast.info("Authentication successful. Loading dashboard...");
          router.push("/customer-dashboard");
        }
      } catch (error) {
        console.error("Authentication callback error:", error);
        toast.error("Authentication failed");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    handleGoogleCallback();
  }, [searchParams, router, dispatch]);

  return (
    <div className="flex justify-center items-center h-screen">
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
      <div className="text-center">
        <p>{isLoading ? "Authenticating..." : "Redirecting..."}</p>
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  );
};

const GoogleCallbackPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GoogleCallbackContent />
    </Suspense>
  );
};

export default GoogleCallbackPage;
