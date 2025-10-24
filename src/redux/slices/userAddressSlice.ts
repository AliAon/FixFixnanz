import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";

// Types
export interface UserAddress {
  id: string;
  user_id: string;
  title: string;
  source: string;
  link: string | null;
  address: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
}

export interface CreateUserAddressRequest {
  userId: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  lat: number;
  lng: number;
  is_deleted: boolean;
}

interface UserAddressState {
  addresses: UserAddress[];
  currentAddress: UserAddress | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserAddressState = {
  addresses: [],
  currentAddress: null,
  isLoading: false,
  error: null,
};

// Async Thunks
export const fetchUserAddresses = createAsyncThunk(
  "userAddress/fetchAll",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/user-address/user/${userId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch user addresses");
    }
  }
);

export const createUserAddress = createAsyncThunk(
  "userAddress/create",
  async (data: CreateUserAddressRequest, { rejectWithValue }) => {
    try {
      const response = await api.post("/user-address", data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to create address");
    }
  }
);

export const updateUserAddress = createAsyncThunk(
  "userAddress/update",
  async ({ id, data }: { id: string; data: Partial<CreateUserAddressRequest> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/user-address/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update address");
    }
  }
);

export const deleteUserAddress = createAsyncThunk(
  "userAddress/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/user-address/${id}/soft`);
      return id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to delete address");
    }
  }
);

export const hardDeleteUserAddress = createAsyncThunk(
  "userAddress/hardDelete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/user-address/${id}/hard`);
      return id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to delete address permanently");
    }
  }
);

const userAddressSlice = createSlice({
  name: "userAddress",
  initialState,
  reducers: {
    clearCurrentAddress: (state) => {
      state.currentAddress = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all addresses
      .addCase(fetchUserAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserAddresses.fulfilled, (state, action: PayloadAction<UserAddress[]>) => {
        state.isLoading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchUserAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create address
      .addCase(createUserAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUserAddress.fulfilled, (state, action: PayloadAction<UserAddress>) => {
        state.isLoading = false;
        state.addresses.push(action.payload);
        state.currentAddress = action.payload;
      })
      .addCase(createUserAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update address
      .addCase(updateUserAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserAddress.fulfilled, (state, action: PayloadAction<UserAddress>) => {
        state.isLoading = false;
        const index = state.addresses.findIndex(addr => addr.id === action.payload.id);
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
        state.currentAddress = action.payload;
      })
      .addCase(updateUserAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Soft Delete address
      .addCase(deleteUserAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUserAddress.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.addresses = state.addresses.filter(addr => addr.id !== action.payload);
        if (state.currentAddress?.id === action.payload) {
          state.currentAddress = null;
        }
      })
      .addCase(deleteUserAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Hard Delete address
      .addCase(hardDeleteUserAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(hardDeleteUserAddress.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.addresses = state.addresses.filter(addr => addr.id !== action.payload);
        if (state.currentAddress?.id === action.payload) {
          state.currentAddress = null;
        }
      })
      .addCase(hardDeleteUserAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentAddress, clearError } = userAddressSlice.actions;
export default userAddressSlice.reducer; 