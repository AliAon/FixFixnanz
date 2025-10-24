import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";

// Types
export interface SupportFaq {
  id: string;
  user_id: string;
  category_id: string;
  question: string;
  answer: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateSupportFaqRequest {
  category_id: string;
  question: string;
  answer: string;
}

interface UpdateSupportFaqRequest {
  id: string;
  data: {
    category_id?: string;
    question?: string;
    answer?: string;
  };
}

interface SupportFaqsState {
  faqs: SupportFaq[];
  faq: SupportFaq | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SupportFaqsState = {
  faqs: [],
  faq: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchSupportFaqs = createAsyncThunk(
  "supportFaqs/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/support-faqs");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch support FAQs");
    }
  }
);

export const fetchSupportFaqById = createAsyncThunk(
  "supportFaqs/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/support-faqs/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch support FAQ");
    }
  }
);

export const createSupportFaq = createAsyncThunk(
  "supportFaqs/create",
  async (data: CreateSupportFaqRequest, { rejectWithValue }) => {
    try {
      const response = await api.post("/support-faqs", data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to create support FAQ");
    }
  }
);

export const updateSupportFaq = createAsyncThunk(
  "supportFaqs/update",
  async ({ id, data }: UpdateSupportFaqRequest, { rejectWithValue }) => {
    try {
      const response = await api.put(`/support-faqs/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update support FAQ");
    }
  }
);

export const deleteSupportFaq = createAsyncThunk(
  "supportFaqs/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/support-faqs/${id}`);
      return id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to delete support FAQ");
    }
  }
);

// Slice
const supportFaqsSlice = createSlice({
  name: "supportFaqs",
  initialState,
  reducers: {
    clearSupportFaqState: (state) => {
      state.faq = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all FAQs
      .addCase(fetchSupportFaqs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSupportFaqs.fulfilled, (state, action: PayloadAction<SupportFaq[]>) => {
        state.isLoading = false;
        state.faqs = action.payload;
      })
      .addCase(fetchSupportFaqs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch FAQ by ID
      .addCase(fetchSupportFaqById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSupportFaqById.fulfilled, (state, action: PayloadAction<SupportFaq>) => {
        state.isLoading = false;
        state.faq = action.payload;
      })
      .addCase(fetchSupportFaqById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create FAQ
      .addCase(createSupportFaq.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSupportFaq.fulfilled, (state, action: PayloadAction<SupportFaq>) => {
        state.isLoading = false;
        state.faqs.push(action.payload);
      })
      .addCase(createSupportFaq.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update FAQ
      .addCase(updateSupportFaq.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSupportFaq.fulfilled, (state, action: PayloadAction<SupportFaq>) => {
        state.isLoading = false;
        const index = state.faqs.findIndex(faq => faq.id === action.payload.id);
        if (index !== -1) {
          state.faqs[index] = action.payload;
        }
        state.faq = action.payload;
      })
      .addCase(updateSupportFaq.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete FAQ
      .addCase(deleteSupportFaq.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSupportFaq.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.faqs = state.faqs.filter(faq => faq.id !== action.payload);
        if (state.faq && state.faq.id === action.payload) {
          state.faq = null;
        }
      })
      .addCase(deleteSupportFaq.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSupportFaqState, clearError } = supportFaqsSlice.actions;
export default supportFaqsSlice.reducer; 