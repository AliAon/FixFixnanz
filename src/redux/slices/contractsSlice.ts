import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from "../api/axiosConfig";

// Types
export interface Contract {
    id: string;
    company_id: string;
    start_of_contract: string;
    expire_date: string;
    number: string;
    amount: number;
    payment_frequency: string;
    service_id: string;
    sent_email: boolean;
    share: unknown[];
    created_by: string;
    length_of_term: number;
    invitation_token: string | null;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    // Optional fields that might come from joins
    society?: string;
    category?: string;
    service?: string;
}

export interface CreateContractData {
    company_id: string;
    start_of_contract: string;
    expire_date: string;
    number: string;
    amount: string;
    payment_frequency: string;
    service_id: string;
}

export interface UpdateContractData {
    company_id: string;
    start_of_contract: string;
    expire_date: string;
    number: string;
    amount: string;
    payment_frequency: string;
    service_id: string;
    length_of_term: number;
}

export interface ShareContractData {
    advisor: string[];
}

interface ContractState {
    contracts: Contract[];
    contract: Contract | null;
    loading: boolean;
    error: string | null;
}

// Initial state
const initialState: ContractState = {
    contracts: [],
    contract: null,
    loading: false,
    error: null
};

// Async thunks
export const fetchContracts = createAsyncThunk(
    'contracts/fetchContracts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/contracts');
            return response.data;
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue('Failed to fetch contracts');
        }
    }
);

export const addContract = createAsyncThunk(
    'contracts/addContract',
    async ({ data }: { data: CreateContractData }, { rejectWithValue }) => {
        try {
            const response = await api.post('/contracts', data);
            return response.data;
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue('Failed to add contract');
        }
    }
);

export const fetchContractById = createAsyncThunk(
    'contracts/fetchContractById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/contracts/${id}`);
            return response.data;
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue('Failed to fetch contract');
        }
    }
);

export const updateContract = createAsyncThunk(
    'contracts/updateContract',
    async ({ id, data }: { id: string; data: UpdateContractData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/contracts/${id}`, data);
            return response.data;
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue('Failed to update contract');
        }
    }
);

export const deleteContract = createAsyncThunk(
    'contracts/deleteContract',
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/contracts/${id}`);
            return id;
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue('Failed to delete contract');
        }
    }
);

export const shareContract = createAsyncThunk(
    'contracts/shareContract',
    async ({ id, data }: { id: string; data: ShareContractData }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/contracts/${id}/share`, data);
            return response.data;
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue('Failed to share contract');
        }
    }
);

// Slice
const contractSlice = createSlice({
    name: 'contracts',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Fetch all contracts
        builder
            .addCase(fetchContracts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchContracts.fulfilled, (state, action: PayloadAction<Contract[]>) => {
                state.loading = false;
                state.contracts = action.payload;
            })
            .addCase(fetchContracts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Add contract
            .addCase(addContract.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addContract.fulfilled, (state, action: PayloadAction<Contract>) => {
                state.loading = false;
                state.contracts.push(action.payload);
            })
            .addCase(addContract.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch contract by ID
            .addCase(fetchContractById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchContractById.fulfilled, (state, action: PayloadAction<Contract>) => {
                state.loading = false;
                state.contract = action.payload;
            })
            .addCase(fetchContractById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update contract
            .addCase(updateContract.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateContract.fulfilled, (state, action: PayloadAction<Contract>) => {
                state.loading = false;
                // Update the contract in the contracts array
                const index = state.contracts.findIndex(contract => contract.id === action.payload.id);
                if (index !== -1) {
                    state.contracts[index] = action.payload;
                }
                // Also update the individual contract state
                state.contract = action.payload;
            })
            .addCase(updateContract.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Delete contract
            .addCase(deleteContract.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteContract.fulfilled, (state, action: PayloadAction<string>) => {
                state.loading = false;
                state.contracts = state.contracts.filter((contract) => contract.id !== action.payload);
            })
            .addCase(deleteContract.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Share contract
            .addCase(shareContract.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(shareContract.fulfilled, (state, action: PayloadAction<Contract>) => {
                state.loading = false;
                state.contract = action.payload;
            })
            .addCase(shareContract.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default contractSlice.reducer;