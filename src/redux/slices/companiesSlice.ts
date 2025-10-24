import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from "@/redux/api/axiosConfig";

// Define Company type based on the API response
export interface Company {
  id: string;
  name: string;
  created_by: string;
  status: 'active' | 'inactive' | string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  // Add any other fields that might be in your API response
}

// Define interfaces
interface CompaniesState {
  companies: Company[];
  currentCompany: Company | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  totalCompanies: number;
  currentPage: number;
  totalPages: number;
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

export interface FetchCompaniesParams {
  search?: string;
  limit?: number;
  offset?: number;
}

const initialState: CompaniesState = {
  companies: [],
  currentCompany: null,
  status: 'idle',
  error: null,
  totalCompanies: 0,
  currentPage: 1,
  totalPages: 1,
};

// Async thunks
export const fetchCompanies = createAsyncThunk<
  { companies: Company[]; total: number; limit: number; offset: number },
  FetchCompaniesParams
>(
  'companies/fetchAll',
  async (params: FetchCompaniesParams = {}, { rejectWithValue }) => {
    try {
      // Set default pagination values if not provided
      const limit = params.limit || 0;
      const offset = params.offset || 0;

      // Construct query parameters
      const queryParams = new URLSearchParams();

      if (params.search) {
        queryParams.append("search", params.search);
      }

      queryParams.append("limit", limit.toString());
      queryParams.append("offset", offset.toString());

      const response = await api.get(
        `/business/companies?${queryParams.toString()}`
      );

      let companies: Company[];
      let total: number;

      if (Array.isArray(response.data)) {
        companies = response.data;
        total = response.data.length;
      } else if (response.data.companies && Array.isArray(response.data.companies)) {
        companies = response.data.companies;
        total = response.data.total || response.data.companies.length;
      } else {
        // Fallback for when the API returns a single object with companies array
        companies = response.data || [];
        total = companies.length;
      }

      return {
        companies,
        total,
        limit,
        offset,
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
      return rejectWithValue("An error occurred while fetching companies");
    }
  }
);

export const fetchCompanyById = createAsyncThunk<Company, string>(
  'companies/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/business/companies/${id}`);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response?.data) {
        return rejectWithValue(
          err.response.data.message ||
            err.response.data.error ||
            "An error occurred"
        );
      }
      return rejectWithValue("An error occurred while fetching the company");
    }
  }
);

export const createCompany = createAsyncThunk<Company, Partial<Company>>(
  'companies/create',
  async (companyData: Partial<Company>, { rejectWithValue }) => {
    try {
      const response = await api.post('/business/companies', companyData);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response?.data) {
        return rejectWithValue(
          err.response.data.message ||
            err.response.data.error ||
            "An error occurred"
        );
      }
      return rejectWithValue("An error occurred while creating the company");
    }
  }
);

export const updateCompany = createAsyncThunk<
  Company, 
  { id: string; data: Partial<Company> }
>(
  'companies/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/business/companies/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response?.data) {
        return rejectWithValue(
          err.response.data.message ||
            err.response.data.error ||
            "An error occurred"
        );
      }
      return rejectWithValue("An error occurred while updating the company");
    }
  }
);

export const deleteCompany = createAsyncThunk<string, string>(
  'companies/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/business/companies/${id}`);
      return id;
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response?.data) {
        return rejectWithValue(
          err.response.data.message ||
            err.response.data.error ||
            "An error occurred"
        );
      }
      return rejectWithValue("An error occurred while deleting the company");
    }
  }
);

// Slice
const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    clearCompaniesError: (state) => {
      state.error = null;
    },
    clearCurrentCompany: (state) => {
      state.currentCompany = null;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all companies
      .addCase(fetchCompanies.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.companies = action.payload.companies;
        state.totalCompanies = action.payload.total;
        state.error = null;
        
        // Calculate total pages
        const limit = action.payload.limit || 20;
        state.totalPages = Math.ceil(action.payload.total / limit);
        
        // Calculate current page based on offset and limit
        const offset = action.payload.offset || 0;
        state.currentPage = Math.floor(offset / limit) + 1;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Fetch company by id
      .addCase(fetchCompanyById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCompanyById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentCompany = action.payload;
        state.error = null;
      })
      .addCase(fetchCompanyById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Create company
      .addCase(createCompany.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.companies.push(action.payload);
        state.totalCompanies += 1;
        state.error = null;
        
        // Recalculate total pages
        state.totalPages = Math.ceil(state.totalCompanies / 20);
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Update company
      .addCase(updateCompany.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.companies.findIndex(company => company.id === action.payload.id);
        if (index !== -1) {
          state.companies[index] = action.payload;
        }
        state.currentCompany = action.payload;
        state.error = null;
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Delete company
      .addCase(deleteCompany.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const deletedId = action.payload;
        state.companies = state.companies.filter(company => company.id !== deletedId);
        state.totalCompanies -= 1;
        
        if (state.currentCompany && state.currentCompany.id === deletedId) {
          state.currentCompany = null;
        }
        
        // Recalculate total pages
        state.totalPages = Math.ceil(state.totalCompanies / 20);
        
        // Adjust current page if we're on the last page and it's now empty
        if (state.currentPage > state.totalPages && state.totalPages > 0) {
          state.currentPage = state.totalPages;
        }
        
        state.error = null;
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  }
});

export const { clearCompaniesError, clearCurrentCompany, setCurrentPage } = companiesSlice.actions;
export default companiesSlice.reducer;