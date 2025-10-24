/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";
// import { RootState } from "../store";

// Types
interface CustomerPreferences {
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
  language?: string;
  theme?: "light" | "dark" | "system";
  timezone?: string;
  currency?: string;
}

export interface CustomerCountResponse {
  count: number;
  consultantId?: string;
}

export interface CustomerState {
  customers: Customer[];
  currentCustomer: Customer | null;
  customerProfile: CustomerProfile | null;
  customerProfileData: CustomerProfile | null;
  customerCount: number; // Add this line
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

export interface Customer {
  deal_name: any;
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username?: string; // Added username field
  phone?: string;
  avatar_url?: string;
  invitation_status?: "pending" | "accepted" | "rejected";
  status?: string; // Added status field for lead status
  created_at: string;
  updated_at: string;
  consultant_id?: string;
  preferences?: CustomerPreferences;
}

export interface CustomerProfile {
  address?: string;
  city?: string;
  state?: string;
  dob?: string;
  occupation?: string;
  postal_code?: string;
  country?: string;
  preferences?: CustomerPreferences;
  news?: string;
  monthly_income?: number;
  monthly_expenses?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  title?: string;
  marital_status?: string;
  profession?: string;
  nationality?: string;
  employer?: string;
  employment_status?: string;
  housing_situation?: string;
  avatar_url?: string;
}

export interface CustomerState {
  customers: Customer[];
  currentCustomer: Customer | null;
  customerProfile: CustomerProfile | null;
  customerProfileData: CustomerProfile | null;
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status: number;
  };
}

// Initial state
const initialState: CustomerState = {
  customers: [],
  currentCustomer: null,
  customerProfile: null,
  customerProfileData: null,
  isLoading: false,
  customerCount: 0, // Add this lines
  error: null,
  success: null,
};

// Async thunks
export const fetchAllCustomers = createAsyncThunk(
  "customers/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/customers");
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch customers"
      );
    }
  }
);

export const fetchCustomerCount = createAsyncThunk(
  "customers/fetchCount",
  async (
    params: { consultantId?: string; status?: string },
    { rejectWithValue }
  ) => {
    try {
      const searchParams = new URLSearchParams();
      if (params.consultantId)
        searchParams.append("consultantId", params.consultantId);
      if (params.status) searchParams.append("status", params.status);

      const response = await api.get(
        `/customers/count?${searchParams.toString()}`
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch customer count"
      );
    }
  }
);

export const fetchCustomersProfileData = createAsyncThunk(
  "customers/fetchProfileData",
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/customers/profile/${id}`);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch customer profile data"
      );
    }
  }
);

export const updateCustomersProfileData = createAsyncThunk(
  "customers/updateProfileData",
  async (
    { id, data }: { id: string; data: CustomerProfile },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/customers/profile-data/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update customer profile data"
      );
    }
  }
);

export const uploadProfileImage = createAsyncThunk(
  "customers/uploadProfileImage",
  async ({ imageFile }: { imageFile: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await api.post("/auth/profile/picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to upload profile image"
      );
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  "customers/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/customers/${id}`);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch customer details"
      );
    }
  }
);

export const fetchCustomerProfile = createAsyncThunk(
  "customers/fetchProfile",
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/customers/profile/${id}`);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch customer profile"
      );
    }
  }
);

export const updateCustomerProfile = createAsyncThunk(
  "customers/updateProfile",
  async (
    {
      userId,
      profileData,
    }: { userId: string; profileData: Partial<CustomerProfile> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(
        `/customers/profile/${userId}`,
        profileData
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update customer profile"
      );
    }
  }
);

export const createCustomer = createAsyncThunk(
  "customers/create",
  async (customerData: Partial<Customer>, { rejectWithValue }) => {
    try {
      const response = await api.post("/customers", customerData);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to create customer"
      );
    }
  }
);

export const assignConsultantToCustomer = createAsyncThunk(
  "customers/assignConsultant",
  async (
    { customerId, consultantId }: { customerId: string; consultantId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(
        `/customers/${customerId}/assign/${consultantId}`
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to assign consultant"
      );
    }
  }
);

export const updateInvitationStatus = createAsyncThunk(
  "customers/updateInvitationStatus",
  async (
    { id, status }: { id: string; status: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(
        `/customers/${id}/invitation-status/${status}`
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update invitation status"
      );
    }
  }
);

export const updateComprehensiveCustomerProfile = createAsyncThunk(
  "customers/updateComprehensiveProfile",
  async (
    {
      user_id,
      profileData,
    }: { user_id: string; profileData: Record<string, unknown> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(
        `/customers/comprehensive/${user_id}`,
        profileData
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message ||
          "Failed to update comprehensive customer profile"
      );
    }
  }
);

export const transferCustomersToAgencyStage = createAsyncThunk(
  "customers/transferToAgencyStage",
  async (
    {
      customer_ids,
      agency_pipeline_id,
      target_stage_id,
    }: {
      customer_ids: string[];
      agency_pipeline_id: string;
      target_stage_id: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/customers/transfer-to-agency-stage", {
        customer_ids,
        agency_pipeline_id,
        target_stage_id,
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message ||
          "Failed to transfer customers to agency stage"
      );
    }
  }
);

export const updateCustomerStatus = createAsyncThunk(
  "customers/updateStatus",
  async (
    { customerId, status }: { customerId: string; status: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/customers/${customerId}/status`, {
        status: status,
      });
      return { customerId, status, data: response.data };
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update customer status"
      );
    }
  }
);

export const updateCustomerAdditionalData = createAsyncThunk(
  "customers/updateAdditionalData",
  async (
    {
      customerId,
      additionalData,
    }: { customerId: string; additionalData: Record<string, any> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(
        `/customers/${customerId}/additional-data`,
        {
          additional_data: additionalData,
        }
      );
      return { customerId, data: response.data };
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message ||
          "Failed to update customer additional data"
      );
    }
  }
);

// Add new async thunk for fetching customers with additional data
export const fetchCustomersWithAdditionalData = createAsyncThunk(
  "customers/fetchWithAdditionalData",
  async (
    params: {
      consultant_id: string;
      stage_id?: string;
      additional_data_fields?: string[];
    },
    { rejectWithValue }
  ) => {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append("consultant_id", params.consultant_id);
      if (params.stage_id) searchParams.append("stage_id", params.stage_id);
      if (
        params.additional_data_fields &&
        params.additional_data_fields.length > 0
      ) {
        params.additional_data_fields.forEach((field) => {
          searchParams.append("additional_data_fields", field);
        });
      }

      const response = await api.get(
        `/customers/with-additional-data?${searchParams.toString()}`
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message ||
          "Failed to fetch customers with additional data"
      );
    }
  }
);

// Create the slice
const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    clearCustomerMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    setCurrentCustomer: (state, action) => {
      state.currentCustomer = action.payload;
    },
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all customers
      .addCase(fetchAllCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllCustomers.fulfilled, (state, action) => {
        console.log("Reducer received:", action.payload);
        state.isLoading = false;

        // Store the customer data correctly
        if (action.payload && typeof action.payload === "object") {
          // If the response has a customers property that's an array
          if (
            action.payload.customers &&
            Array.isArray(action.payload.customers)
          ) {
            state.customers = action.payload.customers;
          }
          // If customers property exists but isn't an array
          else if (action.payload.customers) {
            console.warn(
              "Customers property exists but isn't an array:",
              action.payload.customers
            );
            // Try to convert it to an array if possible
            state.customers = Object.values(action.payload.customers);
          }
          // If the payload itself is the array
          else if (Array.isArray(action.payload)) {
            state.customers = action.payload;
          }
          // Otherwise, try to extract data from whatever structure we have
          else {
            console.warn("Unknown payload structure:", action.payload);
            state.customers = [];
          }
        } else {
          state.customers = [];
        }

        console.log("Updated Redux state.customers:", state.customers);
      })
      .addCase(fetchAllCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch customer by ID
      .addCase(fetchCustomerById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch customer profile
      .addCase(fetchCustomerProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customerProfile = action.payload;
      })
      .addCase(fetchCustomerProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(updateCustomerAdditionalData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateCustomerAdditionalData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = "Customer additional data updated successfully";

        // Update the customer in the customers array
        if (action.payload && state.customers.length > 0) {
          const index = state.customers.findIndex(
            (customer) => customer.id === action.payload.customerId
          );

          if (index !== -1) {
            state.customers[index] = {
              ...state.customers[index],
              ...action.payload.data,
            };
          }
        }

        // Update current customer if it's the same one
        if (
          state.currentCustomer &&
          action.payload &&
          state.currentCustomer.id === action.payload.customerId
        ) {
          state.currentCustomer = {
            ...state.currentCustomer,
            ...action.payload.data,
          };
        }
      })
      .addCase(updateCustomerAdditionalData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch customers with additional data
      .addCase(fetchCustomersWithAdditionalData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomersWithAdditionalData.fulfilled, (state, action) => {
        state.isLoading = false;
        // You can store this in a separate state property or replace current customers
        // depending on your use case
        state.customers = action.payload;
      })
      .addCase(fetchCustomersWithAdditionalData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update customer profile
      .addCase(updateCustomerProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateCustomerProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = "Customer profile updated successfully";
        state.customerProfile = action.payload;
      })
      .addCase(updateCustomerProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchCustomerCount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerCount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customerCount = action.payload.count;
      })
      .addCase(fetchCustomerCount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create customer
      .addCase(createCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = "Customer created successfully";
        state.customers.push(action.payload);
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Assign consultant to customer
      .addCase(assignConsultantToCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(assignConsultantToCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = "Consultant assigned successfully";

        // Update the customer in the customers array
        if (action.payload && state.customers.length > 0) {
          const index = state.customers.findIndex(
            (customer) => customer.id === action.payload.id
          );

          if (index !== -1) {
            state.customers[index] = action.payload;
          }
        }

        // Update current customer if it's the same one
        if (
          state.currentCustomer &&
          action.payload &&
          state.currentCustomer.id === action.payload.id
        ) {
          state.currentCustomer = action.payload;
        }
      })
      .addCase(assignConsultantToCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update invitation status
      .addCase(updateInvitationStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateInvitationStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = "Invitation status updated successfully";

        // Update the customer in the customers array
        if (action.payload && state.customers.length > 0) {
          const index = state.customers.findIndex(
            (customer) => customer.id === action.payload.id
          );

          if (index !== -1) {
            state.customers[index] = action.payload;
          }
        }

        // Update current customer if it's the same one
        if (
          state.currentCustomer &&
          action.payload &&
          state.currentCustomer.id === action.payload.id
        ) {
          state.currentCustomer = action.payload;
        }
      })
      .addCase(updateInvitationStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update comprehensive customer profile
      .addCase(updateComprehensiveCustomerProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateComprehensiveCustomerProfile.fulfilled, (state) => {
        state.isLoading = false;
        state.success = "Comprehensive customer profile updated successfully";
        // Optionally update state.customerProfile or other state here
      })
      .addCase(updateComprehensiveCustomerProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(updateCustomersProfileData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateCustomersProfileData.fulfilled, (state) => {
        state.isLoading = false;
        state.success = "Customers profile data updated successfully";
        // Optionally update state.customerProfileData or other state here
      })
      .addCase(updateCustomersProfileData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Upload profile image
      .addCase(uploadProfileImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = "Profile image uploaded successfully";
        // Update customerProfileData if it exists
        if (state.customerProfileData && action.payload?.avatar_url) {
          state.customerProfileData = {
            ...state.customerProfileData,
            avatar_url: action.payload.avatar_url,
          };
        }
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCustomersProfileData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(fetchCustomersProfileData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = "Customers profile data fetched successfully";
        state.customerProfileData = action.payload;
      })
      .addCase(fetchCustomersProfileData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Transfer customers to agency stage
      .addCase(transferCustomersToAgencyStage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(transferCustomersToAgencyStage.fulfilled, (state) => {
        state.isLoading = false;
        state.success = "Customers transferred to agency stage successfully";
        // Optionally update customers list or remove transferred customers
        // This depends on your UI requirements - you might want to:
        // 1. Refetch the customers list
        // 2. Remove transferred customers from current list
        // 3. Update their status/stage information
      })
      .addCase(transferCustomersToAgencyStage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update customer status
      .addCase(updateCustomerStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateCustomerStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = "Customer status updated successfully";

        // Update the customer in the customers array
        if (action.payload && state.customers.length > 0) {
          const index = state.customers.findIndex(
            (customer) => customer.id === action.payload.customerId
          );

          if (index !== -1) {
            // Update the customer with the new status
            state.customers[index] = {
              ...state.customers[index],
              // Add status field if it doesn't exist in Customer interface
              ...(action.payload.data || {}),
            };
          }
        }

        // Update current customer if it's the same one
        if (
          state.currentCustomer &&
          action.payload &&
          state.currentCustomer.id === action.payload.customerId
        ) {
          state.currentCustomer = {
            ...state.currentCustomer,
            ...(action.payload.data || {}),
          };
        }
      })
      .addCase(updateCustomerStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Selector for dropdown options
// Fixed selector function
// export const selectCustomerOptions = (state: RootState) => {
//   // First, check if the state contains the customers property at all
//   if (!state.customers) {
//     console.log("No customers state found");
//     return [];
//   }

//   // Get the customers array from the state
//   // The API returns { customers: [...] }, so we need to access that property
//   const customersArray = state.customers.customers || [];

//   // Check if it's actually an array
//   if (!Array.isArray(customersArray)) {
//     console.log("Customers is not an array:", customersArray);
//     return [];
//   }

//   console.log(
//     "object",

//     customersArray.map((customer) => ({
//       value: customer.id,
//       label: `ID: ${customer.id}`,
//     }))
//   );
//   // Map the customers to dropdown options
//   return customersArray.map((customer) => ({
//     value: customer.id,
//     label: `ID: ${customer.id}`,
//   }));
// };
export const {
  clearCustomerMessages,
  setCurrentCustomer,
  clearCurrentCustomer,
} = customersSlice.actions;

export default customersSlice.reducer;
