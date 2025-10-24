import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";

// Types for filter state
export interface NotificationTemplateFilters {
  category: string;
  type: string;
  is_default: boolean | null;
  is_enabled: boolean | null; // Add is_enabled filter
  search: string;
  hasSignature: boolean | null;
  sortBy: "title" | "category" | "type" | "created_at" | "updated_at";
  sortOrder: "asc" | "desc";
  limit: number;
  offset: number;
}

// Template interface
export interface NotificationTemplate {
  id: string;
  category: string;
  type: string;
  title: string;
  body: string;
  cc_emails: string[];
  signature_id: string | null;
  is_default: boolean;
  is_enabled: boolean; // Add is_enabled field
  pipeline_id?: string;
  created_at: string;
  updated_at: string;
}

// State interface
export interface NotificationTemplateState extends NotificationTemplateFilters {
  templates: NotificationTemplate[];
  pipelineTemplates: NotificationTemplate[];
  loading: boolean;
  error: string | null;
  currentPipelineId: string | null;
  totalCount: number;
}

// Notification category options
export type NotificationCategory =
  | "video_consultation"
  | "telephone_appointments"
  | "lead_notification"

// Notification type options
export type NotificationType =
  | "appointment_confirmation"
  | "date_change"
  | "appointment_cancellation"
  | "appointment_reminder"
  | "for_advisor"
  | "for_customer";

// Type for creating a notification template
export interface CreateNotificationTemplatePayload {
  category: NotificationCategory;
  type: NotificationType;
  title: string;
  body: string;
  cc_emails: string[];
  signature_id: string | null;
  is_enabled?: boolean; // Add is_enabled field
}

// Type for creating or updating pipeline-specific notification template
export interface CreatePipelineNotificationTemplatePayload {
  pipelineId: string;
  category: NotificationCategory;
  type: NotificationType;
  title: string;
  body: string;
  cc_emails: string[];
  signature_id: string | null;
  pipeline_id?: string;
  is_enabled?: boolean; // Add is_enabled field
}

// Type for updating pipeline-specific notification template
export interface UpdatePipelineNotificationTemplatePayload {
  pipelineId: string;
  templateId: string;
  title: string;
  body: string;
  cc_emails: string[];
  signature_id: string | null;
  is_enabled?: boolean; // Add is_enabled field
}

// Type for updating a notification template
export interface UpdateNotificationTemplatePayload {
  templateId: string;
  title: string;
  body: string;
  cc_emails: string[];
  signature_id: string | null;
  is_enabled?: boolean; // Add is_enabled field
}

// Type for updating template status
export interface UpdateTemplateStatusPayload {
  pipelineId: string;
  templateId: string;
  is_enabled: boolean;
}

// Type for updating all templates status in a pipeline
export interface UpdatePipelineStatusPayload {
  pipelineId: string;
  is_enabled: boolean;
}

const initialState: NotificationTemplateState = {
  category: "",
  type: "",
  is_default: null,
  is_enabled: null, // Add is_enabled to initial state
  search: "",
  hasSignature: null,
  sortBy: "created_at",
  sortOrder: "desc",
  limit: 10,
  offset: 0,
  templates: [],
  pipelineTemplates: [],
  loading: false,
  error: null,
  currentPipelineId: null,
  totalCount: 0,
};

// Async thunk for fetching general notification templates
export const fetchNotificationTemplates = createAsyncThunk(
  "notificationTemplates/fetch",
  async (params: {
    category?: string;
    type?: string;
    is_default?: boolean;
    is_enabled?: boolean; // Add is_enabled parameter
    search?: string;
    hasSignature?: boolean;
    sortBy?: string;
    sortOrder?: string;
    limit?: number;
    offset?: number;
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      // Add optional query parameters
      if (params.category) queryParams.append('category', params.category);
      if (params.type) queryParams.append('type', params.type);
      if (params.is_default !== undefined) queryParams.append('is_default', params.is_default.toString());
      if (params.is_enabled !== undefined) queryParams.append('is_enabled', params.is_enabled.toString()); // Add is_enabled to query
      if (params.search) queryParams.append('search', params.search);
      if (params.hasSignature !== undefined) queryParams.append('hasSignature', params.hasSignature.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());

      const queryString = queryParams.toString();
      const url = `/notifications/templates${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(url);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch notification templates"
      );
    }
  }
);

// Async thunk for fetching pipeline-specific notification templates
export const fetchPipelineNotificationTemplates = createAsyncThunk(
  "notificationTemplates/fetchPipeline",
  async (params: {
    pipelineId: string;
    category?: string;
    type?: string;
    is_default?: boolean;
    is_enabled?: boolean; // Add is_enabled parameter
    search?: string;
    hasSignature?: boolean;
    sortBy?: string;
    sortOrder?: string;
    limit?: number;
    offset?: number;
  }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add optional query parameters
      if (params.category) queryParams.append('category', params.category);
      if (params.type) queryParams.append('type', params.type);
      if (params.is_default !== undefined) queryParams.append('is_default', params.is_default.toString());
      if (params.is_enabled !== undefined) queryParams.append('is_enabled', params.is_enabled.toString()); // Add is_enabled to query
      if (params.search) queryParams.append('search', params.search);
      if (params.hasSignature !== undefined) queryParams.append('hasSignature', params.hasSignature.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());

      const queryString = queryParams.toString();
      const url = `/notifications/pipelines/${params.pipelineId}/templates${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return {
        data: response.data,
        pipelineId: params.pipelineId
      };
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch pipeline notification templates"
      );
    }
  }
);

// Async thunk for creating or updating pipeline-specific notification template
export const createPipelineNotificationTemplate = createAsyncThunk(
  "notificationTemplates/createPipeline",
  async (payload: CreatePipelineNotificationTemplatePayload, { rejectWithValue }) => {
    try {
      const { pipelineId, ...data } = payload;
      // Include pipeline_id in the request body as shown in API documentation
      const requestData = {
        ...data,
        pipeline_id: pipelineId
      };
      const response = await api.post(`/notifications/pipelines/${pipelineId}/templates`, requestData);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to create pipeline notification template"
      );
    }
  }
);

// Async thunk for creating a notification template
export const createNotificationTemplate = createAsyncThunk(
  "notificationTemplates/create",
  async (payload: CreateNotificationTemplatePayload, { rejectWithValue }) => {
    try {
      const response = await api.post("/notifications/templates", payload);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to create notification template"
      );
    }
  }
);

// Async thunk for updating pipeline-specific notification template
export const updatePipelineNotificationTemplate = createAsyncThunk(
  "notificationTemplates/updatePipeline",
  async (payload: UpdatePipelineNotificationTemplatePayload, { rejectWithValue }) => {
    try {
      const { pipelineId, templateId, ...data } = payload;
      const response = await api.put(`/notifications/pipelines/${pipelineId}/templates/${templateId}`, data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update pipeline notification template"
      );
    }
  }
);

// Async thunk for updating a notification template
export const updateNotificationTemplate = createAsyncThunk(
  "notificationTemplates/update",
  async (payload: UpdateNotificationTemplatePayload, { rejectWithValue }) => {
    try {
      const { templateId, ...data } = payload;
      const response = await api.put(`/notifications/templates/${templateId}`, data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update notification template"
      );
    }
  }
);

// NEW: Async thunk for updating pipeline template status
export const updatePipelineTemplateStatus = createAsyncThunk(
  "notificationTemplates/updatePipelineStatus",
  async (payload: UpdateTemplateStatusPayload, { rejectWithValue }) => {
    try {
      const { pipelineId, templateId, is_enabled } = payload;
      const response = await api.put(
        `/notifications/pipelines/${pipelineId}/templates/${templateId}/status`,
        { is_enabled }
      );
      return {
        templateId,
        is_enabled,
        data: response.data
      };
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update template status"
      );
    }
  }
);

// NEW: Async thunk for updating all templates status in a pipeline
export const updatePipelineStatus = createAsyncThunk(
  "notificationTemplates/updateAllPipelineStatus",
  async (payload: UpdatePipelineStatusPayload, { rejectWithValue }) => {
    try {
      const { pipelineId, is_enabled } = payload;
      const response = await api.put(
        `/notifications/pipelines/${pipelineId}/status`,
        { is_enabled }
      );
      return {
        pipelineId,
        is_enabled,
        data: response.data
      };
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update pipeline status"
      );
    }
  }
);

// Async thunk for updating notification settings
export const updateNotificationSettings = createAsyncThunk(
  "notificationSettings/update",
  async (
    params: { category: string; type: string; is_enabled: boolean },
    { rejectWithValue }
  ) => {
    try {
      const { category, type, is_enabled } = params;
      const response = await api.put(
        `/notifications/settings/${category}/${type}`,
        { is_enabled }
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update notification settings"
      );
    }
  }
);

const notificationTemplateSlice = createSlice({
  name: "notificationTemplateFilters",
  initialState,
  reducers: {
    setCategory(state, action: PayloadAction<string>) {
      state.category = action.payload;
    },
    setType(state, action: PayloadAction<string>) {
      state.type = action.payload;
    },
    setIsDefault(state, action: PayloadAction<boolean | null>) {
      state.is_default = action.payload;
    },
    setIsEnabled(state, action: PayloadAction<boolean | null>) {
      state.is_enabled = action.payload;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setHasSignature(state, action: PayloadAction<boolean | null>) {
      state.hasSignature = action.payload;
    },
    setSortBy(state, action: PayloadAction<"title" | "category" | "type" | "created_at" | "updated_at">) {
      state.sortBy = action.payload;
    },
    setSortOrder(state, action: PayloadAction<"asc" | "desc">) {
      state.sortOrder = action.payload;
    },
    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
    },
    setOffset(state, action: PayloadAction<number>) {
      state.offset = action.payload;
    },
    setCurrentPipelineId(state, action: PayloadAction<string | null>) {
      state.currentPipelineId = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    resetFilters() {
      return initialState;
    },
    // NEW: Local state update for optimistic UI updates
    toggleTemplateStatusOptimistically(state, action: PayloadAction<{ templateId: string; is_enabled: boolean }>) {
      const { templateId, is_enabled } = action.payload;

      // Update in pipelineTemplates array
      const pipelineIndex = state.pipelineTemplates.findIndex(t => t.id === templateId);
      if (pipelineIndex !== -1) {
        state.pipelineTemplates[pipelineIndex].is_enabled = is_enabled;
      }

      // Update in templates array
      const templateIndex = state.templates.findIndex(t => t.id === templateId);
      if (templateIndex !== -1) {
        state.templates[templateIndex].is_enabled = is_enabled;
      }
    },
  },
  extraReducers: (builder) => {
    // Handle fetchNotificationTemplates
    builder
      .addCase(fetchNotificationTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificationTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload.data || action.payload;
        state.totalCount = action.payload.count || action.payload.length || 0;
      })
      .addCase(fetchNotificationTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.templates = [];
      });

    // Handle fetchPipelineNotificationTemplates
    builder
      .addCase(fetchPipelineNotificationTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPipelineNotificationTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.pipelineTemplates = action.payload.data.data || action.payload.data;
        state.totalCount = action.payload.data.count || action.payload.data.length || 0;
        state.currentPipelineId = action.payload.pipelineId;
      })
      .addCase(fetchPipelineNotificationTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.pipelineTemplates = [];
      });

    // Handle createNotificationTemplate
    builder
      .addCase(createNotificationTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNotificationTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.templates.push(action.payload);
      })
      .addCase(createNotificationTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Handle createPipelineNotificationTemplate
    builder
      .addCase(createPipelineNotificationTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPipelineNotificationTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.pipelineTemplates.push(action.payload);
      })
      .addCase(createPipelineNotificationTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Handle updateNotificationTemplate
    builder
      .addCase(updateNotificationTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNotificationTemplate.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.templates.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.templates[index] = action.payload;
        }
      })
      .addCase(updateNotificationTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Handle updatePipelineNotificationTemplate
    builder
      .addCase(updatePipelineNotificationTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePipelineNotificationTemplate.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pipelineTemplates.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.pipelineTemplates[index] = action.payload;
        }
      })
      .addCase(updatePipelineNotificationTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Handle updateNotificationSettings
    builder
      .addCase(updateNotificationSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNotificationSettings.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateNotificationSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // NEW: Handle updatePipelineTemplateStatus
    builder
      .addCase(updatePipelineTemplateStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updatePipelineTemplateStatus.fulfilled, (state, action) => {
        const { templateId, is_enabled } = action.payload;

        // Update in pipelineTemplates array
        const pipelineIndex = state.pipelineTemplates.findIndex(t => t.id === templateId);
        if (pipelineIndex !== -1) {
          state.pipelineTemplates[pipelineIndex].is_enabled = is_enabled;
        }

        // Update in templates array
        const templateIndex = state.templates.findIndex(t => t.id === templateId);
        if (templateIndex !== -1) {
          state.templates[templateIndex].is_enabled = is_enabled;
        }
      })
      .addCase(updatePipelineTemplateStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // NEW: Handle updatePipelineStatus
    builder
      .addCase(updatePipelineStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePipelineStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { pipelineId, is_enabled } = action.payload;

        // Update all templates for this pipeline
        state.pipelineTemplates.forEach((template) => {
          if (template.pipeline_id === pipelineId) {
            template.is_enabled = is_enabled;
          }
        });
      })
      .addCase(updatePipelineStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCategory,
  setType,
  setIsDefault,
  setIsEnabled, // NEW: Export setIsEnabled action
  setSearch,
  setHasSignature,
  setSortBy,
  setSortOrder,
  setLimit,
  setOffset,
  setCurrentPipelineId,
  clearError,
  resetFilters,
  toggleTemplateStatusOptimistically, // NEW: Export optimistic update action
} = notificationTemplateSlice.actions;

// Selectors
export const selectNotificationTemplateFilters = (state: RootState) => state.notificationTemplateFilters;
export const selectNotificationTemplates = (state: RootState) => state.notificationTemplateFilters.templates;
export const selectPipelineNotificationTemplates = (state: RootState) => state.notificationTemplateFilters.pipelineTemplates;
export const selectNotificationTemplatesLoading = (state: RootState) => state.notificationTemplateFilters.loading;
export const selectNotificationTemplatesError = (state: RootState) => state.notificationTemplateFilters.error;
export const selectCurrentPipelineId = (state: RootState) => state.notificationTemplateFilters.currentPipelineId;
export const selectNotificationTemplatesTotalCount = (state: RootState) => state.notificationTemplateFilters.totalCount;

export default notificationTemplateSlice.reducer;