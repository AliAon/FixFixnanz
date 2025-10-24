import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";

// Types
export interface WeeklySchedule {
  weekday: string;
  start: string;
  end: string;
  is_available: boolean;
}

export interface CalendarSettings {
  id: string;
  user_id: string;
  consultation_color: string;
  online_event_color: string;
  profile_booking_color: string;
  appointment_duration: number;
  reminder_email_minutes: number;
  google_calendar_id: string;
  weekly_schedule: WeeklySchedule[];
  use_custom_schedule: boolean;
  created_at?: string;
  updated_at?: string;
  alreadyInitialized?: boolean;
}

interface CalendarSettingsState {
  settings: CalendarSettings | null;
  userCalendarSettings: CalendarSettings | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// Initial state
const initialState: CalendarSettingsState = {
  settings: null,
  userCalendarSettings: null,
  loading: false,
  error: null,
  initialized: false,
};

// Async thunks
export const initializeCalendarSettings = createAsyncThunk(
  "calendarSettings/initialize",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/calendar-settings/initialize");
      return response.data;
    } catch (error: unknown) {
      // Check for 409 Conflict (settings already exist)
      if (error instanceof Error && error.message === "409") {
        // Return a special value to indicate conflict
        return rejectWithValue({ conflict: true });
      }
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to initialize calendar settings");
    }
  }
);

export const fetchCalendarSettings = createAsyncThunk(
  "calendarSettings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/calendar-settings");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch calendar settings");
    }
  }
);
export const fetchUserCalendarSettings = createAsyncThunk(
  "calendarSettings/fetch/:userId",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/calendar-settings/${userId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch calendar settings");
    }
  }
);
export const updateCalendarSettings = createAsyncThunk(
  "calendarSettings/update",
  async (data: Partial<CalendarSettings>, { rejectWithValue }) => {
    try {
      const response = await api.put("/calendar-settings", data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update calendar settings");
    }
  }
);

// Slice
const calendarSettingsSlice = createSlice({
  name: "calendarSettings",
  initialState,
  reducers: {
    clearCalendarSettingsError: (state) => {
      state.error = null;
    },
    resetCalendarSettings: (state) => {
      state.settings = null;
      state.initialized = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Initialize Calendar Settings
    builder
      .addCase(initializeCalendarSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        initializeCalendarSettings.fulfilled,
        (state, action: PayloadAction<CalendarSettings>) => {
          state.loading = false;
          state.initialized = true;

          // If we got settings data back, update the settings
          if (!action.payload.alreadyInitialized) {
            state.settings = action.payload;
          }
        }
      )
      .addCase(initializeCalendarSettings.rejected, (state, action) => {
        state.loading = false;
        // Do not set error if it's a conflict (409)
        if (
          action.payload &&
          typeof action.payload === "object" &&
          (action.payload as { conflict: boolean }).conflict
        ) {
          // No error, just skip
        } else {
          state.error = action.payload as string;
        }
      });

    // Fetch Calendar Settings
    builder
      .addCase(fetchCalendarSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCalendarSettings.fulfilled,
        (state, action: PayloadAction<CalendarSettings>) => {
          state.loading = false;
          state.settings = action.payload;
          state.initialized = true;
        }
      )
      .addCase(fetchCalendarSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    // Fetch User Calendar Settings
    builder
      .addCase(fetchUserCalendarSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserCalendarSettings.fulfilled,
        (state, action: PayloadAction<CalendarSettings>) => {
          state.loading = false;
          state.userCalendarSettings = action.payload;
          state.initialized = true;
        }
      )
      .addCase(fetchUserCalendarSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Calendar Settings
    builder
      .addCase(updateCalendarSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateCalendarSettings.fulfilled,
        (state, action: PayloadAction<CalendarSettings>) => {
          state.loading = false;
          state.settings = action.payload;
        }
      )
      .addCase(updateCalendarSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCalendarSettingsError, resetCalendarSettings } =
  calendarSettingsSlice.actions;

export default calendarSettingsSlice.reducer;
