import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

export interface EmailSignature {
  id?: string;
  title: string;
  signature: string;
  tag: string;
}

interface EmailSignatureState {
  signatures: EmailSignature[];
  isLoading: boolean;
  error: string | null;
}

const initialState: EmailSignatureState = {
  signatures: [],
  isLoading: false,
  error: null,
};

// Fetch all signatures
export const fetchEmailSignatures = createAsyncThunk(
  'emailSignature/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/email-signatures');
      return res.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch email signatures');
    }
  }
);

// Create a new signature
export const createEmailSignature = createAsyncThunk(
  'emailSignature/create',
  async (data: { title: string; signature: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/email-signatures', data);
      return res.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to create email signature');
    }
  }
);

// Update a signature
export const updateEmailSignature = createAsyncThunk(
  'emailSignature/update',
  async ({ id, data }: { id: string; data: Partial<EmailSignature> }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/email-signatures/${id}`, data);
      return res.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to update email signature');
    }
  }
);

// Delete a signature
export const deleteEmailSignature = createAsyncThunk(
  'emailSignature/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/email-signatures/${id}`);
      return id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to delete email signature');
    }
  }
);

const emailSignatureSlice = createSlice({
  name: 'emailSignature',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchEmailSignatures.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmailSignatures.fulfilled, (state, action) => {
        state.isLoading = false;
        state.signatures = action.payload;
      })
      .addCase(fetchEmailSignatures.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createEmailSignature.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEmailSignature.fulfilled, (state, action) => {
        state.isLoading = false;
        state.signatures.push(action.payload);
      })
      .addCase(createEmailSignature.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateEmailSignature.fulfilled, (state, action) => {
        const idx = state.signatures.findIndex(sig => sig.id === action.payload.id);
        if (idx !== -1) {
          state.signatures[idx] = action.payload;
        }
      })
      .addCase(deleteEmailSignature.fulfilled, (state, action) => {
        state.signatures = state.signatures.filter(sig => sig.id !== action.payload);
      });
  },
});

export default emailSignatureSlice.reducer;