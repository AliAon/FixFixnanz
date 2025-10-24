/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";

// Types
export interface Advisor {
  id: string;
  user_id: string;
  about: string;
  service_title: string;
  service_details: string;
  experience: string;
  education: string;
  languages: string;
  certifications: string;
  specialties: string;
  broker: boolean;
  website: string;
  service_category_id: string;
  company_id?: string;
  is_visible: boolean;
  freelancer: boolean;
  advisor_contract_accepted: boolean;
  contract_accepted_at?: string | null;
  terms_and_conditions: boolean;
  commission_level_settler: number;
  commission_level_closer: number;
  created_at?: string;
  updated_at?: string;
}

export interface AdvisorSocialProfile {
  user_id: string;
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  tiktok_url?: string;
  twitter_url?: string;
}

export interface PublicAdvisor {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  broker: boolean;
  freelancer: boolean;
  average_rating: number;
  total_reviews: number;
  total_views: number;
  location?: string;
  categories: {
    name: string;
    image: string;
  };
  about?: string;
  service_title?: string;
  experience?: string;
  website?: string;
  languages?: string;
  specialties?: string;
}

export interface AdvisorStats {
  advisor_id: string;
  average_rating: number;
  total_reviews: number;
  assigned_customers_count: number;
  total_views: number;
  customers: {
    customers: Array<{
      id: string;
      first_name: string;
      last_name: string;
      lead_email: string;
      lead_phone: string;
      avatar_url: string;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface ContractAcceptanceResponse {
  success: boolean;
  contract_accepted_at: string;
  message: string;
}

export interface ContractStatusResponse {
  accepted: boolean;
  contract_accepted_at: string | null;
}

interface AdvisorsState {
  advisors: Advisor[];
  publicAdvisors: PublicAdvisor[];
  currentAdvisor: Advisor | null;
  advisorStats: AdvisorStats | null;
  advisorSocialProfiles: AdvisorSocialProfile[];
  currentAdvisorSocialProfile: AdvisorSocialProfile | null;
  currentPublicSocialProfile: AdvisorSocialProfile | null;
  contractAccepted: boolean;
  contractAcceptedAt: string | null;
  isCheckingContract: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdvisorsState = {
  advisors: [],
  publicAdvisors: [],
  currentAdvisor: null,
  advisorStats: null,
  advisorSocialProfiles: [],
  currentAdvisorSocialProfile: null,
  currentPublicSocialProfile: null,
  contractAccepted: false,
  contractAcceptedAt: null,
  isCheckingContract: false,
  isLoading: false,
  error: null,
};

// Get all advisors
export const fetchAdvisors = createAsyncThunk(
  "advisors/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/advisors");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Get current user's advisor profile
export const fetchAdvisorProfile = createAsyncThunk(
  'advisors/fetchAdvisorProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/advisors/profile');
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Update current user's advisor profile
export const updateAdvisorProfile = createAsyncThunk(
  'advisors/updateAdvisorProfile',
  async (data: Partial<Advisor>, { rejectWithValue }) => {
    try {
      const response = await api.put('/advisors/profile', data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Get advisor by ID
export const fetchAdvisorById = createAsyncThunk(
  "advisors/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/advisors/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Update advisor by ID
export const updateAdvisor = createAsyncThunk(
  "advisors/update",
  async ({ id, data }: { id: string; data: Partial<Advisor> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/advisors/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Delete advisor by ID
export const deleteAdvisor = createAsyncThunk(
  "advisors/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/advisors/${id}`);
      return id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Get advisor by user ID
export const fetchAdvisorByUserId = createAsyncThunk(
  "advisors/fetchByUserId",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/advisors/user/${userId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Create new advisor
export const createAdvisor = createAsyncThunk(
  "advisors/create",
  async (data: Partial<Advisor>, { rejectWithValue }) => {
    try {
      const response = await api.post("/advisors", data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Get advisor statistics
export const fetchAdvisorStats = createAsyncThunk(
  "advisors/fetchStats",
  async ({ id, page = 1, limit = 10 }: { id: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      const response = await api.get(`/advisors/${id}/stats?${params}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Get public advisor profile by ID (no authentication required)
export const fetchPublicAdvisorProfile = createAsyncThunk(
  "advisors/fetchPublicProfile",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/advisors/public/${id}?t=${Date.now()}`);
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching advisor profile:', error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Get paginated list of public advisors with filtering (Financial Advisors)
export const fetchPublicAdvisors = createAsyncThunk(
  "advisors/fetchPublicAdvisors",
  async (params: {
    page?: number;
    limit?: number;
    companyId?: string;
    serviceCategoryId?: string;
    minRating?: number;
    location?: string;
    name?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.companyId) queryParams.append('companyId', params.companyId);
      if (params.serviceCategoryId) queryParams.append('serviceCategoryId', params.serviceCategoryId);
      if (params.minRating) queryParams.append('minRating', params.minRating.toString());
      if (params.location) queryParams.append('location', params.location);
      if (params.name) queryParams.append('name', params.name);

      const response = await api.get(`/advisors/public?${queryParams.toString()}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Create new advisor social profile
export const createAdvisorSocialProfile = createAsyncThunk(
  "advisors/createSocialProfile",
  async (data: AdvisorSocialProfile, { rejectWithValue }) => {
    try {
      const response = await api.post("/advisor-social", data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Get all advisor social profiles
export const fetchAdvisorSocialProfiles = createAsyncThunk(
  "advisors/fetchSocialProfiles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/advisor-social");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Get current user's advisor social profile
export const fetchAdvisorSocialProfile = createAsyncThunk(
  "advisors/fetchSocialProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/advisor-social/profile");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Update current user's advisor social profile
export const updateAdvisorSocialProfile = createAsyncThunk(
  "advisors/updateSocialProfile",
  async (data: Partial<AdvisorSocialProfile>, { rejectWithValue }) => {
    try {
      const response = await api.put("/advisor-social/profile", data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Get public advisor social profile by user ID (no authentication required)
export const fetchPublicAdvisorSocialProfile = createAsyncThunk(
  "advisors/fetchPublicSocialProfile",
  async (userId: string, { rejectWithValue }) => {
    try {
      console.log('Fetching social media for user ID:', userId);
      console.log('API URL:', `${process.env.NEXT_PUBLIC_API_URL}/advisor-social/public/${userId}`);
      const response = await api.get(`/advisor-social/public/${userId}?t=${Date.now()}`);
      console.log('Social media API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Social media API error:', error);
      console.log('Error status:', error?.response?.status);
      console.log('Error data:', error?.response?.data);
      if (error?.response?.status === 404) {
        console.log('404 error - returning empty profile');
        return {
          user_id: userId,
          facebook_url: '',
          instagram_url: '',
          linkedin_url: '',
          tiktok_url: '',
          twitter_url: '',
        };
      }
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Accept advisor contract
export const acceptAdvisorContract = createAsyncThunk(
  "advisors/acceptContract",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/advisors/contract/accept");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Check contract status
export const checkContractStatus = createAsyncThunk(
  "advisors/checkContractStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/advisors/contract/status");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

const advisorsSlice = createSlice({
  name: "advisors",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAdvisor: (state) => {
      state.currentAdvisor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all advisors
      .addCase(fetchAdvisors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdvisors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.advisors = action.payload;
      })
      .addCase(fetchAdvisors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch advisor profile
      .addCase(fetchAdvisorProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdvisorProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAdvisor = action.payload;

        // Update contract status from advisor profile
        if (action.payload.advisor_contract_accepted && action.payload.contract_accepted_at) {
          state.contractAccepted = true;
          state.contractAcceptedAt = action.payload.contract_accepted_at;
        } else {
          state.contractAccepted = false;
          state.contractAcceptedAt = null;
        }
      })
      .addCase(fetchAdvisorProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update advisor profile
      .addCase(updateAdvisorProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAdvisorProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAdvisor = action.payload;
      })
      .addCase(updateAdvisorProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch advisor by ID
      .addCase(fetchAdvisorById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdvisorById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAdvisor = action.payload;
      })
      .addCase(fetchAdvisorById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update advisor
      .addCase(updateAdvisor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAdvisor.fulfilled, (state, action) => {
        state.isLoading = false;
        const existingAdvisorIndex = state.advisors.findIndex(
          (advisor) => advisor.id === action.payload.id
        );
        if (existingAdvisorIndex !== -1) {
          state.advisors[existingAdvisorIndex] = action.payload;
        }
        if (state.currentAdvisor?.id === action.payload.id) {
          state.currentAdvisor = action.payload;
          console.log('Current advisor updated:', action.payload);
        }
      })
      .addCase(updateAdvisor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete advisor
      .addCase(deleteAdvisor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAdvisor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.advisors = state.advisors.filter(advisor => advisor.id !== action.payload);
        if (state.currentAdvisor?.id === action.payload) {
          state.currentAdvisor = null;
        }
      })
      .addCase(deleteAdvisor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch advisor by user ID
      .addCase(fetchAdvisorByUserId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdvisorByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAdvisor = action.payload;
      })
      .addCase(fetchAdvisorByUserId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create advisor
      .addCase(createAdvisor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAdvisor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.advisors.push(action.payload);
        state.currentAdvisor = action.payload;
      })
      .addCase(createAdvisor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch advisor statistics
      .addCase(fetchAdvisorStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdvisorStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.advisorStats = action.payload;
      })
      .addCase(fetchAdvisorStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch public advisor profile
      .addCase(fetchPublicAdvisorProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicAdvisors.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.advisors) {
          state.publicAdvisors = action.payload.advisors;
        } else if (Array.isArray(action.payload)) {
          state.publicAdvisors = action.payload;
        } else {
          state.publicAdvisors = [];
        }
      })
      .addCase(fetchPublicAdvisorProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAdvisor = action.payload;
      })
      .addCase(fetchPublicAdvisorProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch paginated list of public advisors with filtering
      .addCase(fetchPublicAdvisors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicAdvisors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create advisor social profile
      .addCase(createAdvisorSocialProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAdvisorSocialProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.advisorSocialProfiles.push(action.payload);
        state.currentAdvisorSocialProfile = action.payload;
      })
      .addCase(createAdvisorSocialProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch advisor social profiles
      .addCase(fetchAdvisorSocialProfiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdvisorSocialProfiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.advisorSocialProfiles = action.payload;
      })
      .addCase(fetchAdvisorSocialProfiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch advisor social profile
      .addCase(fetchAdvisorSocialProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdvisorSocialProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAdvisorSocialProfile = action.payload;
      })
      .addCase(fetchAdvisorSocialProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update advisor social profile
      .addCase(updateAdvisorSocialProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAdvisorSocialProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAdvisorSocialProfile = action.payload;
        const index = state.advisorSocialProfiles.findIndex(
          profile => profile.user_id === action.payload.user_id
        );
        if (index !== -1) {
          state.advisorSocialProfiles[index] = action.payload;
        }
      })
      .addCase(updateAdvisorSocialProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch public advisor social profile
      .addCase(fetchPublicAdvisorSocialProfile.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchPublicAdvisorSocialProfile.fulfilled, (state, action) => {
        state.currentPublicSocialProfile = action.payload;
      })
      .addCase(fetchPublicAdvisorSocialProfile.rejected, (state, action) => {
        state.error = action.payload as string;
        state.currentPublicSocialProfile = null;
      })

      // Accept advisor contract
      .addCase(acceptAdvisorContract.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acceptAdvisorContract.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contractAccepted = true;
        state.contractAcceptedAt = action.payload.contract_accepted_at;

        // Update current advisor if exists
        if (state.currentAdvisor) {
          state.currentAdvisor.advisor_contract_accepted = true;
          state.currentAdvisor.contract_accepted_at = action.payload.contract_accepted_at;
        }
      })
      .addCase(acceptAdvisorContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Check contract status
      .addCase(checkContractStatus.pending, (state) => {
        state.isCheckingContract = true;
        state.error = null;
      })
      .addCase(checkContractStatus.fulfilled, (state, action) => {
        state.isCheckingContract = false;
        state.contractAccepted = action.payload.accepted;
        state.contractAcceptedAt = action.payload.contract_accepted_at;
      })
      .addCase(checkContractStatus.rejected, (state, action) => {
        state.isCheckingContract = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentAdvisor } = advisorsSlice.actions;
export default advisorsSlice.reducer;