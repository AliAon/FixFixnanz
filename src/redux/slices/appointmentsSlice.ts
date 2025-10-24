import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";
import { RootState } from "../store";

// Types
export interface CompletedAppointmentsParams {
  startDate?: string; // YYYY-MM-DD format
  endDate?: string; // YYYY-MM-DD format
}

export interface AppointmentCustomer {
  last_name: string | null;
  avatar_url: string | null;
  first_name: string | null;
  lead_email?: string | null;
  lead_phone?: string | null;
  is_active?: boolean;
}

export interface Appointment {
  id?: string;
  meeting_id?: string;
  email?: string;
  customer_id?: string | AppointmentCustomer;
  created_by?: {
    last_name: string | null;
    avatar_url: string | null;
    first_name: string | null;
  };
  sent_remainder_email?: string;
  google_event_id?: string;
  date: string;
  start_time: string;
  end_time?: string;
  title: string;
  description?: string;
  source?: string;
  link?: string;
  meeting_link?: string;
  type?: string;
  address1?: string;
  address2?: string;
  state?: string;
  city?: string;
  country?: string;
  zip?: string;
  longitude?: string;
  latitude?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  pipeline_id?: string;
  stage_id?: string;
  new_pipeline_name?: string;
  new_stage_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company_id?: string;
  pipelines?: {
    id: string;
    name: string;
    source: string;
    type?: string;
    stages: Array<{
      id: string;
      name: string;
      color: string | null;
      position: number;
    }>;
  };
  meetings?: {
    id: string;
    link?: string;
    title?: string;
    source?: string;
    address1?: string;
    address2?: string;
    state?: string;
    city?: string;
    zip?: string;
    country?: string;
  };
}

export type AppointmentData = Omit<Appointment, "id"> & { id?: string };

interface AppointmentState {
  appointments: Appointment[];
  currentAppointment: Appointment | null;
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

const initialState: AppointmentState = {
  appointments: [],
  currentAppointment: null,
  isLoading: false,
  error: null,
  success: null,
};

// Fetch all appointments
export const fetchAllAppointments = createAsyncThunk(
  "appointments/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/appointments");
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch appointments"
      );
    }
  }
);

// Fetch a specific appointment by ID
export const fetchAppointmentById = createAsyncThunk(
  "appointments/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/appointments/${id}`);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch appointment"
      );
    }
  }
);

// Create a new appointment
export const createAppointment = createAsyncThunk(
  "appointments/create",
  async (appointmentData: Appointment, { rejectWithValue }) => {
    try {
      const response = await api.post("/appointments", appointmentData);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to create appointment"
      );
    }
  }
);

// Create a new public appointment (no authentication required)
export const createPublicAppointment = createAsyncThunk(
  "appointments/createPublic",
  async (appointmentData: Appointment, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/appointments/create-public-appointment",
        appointmentData
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to create public appointment"
      );
    }
  }
);

// Update an existing appointment
export const updateAppointment = createAsyncThunk(
  "appointments/update",
  async (
    {
      id,
      appointmentData,
    }: {
      id: string;
      appointmentData: Appointment;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/appointments/${id}`, appointmentData);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update appointment"
      );
    }
  }
);

// Delete an appointment
export const deleteAppointment = createAsyncThunk(
  "appointments/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/appointments/${id}`);
      return id;
    } catch (error: unknown) {
      console.error("Delete appointment error:", error);

      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to delete appointment");
    }
  }
);

// Fetch future appointments
export const fetchFutureAppointments = createAsyncThunk(
  "appointments/fetchFuture",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/appointments/future");
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch future appointments"
      );
    }
  }
);

// Fetch completed appointments
export const fetchCompletedAppointments = createAsyncThunk(
  "appointments/fetchCompleted",
  async (params: CompletedAppointmentsParams = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.startDate) {
        queryParams.append("startDate", params.startDate);
      }

      if (params.endDate) {
        queryParams.append("endDate", params.endDate);
      }

      const url = `/appointments/completed${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await api.get(url);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch completed appointments"
      );
    }
  }
);

// Create the appointments slice
const appointmentsSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    clearAppointmentMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    setCurrentAppointment: (state, action) => {
      state.currentAppointment = action.payload;
    },
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null;
    },
    clearAppointments: (state) => {
      state.appointments = [];
      state.isLoading = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all appointments
      .addCase(fetchAllAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllAppointments.fulfilled, (state, action) => {
        state.isLoading = false;

        if (Array.isArray(action.payload)) {
          state.appointments = action.payload;
        } else if (
          action.payload &&
          Array.isArray(action.payload.appointments)
        ) {
          state.appointments = action.payload.appointments;
        } else {
          console.warn(
            "Unexpected appointments response format:",
            action.payload
          );
          state.appointments = [];
        }
      })
      .addCase(fetchAllAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch appointment by ID
      .addCase(fetchAppointmentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAppointment = action.payload;
      })
      .addCase(fetchAppointmentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create appointment
      .addCase(createAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = "Appointment created successfully";
        state.appointments.push(action.payload);
        state.currentAppointment = action.payload;
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create public appointment
      .addCase(createPublicAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createPublicAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = "Public appointment created successfully";
        state.appointments.push(action.payload);
        state.currentAppointment = action.payload;
      })
      .addCase(createPublicAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update appointment
      .addCase(updateAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = "Appointment updated successfully";

        // Update in the appointments array
        const index = state.appointments.findIndex(
          (appointment) => appointment.id === action.payload.id
        );

        if (index !== -1) {
          state.appointments[index] = action.payload;
        }

        // Update current appointment if it's the same one
        if (
          state.currentAppointment &&
          state.currentAppointment.id === action.payload.id
        ) {
          state.currentAppointment = action.payload;
        }
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete appointment
      .addCase(deleteAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = "Appointment deleted successfully";

        // Remove from appointments array
        state.appointments = state.appointments.filter(
          (appointment) => appointment.id !== action.payload
        );

        // Clear current appointment if it's the one that was deleted
        if (
          state.currentAppointment &&
          state.currentAppointment.id === action.payload
        ) {
          state.currentAppointment = null;
        }
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch future appointments
      .addCase(fetchFutureAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFutureAppointments.fulfilled, (state, action) => {
        state.isLoading = false;

        if (Array.isArray(action.payload)) {
          state.appointments = action.payload;
        } else if (
          action.payload &&
          Array.isArray(action.payload.appointments)
        ) {
          state.appointments = action.payload.appointments;
        } else {
          state.appointments = [];
        }
      })
      .addCase(fetchFutureAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch completed appointments
      .addCase(fetchCompletedAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompletedAppointments.fulfilled, (state, action) => {
        state.isLoading = false;

        if (Array.isArray(action.payload)) {
          state.appointments = action.payload;
        } else if (
          action.payload &&
          Array.isArray(action.payload.appointments)
        ) {
          state.appointments = action.payload.appointments;
        } else if (
          action.payload &&
          action.payload.data &&
          Array.isArray(action.payload.data)
        ) {
          state.appointments = action.payload.data;
        } else {
          console.warn(
            "Unexpected completed appointments response format:",
            action.payload
          );
          state.appointments = [];
        }
      })
      .addCase(fetchCompletedAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectAllAppointments = (state: RootState) =>
  state.appointments.appointments;
export const selectCurrentAppointment = (state: RootState) =>
  state.appointments.currentAppointment;
export const selectAppointmentsLoading = (state: RootState) =>
  state.appointments.isLoading;
export const selectAppointmentsError = (state: RootState) =>
  state.appointments.error;
export const selectAppointmentsSuccess = (state: RootState) =>
  state.appointments.success;

// Selector for completed appointments (filters appointments with completed status)
export const selectCompletedAppointments = (state: RootState) =>
  state.appointments.appointments.filter(
    (appointment) => appointment.status === "completed"
  );

// Export actions and reducer
export const {
  clearAppointmentMessages,
  setCurrentAppointment,
  clearCurrentAppointment,
  clearAppointments,
} = appointmentsSlice.actions;

export default appointmentsSlice.reducer;