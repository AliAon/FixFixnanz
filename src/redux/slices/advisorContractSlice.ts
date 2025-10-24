import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";

// Define types
interface AdvisorContract {
  id: string;
  body: string;
  created_at: string;
  updated_at: string;
  status?: "pending" | "approved" | "declined";
}

interface AdvisorContractState {
  contract: AdvisorContract | null;
  isLoading: boolean;
  error: string | null;
  downloadUrl: string | null;
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

const initialState: AdvisorContractState = {
  contract: null,
  isLoading: false,
  error: null,
  downloadUrl: null
};

// Fetch advisor contract
export const getAdvisorContract = createAsyncThunk(
  "advisorContract/getContract",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/advisor-contract");
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch advisor contract"
      );
    }
  }
);

// Update advisor contract
export const updateAdvisorContract = createAsyncThunk(
    "advisorContract/updateContract",
    async (contractData: { body: string, status?: string }, { rejectWithValue }) => {
      try {
        const response = await api.put("/advisor-contract", contractData);
        return response.data;
      } catch (error: unknown) {
        const err = error as ApiError;
        return rejectWithValue(
          err.response?.data?.message || "Failed to update advisor contract"
        );
      }
    }
  );
// Generate download URL for contract
export const getAdvisorContractPdf = createAsyncThunk(
    "advisorContract/downloadPdf",
    async (_, { rejectWithValue }) => {
      try {
        const response = await api.get("/advisor-contract/download-pdf", {
          responseType: 'blob'
        });
        
        // Create a blob URL for the PDF
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        return url;
      } catch (error: unknown) {
        console.error("PDF download error:", error);
        return rejectWithValue(
          "Failed to download advisor contract"
        );
      }
    }
  );

const advisorContractSlice = createSlice({
  name: "advisorContract",
  initialState,
  reducers: {
    clearContractError: (state) => {
      state.error = null;
    },
    clearDownloadUrl: (state) => {
      if (state.downloadUrl) {
        window.URL.revokeObjectURL(state.downloadUrl);
        state.downloadUrl = null;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Get contract cases
      .addCase(getAdvisorContract.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAdvisorContract.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contract = action.payload;
      })
      .addCase(getAdvisorContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update contract cases
      .addCase(updateAdvisorContract.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAdvisorContract.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contract = action.payload;
      })
      .addCase(updateAdvisorContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Download PDF cases
      .addCase(getAdvisorContractPdf.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        
        // Clear previous download URL if any
        if (state.downloadUrl) {
          window.URL.revokeObjectURL(state.downloadUrl);
          state.downloadUrl = null;
        }
      })
      .addCase(getAdvisorContractPdf.fulfilled, (state, action) => {
        state.isLoading = false;
        state.downloadUrl = action.payload;
      })
      .addCase(getAdvisorContractPdf.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearContractError, clearDownloadUrl } = advisorContractSlice.actions;
export default advisorContractSlice.reducer;