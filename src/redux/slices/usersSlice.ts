/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/redux/api/axiosConfig";
import { User } from "@/types/TUser";

// Define parameters for fetching users with optional role filtering
export interface FetchUsersParams {
  roles?: ('admin' | 'financial-advisor' | 'user')[];
  search?: string;
  limit?: number;
  offset?: number;
  is_active?: boolean;
  is_approved?: boolean;
}

// Define parameters for fetching customers
export interface FetchCustomersParams {
  search?: string;
  limit?: number;
  offset?: number;
  is_active?: boolean;
  is_approved?: boolean;
  role?: 'admin' | 'financial-advisor' | 'user';
}

// Define parameters for fetching users info with advanced filtering - UPDATED
export interface FetchUsersInfoParams {
  role?: string; // NEW: user, financial-advisor, admin, free-advisor
  status?: string; // NEW: active, inactive
  registration_date?: string;
  last_login?: string;
  inactive?: string;
  contract_uploaded?: boolean;
  email_verified?: boolean;
  page?: number;
  limit?: number;
}

// Define parameters for fetching financial advisor users
export interface FetchFinancialAdvisorUsersParams {
  page?: number;
  limit?: number;
  email_verified?: boolean;
}

// Add new interface for email check
export interface CheckEmailParams {
  email: string;
}

interface CheckEmailResponse {
  exists: boolean;
  message?: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  position: number;
  created_at: Date;
  updated_at: Date;
}


export interface UpdateUserProfileParams {
  id: string;
  data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    role?: string;
    is_active?: boolean;
  };
}

interface PipelineWithCustomerCount {
  id: string;
  name: string;
  source?: string;
  type?: string;
  slug?: string;
  company_id?: string | null;
  stages?: {
    id: string;
    name: string;
    color: string;
    position: number;
    created_at: string;
    updated_at: string;
  }[];
  customer_count: number;
  created_at: string;
  updated_at: string;
}

interface UsersState {
  users: User[];
  modalUsers: User[]; // Separate state for modal/dropdown users
  customers: User[]; // Separate state for customers
  financialAdvisors: User[]; // Separate state for financial advisors
  pipelinesWithCustomerCount: PipelineWithCustomerCount[]; // Separate state for pipelines
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  totalUsers: number;
  totalCustomers: number;
  totalFinancialAdvisors: number;
  currentPage: number;
  totalPages: number;
  financialAdvisorCurrentPage: number;
  financialAdvisorTotalPages: number;
  financialAdvisorLoading: boolean;
  financialAdvisorError: string | null;
  pipelinesLoading: boolean;
  pipelinesError: string | null;
  currentFilters: FetchUsersInfoParams; // Track current filters for pagination
  financialAdvisorCurrentFilters: FetchFinancialAdvisorUsersParams; // Track current filters for financial advisors
  loading: boolean;
  // Add new state for email checking
  emailCheckLoading: boolean;
  emailExists: boolean;
  emailCheckError: string | null;
  pageSize: number;
  platform?: 'fb' | 'ig' | 'meta' | 'manual';
}

interface ApiError {
  response?: {
    data: {
      message?: string;
      error?: string;
      statusCode?: number;
    };
    status: number;
  };
}

// API Response Interfaces
interface ApiUserResponse {
  id: string;
  email: string;
  lead_email?: string;
  lead_phone?: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  is_active: boolean;
  is_approved: boolean;
  email_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at?: string;
  category_id?: string;
  avatar_url?: string;
  contract_uploaded?: boolean;
}

interface ApiPipelineResponse {
  id: string;
  name: string;
  description?: string;
  customer_count?: number;
  created_at: string;
  updated_at?: string;
}

const initialState: UsersState = {
  users: [],
  modalUsers: [],
  customers: [],
  financialAdvisors: [],
  pipelinesWithCustomerCount: [],
  selectedUser: null,
  isLoading: false,
  error: null,
  totalUsers: 0,
  totalCustomers: 0,
  totalFinancialAdvisors: 0,
  currentPage: 1,
  totalPages: 1,
  financialAdvisorCurrentPage: 1,
  financialAdvisorTotalPages: 1,
  financialAdvisorLoading: false,
  financialAdvisorError: null,
  pipelinesLoading: false,
  pipelinesError: null,
  currentFilters: {},
  financialAdvisorCurrentFilters: {},
  loading: false,
  // Initialize new email check state
  emailCheckLoading: false,
  emailExists: false,
  emailCheckError: null,
  pageSize: 20,
};

// Add new async thunk for checking email existence
export const checkEmailExists = createAsyncThunk<
  CheckEmailResponse,
  CheckEmailParams,
  { rejectValue: string }
>(
  "users/checkEmailExists",
  async ({ email }: CheckEmailParams, { rejectWithValue }) => {
    try {
      const response = await api.post('/users/check-email', { email });

      return {
        exists: response.data.exists || false,
        message: response.data.message
      };
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response?.data) {
        return rejectWithValue(
          err.response.data.message ||
          err.response.data.error ||
          "Failed to check email"
        );
      }
      return rejectWithValue("Failed to check email availability");
    }
  }
);
// Async thunk for fetching users with flexible role filtering
export const fetchUsers = createAsyncThunk<
  { users: User[]; total: number; limit: number; offset: number },
  FetchUsersParams
>(
  "users/fetchAll",
  async (params: FetchUsersParams = {}, { rejectWithValue }) => {
    try {
      // Construct query parameters
      const queryParams = new URLSearchParams();

      // Use 'role' (singular) if roles are specified
      if (params.roles && params.roles.length > 0) {
        queryParams.append("role", params.roles[0]);
      }

      if (params.search) {
        queryParams.append("search", params.search);
      }

      // Add is_active and is_approved filters
      if (params.is_active !== undefined) {
        queryParams.append("is_active", params.is_active.toString());
      }
      if (params.is_approved !== undefined) {
        queryParams.append("is_approved", params.is_approved.toString());
      }

      // Only add limit/offset if provided and > 0
      if (params.limit && params.limit > 0) {
        queryParams.append("limit", params.limit.toString());
      }
      if (params.offset && params.offset > 0) {
        queryParams.append("offset", params.offset.toString());
      }

      const response = await api.get(
        `/users?${queryParams.toString()}`
      );

      // Handle different response formats
      let users: User[];
      let total: number;

      if (Array.isArray(response.data)) {
        // If the response is a direct array of users
        users = response.data;
        total = response.data.length;
      } else if (response.data.users && Array.isArray(response.data.users)) {
        // If the response has a users property with an array
        users = response.data.users;
        total = response.data.total || response.data.users.length;
      } else if (response.data.users && typeof response.data.users === 'object') {
        // If the response has a users object (not array) - extract user objects
        const usersObj = response.data.users;
        users = Object.values(usersObj).filter((user): user is User =>
          typeof user === 'object' && user !== null && 'id' in user
        );
        total = users.length;
      } else {
        // Fallback or error case
        throw new Error("Unexpected API response format");
      }

      // Normalize user data for backward compatibility and proper display
      users = users.map((user) => ({
        ...user,
        approved: user.is_approved !== undefined ? user.is_approved : user.approved,
        // Ensure first_name and last_name are available for display
        first_name: user.first_name || user.users?.first_name || user.profiles?.first_name || '',
        last_name: user.last_name || user.users?.last_name || user.profiles?.last_name || '',
        // Ensure email is available
        email: user.email || user.users?.email || '',
        // Ensure role is available
        role: user.role || user.users?.role || user.profiles?.role || '',
      }));

      return {
        users,
        total,
        limit: params.limit || 0,
        offset: params.offset || 0,
      };
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response?.data) {
        return rejectWithValue(
          err.response.data.message ||
          err.response.data.error ||
          "An error occurred"
        );
      }
      return rejectWithValue("An error occurred while fetching users");
    }
  }
);

// Add this async thunk before the createUser thunk
export const updateUserProfile = createAsyncThunk<
  User,
  UpdateUserProfileParams,
  { rejectValue: string }
>(
  "users/updateProfile",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      console.log("Updating user profile:", { id, data });

      const response = await api.put(`/users/${id}`, data);

      console.log("API response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("API error:", error);
      const err = error as ApiError;
      if (err.response?.data) {
        return rejectWithValue(
          err.response.data.message ||
          err.response.data.error ||
          "Failed to update user profile"
        );
      }
      return rejectWithValue("Failed to update user profile");
    }
  }
);

// Async thunk for fetching customers specifically
export const fetchCustomers = createAsyncThunk<
  { users: User[]; total: number; limit: number; offset: number },
  FetchCustomersParams
>(
  "users/fetchCustomers",
  async (params: FetchCustomersParams = {}, { rejectWithValue }) => {
    try {
      // Construct query parameters
      const queryParams = new URLSearchParams();

      // NEW: Add role filter
      if (params.role) {
        queryParams.append("role", params.role);
      }

      if (params.search) {
        queryParams.append("search", params.search);
      }

      // Add is_active and is_approved filters
      if (params.is_active !== undefined) {
        queryParams.append("is_active", params.is_active.toString());
      }
      if (params.is_approved !== undefined) {
        queryParams.append("is_approved", params.is_approved.toString());
      }

      // Only add limit/offset if provided and > 0
      if (params.limit && params.limit > 0) {
        queryParams.append("limit", params.limit.toString());
      }
      if (params.offset && params.offset > 0) {
        queryParams.append("offset", params.offset.toString());
      }

      const response = await api.get(
        `/users/get-customers?${queryParams.toString()}`
      );

      // Handle different response formats
      let users: User[];
      let total: number;

      if (Array.isArray(response.data)) {
        // If the response is a direct array of users
        users = response.data;
        total = response.data.length;
      } else if (response.data.users && Array.isArray(response.data.users)) {
        // If the response has a users property with an array
        users = response.data.users;
        total = response.data.total || response.data.users.length;
      } else if (response.data.users && typeof response.data.users === 'object') {
        // If the response has a users object (not array) - extract user objects
        const usersObj = response.data.users;
        users = Object.values(usersObj).filter((user): user is User =>
          typeof user === 'object' && user !== null && 'id' in user
        );
        total = users.length;
      } else {
        // Fallback or error case
        throw new Error("Unexpected API response format");
      }

      // Normalize user data for backward compatibility and proper display
      users = users.map((user) => ({
        ...user,
        approved: user.is_approved !== undefined ? user.is_approved : user.approved,
        // Ensure first_name and last_name are available for display
        first_name: user.first_name || user.users?.first_name || user.profiles?.first_name || '',
        last_name: user.last_name || user.users?.last_name || user.profiles?.last_name || '',
        // Ensure email is available
        email: user.email || user.users?.email || '',
        // Ensure role is available
        role: user.role || user.users?.role || user.profiles?.role || '',
      }));

      return {
        users,
        total,
        limit: params.limit || 0,
        offset: params.offset || 0,
      };
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response?.data) {
        return rejectWithValue(
          err.response.data.message ||
          err.response.data.error ||
          "An error occurred"
        );
      }
      return rejectWithValue("An error occurred while fetching customers");
    }
  }
);

// UPDATED: Async thunk for fetching users info with advanced filtering including role and status
export const fetchUsersInfo = createAsyncThunk<
  { users: User[]; total: number; limit: number; offset: number },
  FetchUsersInfoParams
>(
  "users/fetchUsersInfo",
  async (params: FetchUsersInfoParams = {}, { rejectWithValue }) => {
    try {
      // Construct query parameters
      const queryParams = new URLSearchParams();

      // NEW: Add role filter
      if (params.role) {
        queryParams.append("role", params.role);
      }

      // NEW: Add status filter (this will be handled as is_active on backend)
      if (params.status) {
        if (params.status === 'active') {
          queryParams.append("is_active", "true");
        } else if (params.status === 'inactive') {
          queryParams.append("is_active", "false");
        }
      }

      if (params.registration_date) {
        queryParams.append("registration_date", params.registration_date);
      }
      if (params.last_login) {
        queryParams.append("last_login", params.last_login);
      }
      if (params.inactive) {
        queryParams.append("inactive", params.inactive);
      }
      if (params.contract_uploaded !== undefined) {
        queryParams.append("contract_uploaded", params.contract_uploaded.toString());
      }
      if (params.email_verified !== undefined) {
        queryParams.append("email_verified", params.email_verified.toString());
      }
      if (params.page && params.page > 0) {
        queryParams.append("page", params.page.toString());
      }
      if (params.limit && params.limit > 0) {
        queryParams.append("limit", params.limit.toString());
      }

      const response = await api.get(
        `/users/info?${queryParams.toString()}`
      );

      console.log("API Response:", response.data); // Debug log

      // Handle different response formats
      let rawUsers: ApiUserResponse[];
      let total: number;

      if (Array.isArray(response.data)) {
        // If the response is a direct array of users (which seems to be the case)
        rawUsers = response.data;
        total = response.data.length;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // If the response has a data property with an array
        rawUsers = response.data.data;
        total = response.data.total || response.data.data.length;
      } else if (response.data.users && Array.isArray(response.data.users)) {
        // If the response has a users property with an array
        rawUsers = response.data.users;
        total = response.data.total || response.data.users.length;
      } else {
        // Fallback or error case
        console.error("Unexpected API response format:", response.data);
        throw new Error("Unexpected API response format");
      }

      // Convert API response to User interface format
      const users: User[] = rawUsers.map((apiUser: ApiUserResponse) => ({
        id: apiUser.id,
        category_id: apiUser.category_id || null,
        created_at: apiUser.created_at,
        updated_at: apiUser.updated_at || apiUser.created_at,
        deactivated_at: null,
        deactivated_by: null,
        email: apiUser.email,
        lead_email: apiUser.email,
        email_verified: apiUser.email_verified,
        is_active: apiUser.is_active,
        is_approved: apiUser.is_approved,
        last_login: apiUser.last_login || null,
        phone: apiUser.phone,
        avatar_url: apiUser.avatar_url || null,
        // Create minimal profile structure
        profiles: {
          id: `profile_${apiUser.id}`,
          address: null,
          avatar_url: apiUser.avatar_url || null,
          bio: null,
          broker: false,
          city: null,
          company_name: null,
          country: null,
          created_at: apiUser.created_at,
          dob: null,
          education: null,
          employer: null,
          employer_status: null,
          facebook_url: null,
          first_name: apiUser.first_name,
          last_name: apiUser.last_name,
          role: apiUser.role,
          company_id: null,
          pipeline_id: null,
          stage_id: null,
        },
        // Create minimal customer structure
        customers: {
          company_name: null,
          status: apiUser.is_active ? "active" : "inactive",
          stages: {
            id: "default",
            name: "Standard",
            color: null,
          },
        },
        // Direct API fields (what TableRow expects)
        first_name: apiUser.first_name,
        last_name: apiUser.last_name,
        role: apiUser.role,
        // Backward compatibility fields for TableRow
        phoneNumber: apiUser.phone, // TableRow expects phoneNumber, API provides phone
        active: apiUser.is_active,
        approved: apiUser.is_approved,
        emailVerified: apiUser.email_verified, // TableRow expects emailVerified, API provides email_verified
        contract_uploaded: apiUser.contract_uploaded, // TableRow expects contract_uploaded
        company_id: null,
        pipeline_id: null,
        stage_id: null,
        registerAt: apiUser.created_at,
      }));

      console.log("Processed users:", users); // Debug log

      return {
        users,
        total,
        limit: params.limit || 20,
        offset: params.page ? (params.page - 1) * (params.limit || 20) : 0,
      };
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error("API Error:", err); // Debug log
      if (err.response?.data) {
        return rejectWithValue(
          err.response.data.message ||
          err.response.data.error ||
          "An error occurred"
        );
      }
      return rejectWithValue("An error occurred while fetching users info");
    }
  }
);

// Async thunk for fetching financial advisor users
export const fetchFinancialAdvisorUsers = createAsyncThunk<
  { users: User[]; total: number; limit: number; offset: number },
  FetchFinancialAdvisorUsersParams
>(
  "users/fetchFinancialAdvisorUsers",
  async (params: FetchFinancialAdvisorUsersParams = {}, { rejectWithValue }) => {
    try {
      // Construct query parameters
      const queryParams = new URLSearchParams();

      if (params.page && params.page > 0) {
        queryParams.append("page", params.page.toString());
      }
      if (params.limit && params.limit > 0) {
        queryParams.append("limit", params.limit.toString());
      }
      if (params.email_verified !== undefined) {
        queryParams.append("email_verified", params.email_verified.toString());
      }

      const response = await api.get(
        `/users/financial-advisor?${queryParams.toString()}`
      );

      console.log("Financial Advisor API Response:", response.data); // Debug log

      // Handle different response formats
      let rawUsers: ApiUserResponse[];
      let total: number;

      if (Array.isArray(response.data)) {
        // If the response is a direct array of users
        rawUsers = response.data;
        total = response.data.length;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // If the response has a data property with an array
        rawUsers = response.data.data;
        total = response.data.total || response.data.data.length;
      } else if (response.data.users && Array.isArray(response.data.users)) {
        // If the response has a users property with an array
        rawUsers = response.data.users;
        total = response.data.total || response.data.users.length;
      } else {
        // Fallback or error case
        console.error("Unexpected API response format:", response.data);
        throw new Error("Unexpected API response format");
      }

      // Convert API response to User interface format
      const users: User[] = rawUsers.map((apiUser: ApiUserResponse) => ({
        id: apiUser.id,
        category_id: apiUser.category_id || null,
        created_at: apiUser.created_at,
        updated_at: apiUser.updated_at || apiUser.created_at,
        deactivated_at: null,
        deactivated_by: null,
        email: apiUser.email,
        lead_email: apiUser.email,
        email_verified: apiUser.email_verified,
        is_active: apiUser.is_active,
        is_approved: apiUser.is_approved,
        last_login: apiUser.last_login || null,
        phone: apiUser.phone,
        avatar_url: apiUser.avatar_url || null,
        // Create minimal profile structure
        profiles: {
          id: `profile_${apiUser.id}`,
          address: null,
          avatar_url: apiUser.avatar_url || null,
          bio: null,
          broker: false,
          city: null,
          company_name: null,
          country: null,
          created_at: apiUser.created_at,
          dob: null,
          education: null,
          employer: null,
          employer_status: null,
          facebook_url: null,
          first_name: apiUser.first_name,
          last_name: apiUser.last_name,
          role: apiUser.role,
          company_id: null,
          pipeline_id: null,
          stage_id: null,
        },
        // Create minimal customer structure
        customers: {
          company_name: null,
          status: apiUser.is_active ? "active" : "inactive",
          stages: {
            id: "default",
            name: "Standard",
            color: null,
          },
        },
        // Direct API fields (what TableRow expects)
        first_name: apiUser.first_name,
        last_name: apiUser.last_name,
        role: apiUser.role,
        // Backward compatibility fields for TableRow
        phoneNumber: apiUser.phone, // TableRow expects phoneNumber, API provides phone
        active: apiUser.is_active,
        approved: apiUser.is_approved,
        emailVerified: apiUser.email_verified, // TableRow expects emailVerified, API provides email_verified
        contract_uploaded: apiUser.contract_uploaded, // TableRow expects contract_uploaded
        company_id: null,
        pipeline_id: null,
        stage_id: null,
        registerAt: apiUser.created_at,
      }));

      console.log("Processed financial advisor users:", users); // Debug log

      return {
        users,
        total,
        limit: params.limit || 10, // Default limit is 10 for this API
        offset: params.page ? (params.page - 1) * (params.limit || 10) : 0,
      };
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error("Financial Advisor API Error:", err); // Debug log
      if (err.response?.data) {
        return rejectWithValue(
          err.response.data.message ||
          err.response.data.error ||
          "An error occurred"
        );
      }
      return rejectWithValue("An error occurred while fetching financial advisor users");
    }
  }
);

// First, update the interface (either in this file or in your types file)
interface ApiPipelineStageResponse {
  id: string;
  name: string;
  color: string;
  position: number;
  created_at: string;
  updated_at: string;
}

interface ApiPipelineResponse {
  id: string;
  name: string;
  source?: string;
  type?: string;
  slug?: string;
  company_id?: string | null;
  stages?: ApiPipelineStageResponse[];
  customer_count?: number;
  created_at: string;
  updated_at?: string;
}

// Then update the thunk
export const fetchPipelinesWithCustomerCount = createAsyncThunk<
  PipelineWithCustomerCount[]
>(
  "users/fetchPipelinesWithCustomerCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/pipelines-with-customer-count");

      console.log("Pipelines with Customer Count API Response:", response.data);

      // Handle different response formats
      let rawPipelines: ApiPipelineResponse[];

      if (Array.isArray(response.data)) {
        rawPipelines = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        rawPipelines = response.data.data;
      } else if (response.data?.pipelines && Array.isArray(response.data.pipelines)) {
        rawPipelines = response.data.pipelines;
      } else {
        console.error("Unexpected API response format:", response.data);
        throw new Error("Unexpected API response format");
      }

      // Transform the data
      const pipelines: PipelineWithCustomerCount[] = rawPipelines.map((item) => ({
        id: item.id,
        name: item.name,
        source: item.source || '',
        type: item.type || 'normal',
        slug: item.slug || '',
        company_id: item.company_id || null,
        customer_count: item.customer_count || 0,
        stages: item.stages?.map(stage => ({
          id: stage.id,
          name: stage.name,
          color: stage.color,
          position: stage.position,
          created_at: stage.created_at,
          updated_at: stage.updated_at || stage.created_at
        })) || [],
        created_at: item.created_at,
        updated_at: item.updated_at || item.created_at
      }));

      console.log("Processed pipelines with customer count:", pipelines);
      return pipelines;
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error("Pipelines with Customer Count API Error:", err);
      if (err.response?.data) {
        return rejectWithValue(
          err.response.data.message ||
          err.response.data.error ||
          "An error occurred"
        );
      }
      return rejectWithValue("An error occurred while fetching pipelines with customer count");
    }
  }
);

// Async thunk for fetching leadpool pipelines with customer count
export const fetchLeadpoolPipelinesWithCustomerCount = createAsyncThunk<
  PipelineWithCustomerCount[]
>(
  "users/fetchLeadpoolPipelinesWithCustomerCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/pipelines-with-customer-count", {
        params: { type: "leadpool" }
      });

      console.log("Leadpool Pipelines with Customer Count API Response:", response.data); // Debug log

      // Handle different response formats
      let pipelines: PipelineWithCustomerCount[];

      if (Array.isArray(response.data)) {
        // If the response is a direct array of pipelines
        pipelines = response.data.map((item: ApiPipelineResponse) => ({
          id: item.id,
          name: item.name,
          description: item.description || null,
          customer_count: item.customer_count || 0,
          created_at: item.created_at,
          updated_at: item.updated_at || item.created_at,
          source: item.source || '',
          type: item.type || 'normal',
          slug: item.slug || '',
          company_id: item.company_id || null,
          stages: item.stages?.map(stage => ({
            id: stage.id,
            name: stage.name,
            color: stage.color,
            position: stage.position,
            created_at: stage.created_at,
            updated_at: stage.updated_at || stage.created_at
          })) || [],
        }));
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // If the response has a data property with an array
        pipelines = response.data.data.map((item: ApiPipelineResponse) => ({
          id: item.id,
          name: item.name,
          description: item.description || null,
          customer_count: item.customer_count || 0,
          created_at: item.created_at,
          updated_at: item.updated_at || item.created_at,
        }));
      } else if (response.data.pipelines && Array.isArray(response.data.pipelines)) {
        // If the response has a pipelines property with an array
        pipelines = response.data.pipelines.map((item: ApiPipelineResponse) => ({
          id: item.id,
          name: item.name,
          description: item.description || null,
          customer_count: item.customer_count || 0,
          created_at: item.created_at,
          updated_at: item.updated_at || item.created_at,
        }));
      } else {
        // Fallback or error case
        console.error("Unexpected API response format:", response.data);
        throw new Error("Unexpected API response format");
      }

      console.log("Processed leadpool pipelines with customer count:", pipelines); // Debug log

      return pipelines;
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error("Leadpool Pipelines with Customer Count API Error:", err); // Debug log
      if (err.response?.data) {
        return rejectWithValue(
          err.response.data.message ||
          err.response.data.error ||
          "An error occurred"
        );
      }
      return rejectWithValue("An error occurred while fetching leadpool pipelines with customer count");
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk<string, string>(
  "users/delete",
  async (userId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${userId}`);
      return userId;
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response?.data) {
        return rejectWithValue(
          err.response.data.message ||
          err.response.data.error ||
          "An error occurred"
        );
      }
      return rejectWithValue("An error occurred while deleting the user");
    }
  }
);

// Interface for fetchUsersByConsultant parameters
export interface FetchUsersByConsultantParams {
  consultantId: string;
  stage_id: string;
}

// Interface for the API response from fetchUsersByConsultant
export interface UserByConsultantResponse {
  id?: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    phone?: string;
    email: string;
    lead_phone?: string;
    lead_email?: string;
    is_approved: boolean;
    created_at?: string;
    updated_at?: string;
  };
  customer?: {
    id?: string;
    company_name?: string;
    created_at?: string;
    updated_at?: string;
  };
  stage?: {
    id: string;
    name: string;
    color?: string;
  };
  pipeline?: {
    id: string;
    name: string;
  };
}

// Add new thunk for fetching users by consultant ID
export const fetchUsersByConsultant = createAsyncThunk<Array<Record<string, unknown>>, FetchUsersByConsultantParams>(
  "users/fetchByConsultant",
  async ({ consultantId, stage_id }: FetchUsersByConsultantParams, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/by-consultant/${consultantId}?stage_id=${stage_id}`);

      // If response is an array, return it directly
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // If response has a data property that's an array
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      // If single user object is returned
      if (response.data && typeof response.data === 'object') {
        return [response.data];
      }

      throw new Error("Unexpected API response format");
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response?.data) {
        return rejectWithValue(
          err.response.data.message ||
          err.response.data.error ||
          "Failed to fetch users by consultant"
        );
      }
      return rejectWithValue("An error occurred while fetching users by consultant");
    }
  }
);

// Async thunk for creating a new user
export const createUser = createAsyncThunk<
  User,
  Partial<User>,
  { rejectValue: string }
>(
  "users/create",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/users", userData);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response?.data) {
        return rejectWithValue(
          err.response.data.message ||
          err.response.data.error ||
          "Failed to create user"
        );
      }
      return rejectWithValue("Failed to create user");
    }
  }
);

interface CreateUserWithConsultantPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_id?: string;
  pipeline_id: string;
  stage_id: string;
  consultant_id: string;
  platform?: 'fb' | 'ig' | 'meta' | 'manual';
  additional_data?: Record<string, any>; // Add this field
}

// usersSlice.ts
export const createUserWithConsultant = createAsyncThunk<
  User,
  CreateUserWithConsultantPayload,
  { rejectValue: string }
>(
  "users/createWithConsultant",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/users/with-consultant", userData);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to create user"
      );
    }
  }
);

// Types for import
export interface ImportUsersPayload {
  file: File;
  pipeline_id: string;
  stage_id: string;
}

export const importUsersFromExcel = createAsyncThunk<
  unknown, // You can specify a more precise type if you know the response
  ImportUsersPayload,
  { rejectValue: string }
>(
  "users/importFromExcel",
  async ({ file, pipeline_id, stage_id }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pipeline_id", pipeline_id);
      formData.append("stage_id", stage_id);

      const response = await api.post("/users/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response?.data) {
        return rejectWithValue(
          err.response.data.message ||
          err.response.data.error ||
          "Failed to import users"
        );
      }
      return rejectWithValue("Failed to import users");
    }
  }
);




// Add new async thunk for updating user approval status
export const updateUserApproval = createAsyncThunk<
  { userId: string; is_approved: boolean },
  { userId: string; is_approved: boolean },
  { rejectValue: string }
>(
  "users/updateApproval",
  async ({ userId, is_approved }, { rejectWithValue }) => {
    try {
      console.log("Making API call to update user approval:", { userId, is_approved });

      // Make the API call to update user approval
      const response = await api.put(`/users/${userId}/approval`, {
        is_approved: is_approved
      });

      console.log("API response:", response.data);

      // Return the userId and new approval status
      return {
        userId,
        is_approved: is_approved
      };
    } catch (error: unknown) {
      console.error("API error:", error);
      const err = error as ApiError;
      if (err.response?.data) {
        return rejectWithValue(
          err.response.data.message ||
          err.response.data.error ||
          "Failed to update user approval"
        );
      }
      return rejectWithValue("Failed to update user approval");
    }
  }
);


// Async thunk for fetching users for modals/dropdowns (separate from pipeline users)
export const fetchModalUsers = createAsyncThunk<
  { users: User[]; total: number; limit: number; offset: number },
  FetchUsersParams
>(
  "users/fetchModalUsers",
  async (params: FetchUsersParams = {}, { rejectWithValue }) => {
    try {
      // Construct query parameters
      const queryParams = new URLSearchParams();

      // Use 'role' (singular) if roles are specified
      if (params.roles && params.roles.length > 0) {
        queryParams.append("role", params.roles[0]);
      }

      if (params.search) {
        queryParams.append("search", params.search);
      }

      // Only add limit/offset if provided and > 0
      if (params.limit && params.limit > 0) {
        queryParams.append("limit", params.limit.toString());
      }
      if (params.offset && params.offset > 0) {
        queryParams.append("offset", params.offset.toString());
      }

      const response = await api.get(
        `/users?${queryParams.toString()}`
      );

      // Handle different response formats
      let users: User[];
      let total: number;

      if (Array.isArray(response.data)) {
        // If the response is a direct array of users
        users = response.data;
        total = response.data.length;
      } else if (response.data.users && Array.isArray(response.data.users)) {
        // If the response has a users property with an array
        users = response.data.users;
        total = response.data.total || response.data.users.length;
      } else {
        // Fallback or error case
        throw new Error("Unexpected API response format");
      }

      // Normalize approval field for backward compatibility
      users = users.map((user) => ({
        ...user,
        approved:
          user.is_approved !== undefined ? user.is_approved : user.approved,
      }));

      return {
        users,
        total,
        limit: params.limit || 0,
        offset: params.offset || 0,
      };
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response?.data) {
        return rejectWithValue(
          err.response.data.message ||
          err.response.data.error ||
          "An error occurred"
        );
      }
      return rejectWithValue("An error occurred while fetching users");
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUsersError: (state) => {
      state.error = null;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setCurrentFilters: (state, action: PayloadAction<FetchUsersInfoParams>) => {
      state.currentFilters = {
        ...action.payload,
        limit: action.payload.limit || state.pageSize
      };
    },
    removeUserFromList: (state, action: PayloadAction<string>) => {
      const userId = action.payload;

      state.users = state.users.filter(user => user.id !== userId);
      state.modalUsers = state.modalUsers.filter(user => user.id !== userId);
      state.customers = state.customers.filter(user => user.id !== userId);
      state.financialAdvisors = state.financialAdvisors.filter(user => user.id !== userId);

      state.totalUsers = Math.max(0, state.totalUsers - 1);

      const limit = state.currentFilters.limit || 20;
      state.totalPages = Math.ceil(state.totalUsers / limit);

      if (state.users.length === 0 && state.currentPage > 1) {
        state.currentPage = Math.max(1, state.currentPage - 1);
      }
    },
    setFinancialAdvisorCurrentFilters: (state, action: PayloadAction<FetchFinancialAdvisorUsersParams>) => {
      state.financialAdvisorCurrentFilters = action.payload;
    },
    localUpdateApproval: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      state.users = state.users.map((user) => {
        if (user.id === userId) {
          // Ensure we're working with proper boolean values
          const currentApproval = Boolean(user.is_approved !== undefined ? user.is_approved : user.approved);
          const newApprovalStatus = !currentApproval;

          console.log("Local update - Current:", currentApproval, "New:", newApprovalStatus);

          return {
            ...user,
            is_approved: newApprovalStatus,
            approved: newApprovalStatus,
          };
        }
        return user;
      });
    },
    clearUsers: (state) => {
      // Clear users data when switching pipelines
      state.users = [];
    },
    clearEmailCheck: (state) => {
      state.emailExists = false;
      state.emailCheckError = null;
      state.emailCheckLoading = false;
    },
    resetEmailCheck: (state) => {
      state.emailExists = false;
      state.emailCheckError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users cases
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.totalUsers = action.payload.total;

        // Calculate total pages
        const limit = action.payload.limit || 20;
        state.totalPages = Math.ceil(action.payload.total / limit);

        // Calculate current page based on offset and limit
        const offset = action.payload.offset || 0;
        state.currentPage = Math.floor(offset / limit) + 1;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedUser = action.payload;

        // Update user in all relevant arrays
        state.users = state.users.map(user =>
          user.id === updatedUser.id ? { ...user, ...updatedUser } : user
        );
        state.modalUsers = state.modalUsers.map(user =>
          user.id === updatedUser.id ? { ...user, ...updatedUser } : user
        );
        state.customers = state.customers.map(user =>
          user.id === updatedUser.id ? { ...user, ...updatedUser } : user
        );
        state.financialAdvisors = state.financialAdvisors.map(user =>
          user.id === updatedUser.id ? { ...user, ...updatedUser } : user
        );

        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete user cases
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserApproval.pending, (state) => {
        // Don't set loading here to avoid UI flickering
        state.error = null;
      })
      .addCase(updateUserApproval.fulfilled, (state, action) => {
        const { userId, is_approved } = action.payload;
        console.log("Updating user approval in state:", { userId, is_approved });

        // Update the user in the users array
        state.users = state.users.map((user) => {
          if (user.id === userId) {
            return {
              ...user,
              is_approved: is_approved, // Ensure this is a boolean
              approved: is_approved,    // Keep both fields in sync
            };
          }
          return user;
        });
      })
      .addCase(updateUserApproval.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Add cases for fetchUsersByConsultant
      .addCase(fetchUsersByConsultant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsersByConsultant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload as unknown as User[];
        state.totalUsers = action.payload.length;
        state.totalPages = 1; // Since we're getting all users for a consultant
        state.currentPage = 1;
      })
      .addCase(fetchUsersByConsultant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Add cases for createUser
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Add cases for importUsersFromExcel
      .addCase(importUsersFromExcel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(importUsersFromExcel.fulfilled, (state) => {
        state.isLoading = false;
        // Optionally handle response
      })
      .addCase(importUsersFromExcel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Add cases for fetchModalUsers
      .addCase(fetchModalUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModalUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.modalUsers = action.payload.users;
        state.totalUsers = action.payload.total;
        state.totalPages = Math.ceil(action.payload.total / 20);
        state.currentPage = Math.floor(action.payload.offset / 20) + 1;
      })
      .addCase(fetchModalUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Add cases for fetchCustomers
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = action.payload.users;
        state.totalCustomers = action.payload.total;

        // Calculate total pages for customers
        const limit = action.payload.limit || 20;
        state.totalPages = Math.ceil(action.payload.total / limit);

        // Calculate current page based on offset and limit
        const offset = action.payload.offset || 0;
        state.currentPage = Math.floor(offset / limit) + 1;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Add cases for fetchUsersInfo
      .addCase(fetchUsersInfo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsersInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.totalUsers = action.payload.total;

        // Calculate total pages for users info
        const limit = action.payload.limit || 20;
        state.totalPages = Math.ceil(action.payload.total / limit);

        // Calculate current page based on offset and limit
        const offset = action.payload.offset || 0;
        state.currentPage = Math.floor(offset / limit) + 1;
      })
      .addCase(fetchUsersInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Add cases for fetchFinancialAdvisorUsers
      .addCase(fetchFinancialAdvisorUsers.pending, (state) => {
        state.financialAdvisorLoading = true;
        state.financialAdvisorError = null;
      })
      .addCase(fetchFinancialAdvisorUsers.fulfilled, (state, action) => {
        state.financialAdvisorLoading = false;
        state.financialAdvisors = action.payload.users;
        state.totalFinancialAdvisors = action.payload.total;

        // Calculate total pages for financial advisor users
        const limit = action.payload.limit || 10; // Default is 10 for this API
        state.financialAdvisorTotalPages = Math.ceil(action.payload.total / limit);

        // Calculate current page based on offset and limit
        const offset = action.payload.offset || 0;
        state.financialAdvisorCurrentPage = Math.floor(offset / limit) + 1;
      })
      .addCase(fetchFinancialAdvisorUsers.rejected, (state, action) => {
        state.financialAdvisorLoading = false;
        state.financialAdvisorError = action.payload as string;
      })

      // Add cases for fetchPipelinesWithCustomerCount
      .addCase(fetchPipelinesWithCustomerCount.pending, (state) => {
        state.pipelinesLoading = true;
        state.pipelinesError = null;
      })
      .addCase(fetchPipelinesWithCustomerCount.fulfilled, (state, action) => {
        state.pipelinesLoading = false;
        state.pipelinesWithCustomerCount = action.payload;
      })
      .addCase(fetchPipelinesWithCustomerCount.rejected, (state, action) => {
        state.pipelinesLoading = false;
        state.pipelinesError = action.payload as string;
      })

      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedUserId = action.payload;

        // Remove the deleted user from all user arrays
        state.users = state.users.filter(user => user.id !== deletedUserId);
        state.modalUsers = state.modalUsers.filter(user => user.id !== deletedUserId);
        state.customers = state.customers.filter(user => user.id !== deletedUserId);
        state.financialAdvisors = state.financialAdvisors.filter(user => user.id !== deletedUserId);

        // Update totals
        state.totalUsers = Math.max(0, state.totalUsers - 1);
        state.totalCustomers = Math.max(0, state.totalCustomers - 1);
        state.totalFinancialAdvisors = Math.max(0, state.totalFinancialAdvisors - 1);

        // Recalculate total pages
        const limit = state.currentFilters.limit || 20;
        state.totalPages = Math.ceil(state.totalUsers / limit);

        // If current page is now empty and we're not on page 1, go to previous page
        if (state.users.length === 0 && state.currentPage > 1) {
          state.currentPage = Math.max(1, state.currentPage - 1);
        }

        state.error = null;
      })

      // Add cases for fetchLeadpoolPipelinesWithCustomerCount
      .addCase(fetchLeadpoolPipelinesWithCustomerCount.pending, (state) => {
        state.pipelinesLoading = true;
        state.pipelinesError = null;
      })
      .addCase(fetchLeadpoolPipelinesWithCustomerCount.fulfilled, (state, action) => {
        state.pipelinesLoading = false;
        state.pipelinesWithCustomerCount = action.payload;
      })
      .addCase(fetchLeadpoolPipelinesWithCustomerCount.rejected, (state, action) => {
        state.pipelinesLoading = false;
        state.pipelinesError = action.payload as string;
      })

      .addCase(checkEmailExists.pending, (state) => {
        state.emailCheckLoading = true;
        state.emailCheckError = null;
        state.emailExists = false;
      })
      .addCase(checkEmailExists.fulfilled, (state, action) => {
        state.emailCheckLoading = false;
        state.emailExists = action.payload.exists;
        state.emailCheckError = null;
      })
      .addCase(checkEmailExists.rejected, (state, action) => {
        state.emailCheckLoading = false;
        state.emailCheckError = action.payload as string;
        state.emailExists = false;
      });

  },
});

export const {
  clearUsersError,
  clearSelectedUser,
  setCurrentPage,
  setCurrentFilters,
  setFinancialAdvisorCurrentFilters,
  localUpdateApproval,
  clearUsers,
  clearEmailCheck,
  resetEmailCheck,
  removeUserFromList,
} = usersSlice.actions;

export default usersSlice.reducer;