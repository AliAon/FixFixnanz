"use client";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";
import { setCookie, destroyCookie } from "nookies";
import axios from "axios";

// Safe localStorage access with proper typing
const getLocalStorage = <T>(
  key: string,
  defaultValue: T | null = null
): T | null => {
  if (typeof window !== "undefined") {
    const item = window.localStorage.getItem(key);
    if (item) {
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as unknown as T;
      }
    }
  }
  return defaultValue;
};
const setLocalStorage = <T>(key: string, value: T): void => {
  if (typeof window !== "undefined") {
    if (typeof value === "object") {
      window.localStorage.setItem(key, JSON.stringify(value));
    } else {
      window.localStorage.setItem(key, String(value));
    }
  }
};

const removeLocalStorage = (key: string): void => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(key);
  }
};

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  lead_email: string;
  password: string;
  role: "user" | "financial-advisor" | "admin";
  category_id?: string;
  avatar_url: string | null;
  username: string | null;
  phone: string | null;
  company: string;
  isBroker: boolean;
  address: string;
  postal_code: string;
  city: string;
  state: string;
  country?: string;
  website: string | null;
  accept_terms?: boolean;
  dob?: string;
  signature?: string;
  salutation?: string;
}

interface AuthProfile {
  id: string;
  user_id: string;
  avatar_url: string | null;
  first_name: string | null;
  last_name: string | null;
  dob: string | null;
  gender: string | null;
  phone: string | null;
  city: string | null;
  lead_email: string;
  state: string | null;
  country: string | null;
  address: string | null;
  bio: string | null;
  sign: string | null;
  marital_status: string | null;
  monthly_income: string | null;
  monthly_expense: string | null;
  living_situation: string | null;
  employer: string | null;
  employer_status: string | null;
  language: string | null;
  education: string | null;
  created_at: string;
  updated_at: string;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  tiktok_url: string | null;
  twitter_url: string | null;
  username: string | null;
  website: string | null;
  broker: boolean;
  postal_code: string | null;
  company_name: string | null;
}

export interface Advisor {
  id: string;
  user_id: string;
  about: string | null;
  advisor_contract_accepted: boolean;
  average_rating: number;
  broker: boolean;
  commission_level_closer: number;
  commission_level_settler: number;
  company_id: string | null;
  created_at: string;
  date_of_birth: string | null;
  freelancer: boolean;
  is_visible: boolean;
  service_category_id: string | null;
  service_details: string | null;
  service_price: string | null;
  service_title: string | null;
  terms_and_conditions: boolean;
  total_views: number;
  updated_at: string;
  website: string | null;
  welcome_modal: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  role: "user" | "financial-advisor" | "admin";
  is_active: boolean;
  is_approved: boolean;
  category_id: string | null;
  profiles?: AuthProfile;
  advisor?: Advisor;
  isEmailVerified: boolean;
  isImpersonating: boolean;
  last_name: string | null;
  first_name: string | null;
  username: string | null;
  phone: string | null;
  avatar_url: string | null;
}

interface AuthState {
  user: null | {
    id: string;
    email: string;
    isEmailVerified: boolean;
    role: "user" | "financial-advisor" | "admin";
    is_active: boolean;
    is_approved: boolean;
    category_id: string | null;
    advisor?: Advisor;
    avatar_url: string | null;
    first_name: string | null;
    last_name: string | null;
    username: string | null;
    phone: string | null;
  };
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  emailVerificationStatus: "idle" | "loading" | "succeeded" | "failed";
  emailVerificationError: string | null;
  resendVerificationStatus: "idle" | "loading" | "succeeded" | "failed";
  resendVerificationError: string | null;
  inviteUserStatus: "idle" | "loading" | "succeeded" | "failed";
  inviteUserError: string | null;
  deactivateAccountStatus: "idle" | "loading" | "succeeded" | "failed";
  deactivateAccountError: string | null;
  requestPasswordResetStatus: "idle" | "loading" | "succeeded" | "failed";
  requestPasswordResetError: string | null;
  resetPasswordStatus: "idle" | "loading" | "succeeded" | "failed";
  resetPasswordError: string | null;
  validateTokenStatus: "idle" | "loading" | "succeeded" | "failed";
  validateTokenError: string | null;
  isImpersonating?: boolean;
}

// Initialize with defaults first, then update in useEffect
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  emailVerificationStatus: "idle",
  emailVerificationError: null,
  resendVerificationStatus: "idle",
  resendVerificationError: null,
  inviteUserStatus: "idle",
  inviteUserError: null,
  deactivateAccountStatus: "idle",
  deactivateAccountError: null,
  requestPasswordResetStatus: "idle",
  requestPasswordResetError: null,
  resetPasswordStatus: "idle",
  resetPasswordError: null,
  validateTokenStatus: "idle",
  validateTokenError: null,
  isImpersonating: false,
};

interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
}

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/verify-email", { token });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const inviteUser = createAsyncThunk(
  "auth/inviteUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/user-invite", { userId });
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response?.data?.message) {
        return rejectWithValue(err.response.data.message);
      }
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to invite user");
    }
  }
);

export const resendVerificationEmail = createAsyncThunk(
  "auth/resendVerification",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/resend-verification", { email });
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response?.data?.message) {
        return rejectWithValue(err.response.data.message);
      }
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to resend verification email");
    }
  }
);

// Updated impersonateUser thunk
export const impersonateUser = createAsyncThunk(
  "auth/impersonate",
  async (userId: string, { rejectWithValue }) => {
    try {
      // Save current admin session before impersonating
      const currentToken = localStorage.getItem("token");
      const currentUser = localStorage.getItem("user");
      const currentRefreshToken = localStorage.getItem("refreshToken");

      // Store admin credentials for later restoration
      if (currentToken) localStorage.setItem("admin_token", currentToken);
      if (currentUser) localStorage.setItem("admin_user", currentUser);
      if (currentRefreshToken)
        localStorage.setItem("admin_refresh_token", currentRefreshToken);

      // Make API call to impersonate
      // const response = await api.post("/auth/impersonate", { userId });
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/impersonate`,
        { userId: "8a3370e4-545f-4ab3-9f22-0e6448b3ec1d" },
        {
          headers: {
            Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiIsImtpZCI6InVFdUNVZlVsZml2NEV2RkMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FvZnllZ21ldXJxcHFvamN5enNwLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI4YTMzNzBlNC01NDVmLTRhYjMtOWYyMi0wZTY0NDhiM2VjMWQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzQzNjAyMzM1LCJpYXQiOjE3NDM1OTg3MzUsImVtYWlsIjoiam9obi5kb2UzQGV4YW1wbGUuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6ImpvaG4uZG9lM0BleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjhhMzM3MGU0LTU0NWYtNGFiMy05ZjIyLTBlNjQ0OGIzZWMxZCJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzQzNTk4NzM1fV0sInNlc3Npb25faWQiOiIyNmQ3ZjYzYi1kYTAxLTRmZmQtYTBhOC0wZjE4MWQ5YmQ3OTkiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.KJ2pdPAhZoiQBbLAxVSXanDRt5X-bCZlAiGMcMTSilc"}`,
          },
        }
      );

      // Case 1: API returns a magic link for redirection
      if (response.data.magic_link) {
        return {
          magicLink: response.data.magic_link,
          isImpersonating: true,
        };
      }

      // Case 2: API returns tokens directly
      const { access_token, refresh_token, user } = response.data;

      // Store tokens
      localStorage.setItem("token", access_token);
      localStorage.setItem("refreshToken", refresh_token || "");
      localStorage.setItem("user", JSON.stringify(user));

      return {
        user,
        token: access_token,
        refreshToken: refresh_token || "",
        isImpersonating: true,
      };
    } catch (error: unknown) {
      console.error("Impersonation Error:", error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Unable to impersonate user");
    }
  }
);

// Updated switchBackToAdmin thunk
export const switchBackToAdmin = createAsyncThunk(
  "auth/switchBackToAdmin",
  async (_, { rejectWithValue }) => {
    try {
      // Retrieve admin tokens
      const adminToken = localStorage.getItem("admin_token");
      const adminUser = localStorage.getItem("admin_user");
      const adminRefreshToken = localStorage.getItem("admin_refresh_token");

      if (!adminToken || !adminUser) {
        throw new Error("No admin session found");
      }

      // Switch back to admin tokens
      localStorage.setItem("token", adminToken);
      localStorage.setItem("user", adminUser);
      if (adminRefreshToken)
        localStorage.setItem("refreshToken", adminRefreshToken);

      // Clear admin backup tokens
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      localStorage.removeItem("admin_refresh_token");

      return {
        user: JSON.parse(adminUser),
        token: adminToken,
        refreshToken: adminRefreshToken || "",
        isImpersonating: false,
      };
    } catch (error: unknown) {
      console.error("Switch Back Error:", error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to switch back to admin");
    }
  }
);

// Add a thunk to handle magic link verification
export const verifyImpersonationMagicLink = createAsyncThunk(
  "auth/verifyMagicLink",
  async (magicLink: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/auth/verify-impersonation", {
        magic_link: magicLink,
      });

      const { access_token, refresh_token, user } = response.data;

      // Store tokens
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("refreshToken", refresh_token);

      // Clear the stored magic link
      localStorage.removeItem("impersonation_magic_link");

      // Dispatch action to update auth state
      dispatch(
        setCredentials({
          user,
          token: access_token,
          refreshToken: refresh_token,
        })
      );

      return {
        user,
        token: access_token,
        refreshToken: refresh_token,
        isImpersonating: true,
      };
    } catch (error: unknown) {
      console.error("Magic Link Verification Error:", error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to verify impersonation");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", credentials);

      const userData = response.data.user;
      const token = response.data.access_token;
      const refreshToken = response.data.refresh_token;

      setCookie(null, "token", token, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });

      setCookie(null, "userData", JSON.stringify(userData), {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });

      // Store in localStorage safely
      setLocalStorage("token", token);
      setLocalStorage("refreshToken", refreshToken);
      setLocalStorage("user", userData);

      return {
        user: userData,
        token,
        refreshToken,
      };
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response) {
        if (err.response.status === 401) {
          return rejectWithValue(
            "Invalid email or password. Please try again."
          );
        } else if (err.response.status === 403) {
          return rejectWithValue(
            "Your account is not active. Please contact support."
          );
        } else if (err.response.data && err.response.data.message) {
          return rejectWithValue(err.response.data.message);
        }
      }
      // Default error message
      return rejectWithValue(
        "Login failed. Please check your connection and try again."
      );
    }
  }
);

// Add these thunks to your existing ones

// Existing register thunk - kept from your code
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: UserData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", userData);

      setCookie(null, "token", response.data.access_token, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });

      setCookie(null, "userData", JSON.stringify(response.data.user), {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });

      // Store in localStorage safely
      setLocalStorage("token", response.data.access_token);
      setLocalStorage("refreshToken", response.data.refresh_token);
      // setLocalStorage("user", response.data.user);

      return {
        user: response.data.user,
        token: response.data.access_token,
        refreshToken: response.data.refresh_token,
      };
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response && err.response.data) {
        return rejectWithValue(
          err.response.data.message || "Registration failed"
        );
      }
      return rejectWithValue("An error occurred during registration");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const previousToken = getLocalStorage("previous_token");
      const previousUser = getLocalStorage("previous_user");
      const previousRefreshToken = getLocalStorage("previous_refresh_token");

      // Cleanup of current tokens
      removeLocalStorage("token");
      removeLocalStorage("refreshToken");
      removeLocalStorage("user");
      destroyCookie(null, "token");
      destroyCookie(null, "userData");

      // If we were impersonating, rollback to previous tokens
      if (previousToken && previousUser) {
        setLocalStorage("token", previousToken);
        setLocalStorage("user", previousUser);
        setLocalStorage("refreshToken", previousRefreshToken);

        setCookie(null, "token", previousToken as string, {
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });

        setCookie(null, "userData", JSON.stringify(previousUser), {
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });

        // Clear impersonation tokens
        removeLocalStorage("previous_token");
        removeLocalStorage("previous_user");
        removeLocalStorage("previous_refresh_token");
      }
      return true;
    } catch (error) {
      console.log(error);
      return rejectWithValue("Logout failed");
    }
  }
);

export const checkAuthStatus = createAsyncThunk<
  { user: AuthUser; token: string; refreshToken: string } | null,
  void
>("auth/checkStatus", async () => {
  const token = getLocalStorage<string>("token", null);
  const user = getLocalStorage<AuthUser>("user", null);
  const refreshToken = getLocalStorage<string>("refreshToken", null);

  if (token && user) {
    return { user, token, refreshToken: refreshToken || "" };
  }
  return null;
});

export const initiateGoogleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/google/url", {
        redirectUrl: `${
          typeof window !== "undefined" ? window.location.origin : ""
        }/auth/google/callback`,
      });

      if (typeof window !== "undefined") {
        window.location.href = response.data.url;
      }

      return {};
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response && err.response.data) {
        return rejectWithValue(
          err.response.data.message || "Failed to initiate Google login"
        );
      }
      return rejectWithValue(
        "An error occurred when trying to login with Google"
      );
    }
  }
);

export const handleGoogleCallback = createAsyncThunk(
  "auth/googleCallback",
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/google/callback", {
        code,
        role: "user",
      });

      // Also store in cookies for server-side access (middleware)
      setCookie(null, "token", response.data.access_token, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });

      setCookie(null, "userData", JSON.stringify(response.data.user), {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });

      // Store in localStorage safely
      setLocalStorage("token", response.data.access_token);
      setLocalStorage("refreshToken", response.data.refresh_token);
      setLocalStorage("user", response.data.user);

      return {
        user: response.data.user,
        token: response.data.access_token,
        refreshToken: response.data.refresh_token,
      };
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response && err.response.data) {
        return rejectWithValue(
          err.response.data.message || "Google authentication failed"
        );
      }
      return rejectWithValue("An error occurred during Google authentication");
    }
  }
);

export const deactivateUserAccount = createAsyncThunk(
  "auth/deactivate",
  async (user_id: string, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/deactivate", {
        user_id: user_id,
      });

      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response && err.response.data) {
        return rejectWithValue(
          err.response.data.message || "Failed to deactivate account"
        );
      }
      return rejectWithValue("An error occurred while deactivating account");
    }
  }
);

// Request password reset
export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/forgot-password", {
        email: email,
      });

      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response && err.response.data) {
        return rejectWithValue(
          err.response.data.message || "Failed to send password reset email"
        );
      }
      return rejectWithValue("An error occurred while requesting password reset");
    }
  }
);

// Reset password with token
export const resetPasswordWithToken = createAsyncThunk(
  "auth/resetPassword",
  async (
    { token, new_password, confirm_password }: { 
      token: string; 
      new_password: string; 
      confirm_password?: string; 
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/auth/reset-password", {
        token: token,
        new_password: new_password,
        confirm_password: confirm_password || new_password,
      });

      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response && err.response.data) {
        return rejectWithValue(
          err.response.data.message || "Failed to reset password"
        );
      }
      return rejectWithValue("An error occurred while resetting password");
    }
  }
);

// Validate password reset token
export const validateResetToken = createAsyncThunk(
  "auth/validateResetToken",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/auth/validate-reset-token?token=${token}`);

      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response && err.response.data) {
        return rejectWithValue(
          err.response.data.message || "Invalid or expired token"
        );
      }
      return rejectWithValue("An error occurred while validating token");
    }
  }
);

// Use your existing auth slice with additional middleware support
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      // Clear localStorage safely
      removeLocalStorage("token");
      removeLocalStorage("access_token");
      removeLocalStorage("refreshToken");
      removeLocalStorage("user");

      // Clear cookies for middleware
      destroyCookie(null, "token");
      destroyCookie(null, "userData");
    },
    autoLogout: (state) => {
      // Same as logout but specifically for automatic timeouts
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = "Session expired due to inactivity";

      // Clear localStorage completely for security
      removeLocalStorage("token");
      removeLocalStorage("refreshToken");
      removeLocalStorage("user");

      // Clear cookies for middleware
      destroyCookie(null, "token");
      destroyCookie(null, "userData");

      // Clear all auth-related localStorage items
      if (typeof window !== 'undefined') {
        const keysToKeep = ['theme', 'language']; // Keep user preferences
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
          if (!keysToKeep.includes(key)) {
            localStorage.removeItem(key);
          }
        });
      }
    },
    setCredentials: (
      state,
      action: PayloadAction<{
        user: AuthUser;
        token: string;
        refreshToken: string;
        isImpersonating?: boolean;
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;

      // Update localStorage safely
      setLocalStorage("token", action.payload.token);
      setLocalStorage("refreshToken", action.payload.refreshToken);
      setLocalStorage("user", action.payload.user);

      // Update cookies for middleware
      setCookie(null, "token", action.payload.token, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });

      setCookie(null, "userData", JSON.stringify(action.payload.user), {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
    },
    clearError: (state) => {
      state.error = null;
    },
    // Add a new action to initialize state from client-side
    initializeFromClient: (state) => {
      const token = getLocalStorage<string>("token", null);
      const user = getLocalStorage<AuthUser>("user", null);
      const refreshToken = getLocalStorage<string>("refreshToken", null);

      if (token && user) {
        state.token = token;
        state.user = user;
        state.refreshToken = refreshToken;
        state.isAuthenticated = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Registration cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        // state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      // Add this to the extraReducers in the builder
      // .addCase(impersonateUser.pending, (state) => {
      //   state.isLoading = true;
      //   state.error = null;
      // })
      // .addCase(impersonateUser.fulfilled, (state, action) => {
      //   state.isLoading = false;
      //   state.isAuthenticated = true;
      //   state.user = action.payload.user;
      //   state.token = action.payload.token;
      //   state.refreshToken = action.payload.refreshToken;
      // })
      // .addCase(impersonateUser.rejected, (state, action) => {
      //   state.isLoading = false;
      //   state.error = action.payload as string;
      //   state.isAuthenticated = false;
      // })
      // Add to the extraReducers in the builder
      .addCase(impersonateUser.pending, (state) => {
        state.isLoading = true;
        state.isImpersonating = false;
      })
      .addCase(impersonateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isImpersonating = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(impersonateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isImpersonating = false;
        state.error = action.payload as string;
        // state.isAuthenticated = false;
      })
      .addCase(verifyImpersonationMagicLink.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isImpersonating = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(verifyImpersonationMagicLink.rejected, (state, action) => {
        state.isLoading = false;
        state.isImpersonating = false;
        state.error = action.payload as string;
      })
      // Check auth status cases
      .addCase(
        checkAuthStatus.fulfilled,
        (
          state,
          action: PayloadAction<{
            user: AuthUser;
            token: string;
            refreshToken: string;
          } | null>
        ) => {
          if (action.payload) {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            state.isAuthenticated = true;
          }
        }
      )

      // Google login cases
      .addCase(initiateGoogleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initiateGoogleLogin.fulfilled, (state) => {
        // This won't actually be called due to redirect
        state.isLoading = false;
      })
      .addCase(initiateGoogleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(handleGoogleCallback.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(handleGoogleCallback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(handleGoogleCallback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      }) // Email Verification Cases
      .addCase(verifyEmail.pending, (state) => {
        state.emailVerificationStatus = "loading";
        state.emailVerificationError = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.emailVerificationStatus = "succeeded";

        // Update user's email verification status
        if (state.user) {
          state.user.isEmailVerified = true;
          
          // Update localStorage with the verified user data
          setLocalStorage("user", state.user);
          
          // Update cookies for middleware
          setCookie(null, "userData", JSON.stringify(state.user), {
            maxAge: 30 * 24 * 60 * 60,
            path: "/",
          });
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.emailVerificationStatus = "failed";
        state.emailVerificationError = action.payload as string;
      })
      // Resend Verification Email Cases
      .addCase(resendVerificationEmail.pending, (state) => {
        state.resendVerificationStatus = "loading";
        state.resendVerificationError = null;
      })
      .addCase(resendVerificationEmail.fulfilled, (state) => {
        state.resendVerificationStatus = "succeeded";
      })
      .addCase(resendVerificationEmail.rejected, (state, action) => {
        state.resendVerificationStatus = "failed";
        state.resendVerificationError = action.payload as string;
      })
      // Invite User Cases
      .addCase(inviteUser.pending, (state) => {
        state.inviteUserStatus = "loading";
        state.inviteUserError = null;
      })
      .addCase(inviteUser.fulfilled, (state) => {
        state.inviteUserStatus = "succeeded";
      })
      .addCase(inviteUser.rejected, (state, action) => {
        state.inviteUserStatus = "failed";
        state.inviteUserError = action.payload as string;
      })
      // Deactivate Account Cases
      .addCase(deactivateUserAccount.pending, (state) => {
        state.deactivateAccountStatus = "loading";
        state.deactivateAccountError = null;
      })
      .addCase(deactivateUserAccount.fulfilled, (state) => {
        state.deactivateAccountStatus = "succeeded";
        // Optionally update user's is_active status to false
        if (state.user) {
          state.user.is_active = false;
          // Update localStorage with the deactivated user data
          setLocalStorage("user", state.user);
          // Update cookies for middleware
          setCookie(null, "userData", JSON.stringify(state.user), {
            maxAge: 30 * 24 * 60 * 60,
            path: "/",
          });
        }
      })
      .addCase(deactivateUserAccount.rejected, (state, action) => {
        state.deactivateAccountStatus = "failed";
        state.deactivateAccountError = action.payload as string;
      })
      // Request Password Reset Cases
      .addCase(requestPasswordReset.pending, (state) => {
        state.requestPasswordResetStatus = "loading";
        state.requestPasswordResetError = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.requestPasswordResetStatus = "succeeded";
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.requestPasswordResetStatus = "failed";
        state.requestPasswordResetError = action.payload as string;
      })
      // Reset Password Cases
      .addCase(resetPasswordWithToken.pending, (state) => {
        state.resetPasswordStatus = "loading";
        state.resetPasswordError = null;
      })
      .addCase(resetPasswordWithToken.fulfilled, (state) => {
        state.resetPasswordStatus = "succeeded";
      })
      .addCase(resetPasswordWithToken.rejected, (state, action) => {
        state.resetPasswordStatus = "failed";
        state.resetPasswordError = action.payload as string;
      })
      // Validate Reset Token Cases
      .addCase(validateResetToken.pending, (state) => {
        state.validateTokenStatus = "loading";
        state.validateTokenError = null;
      })
      .addCase(validateResetToken.fulfilled, (state) => {
        state.validateTokenStatus = "succeeded";
      })
      .addCase(validateResetToken.rejected, (state, action) => {
        state.validateTokenStatus = "failed";
        state.validateTokenError = action.payload as string;
      });
  },
});

export const { logout, autoLogout, setCredentials, clearError, initializeFromClient } =
  authSlice.actions;
export default authSlice.reducer;
