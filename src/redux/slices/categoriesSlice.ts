import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import axios from "axios";
import api from "../api/axiosConfig";

// Define category types
export interface Category {
  id: string;
  name: string;
  image?: string;
  description?: string;
}

export interface SubCategory {
  id: string;
  name: string;
  category_id: string;
}

// interface ApiError {
//   response?: {
//     data: {
//       message?: string;
//       error?: string;
//       statusCode?: number;
//     };
//     status: number;
//   };
// }

interface CategoriesState {
  categories: Category[];
  category: Category | null;
  subCategories: SubCategory[];
  subCategory: SubCategory | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  category: null,
  subCategories: [],
  subCategory: null,
  isLoading: false,
  error: null,
};

// Async thunk for fetching all categories
export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/categories");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch categories");
    }
  }
);

// Fetch all subcategories
export const fetchSubCategories = createAsyncThunk(
  "categories/fetchSubCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/categories/sub-categories");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch subcategories");
    }
  }
);

// Create a new subcategory
export const createSubCategory = createAsyncThunk(
  "categories/createSubCategory",
  async (data: { name: string; category_id: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/categories/sub-categories", data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to create subcategory");
    }
  }
);

// Get subcategory by ID
export const fetchSubCategoryById = createAsyncThunk(
  "categories/fetchSubCategoryById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/categories/sub-categories/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch subcategory");
    }
  }
);

// Update a subcategory
export const updateSubCategory = createAsyncThunk(
  "categories/updateSubCategory",
  async ({ id, data }: { id: string; data: { name: string; category_id: string } }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/categories/sub-categories/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update subcategory");
    }
  }
);

// Delete a subcategory
export const deleteSubCategory = createAsyncThunk(
  "categories/deleteSubCategory",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/sub-categories/${id}`);
      return id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to delete subcategory");
    }
  }
);

// New async thunk for fetching a category by ID
export const fetchCategoryById = createAsyncThunk(
  "categories/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch category");
    }
  }
);

// Create a new category
export const createCategory = createAsyncThunk(
  "categories/create",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post("/categories", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to create category");
    }
  }
);

// Update a category
export const updateCategory = createAsyncThunk(
  "categories/update",
  async ({ id, data }: { id: string; data: FormData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/categories/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update category");
    }
  }
);

// Delete a category
export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`);
      return id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to delete category");
    }
  }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCategoryState: (state) => {
      state.category = null;
      state.error = null;
    },
    clearSubCategoryState: (state) => {
      state.subCategory = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all categories cases
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false;
        const index = state.categories.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        state.category = action.payload;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.categories = state.categories.filter(category => category.id !== action.payload);
        if (state.category && state.category.id === action.payload) {
          state.category = null;
        }
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch category by ID cases
      .addCase(fetchCategoryById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false;
        state.category = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch all subcategories
      .addCase(fetchSubCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubCategories.fulfilled, (state, action: PayloadAction<SubCategory[]>) => {
        state.isLoading = false;
        state.subCategories = action.payload;
      })
      .addCase(fetchSubCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create subcategory
      .addCase(createSubCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSubCategory.fulfilled, (state, action: PayloadAction<SubCategory>) => {
        state.isLoading = false;
        state.subCategories.push(action.payload);
      })
      .addCase(createSubCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch subcategory by ID
      .addCase(fetchSubCategoryById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubCategoryById.fulfilled, (state, action: PayloadAction<SubCategory>) => {
        state.isLoading = false;
        state.subCategory = action.payload;
      })
      .addCase(fetchSubCategoryById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update subcategory
      .addCase(updateSubCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSubCategory.fulfilled, (state, action: PayloadAction<SubCategory>) => {
        state.isLoading = false;
        const index = state.subCategories.findIndex(subCat => subCat.id === action.payload.id);
        if (index !== -1) {
          state.subCategories[index] = action.payload;
        }
        state.subCategory = action.payload;
      })
      .addCase(updateSubCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete subcategory
      .addCase(deleteSubCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSubCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.subCategories = state.subCategories.filter(subCategory => subCategory.id !== action.payload);
        if (state.subCategory && state.subCategory.id === action.payload) {
          state.subCategory = null;
        }
      })
      .addCase(deleteSubCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCategoryState, clearSubCategoryState, clearError } = categoriesSlice.actions;
export default categoriesSlice.reducer;
