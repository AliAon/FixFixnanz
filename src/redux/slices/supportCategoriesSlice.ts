import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";

// Types
export interface SupportCategory {
  id: string;
  name: string;
  slug: string;
  status: number;
  user_id: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateSupportCategoryRequest {
  name: string;
  slug?: string;
  status?: number;
}

interface UpdateSupportCategoryRequest {
  id: string;
  data: {
    name?: string;
    slug?: string;
    status?: number;
  };
}

interface SupportCategoriesState {
  categories: SupportCategory[];
  category: SupportCategory | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SupportCategoriesState = {
  categories: [],
  category: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchSupportCategories = createAsyncThunk(
  "supportCategories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/support-categories");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch support categories");
    }
  }
);

export const fetchSupportCategoryById = createAsyncThunk(
  "supportCategories/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/support-categories/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch support category");
    }
  }
);

export const createSupportCategory = createAsyncThunk(
  "supportCategories/create",
  async (data: CreateSupportCategoryRequest, { rejectWithValue }) => {
    try {
      const response = await api.post("/support-categories", data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to create support category");
    }
  }
);

export const updateSupportCategory = createAsyncThunk(
  "supportCategories/update",
  async ({ id, data }: UpdateSupportCategoryRequest, { rejectWithValue }) => {
    try {
      const response = await api.put(`/support-categories/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update support category");
    }
  }
);

export const deleteSupportCategory = createAsyncThunk(
  "supportCategories/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/support-categories/${id}`);
      return id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to delete support category");
    }
  }
);

// Slice
const supportCategoriesSlice = createSlice({
  name: "supportCategories",
  initialState,
  reducers: {
    clearSupportCategoryState: (state) => {
      state.category = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all categories
      .addCase(fetchSupportCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSupportCategories.fulfilled, (state, action: PayloadAction<SupportCategory[]>) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchSupportCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch category by ID
      .addCase(fetchSupportCategoryById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSupportCategoryById.fulfilled, (state, action: PayloadAction<SupportCategory>) => {
        state.isLoading = false;
        state.category = action.payload;
      })
      .addCase(fetchSupportCategoryById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create category
      .addCase(createSupportCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSupportCategory.fulfilled, (state, action: PayloadAction<SupportCategory>) => {
        state.isLoading = false;
        state.categories.push(action.payload);
      })
      .addCase(createSupportCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update category
      .addCase(updateSupportCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSupportCategory.fulfilled, (state, action: PayloadAction<SupportCategory>) => {
        state.isLoading = false;
        const index = state.categories.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        state.category = action.payload;
      })
      .addCase(updateSupportCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete category
      .addCase(deleteSupportCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSupportCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.categories = state.categories.filter(category => category.id !== action.payload);
        if (state.category && state.category.id === action.payload) {
          state.category = null;
        }
      })
      .addCase(deleteSupportCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSupportCategoryState, clearError } = supportCategoriesSlice.actions;
export default supportCategoriesSlice.reducer;
