"use client";
import ConfirmationDialog from "@/components/shared/ConfirmationDialouge";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import {  FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { LiaTimesSolid } from "react-icons/lia";
import { HiMiniArrowsUpDown } from "react-icons/hi2";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import {
  createDynamicForm,
  resetCreateFormStatus,
  createFormStep,
  fetchMappableFields,
  fetchFieldTypes,
  createStepField,
  updateStepField,
  resetCreateFieldStatus,
  updateDynamicForm,
  deleteFormField,
  updateFormStep,
  ReorderFieldsData,
  resetUpdateStepStatus,
} from "@/redux/slices/dynamicFormsSlice";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "react-toastify";

interface BaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

interface CreateFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formName: string, pipelineId: string) => void;
  width?: string;
}

interface EditFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (formName: string, pipelineId: string) => void;
  initialFormName: string;
  formId: string;
  width?: string;
}

interface EditStepDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (stepName: string) => void;
  initialStepName: string;
  stepId: string;
  width?: string;
}

interface AddStepDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stepName: string) => void;
  formId: string;
  width?: string;
}

interface FieldType {
  id: string;
  label: string;
  type: string;
  field_type?: string; // API response field
  required: boolean;
  is_required?: boolean; // API response field
  description: string;
  mapping: string;
  mapping_field?: string; // API response field
  options?: {
    value: string;
    label: string;
  }[];
  minValue?: string;
  maxValue?: string;
}

interface ManageFieldsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stepName: string;
  stepId: string;
  onSaveField: (field: FieldType) => void;
  existingFields: FieldType[];
  onEditField?: (field: FieldType) => void;
  onDeleteField?: (fieldId: string) => void;
  width?: string;
}

interface EditFieldDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (field: FieldType) => void;
  field: FieldType;
  stepName: string;
  width?: string;
}

// Sortable field row component
interface SortableFieldRowProps {
  field: FieldType;
  stepId: string;
  onEditField: (field: FieldType) => void;
  onDeleteField: (fieldId: string) => void;
  deletingFields: string[];
  isUpdatingPositions: boolean;
}

const SortableFieldRow: React.FC<SortableFieldRowProps> = ({
  field,
  onEditField,
  onDeleteField,
  deletingFields,
  isUpdatingPositions,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'bg-gray-100' : ''} hover:bg-gray-50`}
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {field.label}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {field.field_type || field.type}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {(
          field.is_required !== undefined
            ? field.is_required
            : field.required
        )
          ? "Yes"
          : "No"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {field.description || "-"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {field.mapping_field || field.mapping || "-"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div
          {...attributes}
          {...listeners}
          className={`text-gray-700 ${
            isUpdatingPositions 
              ? 'cursor-not-allowed opacity-50' 
              : 'cursor-grab active:cursor-grabbing hover:bg-gray-200'
          } p-1 rounded`}
        >
          <HiMiniArrowsUpDown size={20} />
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex space-x-2">
          <button
            className="text-gray-500 hover:text-gray-700 p-1 rounded bg-gray-200"
            onClick={() => onEditField(field)}
          >
            <FaEdit />
          </button>
          <button
            className={`p-1 rounded ${
              deletingFields.includes(field.id)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            } text-white`}
            onClick={() => !deletingFields.includes(field.id) && onDeleteField(field.id)}
            disabled={deletingFields.includes(field.id)}
          >
            {deletingFields.includes(field.id) ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaTrash />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
};

// Base Dialog Component
export const BaseDialog: React.FC<BaseDialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = "max-w-md",
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    // Add event listener only when dialog is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    // Add event listener only when dialog is open
    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={dialogRef}
        className={`bg-white rounded-lg w-full ${width} p-6`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-primary">{title}</h2>
          <Link
            href=""
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <LiaTimesSolid size={24} />
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
};

// Create Form Dialog
export const CreateFormDialog: React.FC<CreateFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  width,
}) => {
  const [formName, setFormName] = useState("");
  const [selectedPipeline, setSelectedPipeline] = useState("");

  const dispatch = useDispatch<AppDispatch>();

  // Get pipelines from Redux store
  const pipelines = useSelector((state: RootState) => state.pipeline.pipelines);

  // Get dynamic forms state from Redux
  const { createFormStatus, createFormError } = useSelector(
    (state: RootState) => state.dynamicForms
  );

  useEffect(() => {
    if (isOpen) {
      setFormName("");
      setSelectedPipeline("");
      // Reset any previous form creation status/errors
      dispatch(resetCreateFormStatus());
    }
  }, [isOpen, dispatch]);

  // Handle API errors from Redux state
  useEffect(() => {
    if (createFormError) {
      toast.error(createFormError);
    }
  }, [createFormError]);

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error("Please enter a form name");
      return;
    }

    if (!selectedPipeline) {
      toast.error("Please select a pipeline");
      return;
    }

    try {
      const formData = {
        pipeline_id: selectedPipeline,
        form_name: formName.trim(),
        is_enabled: true,
        steps: [], // Start with empty steps - user can add them later
      };

      const result = await dispatch(createDynamicForm(formData));

      if (createDynamicForm.fulfilled.match(result)) {
        toast.success("Form created successfully!");
        onSave(formName, selectedPipeline); // Call parent callback for any additional logic
        onClose();
        // Reset form state
        setFormName("");
        setSelectedPipeline("");
      } else {
        // Handle rejected case
        const errorMessage =
          (result.payload as string) || "Failed to create form";
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error creating form:", error);
    }
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Form"
      width={width}
    >
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Pipelines</label>
        <div className="relative">
          <select
            className="w-full p-2 border border-gray-300 rounded appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedPipeline}
            onChange={(e) => setSelectedPipeline(e.target.value)}
          >
            <option value="">Select pipeline</option>
            {pipelines.map((pipeline) => (
              <option key={pipeline.id} value={pipeline.id.toString()}>
                {pipeline.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Form Name</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Write form name"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
        />
      </div>

      <div className="flex justify-start">
        <button
          className="bg-base text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSave}
          disabled={createFormStatus === "loading"}
        >
          {createFormStatus === "loading" ? "Creating..." : "Save Form"}
        </button>
      </div>
    </BaseDialog>
  );
};

// Edit Form Dialog
export const EditFormDialog: React.FC<EditFormDialogProps> = ({
  isOpen,
  onClose,
  onUpdate,
  initialFormName,
  formId,
  width,
}) => {
  const [formName, setFormName] = useState(initialFormName);
  // const [selectedPipeline, setSelectedPipeline] = useState("");

  const dispatch = useDispatch<AppDispatch>();

  // Get dynamic forms state from Redux
  const updateFormStatus = useSelector(
    (state: RootState) => state.dynamicForms.updateFormStatus
  );
  const updateFormError = useSelector(
    (state: RootState) => state.dynamicForms.updateFormError
  );
  const isLoading = updateFormStatus === "loading";

  useEffect(() => {
    if (isOpen) {
      setFormName(initialFormName);
    }
  }, [isOpen, initialFormName]);

  // Handle API errors from Redux state
  useEffect(() => {
    if (updateFormError && isOpen) {
      toast.error(updateFormError);
    }
  }, [updateFormError, isOpen]);

  const handleUpdate = async () => {
    if (!formName.trim()) {
      toast.error("Please enter a form name");
      return;
    }

    if (!formId) {
      toast.error("Form ID is required");
      return;
    }

    try {
      const updateData = {
        form_name: formName.trim(),
      };

      const result = await dispatch(
        updateDynamicForm({
          formId,
          data: updateData,
        })
      );

      if (updateDynamicForm.fulfilled.match(result)) {
        toast.success("Form updated successfully!");
        onUpdate(formName, formId);
        onClose();
      } else {
        const errorMessage =
          (result.payload as string) || "Failed to update form";
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error updating form:", error);
    }
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Form"
      width={width}
    >
      {/* <div className="mb-4">
        <label className="block text-gray-700 mb-2">Pipelines</label>
        <div className="relative">
          <select
            className="w-full p-2 border border-gray-300 rounded appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedPipeline}
            onChange={(e) => setSelectedPipeline(e.target.value)}
          >
            <option value="">Select pipeline</option>
            {pipelines.map((pipeline) => (
              <option key={pipeline.id} value={pipeline.id.toString()}>
                {pipeline.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>
      </div> */}

      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Form Name</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
        />
      </div>

      <div className="flex justify-start">
        <button
          className="bg-base text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Update Form"}
        </button>
      </div>
    </BaseDialog>
  );
};

// Edit Step Dialog
export const EditStepDialog: React.FC<EditStepDialogProps> = ({
  isOpen,
  onClose,
  onUpdate,
  initialStepName,
  stepId,
  width,
}) => {
  const [stepName, setStepName] = useState(initialStepName);

  const dispatch = useDispatch<AppDispatch>();

  // Redux state selectors
  const updateStepStatus = useSelector(
    (state: RootState) => state.dynamicForms.updateStepStatus
  );
  const updateStepError = useSelector(
    (state: RootState) => state.dynamicForms.updateStepError
  );
  const isLoading = updateStepStatus === "loading";

  useEffect(() => {
    if (isOpen) {
      setStepName(initialStepName);
      // Reset any previous update step status/errors
      dispatch(resetUpdateStepStatus());
    }
  }, [isOpen, initialStepName, dispatch]);

  // Handle API errors from Redux state
  useEffect(() => {
    if (updateStepError && isOpen) {
      toast.error(updateStepError);
    }
  }, [updateStepError, isOpen]);

  const handleUpdate = async () => {
    if (!stepName.trim()) {
      toast.error("Please enter a step name");
      return;
    }

    if (!stepId) {
      toast.error("Step ID is required");
      return;
    }

    try {
      const stepData = {
        step_name: stepName.trim(),
      };

      await dispatch(updateFormStep({
        stepId,
        stepData,
      })).unwrap();

      toast.success("Step updated successfully!");
      onUpdate(stepName);
      onClose();
    } catch (error) {
      console.error("Failed to update step:", error);
      // Error is handled by Redux state and useEffect above
    }
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Step"
      width={width}
    >
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Step Name</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={stepName}
          onChange={(e) => setStepName(e.target.value)}
          placeholder="Enter step name"
        />
      </div>

      <div className="flex justify-start">
        <button
          className="bg-base text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Update Step"}
        </button>
      </div>
    </BaseDialog>
  );
};

// Add Step Dialog
export const AddStepDialog: React.FC<AddStepDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  formId,
  width,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [stepName, setStepName] = useState("");

  // Redux state selectors
  const createStepStatus = useSelector(
    (state: RootState) => state.dynamicForms.createStepStatus
  );
  // const createStepError = useSelector(
  //   (state: RootState) => state.dynamicForms.createStepError
  // );
  const forms = useSelector(
    (state: RootState) => state.dynamicForms.forms
  );
  const isLoading = createStepStatus === "loading";

  useEffect(() => {
    if (isOpen) {
      setStepName("");
    }
  }, [isOpen]);

  const handleSave = async () => {
    // Form validation
    if (!stepName.trim()) {
      toast.error("Please enter a step name");
      return;
    }

    if (!formId) {
      toast.error("Form ID is required");
      return;
    }

    try {
      // Find the form by ID to calculate position based on existing steps
      const form = forms.find(f => f.id === formId);
      
      // Find the next available position by looking for gaps or using the next number
      let nextPosition = 1;
      if (form?.steps && form.steps.length > 0) {
        // Sort steps by position to find gaps
        const sortedSteps = [...form.steps].sort((a, b) => (a.position || 0) - (b.position || 0));
        
        // Find the first gap in positions, or use the next number after the highest position
        for (let i = 0; i < sortedSteps.length; i++) {
          const expectedPosition = i + 1;
          const actualPosition = sortedSteps[i].position || 0;
          
          if (actualPosition > expectedPosition) {
            // Found a gap, use the expected position
            nextPosition = expectedPosition;
            break;
          }
        }
        
        // If no gap found, use the next position after the highest
        if (nextPosition === 1) {
          const highestPosition = Math.max(...sortedSteps.map(step => step.position || 0));
          nextPosition = highestPosition + 1;
        }
      }

      // Prepare step data
      const stepData = {
        step_name: stepName.trim(),
        position: nextPosition,
        fields: [], // Empty fields array - fields can be added later through ManageFieldsDialog
      };

      // Dispatch the API call
      await dispatch(
        createFormStep({
          formId,
          stepData,
        })
      ).unwrap();

      // Success handling
      toast.success("Step created successfully!");
      onSave(stepName); // Call the parent callback for any additional handling
      onClose();
      setStepName(""); // Reset form
    } catch (error) {
      // Error handling
      const errorMessage =
        typeof error === "string" ? error : "Failed to create step";
      toast.error(errorMessage);
      console.error("Failed to create step:", error);
    }
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Step"
      width={width}
    >
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Step Name</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter step name"
          value={stepName}
          onChange={(e) => setStepName(e.target.value)}
        />
      </div>

      <div className="flex justify-start">
        <button
          className={`px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-base hover:bg-blue-700"
          } text-white`}
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Save Step"}
        </button>
      </div>
    </BaseDialog>
  );
};

// Edit Field Dialog
export const EditFieldDialog: React.FC<EditFieldDialogProps> = ({
  isOpen,
  onClose,
  onUpdate,
  field,
  stepName,
  width = "max-w-2xl",
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [editedField, setEditedField] = useState<FieldType>({ ...field });
  const [newOptionValue, setNewOptionValue] = useState("");
  const [newOptionLabel, setNewOptionLabel] = useState("");

  // Redux state selectors
  const mappableFields = useSelector(
    (state: RootState) => state.dynamicForms.mappableFields
  );
  const apiFieldTypes = useSelector(
    (state: RootState) => state.dynamicForms.fieldTypes
  );
  const fetchMappableFieldsStatus = useSelector(
    (state: RootState) => state.dynamicForms.fetchMappableFieldsStatus
  );
  const fetchFieldTypesStatus = useSelector(
    (state: RootState) => state.dynamicForms.fetchFieldTypesStatus
  );
  const createFieldStatus = useSelector(
    (state: RootState) => state.dynamicForms.createFieldStatus
  );
  const createFieldError = useSelector(
    (state: RootState) => state.dynamicForms.createFieldError
  );
  const isFieldLoading = createFieldStatus === "loading";

  useEffect(() => {
    if (isOpen) {
      // Ensure backward compatibility with old field structure
      const normalizedField = {
        ...field,
        field_type: field.field_type || field.type || "",
        is_required:
          field.is_required !== undefined
            ? field.is_required
            : field.required || false,
        mapping_field: field.mapping_field || field.mapping || "",
      };
      setEditedField(normalizedField);
      // Fetch data when dialog opens
      if (fetchMappableFieldsStatus === "idle") {
        dispatch(fetchMappableFields());
      }
      if (fetchFieldTypesStatus === "idle") {
        dispatch(fetchFieldTypes());
      }
    }
  }, [
    isOpen,
    field,
    dispatch,
    fetchMappableFieldsStatus,
    fetchFieldTypesStatus,
  ]);

  // Handle API errors from Redux state
  useEffect(() => {
    if (createFieldError && isOpen) {
      toast.error(createFieldError);
    }
  }, [createFieldError, isOpen]);

  const handleUpdateField = async () => {
    // Form validation
    if (!editedField.label.trim()) {
      toast.error("Please enter a field label");
      return;
    }

    if (!editedField.type && !editedField.field_type) {
      toast.error("Please select a field type");
      return;
    }

    if (!editedField.id) {
      toast.error("Field ID is required");
      return;
    }

    // Prepare field data according to API structure
    const fieldData = {
      label: editedField.label.trim(),
      field_type: (editedField.field_type || editedField.type) as
        | "text"
        | "select"
        | "textarea"
        | "email"
        | "number"
        | "checkbox"
        | "radio"
        | "date"
        | "multiple_choice"
        | "slider",
      is_required:
        editedField.is_required !== undefined
          ? editedField.is_required
          : editedField.required,
      description: editedField.description?.trim() || undefined,
      mapping_field:
        editedField.mapping_field || editedField.mapping || undefined,
      options: editedField.options?.map((opt) => opt.value) || undefined,
      validation_rules: undefined, // Add validation rules if needed
    };

    try {
      // Dispatch the API call
      const result = await dispatch(
        updateStepField({
          fieldId: editedField.id,
          fieldData,
        })
      );

      // Check if the action was fulfilled (successful)
      if (updateStepField.fulfilled.match(result)) {
        toast.success("Field updated successfully!");
        console.log("Field updated successfully!");
        onUpdate(editedField); // Call parent callback for any additional logic
        onClose();
      } else {
        // Handle rejected case
        const errorMessage =
          (result.payload as string) || "Failed to update field";
        toast.error(errorMessage);
        console.error("Field update failed:", result.payload);
      }
    } finally {
      // Ensure loading state is reset regardless of success/failure
      dispatch(resetCreateFieldStatus());
    }
  };

  const addOption = () => {
    if (newOptionValue) {
      const options = editedField.options || [];
      setEditedField({
        ...editedField,
        options: [
          ...options,
          {
            value: newOptionValue,
            label: newOptionLabel || newOptionValue,
          },
        ],
      });
      setNewOptionValue("");
      setNewOptionLabel("");
    }
  };

  const removeOption = (index: number) => {
    if (editedField.options) {
      const newOptions = [...editedField.options];
      newOptions.splice(index, 1);
      setEditedField({
        ...editedField,
        options: newOptions,
      });
    }
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Step for ${stepName}`}
      width={width}
    >
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-gray-700 mb-2">
            Label <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={editedField.label}
            onChange={(e) =>
              setEditedField({ ...editedField, label: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Type</label>
          <div className="relative">
            <select
              className="w-full p-2 border border-gray-300 rounded appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editedField.field_type || editedField.type}
              onChange={(e) =>
                setEditedField({ ...editedField, field_type: e.target.value, type: e.target.value })
              }
            >
              <option value="">Select Type</option>
              {apiFieldTypes.map((type) => {
                // Use type.value directly as it contains the correct field type
                const typeValue = type.value || type.id;
                return (
                  <option key={type.id} value={typeValue}>
                    {type.label}
                  </option>
                );
              })}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Slider specific controls */}
      {(editedField.field_type === "Slider" || editedField.type === "Slider") && (
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Options</label>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1"
                value={editedField.minValue || ""}
                onChange={(e) =>
                  setEditedField({ ...editedField, minValue: e.target.value })
                }
              />
              <span className="text-xs text-gray-500 ml-2">Min</span>
            </div>
            <div>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1000000"
                value={editedField.maxValue || ""}
                onChange={(e) =>
                  setEditedField({ ...editedField, maxValue: e.target.value })
                }
              />
              <span className="text-xs text-gray-500 ml-2">Max</span>
            </div>
          </div>
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
            onClick={addOption}
          >
            <FaPlus className="mr-2" /> Add
          </button>
        </div>
      )}

      {/* Select and Radio specific controls */}
      {(editedField.field_type === "Select" || editedField.type === "Select" || editedField.field_type === "Radio" || editedField.type === "Radio") && (
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Options</label>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Option value"
              value={newOptionValue}
              onChange={(e) => setNewOptionValue(e.target.value)}
            />
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Display label (optional)"
              value={newOptionLabel}
              onChange={(e) => setNewOptionLabel(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
            onClick={addOption}
          >
            <FaPlus className="mr-2" /> Add
          </button>

          {editedField.options && editedField.options.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Defined Options:</h4>
              <ul className="bg-gray-50 p-2 rounded">
                {editedField.options.map((option, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center py-1 border-b last:border-0"
                  >
                    <span>
                      {option.value}{" "}
                      {option.label !== option.value && `(${option.label})`}
                    </span>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeOption(index)}
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-gray-700 mb-2">Label Description</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter label description"
            value={editedField.description}
            onChange={(e) =>
              setEditedField({ ...editedField, description: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Field Mapping</label>
          <div className="relative">
            <select
              className="w-full p-2 border border-gray-300 rounded appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editedField.mapping_field || editedField.mapping}
              onChange={(e) =>
                setEditedField({ ...editedField, mapping_field: e.target.value, mapping: e.target.value })
              }
            >
              <option value="">Select Field</option>
              {mappableFields.map((field) => {
                // Use field.value directly as it already contains the correct field name
                const fieldValue = field.value || field.id;

                return (
                  <option key={field.id} value={fieldValue}>
                    {field.label}
                  </option>
                );
              })}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center mb-6">
        <label className="flex items-center text-gray-700">
          <input
            type="checkbox"
            checked={editedField.is_required !== undefined ? editedField.is_required : editedField.required}
            onChange={(e) =>
              setEditedField({ ...editedField, is_required: e.target.checked, required: e.target.checked })
            }
            className="form-checkbox h-5 w-5 text-blue-500 mr-2"
          />
          <span>Required</span>
        </label>
      </div>

      <div className="flex justify-end">
        <button
          className={`px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isFieldLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-base hover:bg-blue-700"
          } text-white`}
          onClick={handleUpdateField}
          disabled={isFieldLoading}
        >
          {isFieldLoading ? "Updating..." : "Update Field"}
        </button>
      </div>
    </BaseDialog>
  );
};

// Manage Fields Dialog
export const ManageFieldsDialog: React.FC<ManageFieldsDialogProps> = ({
  isOpen,
  onClose,
  stepName,
  stepId,
  onSaveField,
  existingFields,
  onEditField,
  width,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [newField, setNewField] = useState<FieldType>({
    id: "",
    label: "",
    type: "",
    required: false,
    description: "",
    mapping: "",
  });

  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    title: "",
    message: "",
    fieldId: "",
  });
  const [isConfirming, setIsConfirming] = useState(false);

  // For editing fields
  const [isEditFieldDialogOpen, setIsEditFieldDialogOpen] = useState(false);
  const [currentEditField, setCurrentEditField] = useState<FieldType | null>(
    null
  );

  // Local state for tracking field position updates
  const [updatingFieldPositions, setUpdatingFieldPositions] = useState(false);

  // Redux state selectors
  const mappableFields = useSelector(
    (state: RootState) => state.dynamicForms.mappableFields
  );
  const apiFieldTypes = useSelector(
    (state: RootState) => state.dynamicForms.fieldTypes
  );
  const fetchMappableFieldsStatus = useSelector(
    (state: RootState) => state.dynamicForms.fetchMappableFieldsStatus
  );
  const fetchFieldTypesStatus = useSelector(
    (state: RootState) => state.dynamicForms.fetchFieldTypesStatus
  );
  const createFieldStatus = useSelector(
    (state: RootState) => state.dynamicForms.createFieldStatus
  );
  // const createFieldError = useSelector(
  //   (state: RootState) => state.dynamicForms.createFieldError
  // );
  const isFieldLoading = createFieldStatus === "loading";
  const deletingFields = useSelector(
    (state: RootState) => state.dynamicForms.deletingFields
  );

  useEffect(() => {
    if (isOpen) {
      setNewField({
        id: "",
        label: "",
        type: "",
        required: false,
        description: "",
        mapping: "",
      });
      // Fetch data when dialog opens
      if (fetchMappableFieldsStatus === "idle") {
        dispatch(fetchMappableFields());
      }
      if (fetchFieldTypesStatus === "idle") {
        dispatch(fetchFieldTypes());
      }
    }
  }, [isOpen, dispatch, fetchMappableFieldsStatus, fetchFieldTypesStatus]);

  const handleSaveField = async () => {
    // Form validation
    if (!newField.label.trim()) {
      toast.error("Please enter a field label");
      return;
    }

    if (!newField.type) {
      toast.error("Please select a field type");
      return;
    }

    if (!stepId) {
      toast.error("Step ID is required");
      return;
    }

    // Calculate position based on existing fields
    const position = existingFields.length + 1;

    // Prepare field data according to API structure
    const fieldData = {
      label: newField.label.trim(),
      field_type: newField.type as
        | "text"
        | "select"
        | "textarea"
        | "email"
        | "number"
        | "checkbox"
        | "radio"
        | "date"
        | "multiple_choice"
        | "slider",
      is_required: newField.required,
      description: newField.description?.trim() || undefined,
      mapping_field: newField.mapping || undefined,
      position: position,
      options: newField.options?.map((opt) => opt.value) || undefined,
      validation_rules: undefined,
    };

    // Dispatch the API call
    const result = await dispatch(
      createStepField({
        stepId,
        fieldData,
      })
    );

    // Check if the action was fulfilled (successful)
    if (createStepField.fulfilled.match(result)) {
      // Success handling
      toast.success("Field created successfully!");
      onSaveField({
        ...newField,
        id: result.payload.field.id || `field-${Date.now()}`,
      });

      // Reset form
      setNewField({
        id: "",
        label: "",
        type: "",
        required: false,
        description: "",
        mapping: "",
      });

      // Close the modal
      onClose();
    } else {
      // Handle rejected case
      const errorMessage =
        (result.payload as string) || "Failed to create field";
      toast.error(errorMessage);
      console.error("Field creation failed:", result.payload);
    }
  };

  const openEditFieldDialog = (field: FieldType) => {
    setCurrentEditField(field);
    setIsEditFieldDialogOpen(true);
  };

  const handleUpdateField = (updatedField: FieldType) => {
    if (onEditField) {
      onEditField(updatedField);
    }
  };

  const confirmDeleteField = (fieldId: string) => {
    const field = existingFields.find((f) => f.id === fieldId);
    if (!field) return;

    setConfirmation({
      isOpen: true,
      title: "Are you sure?",
      message: `Do you really want to delete the field "${field.label}"? This process cannot be undone.`,
      fieldId: fieldId,
    });
  };

  const handleConfirmDelete = async () => {
    setIsConfirming(true);
    try {
      await dispatch(deleteFormField(confirmation.fieldId)).unwrap();
      toast.success("Field deleted successfully!");
      setConfirmation({ ...confirmation, isOpen: false });
    } catch (error) {
      console.error("Failed to delete field:", error);
      toast.error("Failed to delete field");
      setConfirmation({ ...confirmation, isOpen: false });
    } finally {
      setIsConfirming(false);
    }
  };

  const closeConfirmation = () => {
    setConfirmation({ ...confirmation, isOpen: false });
  };

  // Handle drag end for field reordering
  const handleFieldDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // Prevent dragging if positions are being updated
    if (updatingFieldPositions) {
      return;
    }

    if (active.id !== over?.id) {
      const oldIndex = existingFields.findIndex(field => field.id === active.id);
      const newIndex = existingFields.findIndex(field => field.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Update local state immediately for better UX
        const newFields = arrayMove(existingFields, oldIndex, newIndex);
        
        // Add to updating state
        setUpdatingFieldPositions(true);

        try {
          // Create the fields payload with updated positions
          const fieldsPayload = newFields.map((field, index) => ({
            id: field.id,
            position: index + 1
          }));

          // Update the step with the new field positions
          const reorderData: ReorderFieldsData = {
            fields: fieldsPayload
          };
          
          await dispatch(updateFormStep({
            stepId,
            stepData: reorderData
          })).unwrap();
          
          toast.success("Field order updated successfully!");
        } catch (error) {
          console.error("Failed to update field order:", error);
          toast.error("Failed to update field order. Please try again.");
        } finally {
          // Remove from updating state
          setUpdatingFieldPositions(false);
        }
      }
    }
  };

  console.log(mappableFields, "mappableFields");
  console.log("existingFields:", existingFields);
  console.log("existingFields length:", existingFields.length);

  return (
    <>
      <BaseDialog
        isOpen={isOpen}
        onClose={onClose}
        title={`Manage Fields for ${stepName}`}
        width={width}
      >
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">
              Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter lable name"
              value={newField.label}
              onChange={(e) =>
                setNewField({ ...newField, label: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Type</label>
            <div className="relative">
              <select
                className="w-full p-2 border border-gray-300 rounded appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newField.type}
                onChange={(e) =>
                  setNewField({ ...newField, type: e.target.value })
                }
              >
                <option value="">Select Type</option>
                {apiFieldTypes.map((type) => {
                  // Use type.value directly as it contains the correct field type
                  const typeValue = type.value || type.id;
                  console.log(
                    "DEBUG: ManageFieldsDialog - Type object:",
                    type,
                    "Using value:",
                    typeValue
                  );

                  return (
                    <option key={type.id} value={typeValue}>
                      {type.label}
                    </option>
                  );
                })}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">
              Label Description
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter lable Description"
              value={newField.description}
              onChange={(e) =>
                setNewField({ ...newField, description: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Field Mapping</label>
            <div className="relative">
              <select
                className="w-full p-2 border border-gray-300 rounded appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newField.mapping}
                onChange={(e) =>
                  setNewField({ ...newField, mapping: e.target.value })
                }
              >
                <option value="">Select Field</option>
                {mappableFields.map((field) => {
                  // Use field.value directly as it already contains the correct field name
                  const fieldValue = field.value || field.id;

                  return (
                    <option key={field.id} value={fieldValue}>
                      {field.label}
                    </option>
                  );
                })}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="flex items-center text-gray-700">
            <span className="mr-2">Required</span>
            <input
              type="checkbox"
              checked={newField.required}
              onChange={(e) =>
                setNewField({ ...newField, required: e.target.checked })
              }
              className="form-checkbox h-5 w-5 text-blue-500"
            />
          </label>
        </div>

        <div className="flex justify-end mb-6">
          <button
            className={`px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isFieldLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-base hover:bg-blue-700"
            } text-white`}
            onClick={handleSaveField}
            disabled={isFieldLoading}
          >
            {isFieldLoading ? "Creating..." : "Save Field"}
          </button>
        </div>

        {/* Field List */}
        <div className="overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleFieldDragEnd}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Label
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Required
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mapping
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sorting
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <SortableContext
                items={existingFields.map(field => field.id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody className="bg-white divide-y divide-gray-200">
                  {existingFields.map((field) => {
                    console.log("Rendering field:", field);
                    return (
                      <SortableFieldRow
                        key={field.id}
                        field={field}
                        stepId={stepId}
                        onEditField={openEditFieldDialog}
                        onDeleteField={confirmDeleteField}
                        deletingFields={deletingFields}
                        isUpdatingPositions={updatingFieldPositions}
                      />
                    );
                  })}
                  {existingFields.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                      >
                        No fields added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </SortableContext>
            </table>
          </DndContext>
          {updatingFieldPositions && (
            <div className="flex items-center justify-center mt-4 text-sm text-gray-600">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              Updating field order...
            </div>
          )}
        </div>
      </BaseDialog>

      {/* Edit Field Dialog */}
      {currentEditField && (
        <EditFieldDialog
          isOpen={isEditFieldDialogOpen}
          onClose={() => setIsEditFieldDialogOpen(false)}
          onUpdate={handleUpdateField}
          field={currentEditField}
          stepName={stepName}
        />
      )}
      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        title={confirmation.title}
        message={confirmation.message}
        confirmText="Yes"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={closeConfirmation}
        isLoading={isConfirming}
      />
    </>
  );
};

/* eslint-disable-next-line */
export default {
  BaseDialog,
  CreateFormDialog,
  EditFormDialog,
  EditStepDialog,
  AddStepDialog,
  ManageFieldsDialog,
  EditFieldDialog,
};
