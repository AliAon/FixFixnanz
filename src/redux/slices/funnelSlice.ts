/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";

// Types
interface Component {
  id: string;
  type: string;
  text: string;
  level?: string;
  inputType?: string;
  src?: string;
  alt?: string;
  link?: string;
  author?: string;
  color?: string;
  backgroundColor?: string;
  hoverColor?: string;
  fontSize?: string;
  icon?: string;
  textAlign?: 'left' | 'center' | 'right';
  options?: string[];
  optionIcons?: string[];
}

interface Step {
  id: string;
  title: string;
  components: Component[];
}

interface FunnelSettings {
  customUrl?: string;
  privacyPolicy?: string;
  privacyPolicyLink?: string;
  privacyPolicyLinkText?: string;
  showProgressBar?: boolean;
  nextButtonText?: string;
  nextButtonColor?: string;
  nextButtonHoverColor?: string;
  previousButtonText?: string;
  previousButtonColor?: string;
  previousButtonHoverColor?: string;
  submitButtonText?: string;
  submitButtonColor?: string; 
  submitButtonTextColor?: string; 
  submitButtonHoverColor?: string; 
}

interface FunnelDesign {
  steps: Step[];
  settings?: FunnelSettings;
  templateUsed?: string;
  lastModified: string;
}

export interface Funnel {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
  publicLink: string;
  shortUrl: string;
  pipelineId: string;
  pipelineName: string;
  stageId: string;
  stageName: string;
  leads: number;
  views: number;
  conversions: number;
  conversionRate: number;
  design: FunnelDesign;
  userId: string;
  companyId?: string;
}

export interface CreateFunnelRequest {
  name: string;
  description?: string;
  pipelineId: string;
  stageId?: string;
  design: FunnelDesign;
  status?: 'active' | 'inactive' | 'draft';
}

export interface UpdateFunnelRequest {
  name?: string;
  description?: string;
  pipelineId?: string;
  stageId?: string;
  design?: FunnelDesign;
  status?: 'active' | 'inactive' | 'draft';
}

export interface DuplicateFunnelRequest {
  originalFunnelId: string;
  name: string;
  description?: string;
  pipelineId?: string;
  stageId?: string;
}

export interface FunnelAnalytics {
  funnelId: string;
  totalViews: number;
  totalLeads: number;
  conversionRate: number;
  stepAnalytics: {
    stepId: string;
    stepTitle: string;
    views: number;
    completions: number;
    dropOffRate: number;
  }[];
  timeRange: {
    startDate: string;
    endDate: string;
  };
}

interface FunnelState {
  funnels: Funnel[];
  currentFunnel: Funnel | null;
  funnelAnalytics: FunnelAnalytics | null;
  isLoading: boolean;
  error: string | null;
  loading: {
    funnels: boolean;
    currentFunnel: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
    duplicating: boolean;
    analytics: boolean;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

const initialState: FunnelState = {
  funnels: [],
  currentFunnel: null,
  funnelAnalytics: null,
  isLoading: false,
  error: null,
  loading: {
    funnels: false,
    currentFunnel: false,
    creating: false,
    updating: false,
    deleting: false,
    duplicating: false,
    analytics: false,
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  },
};

// Get all funnels for the user with filters
export const fetchFunnels = createAsyncThunk(
  "funnel/fetchAll",
  async (params: {
    page?: number;
    limit?: number;
    status?: string;
    pipelineId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await api.get(`/funnel?${queryParams.toString()}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch funnels");
    }
  }
);

// Get funnels by pipeline
export const fetchFunnelsByPipeline = createAsyncThunk(
  "funnel/fetchByPipeline",
  async (pipelineId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/funnel/pipeline/${pipelineId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch funnels by pipeline");
    }
  }
);

// Get a specific funnel by ID
export const fetchFunnelById = createAsyncThunk(
  "funnel/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/funnel/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch funnel");
    }
  }
);

// Get funnel by public URL slug
export const fetchFunnelBySlug = createAsyncThunk(
  "funnel/fetchBySlug",
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/funnel/public/${slug}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch funnel by slug");
    }
  }
);

// Create a new funnel
export const createFunnel = createAsyncThunk(
  "funnel/create",
  async (data: CreateFunnelRequest, { rejectWithValue }) => {
    try {
      const response = await api.post("/funnel", data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to create funnel");
    }
  }
);

// Update an existing funnel
export const updateFunnel = createAsyncThunk(
  "funnel/update",
  async ({ id, data }: { id: string; data: UpdateFunnelRequest }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/funnel/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update funnel");
    }
  }
);

// Update funnel status (activate/deactivate)
export const updateFunnelStatus = createAsyncThunk(
  "funnel/updateStatus",
  async ({ id, status }: { id: string; status: 'active' | 'inactive' | 'draft' }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/funnel/${id}/status`, { status });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update funnel status");
    }
  }
);

// Duplicate a funnel
export const duplicateFunnel = createAsyncThunk(
  "funnel/duplicate",
  async (data: DuplicateFunnelRequest, { rejectWithValue }) => {
    try {
      const response = await api.post(`/funnel/${data.originalFunnelId}/duplicate`, data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to duplicate funnel");
    }
  }
);

// Delete a funnel
export const deleteFunnel = createAsyncThunk(
  "funnel/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/funnel/${id}`);
      return id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to delete funnel");
    }
  }
);

// Get funnel analytics
export const fetchFunnelAnalytics = createAsyncThunk(
  "funnel/fetchAnalytics",
  async ({ id, startDate, endDate }: { 
    id: string; 
    startDate?: string; 
    endDate?: string; 
  }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await api.get(`/funnel/${id}/analytics?${params.toString()}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch funnel analytics");
    }
  }
);

// Generate new public URL for funnel
export const generateFunnelUrl = createAsyncThunk(
  "funnel/generateUrl",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/funnel/${id}/generate-url`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to generate funnel URL");
    }
  }
);

// Track funnel view (public endpoint)
export const trackFunnelView = createAsyncThunk(
  "funnel/trackView",
  async ({ slug, stepId, visitorId }: { 
    slug: string; 
    stepId?: string; 
    visitorId?: string; 
  }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/funnel/public/${slug}/track-view`, {
        stepId,
        visitorId,
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to track funnel view");
    }
  }
);

// Submit funnel lead (public endpoint)
export const submitFunnelLead = createAsyncThunk(
  "funnel/submitLead",
  async ({ slug, leadData, stepId }: { 
    slug: string; 
    leadData: Record<string, any>;
    stepId: string;
  }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/funnel/public/${slug}/submit-lead`, {
        leadData,
        stepId,
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to submit lead");
    }
  }
);

// Get funnel templates
export const fetchFunnelTemplates = createAsyncThunk(
  "funnel/fetchTemplates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/funnel/templates");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch funnel templates");
    }
  }
);

// Export funnel data
export const exportFunnel = createAsyncThunk(
  "funnel/export",
  async ({ id, format }: { id: string; format: 'json' | 'pdf' }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/funnel/${id}/export?format=${format}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to export funnel");
    }
  }
);

// Upload funnel image
export const uploadFunnelImage = createAsyncThunk(
  "funnel/uploadImage",
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/funnel/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to upload image");
    }
  }
);

const funnelSlice = createSlice({
  name: "funnel",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentFunnel: (state) => {
      state.currentFunnel = null;
    },
    clearFunnelAnalytics: (state) => {
      state.funnelAnalytics = null;
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    updateFunnelLocally: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.funnels.findIndex(funnel => funnel.id === id);
      if (index !== -1) {
        state.funnels[index] = { ...state.funnels[index], ...updates };
      }
      if (state.currentFunnel?.id === id) {
        state.currentFunnel = { ...state.currentFunnel, ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all funnels
      .addCase(fetchFunnels.pending, (state) => {
        state.loading.funnels = true;
        state.error = null;
      })
      .addCase(fetchFunnels.fulfilled, (state, action) => {
        state.loading.funnels = false;
        state.funnels = action.payload.funnels || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchFunnels.rejected, (state, action) => {
        state.loading.funnels = false;
        state.error = action.payload as string;
      })

      // Fetch funnels by pipeline
      .addCase(fetchFunnelsByPipeline.pending, (state) => {
        state.loading.funnels = true;
        state.error = null;
      })
      .addCase(fetchFunnelsByPipeline.fulfilled, (state, action) => {
        state.loading.funnels = false;
        state.funnels = action.payload;
      })
      .addCase(fetchFunnelsByPipeline.rejected, (state, action) => {
        state.loading.funnels = false;
        state.error = action.payload as string;
      })

      // Fetch funnel by ID
      .addCase(fetchFunnelById.pending, (state) => {
        state.loading.currentFunnel = true;
        state.error = null;
      })
      .addCase(fetchFunnelById.fulfilled, (state, action) => {
        state.loading.currentFunnel = false;
        state.currentFunnel = action.payload;
      })
      .addCase(fetchFunnelById.rejected, (state, action) => {
        state.loading.currentFunnel = false;
        state.error = action.payload as string;
      })

      // Fetch funnel by slug
      .addCase(fetchFunnelBySlug.pending, (state) => {
        state.loading.currentFunnel = true;
        state.error = null;
      })
      .addCase(fetchFunnelBySlug.fulfilled, (state, action) => {
        state.loading.currentFunnel = false;
        state.currentFunnel = action.payload;
      })
      .addCase(fetchFunnelBySlug.rejected, (state, action) => {
        state.loading.currentFunnel = false;
        state.error = action.payload as string;
      })

      // Create funnel
      .addCase(createFunnel.pending, (state) => {
        state.loading.creating = true;
        state.error = null;
      })
      .addCase(createFunnel.fulfilled, (state, action) => {
        state.loading.creating = false;
        state.funnels.unshift(action.payload);
        state.currentFunnel = action.payload;
      })
      .addCase(createFunnel.rejected, (state, action) => {
        state.loading.creating = false;
        state.error = action.payload as string;
      })

      // Upload funnel image
      .addCase(uploadFunnelImage.pending, (state) => {
        state.loading.updating = true;
        state.error = null;
      })
      .addCase(uploadFunnelImage.fulfilled, (state) => {
        state.loading.updating = false;
      })
      .addCase(uploadFunnelImage.rejected, (state, action) => {
        state.loading.updating = false;
        state.error = action.payload as string;
      })

      // Update funnel
      .addCase(updateFunnel.pending, (state) => {
        state.loading.updating = true;
        state.error = null;
      })
      .addCase(updateFunnel.fulfilled, (state, action) => {
        state.loading.updating = false;
        const index = state.funnels.findIndex(funnel => funnel.id === action.payload.id);
        if (index !== -1) {
          state.funnels[index] = action.payload;
        }
        if (state.currentFunnel?.id === action.payload.id) {
          state.currentFunnel = action.payload;
        }
      })
      .addCase(updateFunnel.rejected, (state, action) => {
        state.loading.updating = false;
        state.error = action.payload as string;
      })

      // Update funnel status
      .addCase(updateFunnelStatus.pending, (state) => {
        state.loading.updating = true;
        state.error = null;
      })
      .addCase(updateFunnelStatus.fulfilled, (state, action) => {
        state.loading.updating = false;
        const index = state.funnels.findIndex(funnel => funnel.id === action.payload.id);
        if (index !== -1) {
          state.funnels[index] = action.payload;
        }
        if (state.currentFunnel?.id === action.payload.id) {
          state.currentFunnel = action.payload;
        }
      })
      .addCase(updateFunnelStatus.rejected, (state, action) => {
        state.loading.updating = false;
        state.error = action.payload as string;
      })

      // Duplicate funnel
      .addCase(duplicateFunnel.pending, (state) => {
        state.loading.duplicating = true;
        state.error = null;
      })
      .addCase(duplicateFunnel.fulfilled, (state, action) => {
        state.loading.duplicating = false;
        state.funnels.unshift(action.payload);
      })
      .addCase(duplicateFunnel.rejected, (state, action) => {
        state.loading.duplicating = false;
        state.error = action.payload as string;
      })

      // Delete funnel
      .addCase(deleteFunnel.pending, (state) => {
        state.loading.deleting = true;
        state.error = null;
      })
      .addCase(deleteFunnel.fulfilled, (state, action) => {
        state.loading.deleting = false;
        state.funnels = state.funnels.filter(funnel => funnel.id !== action.payload);
        if (state.currentFunnel?.id === action.payload) {
          state.currentFunnel = null;
        }
      })
      .addCase(deleteFunnel.rejected, (state, action) => {
        state.loading.deleting = false;
        state.error = action.payload as string;
      })

      // Fetch funnel analytics
      .addCase(fetchFunnelAnalytics.pending, (state) => {
        state.loading.analytics = true;
        state.error = null;
      })
      .addCase(fetchFunnelAnalytics.fulfilled, (state, action) => {
        state.loading.analytics = false;
        state.funnelAnalytics = action.payload;
      })
      .addCase(fetchFunnelAnalytics.rejected, (state, action) => {
        state.loading.analytics = false;
        state.error = action.payload as string;
      })

      // Generate funnel URL
      .addCase(generateFunnelUrl.fulfilled, (state, action) => {
        const index = state.funnels.findIndex(funnel => funnel.id === action.payload.id);
        if (index !== -1) {
          state.funnels[index] = action.payload;
        }
        if (state.currentFunnel?.id === action.payload.id) {
          state.currentFunnel = action.payload;
        }
      })

      // Track funnel view
      .addCase(trackFunnelView.fulfilled, (state, action) => {
        if (state.currentFunnel && action.payload.views) {
          state.currentFunnel.views = action.payload.views;
        }
      })

      // Submit funnel lead
      .addCase(submitFunnelLead.fulfilled, (state, action) => {
        if (state.currentFunnel && action.payload.leads) {
          state.currentFunnel.leads = action.payload.leads;
          state.currentFunnel.conversions = action.payload.conversions;
          state.currentFunnel.conversionRate = action.payload.conversionRate;
        }
      });
  },
});

export const { 
  clearError, 
  clearCurrentFunnel, 
  clearFunnelAnalytics, 
  setCurrentPage,
  updateFunnelLocally 
} = funnelSlice.actions;

export default funnelSlice.reducer;