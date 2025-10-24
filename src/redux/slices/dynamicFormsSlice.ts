import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";

// Define types for dynamic forms based on actual API structure
export interface DynamicForm {
  id?: string;
  pipeline_id: string;
  form_name: string;
  is_enabled: boolean;
  steps: FormStep[];
  created_at?: string;
  updated_at?: string;
  pipelines?: {
    id: string;
    name: string;
    slug?: string;
    type?: string;
    source?: string;
    company_id?: string | null;
    user_id?: string;
    created_at?: string;
    updated_at?: string;
    is_deleted?: boolean;
  };
}

export interface FormStep {
  id?: string;
  step_name: string;
  position: number;
  form_fields: FormField[];
}

export interface FormField {
  id?: string;
  label: string;
  field_type: "text" | "select" | "textarea" | "email" | "number" | "checkbox" | "radio" | "date" | "multiple_choice" | "slider";
  is_required: boolean;
  position: number;
  mapping_field?: string;
  description?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  validation_rules?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface MappableField {
  id: string;
  value: string;
  label: string;
  table: string;
  description?: string;
}

export interface FieldType {
  id: string;
  value: string;
  label: string;
  description?: string;
  validation_options?: {
    supports_min_max?: boolean;
    supports_pattern?: boolean;
    supports_options?: boolean;
  };
}

export interface CreateFormData {
  pipeline_id: string;
  form_name: string;
  is_enabled: boolean;
  steps: Omit<FormStep, 'id'>[];
}

export interface ReorderStepsData {
  steps: {
    id: string;
    position: number;
  }[];
}

export interface ReorderFieldsData {
  fields: {
    id: string;
    position: number;
  }[];
}

export interface CreateStepData {
  step_name: string;
  position: number;
  fields: Omit<FormField, 'id'>[];
}

export interface CreateFieldData {
  label: string;
  field_type: "text" | "select" | "textarea" | "email" | "number" | "checkbox" | "radio" | "date" | "multiple_choice" | "slider";
  is_required: boolean;
  description?: string;
  mapping_field?: string;
  position: number;
  options?: string[];
  validation_rules?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface UpdateFieldData {
  label?: string;
  field_type?: "text" | "select" | "textarea" | "email" | "number" | "checkbox" | "radio" | "date" | "multiple_choice" | "slider";
  is_required?: boolean;
  description?: string;
  mapping_field?: string;
  position?: number;
  options?: string[];
  validation_rules?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface SubmitFormData {
  form_id: string;
  submission_data: Record<string, string | number | boolean | string[] | undefined>;
  user_id?: string;
  customer_id?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submission_data: Record<string, any>;
  user_id?: string;
  customer_id?: string;
  ip_address?: string;
  user_agent?: string;
  submitted_at: string;
}

export interface FormStatistics {
  total_submissions: number;
  today_submissions: number;
  last_7_days_submissions: number;
  last_30_days_submissions: number;
  conversion_rate: number;
  completion_rate: number;
  average_completion_time: number;
  daily_breakdown: {
    date: string;
    submissions: number;
    completed: number;
    conversion_rate: number;
  }[];
  exit_points: {
    step_name: string;
    exit_count: number;
    exit_percentage: number;
  }[];
  sources: {
    source: string;
    count: number;
    percentage: number;
  }[];
  peak_hours: {
    hour: string;
    submissions: number;
  }[];
  form_health: {
    load_time: number;
    error_rate: number;
    abandonment_rate: number;
  };
}

export interface UserStatistics {
  total_users_created: number;
  today_users_created: number;
  last_7_days_users_created: number;
  last_30_days_users_created: number;
  conversion_rates: {
    submission_to_user: number;
    today_conversion: number;
    last_7_days_conversion: number;
    last_30_days_conversion: number;
  };
  user_status_breakdown: {
    active: number;
    pending_verification: number;
    inactive: number;
    suspended: number;
  };
  lead_quality: {
    high_quality: number;
    medium_quality: number;
    low_quality: number;
    qualified_leads: number;
    converted_to_customers: number;
  };
  daily_user_creation: {
    date: string;
    users_created: number;
    form_submissions: number;
  }[];
  traffic_sources: {
    source: string;
    users: number;
    percentage: number;
  }[];
  geographic_distribution: {
    country: string;
    users: number;
    percentage: number;
  }[];
}

interface DynamicFormsState {
  forms: DynamicForm[];
  currentForm: DynamicForm | null;
  mappableFields: MappableField[];
  fieldTypes: FieldType[];
  submissions: FormSubmission[];
  currentFormStatistics: FormStatistics | null;
  currentUserStatistics: UserStatistics | null;
  isLoading: boolean;
  error: string | null;
  createFormStatus: "idle" | "loading" | "succeeded" | "failed";
  createFormError: string | null;
  fetchMappableFieldsStatus: "idle" | "loading" | "succeeded" | "failed";
  fetchMappableFieldsError: string | null;
  fetchFieldTypesStatus: "idle" | "loading" | "succeeded" | "failed";
  fetchFieldTypesError: string | null;
  createStepStatus: "idle" | "loading" | "succeeded" | "failed";
  createStepError: string | null;
  createFieldStatus: "idle" | "loading" | "succeeded" | "failed";
  createFieldError: string | null;
  submitFormStatus: "idle" | "loading" | "succeeded" | "failed";
  submitFormError: string | null;
  fetchStatisticsStatus: "idle" | "loading" | "succeeded" | "failed";
  fetchStatisticsError: string | null;
  fetchUserStatisticsStatus: "idle" | "loading" | "succeeded" | "failed";
  fetchUserStatisticsError: string | null;
  updateFormStatus: "idle" | "loading" | "succeeded" | "failed";
  updateFormError: string | null;
  updateStepStatus: "idle" | "loading" | "succeeded" | "failed";
  updateStepError: string | null;
  togglingForms: string[]; // Array of form IDs that are currently being toggled
  deleteStepStatus: "idle" | "loading" | "succeeded" | "failed";
  deleteStepError: string | null;
  deletingSteps: string[]; // Array of step IDs that are currently being deleted
  deleteFieldStatus: "idle" | "loading" | "succeeded" | "failed";
  deleteFieldError: string | null;
  deletingFields: string[]; // Array of field IDs that are currently being deleted
  fetchByUserStatus: "idle" | "loading" | "succeeded" | "failed";
  fetchByUserError: string | null;
  creatingSteps: string[]; // Array of form IDs that are currently creating steps
}

const initialState: DynamicFormsState = {
  forms: [],
  currentForm: null,
  mappableFields: [],
  fieldTypes: [],
  submissions: [],
  currentFormStatistics: null,
  currentUserStatistics: null,
  isLoading: false,
  error: null,
  createFormStatus: "idle",
  createFormError: null,
  fetchMappableFieldsStatus: "idle",
  fetchMappableFieldsError: null,
  fetchFieldTypesStatus: "idle",
  fetchFieldTypesError: null,
  createStepStatus: "idle",
  createStepError: null,
  createFieldStatus: "idle",
  createFieldError: null,
  submitFormStatus: "idle",
  submitFormError: null,
  fetchStatisticsStatus: "idle",
  fetchStatisticsError: null,
  fetchUserStatisticsStatus: "idle",
  fetchUserStatisticsError: null,
  updateFormStatus: "idle",
  updateFormError: null,
  updateStepStatus: "idle",
  updateStepError: null,
  togglingForms: [],
  deleteStepStatus: "idle",
  deleteStepError: null,
  deletingSteps: [],
  deleteFieldStatus: "idle",
  deleteFieldError: null,
  deletingFields: [],
  fetchByUserStatus: "idle",
  fetchByUserError: null,
  creatingSteps: [],
};

// Async thunk for creating a new dynamic form
export const createDynamicForm = createAsyncThunk(
  "dynamicForms/create",
  async (formData: CreateFormData, { rejectWithValue }) => {
    try {
      const response = await api.post("/dynamic-forms", formData);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to create dynamic form");
    }
  }
);

// Async thunk for creating a new step for an existing form
export const createFormStep = createAsyncThunk(
  "dynamicForms/createStep",
  async ({ formId, stepData }: { formId: string; stepData: CreateStepData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/dynamic-forms/${formId}/steps`, stepData);
      return { formId, step: response.data };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to create form step");
    }
  }
);

// Async thunk for creating a new field for an existing step
export const createStepField = createAsyncThunk(
  "dynamicForms/createField",
  async ({ stepId, fieldData }: { stepId: string; fieldData: CreateFieldData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/dynamic-forms/steps/${stepId}/fields`, fieldData);
      return { stepId, field: response.data };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to create step field");
    }
  }
);

// Async thunk for updating a field
export const updateStepField = createAsyncThunk(
  "dynamicForms/updateField",
  async ({ fieldId, fieldData }: { fieldId: string; fieldData: UpdateFieldData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/dynamic-forms/fields/${fieldId}`, fieldData);
      return { fieldId, field: response.data };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update field");
    }
  }
);

// Async thunk for updating a form step
export const updateFormStep = createAsyncThunk(
  "dynamicForms/updateStep",
  async ({ stepId, stepData }: { stepId: string; stepData: Partial<FormStep> | ReorderFieldsData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/dynamic-forms/steps/${stepId}`, stepData);
      return { stepId, step: response.data };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update step");
    }
  }
);

// Async thunk for submitting form data (public endpoint)
export const submitForm = createAsyncThunk(
  "dynamicForms/submit",
  async (submissionData: SubmitFormData, { rejectWithValue }) => {
    try {
      const response = await api.post("/dynamic-forms/submit", submissionData);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to submit form");
    }
  }
);

// Async thunk for fetching mappable fields
export const fetchMappableFields = createAsyncThunk(
  "dynamicForms/fetchMappableFields",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/dynamic-forms/mappable-fields");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch mappable fields");
    }
  }
);

// Async thunk for fetching field types
export const fetchFieldTypes = createAsyncThunk(
  "dynamicForms/fetchFieldTypes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/dynamic-forms/field-types");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch field types");
    }
  }
);

// Additional async thunks for common CRUD operations

// Fetch all dynamic forms
export const fetchDynamicForms = createAsyncThunk(
  "dynamicForms/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/dynamic-forms");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch dynamic forms");
    }
  }
);

// Fetch dynamic form by ID
export const fetchDynamicFormById = createAsyncThunk(
  "dynamicForms/fetchById",
  async (formId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/dynamic-forms/${formId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch dynamic form");
    }
  }
);

// Update dynamic form
export const updateDynamicForm = createAsyncThunk(
  "dynamicForms/update",
  async ({ formId, data }: { formId: string; data: Partial<CreateFormData> | ReorderStepsData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/dynamic-forms/${formId}`, data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update dynamic form");
    }
  }
);

// Delete dynamic form
export const deleteDynamicForm = createAsyncThunk(
  "dynamicForms/delete",
  async (formId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/dynamic-forms/${formId}`);
      return formId;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to delete dynamic form");
    }
  }
);

// Delete form step
export const deleteFormStep = createAsyncThunk(
  "dynamicForms/deleteStep",
  async (stepId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/dynamic-forms/steps/${stepId}`);
      return stepId;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to delete form step");
    }
  }
);

// Delete form field
export const deleteFormField = createAsyncThunk(
  "dynamicForms/deleteField",
  async (fieldId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/dynamic-forms/fields/${fieldId}`);
      return fieldId;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to delete form field");
    }
  }
);

// Fetch form statistics
export const fetchFormStatistics = createAsyncThunk(
  "dynamicForms/fetchStatistics",
  async (formId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/dynamic-forms/${formId}/statistics`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch form statistics");
    }
  }
);

// Fetch user statistics
export const fetchUserStatistics = createAsyncThunk(
  "dynamicForms/fetchUserStatistics",
  async (formId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/dynamic-forms/${formId}/user-statistics`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch user statistics");
    }
  }
);

// Fetch dynamic forms by user ID
export const fetchDynamicFormsByUser = createAsyncThunk(
  "dynamicForms/fetchByUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/dynamic-forms/user/${userId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch dynamic forms by user");
    }
  }
);

const dynamicFormsSlice = createSlice({
  name: "dynamicForms",
  initialState,
  reducers: {
    clearCurrentForm: (state) => {
      state.currentForm = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
      state.createFormError = null;
      state.fetchMappableFieldsError = null;
      state.fetchFieldTypesError = null;
      state.createStepError = null;
      state.createFieldError = null;
      state.submitFormError = null;
      state.fetchStatisticsError = null;
      state.fetchUserStatisticsError = null;
    },
    resetCreateFormStatus: (state) => {
      state.createFormStatus = "idle";
      state.createFormError = null;
    },
    resetCreateStepStatus: (state) => {
      state.createStepStatus = "idle";
      state.createStepError = null;
    },
    resetCreateFieldStatus: (state) => {
      state.createFieldStatus = "idle";
      state.createFieldError = null;
    },
    resetSubmitFormStatus: (state) => {
      state.submitFormStatus = "idle";
      state.submitFormError = null;
    },
    resetFetchStatisticsStatus: (state) => {
      state.fetchStatisticsStatus = "idle";
      state.fetchStatisticsError = null;
    },
    resetFetchUserStatisticsStatus: (state) => {
      state.fetchUserStatisticsStatus = "idle";
      state.fetchUserStatisticsError = null;
    },
    resetUpdateFormStatus: (state) => {
      state.updateFormStatus = "idle";
      state.updateFormError = null;
    },
    resetUpdateStepStatus: (state) => {
      state.updateStepStatus = "idle";
      state.updateStepError = null;
    },
    addTogglingForm: (state, action: PayloadAction<string>) => {
      if (!state.togglingForms.includes(action.payload)) {
        state.togglingForms.push(action.payload);
      }
    },
    removeTogglingForm: (state, action: PayloadAction<string>) => {
      state.togglingForms = state.togglingForms.filter(id => id !== action.payload);
    },
    resetDeleteStepStatus: (state) => {
      state.deleteStepStatus = "idle";
      state.deleteStepError = null;
    },
    addDeletingStep: (state, action: PayloadAction<string>) => {
      if (!state.deletingSteps.includes(action.payload)) {
        state.deletingSteps.push(action.payload);
      }
    },
    removeDeletingStep: (state, action: PayloadAction<string>) => {
      state.deletingSteps = state.deletingSteps.filter(id => id !== action.payload);
    },
    resetDeleteFieldStatus: (state) => {
      state.deleteFieldStatus = "idle";
      state.deleteFieldError = null;
    },
    addDeletingField: (state, action: PayloadAction<string>) => {
      if (!state.deletingFields.includes(action.payload)) {
        state.deletingFields.push(action.payload);
      }
    },
    removeDeletingField: (state, action: PayloadAction<string>) => {
      state.deletingFields = state.deletingFields.filter(id => id !== action.payload);
    },
    resetFetchByUserStatus: (state) => {
      state.fetchByUserStatus = "idle";
      state.fetchByUserError = null;
    },
    addCreatingStep: (state, action: PayloadAction<string>) => {
      if (!state.creatingSteps.includes(action.payload)) {
        state.creatingSteps.push(action.payload);
      }
    },
    removeCreatingStep: (state, action: PayloadAction<string>) => {
      state.creatingSteps = state.creatingSteps.filter(id => id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Create dynamic form cases
      .addCase(createDynamicForm.pending, (state) => {
        state.createFormStatus = "loading";
        state.createFormError = null;
      })
      .addCase(createDynamicForm.fulfilled, (state, action: PayloadAction<DynamicForm>) => {
        state.createFormStatus = "succeeded";
        state.forms.push(action.payload);
        state.currentForm = action.payload;
      })
      .addCase(createDynamicForm.rejected, (state, action) => {
        state.createFormStatus = "failed";
        state.createFormError = action.payload as string;
      })
      
      // Create form step cases
      .addCase(createFormStep.pending, (state, action) => {
        state.createStepStatus = "loading";
        state.createStepError = null;
        // Add the form ID to creating steps
        const formId = action.meta.arg.formId;
        if (formId && !state.creatingSteps.includes(formId)) {
          state.creatingSteps.push(formId);
        }
      })
      .addCase(createFormStep.fulfilled, (state, action) => {
        state.createStepStatus = "succeeded";
        const { formId, step } = action.payload;
        
        // Add the step to the current form if it matches
        if (state.currentForm && state.currentForm.id === formId) {
          state.currentForm.steps.push(step);
        }
        
        // Add the step to the form in the forms array
        const formIndex = state.forms.findIndex(form => form.id === formId);
        if (formIndex !== -1) {
          state.forms[formIndex].steps.push(step);
        }
        
        // Remove the form ID from creating steps
        state.creatingSteps = state.creatingSteps.filter(id => id !== formId);
      })
      .addCase(createFormStep.rejected, (state, action) => {
        state.createStepStatus = "failed";
        state.createStepError = action.payload as string;
        // Remove the form ID from creating steps on error
        const formId = action.meta.arg.formId;
        if (formId) {
          state.creatingSteps = state.creatingSteps.filter(id => id !== formId);
        }
      })
      
      // Create step field cases
      .addCase(createStepField.pending, (state) => {
        state.createFieldStatus = "loading";
        state.createFieldError = null;
      })
      .addCase(createStepField.fulfilled, (state, action) => {
        state.createFieldStatus = "succeeded";
        const { stepId, field } = action.payload;
        
        // Add the field to the current form's matching step
        if (state.currentForm) {
          const stepIndex = state.currentForm.steps.findIndex(step => step.id === stepId);
          if (stepIndex !== -1) {
            state.currentForm.steps[stepIndex].form_fields.push(field);
          }
        }
        
        // Add the field to the matching step in the forms array
        for (const form of state.forms) {
          const stepIndex = form.steps.findIndex(step => step.id === stepId);
          if (stepIndex !== -1) {
            form.steps[stepIndex].form_fields.push(field);
            break;
          }
        }
      })
      .addCase(createStepField.rejected, (state, action) => {
        state.createFieldStatus = "failed";
        state.createFieldError = action.payload as string;
      })
      
             // Update step field cases
       .addCase(updateStepField.pending, (state) => {
         state.createFieldStatus = "loading"; // Reusing createFieldStatus for update
         state.createFieldError = null;
       })
       .addCase(updateStepField.fulfilled, (state, action) => {
         state.createFieldStatus = "succeeded";
         const { fieldId, field } = action.payload;
         
         // Update the field in the current form by finding it across all steps
         if (state.currentForm) {
           for (const step of state.currentForm.steps) {
             const fieldIndex = step.form_fields.findIndex(f => f.id === fieldId);
             if (fieldIndex !== -1) {
               step.form_fields[fieldIndex] = field;
               break;
             }
           }
         }
         
         // Update the field in the forms array by finding it across all steps
         for (const form of state.forms) {
           for (const step of form.steps) {
             const fieldIndex = step.form_fields.findIndex(f => f.id === fieldId);
             if (fieldIndex !== -1) {
               step.form_fields[fieldIndex] = field;
               break;
             }
           }
         }
       })
       .addCase(updateStepField.rejected, (state, action) => {
         state.createFieldStatus = "failed";
         state.createFieldError = action.payload as string;
       })
       
       // Update form step cases
       .addCase(updateFormStep.pending, (state) => {
         state.updateStepStatus = "loading";
         state.updateStepError = null;
       })
       .addCase(updateFormStep.fulfilled, (state, action) => {
         state.updateStepStatus = "succeeded";
         const { stepId, step } = action.payload;
         
         // Update the step in the current form
         if (state.currentForm) {
           const stepIndex = state.currentForm.steps.findIndex(s => s.id === stepId);
           if (stepIndex !== -1) {
             state.currentForm.steps[stepIndex] = step;
           }
         }
         
         // Update the step in the forms array
         for (const form of state.forms) {
           const stepIndex = form.steps.findIndex(s => s.id === stepId);
           if (stepIndex !== -1) {
             form.steps[stepIndex] = step;
             break;
           }
         }
       })
       .addCase(updateFormStep.rejected, (state, action) => {
         state.updateStepStatus = "failed";
         state.updateStepError = action.payload as string;
       })
      
      // Submit form cases
      .addCase(submitForm.pending, (state) => {
        state.submitFormStatus = "loading";
        state.submitFormError = null;
      })
      .addCase(submitForm.fulfilled, (state, action: PayloadAction<FormSubmission>) => {
        state.submitFormStatus = "succeeded";
        state.submissions.push(action.payload);
      })
      .addCase(submitForm.rejected, (state, action) => {
        state.submitFormStatus = "failed";
        state.submitFormError = action.payload as string;
      })
      
      // Fetch mappable fields cases
      .addCase(fetchMappableFields.pending, (state) => {
        state.fetchMappableFieldsStatus = "loading";
        state.fetchMappableFieldsError = null;
      })
      .addCase(fetchMappableFields.fulfilled, (state, action: PayloadAction<MappableField[]>) => {
        state.fetchMappableFieldsStatus = "succeeded";
        state.mappableFields = action.payload;
      })
      .addCase(fetchMappableFields.rejected, (state, action) => {
        state.fetchMappableFieldsStatus = "failed";
        state.fetchMappableFieldsError = action.payload as string;
      })
      
      // Fetch field types cases
      .addCase(fetchFieldTypes.pending, (state) => {
        state.fetchFieldTypesStatus = "loading";
        state.fetchFieldTypesError = null;
      })
      .addCase(fetchFieldTypes.fulfilled, (state, action: PayloadAction<FieldType[]>) => {
        state.fetchFieldTypesStatus = "succeeded";
        state.fieldTypes = action.payload;
      })
      .addCase(fetchFieldTypes.rejected, (state, action) => {
        state.fetchFieldTypesStatus = "failed";
        state.fetchFieldTypesError = action.payload as string;
      })
      
      // Fetch all dynamic forms cases
      .addCase(fetchDynamicForms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDynamicForms.fulfilled, (state, action: PayloadAction<DynamicForm[]>) => {
        state.isLoading = false;
        state.forms = action.payload;
      })
      .addCase(fetchDynamicForms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch dynamic form by ID cases
      .addCase(fetchDynamicFormById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDynamicFormById.fulfilled, (state, action: PayloadAction<DynamicForm>) => {
        state.isLoading = false;
        state.currentForm = action.payload;
      })
      .addCase(fetchDynamicFormById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update dynamic form cases
      .addCase(updateDynamicForm.pending, (state, action) => {
        state.updateFormStatus = "loading";
        state.updateFormError = null;
        // Add the form ID to toggling forms if it's a toggle operation
        const formId = action.meta.arg.formId;
        if (formId && !state.togglingForms.includes(formId)) {
          state.togglingForms.push(formId);
        }
      })
      .addCase(updateDynamicForm.fulfilled, (state, action: PayloadAction<DynamicForm>) => {
        state.updateFormStatus = "succeeded";
        const index = state.forms.findIndex(form => form.id === action.payload.id);
        if (index !== -1) {
          // Preserve existing pipelines data if the API response doesn't include it
          const existingForm = state.forms[index];
          const updatedForm = {
            ...action.payload,
            pipelines: action.payload.pipelines || existingForm.pipelines
          };
          state.forms[index] = updatedForm;
          
          // Update currentForm if it's the same form
          if (state.currentForm && state.currentForm.id === action.payload.id) {
            state.currentForm = updatedForm;
          }
        }
        // Remove the form ID from toggling forms
        const formId = action.payload.id;
        if (formId) {
          state.togglingForms = state.togglingForms.filter(id => id !== formId);
        }
      })
      .addCase(updateDynamicForm.rejected, (state, action) => {
        state.updateFormStatus = "failed";
        state.updateFormError = action.payload as string;
        // Remove the form ID from toggling forms on error
        const formId = action.meta.arg.formId;
        if (formId) {
          state.togglingForms = state.togglingForms.filter(id => id !== formId);
        }
      })
      
      // Delete dynamic form cases
      .addCase(deleteDynamicForm.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDynamicForm.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.forms = state.forms.filter(form => form.id !== action.payload);
        if (state.currentForm && state.currentForm.id === action.payload) {
          state.currentForm = null;
        }
      })
      .addCase(deleteDynamicForm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete form step cases
      .addCase(deleteFormStep.pending, (state, action) => {
        state.deleteStepStatus = "loading";
        state.deleteStepError = null;
        // Add the step ID to deleting steps
        const stepId = action.meta.arg;
        if (stepId && !state.deletingSteps.includes(stepId)) {
          state.deletingSteps.push(stepId);
        }
      })
      .addCase(deleteFormStep.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleteStepStatus = "succeeded";
        // Remove the step from current form if it exists
        if (state.currentForm) {
          state.currentForm.steps = state.currentForm.steps.filter(step => step.id !== action.payload);
        }
        // Remove the step from forms array
        state.forms.forEach(form => {
          form.steps = form.steps.filter(step => step.id !== action.payload);
        });
        // Remove the step ID from deleting steps
        state.deletingSteps = state.deletingSteps.filter(id => id !== action.payload);
      })
      .addCase(deleteFormStep.rejected, (state, action) => {
        state.deleteStepStatus = "failed";
        state.deleteStepError = action.payload as string;
        // Remove the step ID from deleting steps on error
        const stepId = action.meta.arg;
        if (stepId) {
          state.deletingSteps = state.deletingSteps.filter(id => id !== stepId);
        }
      })
      
      // Delete form field cases
      .addCase(deleteFormField.pending, (state, action) => {
        state.deleteFieldStatus = "loading";
        state.deleteFieldError = null;
        // Add the field ID to deleting fields
        const fieldId = action.meta.arg;
        if (fieldId && !state.deletingFields.includes(fieldId)) {
          state.deletingFields.push(fieldId);
        }
      })
      .addCase(deleteFormField.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleteFieldStatus = "succeeded";
        // Remove the field from current form if it exists
        if (state.currentForm) {
          state.currentForm.steps.forEach(step => {
            step.form_fields = step.form_fields.filter(field => field.id !== action.payload);
          });
        }
        // Remove the field from forms array
        state.forms.forEach(form => {
          form.steps.forEach(step => {
            step.form_fields = step.form_fields.filter(field => field.id !== action.payload);
          });
        });
        // Remove the field ID from deleting fields
        state.deletingFields = state.deletingFields.filter(id => id !== action.payload);
      })
      .addCase(deleteFormField.rejected, (state, action) => {
        state.deleteFieldStatus = "failed";
        state.deleteFieldError = action.payload as string;
        // Remove the field ID from deleting fields on error
        const fieldId = action.meta.arg;
        if (fieldId) {
          state.deletingFields = state.deletingFields.filter(id => id !== fieldId);
        }
      })
      
      // Fetch form statistics cases
      .addCase(fetchFormStatistics.pending, (state) => {
        state.fetchStatisticsStatus = "loading";
        state.fetchStatisticsError = null;
      })
      .addCase(fetchFormStatistics.fulfilled, (state, action: PayloadAction<FormStatistics>) => {
        state.fetchStatisticsStatus = "succeeded";
        state.currentFormStatistics = action.payload;
      })
      .addCase(fetchFormStatistics.rejected, (state, action) => {
        state.fetchStatisticsStatus = "failed";
        state.fetchStatisticsError = action.payload as string;
      })
      
      // Fetch user statistics cases
      .addCase(fetchUserStatistics.pending, (state) => {
        state.fetchUserStatisticsStatus = "loading";
        state.fetchUserStatisticsError = null;
      })
      .addCase(fetchUserStatistics.fulfilled, (state, action: PayloadAction<UserStatistics>) => {
        state.fetchUserStatisticsStatus = "succeeded";
        state.currentUserStatistics = action.payload;
      })
      .addCase(fetchUserStatistics.rejected, (state, action) => {
        state.fetchUserStatisticsStatus = "failed";
        state.fetchUserStatisticsError = action.payload as string;
      })
      
      // Fetch dynamic forms by user cases
      .addCase(fetchDynamicFormsByUser.pending, (state) => {
        state.fetchByUserStatus = "loading";
        state.fetchByUserError = null;
      })
      .addCase(fetchDynamicFormsByUser.fulfilled, (state, action: PayloadAction<DynamicForm[]>) => {
        state.fetchByUserStatus = "succeeded";
        state.forms = action.payload;
      })
      .addCase(fetchDynamicFormsByUser.rejected, (state, action) => {
        state.fetchByUserStatus = "failed";
        state.fetchByUserError = action.payload as string;
      });
  },
});

export const { 
  clearCurrentForm, 
  clearError, 
  resetCreateFormStatus, 
  resetCreateStepStatus, 
  resetCreateFieldStatus, 
  resetSubmitFormStatus, 
  resetFetchStatisticsStatus, 
  resetFetchUserStatisticsStatus,
  resetUpdateFormStatus,
  resetUpdateStepStatus,
  addTogglingForm,
  removeTogglingForm,
  resetDeleteStepStatus,
  addDeletingStep,
  removeDeletingStep,
  resetDeleteFieldStatus,
  addDeletingField,
  removeDeletingField,
  resetFetchByUserStatus,
  addCreatingStep,
  removeCreatingStep
} = dynamicFormsSlice.actions;
export default dynamicFormsSlice.reducer;
