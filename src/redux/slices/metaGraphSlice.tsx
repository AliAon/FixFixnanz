import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

// Types
interface Business {
  id: string;
  name: string;
}

export interface Account {
  id: string;
  name: string;
  account_status: number;
  currency: string;
  timezone_name: string;
  business?: Business;
}

export interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  created_time: string;
  updated_time: string;
  start_time?: string;
  stop_time?: string;
  budget_rebalance_flag?: boolean;
  daily_budget?: number;
  lifetime_budget?: number;
  account_id: string;
}

export interface Ad {
  id: string;
  name: string;
  status: string;
  created_time: string;
  updated_time: string;
  campaign_id: string;
  adset_id?: string;
  creative?: {
    id: string;
    name: string;
    title?: string;
    body?: string;
    image_url?: string;
  };
}

export interface Lead {
  platform?: string;
  id: string;
  created_time: string;
  form_id: string;
  field_data: Array<{
    name: string;
    values: string[];
  }>;
}

interface CampaignState {
  accounts: Account[];
  account: Account | null;
  campaigns: Campaign[];
  campaign: Campaign | null;
  ads: Ad[];
  ad: Ad | null;
  leads: Lead[];
  lead: Lead | null;
  isLoading: boolean;
  error: string | null;
  loading: {
    accounts: boolean;
    campaigns: boolean;
    ads: boolean;
    leads: boolean;
  };
}

const initialState: CampaignState = {
  accounts: [],
  account: null,
  campaigns: [],
  campaign: null,
  ads: [],
  ad: null,
  leads: [],
  lead: null,
  isLoading: false,
  error: null,
   loading: {
    accounts: false,
    campaigns: false,
    ads: false,
    leads: false,
  }
};

// Async thunk for fetching all accounts
export const fetchAccounts = createAsyncThunk(
  'campaign/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/meta-graph/accounts');
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch accounts');
    }
  }
);

// Fetch account by ID
export const fetchAccountById = createAsyncThunk(
  'campaign/fetchAccountById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/meta-graph/accounts/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch account');
    }
  }
);

// Fetch campaigns by account ID
export const fetchCampaigns = createAsyncThunk(
  'campaign/fetchCampaigns',
  async (accountId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/meta-graph/accounts/${accountId}/campaigns`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch campaigns');
    }
  }
);

// Fetch campaign by ID
export const fetchCampaignById = createAsyncThunk(
  'campaign/fetchCampaignById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/meta-graph/campaigns/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch campaign');
    }
  }
);

// Fetch ads by campaign ID
export const fetchAds = createAsyncThunk(
  'campaign/fetchAds',
  async (campaignId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/meta-graph/campaigns/${campaignId}/ads`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch ads');
    }
  }
);

// Fetch ad by ID
export const fetchAdById = createAsyncThunk(
  'campaign/fetchAdById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/meta-graph/ads/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch ad');
    }
  }
);

// Fetch leads by form ID
export const fetchLeads = createAsyncThunk(
  'campaign/fetchLeads',
  async (formId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/meta-graph/forms/${formId}/leads`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch leads');
    }
  }
);

// Fetch lead by ID
export const fetchLeadById = createAsyncThunk(
  'campaign/fetchLeadById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/meta-graph/leads/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch lead');
    }
  }
);

// Create campaign slice
const metaGraphSlice = createSlice({
  name: 'campaign',
  initialState,
  reducers: {
    clearAccountState: (state) => {
      state.account = null;
      state.error = null;
    },
    clearCampaignState: (state) => {
      state.campaign = null;
      state.campaigns = [];
      state.error = null;
    },
    clearAdState: (state) => {
      state.ad = null;
      state.ads = [];
      state.error = null;
    },
    clearLeadState: (state) => {
      state.lead = null;
      state.leads = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all accounts cases
      .addCase(fetchAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action: PayloadAction<Account[]>) => {
        state.isLoading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch account by ID cases
      .addCase(fetchAccountById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccountById.fulfilled, (state, action: PayloadAction<Account>) => {
        state.isLoading = false;
        state.account = action.payload;
      })
      .addCase(fetchAccountById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch campaigns cases
      .addCase(fetchCampaigns.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action: PayloadAction<Campaign[]>) => {
        state.isLoading = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch campaign by ID cases
      .addCase(fetchCampaignById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCampaignById.fulfilled, (state, action: PayloadAction<Campaign>) => {
        state.isLoading = false;
        state.campaign = action.payload;
      })
      .addCase(fetchCampaignById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch ads cases
      .addCase(fetchAds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAds.fulfilled, (state, action: PayloadAction<Ad[]>) => {
        state.isLoading = false;
        state.ads = action.payload;
      })
      .addCase(fetchAds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch ad by ID cases
      .addCase(fetchAdById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdById.fulfilled, (state, action: PayloadAction<Ad>) => {
        state.isLoading = false;
        state.ad = action.payload;
      })
      .addCase(fetchAdById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch leads cases
      .addCase(fetchLeads.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action: PayloadAction<Lead[]>) => {
        state.isLoading = false;
        state.leads = action.payload;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch lead by ID cases
      .addCase(fetchLeadById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeadById.fulfilled, (state, action: PayloadAction<Lead>) => {
        state.isLoading = false;
        state.lead = action.payload;
      })
      .addCase(fetchLeadById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearAccountState, 
  clearCampaignState, 
  clearAdState, 
  clearLeadState, 
  clearError 
} = metaGraphSlice.actions;

export default metaGraphSlice.reducer;