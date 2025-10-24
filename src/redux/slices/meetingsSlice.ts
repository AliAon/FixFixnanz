import api from "../api/axiosConfig";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types
export interface Meeting {
  id: string;
  title: string;
  source: string;
  link: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  latitude: number;
  longitude: number;
  createdAt?: string;
  updatedAt?: string;
  location?: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    latitude: number;
    longitude: number;
  };
}

interface MeetingsState {
  meetings: Meeting[];
  meeting: Meeting | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: MeetingsState = {
  meetings: [],
  meeting: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchMeetings = createAsyncThunk(
  "meetings/fetchMeetings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/meetings");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch meetings");
    }
  }
);

export const fetchMeetingById = createAsyncThunk(
  "meetings/fetchMeetingById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/meetings/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch meeting");
    }
  }
);

export const createMeeting = createAsyncThunk(
  "meetings/createMeeting",
  async (meetingData: Omit<Meeting, "id">, { rejectWithValue }) => {
    try {
      const response = await api.post("/meetings", meetingData);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to create meeting");
    }
  }
);

export const updateMeeting = createAsyncThunk(
  "meetings/updateMeeting",
  async (
    { id, data }: { id: string; data: Partial<Meeting> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/meetings/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update meeting");
    }
  }
);

export const deleteMeeting = createAsyncThunk(
  "meetings/deleteMeeting",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/meetings/${id}`);
      return id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to delete meeting");
    }
  }
);

// Slice
const meetingsSlice = createSlice({
  name: "meetings",
  initialState,
  reducers: {
    clearMeetingState: (state) => {
      state.meeting = null;
      state.error = null;
    },
    clearMeetingsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all meetings
    builder
      .addCase(fetchMeetings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMeetings.fulfilled,
        (state, action: PayloadAction<Meeting[]>) => {
          state.loading = false;
          state.meetings = action.payload;
        }
      )
      .addCase(fetchMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch meeting by ID
    builder
      .addCase(fetchMeetingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMeetingById.fulfilled,
        (state, action: PayloadAction<Meeting>) => {
          state.loading = false;
          state.meeting = action.payload;
        }
      )
      .addCase(fetchMeetingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create meeting
    builder
      .addCase(createMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createMeeting.fulfilled,
        (state, action: PayloadAction<Meeting>) => {
          state.loading = false;
          state.meetings.push(action.payload);
          state.meeting = action.payload;
        }
      )
      .addCase(createMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update meeting
    builder
      .addCase(updateMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateMeeting.fulfilled,
        (state, action: PayloadAction<Meeting>) => {
          state.loading = false;
          state.meetings = state.meetings.map((meeting) =>
            meeting.id === action.payload.id ? action.payload : meeting
          );
          state.meeting = action.payload;
        }
      )
      .addCase(updateMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete meeting
    builder
      .addCase(deleteMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteMeeting.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.meetings = state.meetings.filter(
            (meeting) => meeting.id !== action.payload
          );
          if (state.meeting && state.meeting.id === action.payload) {
            state.meeting = null;
          }
        }
      )
      .addCase(deleteMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMeetingState, clearMeetingsError } = meetingsSlice.actions;

export default meetingsSlice.reducer;
