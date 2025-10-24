import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";
import { setCredentials, AuthUser } from "./authSlice";

export interface ProfileBasicData {
  username?: string;
  first_name?: string;
  last_name?: string;
  category_id?: string; 
  bio?: string; 
}

export interface ProfileSocialData {
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  tiktok_url?: string;
  twitter_url?: string;
  website?: string;
}

export interface ProfileBusinessData {
  company_name: string;
  address: string;
  address2?: string;
  state: string;
  city: string;
  postal_code: string;
  phone: string;
  website: string;
  broker: boolean;
  country: string;
  company_id?: string | null;
}

export interface PasswordUpdateData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ProfileState {
  data: {
    basic: ProfileBasicData;
    social: ProfileSocialData;
    business: ProfileBusinessData;
    avatar_url?: string;
  };
  isLoading: boolean;
  error: string | null;
  success: string | null;
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

const initialState: ProfileState = {
  data: {
    basic: {
      username: "",
      first_name: "",
      last_name: "",
      category_id: "",
    },
    social: {
      facebook_url: "",
      instagram_url: "",
      linkedin_url: "",
      tiktok_url: "",
      twitter_url: "",
      website: "",
    },
    business: {
      company_name: "",
      address: "",
      address2: "",
      state: "",
      city: "",
      postal_code: "",
      phone: "",
      website: "",
      broker: false,
      country: "",
    },
    avatar_url: "",
  },
  isLoading: false,
  error: null,
  success: null,
};

// Fetch profile data including social links
export const fetchProfileData = createAsyncThunk(
  "profile/fetchData",
  async (_, { rejectWithValue }) => {
    try {
      const [profileResponse, socialResponse] = await Promise.allSettled([
        api.get("/auth/profile"),
        api.get("/advisor-social/profile")
      ]);
      
      const profileData = profileResponse.status === 'fulfilled' ? profileResponse.value.data : null;
      const socialData = socialResponse.status === 'fulfilled' ? socialResponse.value.data : null;
      
      return {
        ...profileData,
        socialLinks: socialData || {}
      };
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch profile data"
      );
    }
  }
);

// Update basic profile data
export const updateBasicProfile = createAsyncThunk(
  "profile/updateBasic",
  async (data: ProfileBasicData, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await api.put("/auth/profile/basic", data);

      // After successful update, update the user data in auth state
      const state = getState() as {
        auth: {
          user: AuthUser | null;
          token: string;
          refreshToken: string;
        };
      };
      if (state.auth.user) {
        // Create updated user object
        const updatedUser = {
          ...state.auth.user,
          first_name: data.first_name || state.auth.user.first_name,
          last_name: data.last_name || state.auth.user.last_name,
          username: data.username || state.auth.user.username,
          category_id: data.category_id || state.auth.user.category_id,
        };

        // Dispatch setCredentials to update auth state
        dispatch(
          setCredentials({
            user: updatedUser,
            token: state.auth.token,
            refreshToken: state.auth.refreshToken,
          })
        );
      }

      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

// Update profile picture
export const updateProfilePicture = createAsyncThunk(
  "profile/updatePicture",
  async (file: File, { rejectWithValue, dispatch, getState }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/auth/profile/picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Extract avatar URL from response
      const avatarUrl = response.data.avatar_url || response.data.url || response.data.file;

      // Update auth state with new avatar URL
      const state = getState() as {
        auth: {
          user: AuthUser | null;
          token: string;
          refreshToken: string;
        };
      };

      if (state.auth.user) {
        const updatedUser = {
          ...state.auth.user,
          avatar_url: avatarUrl,
        };

        dispatch(
          setCredentials({
            user: updatedUser,
            token: state.auth.token,
            refreshToken: state.auth.refreshToken,
          })
        );
      }

      return { avatar_url: avatarUrl };
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update profile picture"
      );
    }
  }
);

// Update social media links using advisor-social endpoint
export const updateSocialLinks = createAsyncThunk(
  "profile/updateSocial",
  async (data: ProfileSocialData, { rejectWithValue }) => {
    try {
      // Include all social media fields (empty strings will clear existing data)
      // This allows users to remove social media links by submitting empty values
      const advisorSocialData = {
        facebook_url: data.facebook_url || "",
        instagram_url: data.instagram_url || "",
        linkedin_url: data.linkedin_url || "",
        tiktok_url: data.tiktok_url || "",
        twitter_url: data.twitter_url || "",
      };
      
      const response = await api.put("/advisor-social/profile", advisorSocialData);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update social links"
      );
    }
  }
);

// Update business information
export const updateBusinessInfo = createAsyncThunk(
  "profile/updateBusiness",
  async (data: ProfileBusinessData & { company_id?: string | null }, { rejectWithValue }) => {
    try {
      const response = await api.put("/auth/profile/business", data);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update business information"
      );
    }
  }
);

// Update password
export const updatePassword = createAsyncThunk(
  "profile/updatePassword",
  async (data: PasswordUpdateData, { rejectWithValue }) => {
    try {
      const response = await api.put("/auth/password", data);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update password"
      );
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileMessages: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile data
      .addCase(fetchProfileData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfileData.fulfilled, (state, action) => {
        state.isLoading = false;
        // console.log("Raw API response:", action.payload);

        // Adapt to the new API structure
        if (action.payload) {
          // Extract user data directly from the response
          const userData = action.payload;
          const socialLinks = userData.socialLinks || {};

          // Basic data
          state.data.basic = {
            username: userData.username || "",
            first_name: userData.first_name || "",
            last_name: userData.last_name || "",
            category_id: userData.category_id || "",
            bio: userData.bio || "",
          };

          // Social data from advisor-social endpoint
          state.data.social = {
            facebook_url: socialLinks.facebook_url || "",
            instagram_url: socialLinks.instagram_url || "",
            linkedin_url: socialLinks.linkedin_url || "",
            tiktok_url: socialLinks.tiktok_url || "",
            twitter_url: socialLinks.twitter_url || "",
            website: userData.website || "", // Website comes from main profile
          };

          // Business data
          state.data.business = {
            company_name: userData.company_name || "",
            address: userData.address || "",
            address2: userData.address2 || "",
            state: userData.state || "",
            city: userData.city || "",
            postal_code: userData.postal_code || "",
            phone: userData.phone || "",
            website: userData.website || "",
            broker: userData.broker || false,
            country: userData.country || "",
          };

          // Profile picture
          state.data.avatar_url = userData.avatar_url || "";
        }
      })
      .addCase(fetchProfileData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update basic profile
      .addCase(updateBasicProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateBasicProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = "Profile updated successfully";

        // Update basic data in state
        if (action.payload) {
          state.data.basic = {
            ...state.data.basic,
            username: action.payload.username || state.data.basic.username,
            first_name: action.payload.first_name || state.data.basic.first_name,
            last_name: action.payload.last_name || state.data.basic.last_name,
            category_id: action.payload.category_id || state.data.basic.category_id,
          };
        }
      })
      .addCase(updateBasicProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update profile picture
      .addCase(updateProfilePicture.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateProfilePicture.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = "Profile picture updated successfully";
        state.data.avatar_url = action.payload.avatar_url;
      })
      .addCase(updateProfilePicture.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update social links
      .addCase(updateSocialLinks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateSocialLinks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = "Social links updated successfully";
        
        // Update social data from advisor-social response
        const socialData = action.payload;
        state.data.social = {
          ...state.data.social,
          facebook_url: socialData.facebook_url || "",
          instagram_url: socialData.instagram_url || "",
          linkedin_url: socialData.linkedin_url || "",
          tiktok_url: socialData.tiktok_url || "",
          twitter_url: socialData.twitter_url || "",
          // Keep existing website value as it's managed separately
        };
      })
      .addCase(updateSocialLinks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update business information
      .addCase(updateBusinessInfo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateBusinessInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = "Business information updated successfully";
        state.data.business = {
          ...state.data.business,
          ...action.payload,
        };
      })
      .addCase(updateBusinessInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update password
      .addCase(updatePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.success = "Password updated successfully";
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfileMessages } = profileSlice.actions;
export default profileSlice.reducer;