import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";

// Types
interface Stage {
  description: string;
  order: number;
  id: string;
  name: string;
}

export interface Pipeline {
  id: number;
  user_id: string;
  name: string;
  source: string;
  type: string;
  company_id: number;
  created_at: string;
  updated_at: string;
  stages: Stage[];
  is_deleted: boolean;
}

export interface CreatePipelineRequest {
  name: string;
  source: string;
  type: "normal" | "leadpool" | "meta" | "agency" | "profile";
  company_id?: string; // Optional for leadpool pipelines
}

interface PipelineState {
  pipelines: Pipeline[];
  agencyPipelines: Pipeline[];
  currentPipeline: Pipeline | null;
  isLoading: boolean;
  error: string | null;
  loading: {
    pipelines: false,
    currentPipeline: false,
    stages: false,
  }
}

const initialState: PipelineState = {
  pipelines: [],
  agencyPipelines: [],
  currentPipeline: null,
  isLoading: false,
  error: null,
  loading: {
    pipelines: false,
    currentPipeline: false,
    stages: false,
  }
};

// Get all pipelines for the user
export const fetchPipelines = createAsyncThunk(
  "pipeline/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/pipeline");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch pipelines");
    }
  }
);

// Get pipelines by type (e.g., "agency")
export const fetchPipelinesByType = createAsyncThunk(
  "pipeline/fetchByType",
  async (type: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/pipeline?type=${type}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch pipelines by type");
    }
  }
);

// Get agency pipelines specifically (stores in separate state)
export const fetchAgencyPipelinesOnly = createAsyncThunk(
  "pipeline/fetchAgencyOnly",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/pipeline?type=agency`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch agency pipelines");
    }
  }
);

// Create a new pipeline
export const createPipeline = createAsyncThunk(
  "pipeline/create",
  async (data: CreatePipelineRequest, { rejectWithValue }) => {
    try {
      const response = await api.post("/pipeline", data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to create pipeline");
    }
  }
);

// Create pipeline for specific user
export const createPipelineForUser = createAsyncThunk(
  "pipeline/createForUser",
  async ({ userId, data }: { userId: string; data: CreatePipelineRequest }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/pipeline/for-user/${userId}`, data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to create pipeline for user");
    }
  }
);

// Get a specific pipeline
export const fetchPipelineById = createAsyncThunk(
  "pipeline/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/pipeline/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch pipeline");
    }
  }
);

// Update a pipeline
export const updatePipeline = createAsyncThunk(
  "pipeline/update",
  async ({ id, data }: { id: string; data: Partial<CreatePipelineRequest> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/pipeline/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update pipeline");
    }
  }
);

// Delete a pipeline
export const deletePipeline = createAsyncThunk(
  "pipeline/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/pipeline/${id}`);
      return id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to delete pipeline");
    }
  }
);

const pipelineSlice = createSlice({
  name: "pipeline",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPipeline: (state) => {
      state.currentPipeline = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all pipelines
      .addCase(fetchPipelines.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPipelines.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pipelines = action.payload;
      })
      .addCase(fetchPipelines.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch pipelines by type
      .addCase(fetchPipelinesByType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPipelinesByType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pipelines = action.payload;
      })
      .addCase(fetchPipelinesByType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch agency pipelines only (separate state)
      .addCase(fetchAgencyPipelinesOnly.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAgencyPipelinesOnly.fulfilled, (state, action) => {
        state.isLoading = false;
        state.agencyPipelines = action.payload;
      })
      .addCase(fetchAgencyPipelinesOnly.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create pipeline
      .addCase(createPipeline.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPipeline.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pipelines.push(action.payload);
        state.currentPipeline = action.payload;
      })
      .addCase(createPipeline.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch pipeline by ID
      .addCase(fetchPipelineById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPipelineById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPipeline = action.payload;
      })
      .addCase(fetchPipelineById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update pipeline
      .addCase(updatePipeline.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePipeline.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.pipelines.findIndex(pipeline => pipeline.id === action.payload.id);
        if (index !== -1) {
          state.pipelines[index] = action.payload;
        }
        if (state.currentPipeline?.id === action.payload.id) {
          state.currentPipeline = action.payload;
        }
      })
      .addCase(updatePipeline.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete pipeline
      .addCase(deletePipeline.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePipeline.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pipelines = state.pipelines.filter(pipeline => pipeline.id.toString() !== action.payload);
        if (state.currentPipeline?.id.toString() === action.payload) {
          state.currentPipeline = null;
        }
      })
      .addCase(deletePipeline.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentPipeline } = pipelineSlice.actions;
export default pipelineSlice.reducer; 