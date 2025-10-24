import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";

// Types
export interface Stage {
  id: string;
  pipeline_id: string;
  name: string;
  color: string;
  position: number;
  created_at: string;
  updated_at: string;
  pipelines: Record<string, {
    id: string;
    name: string;
    color: string;
    position: number;
  }>;
}

interface CreateStageRequest {
  pipeline_id: string;
  name: string;
  color: string;
  position: number;
}

interface StageState {
  stages: Stage[];
  currentStage: Stage | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: StageState = {
  stages: [],
  currentStage: null,
  isLoading: false,
  error: null,
};

// Get all stages for a pipeline
export const fetchStagesByPipeline = createAsyncThunk(
  "stage/fetchByPipeline",
  async (pipelineId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/stage/pipelines/${pipelineId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch stages");
    }
  }
);

// Get a specific stage
export const fetchStageById = createAsyncThunk(
  "stage/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/stage/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch stage");
    }
  }
);

// Create a new stage
export const createStage = createAsyncThunk(
  "stage/create",
  async (data: CreateStageRequest, { rejectWithValue }) => {
    try {
      const response = await api.post("/stage", data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to create stage");
    }
  }
);

// Create a new stage for a specific pipeline (admin)
export const createStageForPipeline = createAsyncThunk(
  "stage/createForPipeline",
  async ({ pipelineId, data }: { pipelineId: string; data: Omit<CreateStageRequest, 'pipeline_id'> }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/stage/for-pipeline/${pipelineId}`, data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to create stage for pipeline");
    }
  }
);

// Update a stage
export const updateStage = createAsyncThunk(
  "stage/update",
  async ({ id, data }: { id: string; data: Partial<CreateStageRequest> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/stage/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update stage");
    }
  }
);

// Delete a stage
export const deleteStage = createAsyncThunk(
  "stage/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/stage/${id}`);
      return id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to delete stage");
    }
  }
);

const stageSlice = createSlice({
  name: "stage",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentStage: (state) => {
      state.currentStage = null;
    },
    clearStages: (state) => {
      state.stages = [];
      state.currentStage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stages by pipeline
      .addCase(fetchStagesByPipeline.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStagesByPipeline.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stages = action.payload;
      })
      .addCase(fetchStagesByPipeline.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch stage by ID
      .addCase(fetchStageById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStageById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentStage = action.payload;
      })
      .addCase(fetchStageById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create stage
      .addCase(createStage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createStage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stages.push(action.payload);
        state.currentStage = action.payload;
      })
      .addCase(createStage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create stage for pipeline
      .addCase(createStageForPipeline.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createStageForPipeline.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stages.push(action.payload);
        state.currentStage = action.payload;
      })
      .addCase(createStageForPipeline.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update stage
      .addCase(updateStage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateStage.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.stages.findIndex(stage => stage.id === action.payload.id);
        if (index !== -1) {
          state.stages[index] = action.payload;
        }
        if (state.currentStage?.id === action.payload.id) {
          state.currentStage = action.payload;
        }
      })
      .addCase(updateStage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete stage
      .addCase(deleteStage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteStage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stages = state.stages.filter(stage => stage.id !== action.payload);
        if (state.currentStage?.id === action.payload) {
          state.currentStage = null;
        }
      })
      .addCase(deleteStage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentStage, clearStages } = stageSlice.actions;
export default stageSlice.reducer;