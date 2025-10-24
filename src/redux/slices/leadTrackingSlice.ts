import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";

// Types
export interface LeadTracking {
  id: string;
  user_id: string;
  userId: string;
  activity: string;
  created_at: string;
  updated_at: string;
  // Add more fields as needed
}

export interface LeadTrackingState {
  leadTrackings: LeadTracking[];
  currentLeadTracking: LeadTracking | null;
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: LeadTrackingState = {
  leadTrackings: [],
  currentLeadTracking: null,
  isLoading: false,
  error: null,
  success: null,
};

// Async thunks
export const createLeadTracking = createAsyncThunk(
  "leadTracking/create",
  async (data: Partial<LeadTracking>, { rejectWithValue }) => {
    try {
      const response = await api.post("/lead-tracking", data);
      return response.data;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        // @ts-expect-error: error.response is likely from axios
        return rejectWithValue(error.response?.data?.message || "Failed to create lead tracking record");
      }
      return rejectWithValue("Failed to create lead tracking record");
    }
  }
);

export const fetchAllLeadTrackings = createAsyncThunk(
  "leadTracking/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/lead-tracking");
      return response.data;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        // @ts-expect-error: error.response is likely from axios
        return rejectWithValue(error.response?.data?.message || "Failed to fetch lead tracking records");
      }
      return rejectWithValue("Failed to fetch lead tracking records");
    }
  }
);

export const fetchLeadTrackingById = createAsyncThunk(
  "leadTracking/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/lead-tracking/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        // @ts-expect-error: error.response is likely from axios
        return rejectWithValue(error.response?.data?.message || "Failed to fetch lead tracking record");
      }
      return rejectWithValue("Failed to fetch lead tracking record");
    }
  }
);

export const deleteLeadTracking = createAsyncThunk(
  "leadTracking/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/lead-tracking/${id}`);
      return id;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        // @ts-expect-error: error.response is likely from axios
        return rejectWithValue(error.response?.data?.message || "Failed to delete lead tracking record");
      }
      return rejectWithValue("Failed to delete lead tracking record");
    }
  }
);

export const fetchLeadTrackingsByUserId = createAsyncThunk(
  "leadTracking/fetchByUserId",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/lead-tracking/user/${userId}`);
      return response.data;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        // @ts-expect-error: error.response is likely from axios
        return rejectWithValue(error.response?.data?.message || "Failed to fetch lead tracking records by user ID");
      }
      return rejectWithValue("Failed to fetch lead tracking records by user ID");
    }
  }
);

export const fetchLeadTrackingsByActivity = createAsyncThunk(
  "leadTracking/fetchByActivity",
  async (activity: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/lead-tracking/activity/${activity}`);
      return response.data;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        // @ts-expect-error: error.response is likely from axios
        return rejectWithValue(error.response?.data?.message || "Failed to fetch lead tracking records by activity");
      }
      return rejectWithValue("Failed to fetch lead tracking records by activity");
    }
  }
);

const leadTrackingSlice = createSlice({
  name: "leadTracking",
  initialState,
  reducers: {
    clearLeadTrackingMessages: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createLeadTracking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createLeadTracking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = "Lead tracking record created successfully";
        state.leadTrackings.push(action.payload);
      })
      .addCase(createLeadTracking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch all
      .addCase(fetchAllLeadTrackings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllLeadTrackings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leadTrackings = action.payload;
      })
      .addCase(fetchAllLeadTrackings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch by ID
      .addCase(fetchLeadTrackingById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeadTrackingById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentLeadTracking = action.payload;
      })
      .addCase(fetchLeadTrackingById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteLeadTracking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteLeadTracking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = "Lead tracking record deleted successfully";
        state.leadTrackings = state.leadTrackings.filter((lt) => lt.id !== action.payload);
      })
      .addCase(deleteLeadTracking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch by userId
      .addCase(fetchLeadTrackingsByUserId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeadTrackingsByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leadTrackings = action.payload;
      })
      .addCase(fetchLeadTrackingsByUserId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch by activity
      .addCase(fetchLeadTrackingsByActivity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeadTrackingsByActivity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leadTrackings = action.payload;
      })
      .addCase(fetchLeadTrackingsByActivity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearLeadTrackingMessages } = leadTrackingSlice.actions;
export default leadTrackingSlice.reducer; 