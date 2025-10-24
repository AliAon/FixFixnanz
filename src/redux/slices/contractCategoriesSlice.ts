import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from "../api/axiosConfig";

// Types
export interface ContractCategory {
  id: number;
  name: string;
  image?: string;
}

interface ContractCategoriesState {
  categories: ContractCategory[];
  category: ContractCategory | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: ContractCategoriesState = {
  categories: [],
  category: null,
  loading: false,
  error: null
};

// Async thunks
export const fetchCategories = createAsyncThunk(
  'contractCategories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/contract-categories');
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch categories');
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  'contractCategories/fetchCategoryById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/contract-categories/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch category');
    }
  }
);

export const createCategory = createAsyncThunk(
  'contractCategories/createCategory',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post('/contract-categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to create category');
    }
  }
);


export const updateCategory = createAsyncThunk(
  'contractCategories/updateCategory',
  async ({ id, data }: { id: number; data: FormData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/contract-categories/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'contractCategories/deleteCategory',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/contract-categories/${id}`);
      return id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to delete category');
    }
  }
);

// Slice
const contractCategoriesSlice = createSlice({
  name: 'contractCategories',
  initialState,
  reducers: {
    clearCategoryState: (state) => {
      state.category = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<ContractCategory[]>) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch category by ID
    builder
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action: PayloadAction<ContractCategory>) => {
        state.loading = false;
        state.category = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create category
    builder
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<ContractCategory>) => {
        state.loading = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update category
    builder
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<ContractCategory>) => {
        state.loading = false;
        const index = state.categories.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        state.category = action.payload;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete category
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.categories = state.categories.filter(category => category.id !== action.payload);
        if (state.category && state.category.id === action.payload) {
          state.category = null;
        }
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCategoryState, clearError } = contractCategoriesSlice.actions;

export default contractCategoriesSlice.reducer;