import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";

// Types
interface SupportWelcomeMessage {
  id: string;
  message: string;
  created_at: string;
  updated_at: string;
}

interface UpdateWelcomeMessageRequest {
  message: string;
}

interface SupportWelcomeMessageState {
  message: SupportWelcomeMessage | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SupportWelcomeMessageState = {
  message: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchWelcomeMessage = createAsyncThunk(
  "supportWelcomeMessage/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/support-welcome-message");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch welcome message");
    }
  }
);

export const updateWelcomeMessage = createAsyncThunk(
  "supportWelcomeMessage/update",
  async (data: UpdateWelcomeMessageRequest, { rejectWithValue }) => {
    try {
      const response = await api.put("/support-welcome-message", data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update welcome message");
    }
  }
);

// Slice
const supportWelcomeMessageSlice = createSlice({
  name: "supportWelcomeMessage",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch welcome message
      .addCase(fetchWelcomeMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchWelcomeMessage.fulfilled,
        (state, action: PayloadAction<SupportWelcomeMessage>) => {
          state.isLoading = false;
          state.message = action.payload;
        }
      )
      .addCase(fetchWelcomeMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update welcome message
      .addCase(updateWelcomeMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateWelcomeMessage.fulfilled,
        (state, action: PayloadAction<SupportWelcomeMessage>) => {
          state.isLoading = false;
          state.message = action.payload;
        }
      )
      .addCase(updateWelcomeMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = supportWelcomeMessageSlice.actions;
export default supportWelcomeMessageSlice.reducer; 