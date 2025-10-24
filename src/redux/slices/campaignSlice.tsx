/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../api/axiosConfig'; // Adjust path based on your project structure

// Types
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
}

/*interface CreateUserWithConsultantPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_id?: string;
  pipeline_id: string;
  stage_id: string;
  consultant_id: string;
  platform?: 'fb' | 'ig' | 'meta' | 'manual';
  additional_data?: Record<string, any>; // Add this field
}*/

export interface Pipeline {
  id: string;
  name: string;
}

export interface Stage {
  id: string;
  name: string;
  customer_stage_count:number
}

export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  pipeline_id?: string;
  stage_id?: string;
  account_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  users?: User;
  pipelines?: Pipeline;
  stages?: Stage;
  [key: string]: any; // For additional campaign fields
}

export interface CreateMetaCampaignDto {
  name: string;
  status: string;
  pipeline_id?: string;
  stage_id?: string;
  account_id?: string;
  [key: string]: any; // For additional campaign fields
}

export interface UpdateMetaCampaignDto {
  name?: string;
  status?: string;
  pipeline_id?: string;
  stage_id?: string;
  account_id?: string;
  [key: string]: any; // For additional campaign fields
}

export interface MetaCampaignFilterDto {
  status?: string;
  pipeline_id?: string;
  stage_id?: string;
  account_id?: string;
}

interface CampaignState {
  campaigns: MetaCampaign[];
  campaign: MetaCampaign | null;
  userCampaigns: MetaCampaign[];
  statusCampaigns: MetaCampaign[];
  accountCampaigns: MetaCampaign[];
  pipelineCampaigns: MetaCampaign[];
  isLoading: boolean;
  error: string | null;
  loading: {
    campaigns: boolean;
    userCampaigns: boolean;
    statusCampaigns: boolean;
    accountCampaigns: boolean;
    pipelineCampaigns: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
}

const initialState: CampaignState = {
  campaigns: [],
  campaign: null,
  userCampaigns: [],
  statusCampaigns: [],
  accountCampaigns: [],
  pipelineCampaigns: [],
  isLoading: false,
  error: null,
  loading: {
    campaigns: false,
    userCampaigns: false,
    statusCampaigns: false,
    accountCampaigns: false,
    pipelineCampaigns: false,
    create: false,
    update: false,
    delete: false,
  }
};

// Async thunk for fetching all campaigns
export const fetchCampaigns = createAsyncThunk(
  'campaign/fetchCampaigns',
  async (
    args: MetaCampaignFilterDto | undefined,
    thunkAPI
  ) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const params = new URLSearchParams();
      if (args?.status) params.append('status', args.status);
      if (args?.pipeline_id) params.append('pipeline_id', args.pipeline_id);
      if (args?.stage_id) params.append('stage_id', args.stage_id);
      if (args?.account_id) params.append('account_id', args.account_id);

      const response = await api.get(`/meta-campaigns?userId=324&${params.toString()}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch campaigns');
    }
  }
);

// Fetch campaigns by user ID
export const fetchCampaignsByUser = createAsyncThunk(
  'campaign/fetchCampaignsByUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/meta-campaigns/user/${userId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch user campaigns');
    }
  }
);

// Fetch campaign by ID
export const fetchCampaignById = createAsyncThunk(
  'campaign/fetchCampaignById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/meta-campaigns/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch campaign');
    }
  }
);

// Fetch campaigns by status
export const fetchCampaignsByStatus = createAsyncThunk(
  'campaign/fetchCampaignsByStatus',
  async (status: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/meta-campaigns/status/${status}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch campaigns by status');
    }
  }
);

// Fetch campaigns by account ID
export const fetchCampaignsByAccount = createAsyncThunk(
  'campaign/fetchCampaignsByAccount',
  async (accountId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/meta-campaigns/account/${accountId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch campaigns by account');
    }
  }
);

// Fetch campaigns by pipeline ID
export const fetchCampaignsByPipeline = createAsyncThunk(
  'campaign/fetchCampaignsByPipeline',
  async (pipelineId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/meta-campaigns/pipeline/${pipelineId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch campaigns by pipeline');
    }
  }
);

// Create new campaign
export const createCampaign = createAsyncThunk(
  'campaign/createCampaign',
  async (campaignData: CreateMetaCampaignDto, { rejectWithValue }) => {
    try {
      const response = await api.post('/meta-campaigns', campaignData);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to create campaign');
    }
  }
);

// Update campaign
export const updateCampaign = createAsyncThunk(
  'campaign/updateCampaign',
  async ({ id, campaignData }: { id: string; campaignData: UpdateMetaCampaignDto }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/meta-campaigns/${id}`, campaignData);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to update campaign');
    }
  }
);

// Update campaign status
export const updateCampaignStatus = createAsyncThunk(
  'campaign/updateCampaignStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/meta-campaigns/${id}/status`, { status });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to update campaign status');
    }
  }
);


// Update the deleteCampaign thunk in your campaign slice
export const deleteCampaign = createAsyncThunk(
  'campaign/deleteCampaign',
  async ({ id, userId }: { id: string; userId: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/meta-campaigns/${id}?userId=${userId}`);
      return id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to delete campaign');
    }
  }
);

// Create campaign slice
const campaignSlice = createSlice({
  name: 'campaign',
  initialState,
  reducers: {
    clearCampaignState: (state) => {
      state.campaign = null;
      state.campaigns = [];
      state.error = null;
    },
    clearUserCampaigns: (state) => {
      state.userCampaigns = [];
      state.error = null;
    },
    clearStatusCampaigns: (state) => {
      state.statusCampaigns = [];
      state.error = null;
    },
    clearAccountCampaigns: (state) => {
      state.accountCampaigns = [];
      state.error = null;
    },
    clearPipelineCampaigns: (state) => {
      state.pipelineCampaigns = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentCampaign: (state, action: PayloadAction<MetaCampaign>) => {
      state.campaign = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all campaigns cases
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading.campaigns = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action: PayloadAction<MetaCampaign[]>) => {
        state.loading.campaigns = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading.campaigns = false;
        state.error = action.payload as string;
      })
      // Fetch campaigns by user cases
      .addCase(fetchCampaignsByUser.pending, (state) => {
        state.loading.userCampaigns = true;
        state.error = null;
      })
      .addCase(fetchCampaignsByUser.fulfilled, (state, action: PayloadAction<MetaCampaign[]>) => {
        state.loading.userCampaigns = false;
        state.userCampaigns = action.payload;
      })
      .addCase(fetchCampaignsByUser.rejected, (state, action) => {
        state.loading.userCampaigns = false;
        state.error = action.payload as string;
      })
      // Fetch campaign by ID cases
      .addCase(fetchCampaignById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCampaignById.fulfilled, (state, action: PayloadAction<MetaCampaign>) => {
        state.isLoading = false;
        state.campaign = action.payload;
      })
      .addCase(fetchCampaignById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch campaigns by status cases
      .addCase(fetchCampaignsByStatus.pending, (state) => {
        state.loading.statusCampaigns = true;
        state.error = null;
      })
      .addCase(fetchCampaignsByStatus.fulfilled, (state, action: PayloadAction<MetaCampaign[]>) => {
        state.loading.statusCampaigns = false;
        state.statusCampaigns = action.payload;
      })
      .addCase(fetchCampaignsByStatus.rejected, (state, action) => {
        state.loading.statusCampaigns = false;
        state.error = action.payload as string;
      })
      // Fetch campaigns by account cases
      .addCase(fetchCampaignsByAccount.pending, (state) => {
        state.loading.accountCampaigns = true;
        state.error = null;
      })
      .addCase(fetchCampaignsByAccount.fulfilled, (state, action: PayloadAction<MetaCampaign[]>) => {
        state.loading.accountCampaigns = false;
        state.accountCampaigns = action.payload;
      })
      .addCase(fetchCampaignsByAccount.rejected, (state, action) => {
        state.loading.accountCampaigns = false;
        state.error = action.payload as string;
      })
      // Fetch campaigns by pipeline cases
      .addCase(fetchCampaignsByPipeline.pending, (state) => {
        state.loading.pipelineCampaigns = true;
        state.error = null;
      })
      .addCase(fetchCampaignsByPipeline.fulfilled, (state, action: PayloadAction<MetaCampaign[]>) => {
        state.loading.pipelineCampaigns = false;
        state.pipelineCampaigns = action.payload;
      })
      .addCase(fetchCampaignsByPipeline.rejected, (state, action) => {
        state.loading.pipelineCampaigns = false;
        state.error = action.payload as string;
      })
      // Create campaign cases
      .addCase(createCampaign.pending, (state) => {
        state.loading.create = true;
        state.error = null;
      })
      .addCase(createCampaign.fulfilled, (state, action: PayloadAction<MetaCampaign>) => {
        state.loading.create = false;
        state.campaigns.unshift(action.payload);
        state.campaign = action.payload;
      })
      .addCase(createCampaign.rejected, (state, action) => {
        state.loading.create = false;
        state.error = action.payload as string;
      })
      // Update campaign cases
      .addCase(updateCampaign.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(updateCampaign.fulfilled, (state, action: PayloadAction<MetaCampaign>) => {
        state.loading.update = false;
        const index = state.campaigns.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.campaigns[index] = action.payload;
        }
        state.campaign = action.payload;
      })
      .addCase(updateCampaign.rejected, (state, action) => {
        state.loading.update = false;
        state.error = action.payload as string;
      })
      // Update campaign status cases
      .addCase(updateCampaignStatus.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(updateCampaignStatus.fulfilled, (state, action: PayloadAction<MetaCampaign>) => {
        state.loading.update = false;
        const index = state.campaigns.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.campaigns[index] = action.payload;
        }
        if (state.campaign?.id === action.payload.id) {
          state.campaign = action.payload;
        }
      })
      .addCase(updateCampaignStatus.rejected, (state, action) => {
        state.loading.update = false;
        state.error = action.payload as string;
      })
      // Delete campaign cases
      .addCase(deleteCampaign.pending, (state) => {
        state.loading.delete = true;
        state.error = null;
      })
      .addCase(deleteCampaign.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading.delete = false;
        state.campaigns = state.campaigns.filter(c => c.id !== action.payload);
        if (state.campaign?.id === action.payload) {
          state.campaign = null;
        }
      })
      .addCase(deleteCampaign.rejected, (state, action) => {
        state.loading.delete = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearCampaignState, 
  clearUserCampaigns,
  clearStatusCampaigns,
  clearAccountCampaigns,
  clearPipelineCampaigns,
  clearError,
  setCurrentCampaign
} = campaignSlice.actions;

export default campaignSlice.reducer;