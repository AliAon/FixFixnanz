import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";

// Types and Interfaces
export interface MarketingPackage {
  id: string;
  name: string;
  description?: string;
  price: number;
  advisor_id: string;
  customer_id?: string;
  pipeline_id?: string;
  stage_id?: string;
  start_date?: string;
  end_date?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  // Related data
  advisor?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  customer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    company_name?: string;
  };
  pipeline?: {
    id: string;
    name: string;
  };
  stage?: {
    id: string;
    name: string;
    color: string;
  };
}

export interface FetchMarketingPackagesParams {
  page?: number;
  limit?: number;
  advisor_id?: string;
  customer_id?: string;
  pipeline_id?: string;
  stage_id?: string;
  price_min?: number;
  price_max?: number;
  start_date?: string; // YYYY-MM-DD format
  end_date?: string;   // YYYY-MM-DD format
  is_deleted?: boolean;
}

export interface CreateMarketingPackageData {
  name: string;
  description?: string;
  price?: number;
  advisor_id: string;
  customer_id?: string;
  pipeline_id?: string;
  stage_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface UpdateMarketingPackageData {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  advisor_id?: string;
  customer_id?: string;
  pipeline_id?: string;
  stage_id?: string;
  start_date?: string;
  end_date?: string;
  is_deleted?: boolean;
}

export interface MarketingPackagesResponse {
  packages: MarketingPackage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface MarketingPackagesState {
  packages: MarketingPackage[];
  currentPackage: MarketingPackage | null;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  // Pagination
  currentPage: number;
  totalPages: number;
  totalPackages: number;
  limit: number;
  // Filters
  filters: FetchMarketingPackagesParams;
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

const initialState: MarketingPackagesState = {
  packages: [],
  currentPackage: null,
  isLoading: false,
  error: null,
  success: null,
  currentPage: 1,
  totalPages: 1,
  totalPackages: 0,
  limit: 10,
  filters: {},
};

// Async Thunks

// Fetch all marketing packages with filters and pagination
export const fetchMarketingPackages = createAsyncThunk<
  MarketingPackagesResponse,
  FetchMarketingPackagesParams
>(
  "marketingPackages/fetchAll",
  async (params: FetchMarketingPackagesParams = {}, { rejectWithValue }) => {
    try {
      // Construct query parameters
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.advisor_id) queryParams.append("advisor_id", params.advisor_id);
      if (params.customer_id) queryParams.append("customer_id", params.customer_id);
      if (params.pipeline_id) queryParams.append("pipeline_id", params.pipeline_id);
      if (params.stage_id) queryParams.append("stage_id", params.stage_id);
      if (params.price_min !== undefined) queryParams.append("price_min", params.price_min.toString());
      if (params.price_max !== undefined) queryParams.append("price_max", params.price_max.toString());
      if (params.start_date) queryParams.append("start_date", params.start_date);
      if (params.end_date) queryParams.append("end_date", params.end_date);
      if (params.is_deleted !== undefined) queryParams.append("is_deleted", params.is_deleted.toString());

      const response = await api.get(`/marketing-packages?${queryParams.toString()}`);

      // Handle different response formats
      let packages: MarketingPackage[];
      let total: number;
      let page: number;
      let limit: number;
      let totalPages: number;

      if (Array.isArray(response.data)) {
        // Direct array response
        packages = response.data;
        total = response.data.length;
        page = params.page || 1;
        limit = params.limit || 10;
        totalPages = Math.ceil(total / limit);
      } else if (response.data.packages && Array.isArray(response.data.packages)) {
        // Paginated response
        packages = response.data.packages;
        total = response.data.total || packages.length;
        page = response.data.page || params.page || 1;
        limit = response.data.limit || params.limit || 10;
        totalPages = response.data.totalPages || Math.ceil(total / limit);
      } else {
        throw new Error("Unexpected API response format");
      }

      return {
        packages,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to fetch marketing packages"
      );
    }
  }
);

// Fetch a single marketing package by ID
export const fetchMarketingPackageById = createAsyncThunk<
  MarketingPackage,
  string
>(
  "marketingPackages/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/marketing-packages/${id}`);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to fetch marketing package"
      );
    }
  }
);

// Create a new marketing package
export const createMarketingPackage = createAsyncThunk<
  MarketingPackage,
  CreateMarketingPackageData
>(
  "marketingPackages/create",
  async (packageData: CreateMarketingPackageData, { rejectWithValue }) => {
    try {
      const response = await api.post("/marketing-packages", packageData);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to create marketing package"
      );
    }
  }
);

// Update an existing marketing package
export const updateMarketingPackage = createAsyncThunk<
  MarketingPackage,
  UpdateMarketingPackageData
>(
  "marketingPackages/update",
  async (updateData: UpdateMarketingPackageData, { rejectWithValue }) => {
    try {
      const { id, ...data } = updateData;
      const response = await api.put(`/marketing-packages/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update marketing package"
      );
    }
  }
);

// Delete a marketing package (soft delete)
export const deleteMarketingPackage = createAsyncThunk<
  { id: string },
  string
>(
  "marketingPackages/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/marketing-packages/${id}`);
      return { id };
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete marketing package"
      );
    }
  }
);

// Restore a deleted marketing package
export const restoreMarketingPackage = createAsyncThunk<
  MarketingPackage,
  string
>(
  "marketingPackages/restore",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/marketing-packages/${id}/restore`);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to restore marketing package"
      );
    }
  }
);

// Redux Slice
const marketingPackagesSlice = createSlice({
  name: "marketingPackages",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    setCurrentPackage: (state, action: PayloadAction<MarketingPackage | null>) => {
      state.currentPackage = action.payload;
    },
    setFilters: (state, action: PayloadAction<FetchMarketingPackagesParams>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch marketing packages
      .addCase(fetchMarketingPackages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMarketingPackages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.packages = action.payload.packages;
        state.totalPackages = action.payload.total;
        state.currentPage = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchMarketingPackages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch single marketing package
      .addCase(fetchMarketingPackageById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMarketingPackageById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPackage = action.payload;
      })
      .addCase(fetchMarketingPackageById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create marketing package
      .addCase(createMarketingPackage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createMarketingPackage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.packages.unshift(action.payload);
        state.currentPackage = action.payload;
        state.success = "Marketing package created successfully";
        state.totalPackages += 1;
      })
      .addCase(createMarketingPackage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update marketing package
      .addCase(updateMarketingPackage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateMarketingPackage.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.packages.findIndex(pkg => pkg.id === action.payload.id);
        if (index !== -1) {
          state.packages[index] = action.payload;
        }
        state.currentPackage = action.payload;
        state.success = "Marketing package updated successfully";
      })
      .addCase(updateMarketingPackage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete marketing package
      .addCase(deleteMarketingPackage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteMarketingPackage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.packages = state.packages.filter(pkg => pkg.id !== action.payload.id);
        state.success = "Marketing package deleted successfully";
        state.totalPackages -= 1;
        if (state.currentPackage?.id === action.payload.id) {
          state.currentPackage = null;
        }
      })
      .addCase(deleteMarketingPackage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Restore marketing package
      .addCase(restoreMarketingPackage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(restoreMarketingPackage.fulfilled, (state, action) => {
        state.isLoading = false;
        const existingIndex = state.packages.findIndex(pkg => pkg.id === action.payload.id);
        if (existingIndex !== -1) {
          state.packages[existingIndex] = action.payload;
        } else {
          state.packages.unshift(action.payload);
          state.totalPackages += 1;
        }
        state.currentPackage = action.payload;
        state.success = "Marketing package restored successfully";
      })
      .addCase(restoreMarketingPackage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearMessages,
  setCurrentPackage,
  setFilters,
  clearFilters,
  setCurrentPage,
  setLimit,
} = marketingPackagesSlice.actions;

export default marketingPackagesSlice.reducer; 