"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaLink,
  FaEdit,
  FaTrash,
  FaFunnelDollar,
  FaPlus,
  FaShare,
} from "react-icons/fa";
import { HiMiniArrowsUpDown } from "react-icons/hi2";
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
import {
  CreateFormDialog,
  EditFormDialog,
  EditStepDialog,
  AddStepDialog,
  ManageFieldsDialog,
  EditFieldDialog,
} from "./Dialoges";
import ConfirmationDialog from "@/components/shared/ConfirmationDialouge";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { fetchPipelines } from "@/redux/slices/pipelineSlice";
import {
  fetchDynamicFormsByUser,
  updateDynamicForm,
  deleteDynamicForm,
  deleteFormStep,
  deleteFormField,
  ReorderStepsData,
} from "@/redux/slices/dynamicFormsSlice";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

interface Step {
  id: string;
  name: string;
  step_name?: string;
  position?: number;
  form_fields?: FormField[];
}

interface FormField {
  id?: string;
  label?: string;
  field_type?: string;
  is_required?: boolean;
  description?: string;
  mapping_field?: string;
}

interface Field {
  id: string;
  label: string;
  type: string;
  required: boolean;
  description: string;
  mapping: string;
  options?: {
    value: string;
    label: string;
  }[];
  minValue?: string;
  maxValue?: string;
}

interface Pipeline {
  id: string;
  name: string;
  description: string;
  active: boolean;
  steps: Step[];
}
interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

// Sortable table row component
interface SortableTableRowProps {
  step: Step;
  pipelineId: string;
  onManageFields: (pipelineId: string, stepId: string, stepName: string) => void;
  onDeleteStep: (pipelineId: string, stepId: string) => void;
  onEditStep: (stepId: string, stepName: string) => void;
  deletingSteps: string[];
  isUpdatingPositions: boolean;
}

const SortableTableRow: React.FC<SortableTableRowProps> = ({
  step,
  pipelineId,
  onManageFields,
  onDeleteStep,
  onEditStep,
  deletingSteps,
  isUpdatingPositions,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

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
      <td className="px-6 py-4 text-base text-primary">
        <div className="flex items-center">
        
          {step.name}
        </div>
      </td>
      <td className="px-6 py-4">
        {/* <div className="text-gray-700 cursor-pointer">
          <HiMiniArrowsUpDown size={24} fill="primary" />
        </div> */}
          <div
            {...attributes}
            {...listeners}
            className={`mr-3 p-1 w-max rounded ${
              isUpdatingPositions 
                ? 'cursor-not-allowed opacity-50' 
                : 'cursor-grab active:cursor-grabbing hover:bg-gray-200'
            }`}
          >
            <HiMiniArrowsUpDown size={20} className="text-gray-500" />
          </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          <button
            className="bg-base text-white px-3 py-[6px] rounded text-md"
            onClick={() =>
              onManageFields(pipelineId, step.id, step.name)
            }
          >
            Manage Property
          </button>
          <button 
            className="text-white py-1 rounded px-2 border-none bg-[#6C757D] duration-150 hover:bg-[#5C636A]"
            onClick={() => onEditStep(step.id, step.name)}
          >
            <FaEdit className="text-lg" />
          </button>
          <button
            onClick={() =>
              !deletingSteps.includes(step.id) && onDeleteStep(pipelineId, step.id)
            }
            className={`py-1 rounded px-2 border-none duration-150 ${
              deletingSteps.includes(step.id)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#DC3545] hover:bg-[#DC3545]"
            } text-white`}
            disabled={deletingSteps.includes(step.id)}
          >
            {deletingSteps.includes(step.id) ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaTrash className="text-lg" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
};

const FormsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get data from Redux store
  // const pipelinesFromRedux = useSelector((state: RootState) => state.pipeline.pipelines);
  // const isLoadingPipelines = useSelector((state: RootState) => state.pipeline.isLoading);

  // Dynamic Forms Redux state
  const forms = useSelector(
    (state: RootState) => state.dynamicForms.forms
  );
  const isLoadingForms = useSelector(
    (state: RootState) => state.dynamicForms.fetchByUserStatus === "loading"
  );
  const formsError = useSelector(
    (state: RootState) => state.dynamicForms.fetchByUserError
  );
  const togglingForms = useSelector(
    (state: RootState) => state.dynamicForms.togglingForms
  );
  const deletingSteps = useSelector(
    (state: RootState) => state.dynamicForms.deletingSteps
  );
  const creatingSteps = useSelector(
    (state: RootState) => state.dynamicForms.creatingSteps
  );
  // Local state for tracking step position updates
  const [updatingStepPositions, setUpdatingStepPositions] = useState<string[]>([]);

  // Local state for forms-specific data - convert dynamic form to pipeline structure for UI compatibility
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);

  // Get user ID from localStorage
  const getUserId = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user.id;
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
          return null;
        }
      }
    }
    return null;
  };

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchPipelines());
    
    const userId = getUserId();
    if (userId) {
      dispatch(fetchDynamicFormsByUser(userId));
    } else {
      console.error('No user ID found in localStorage');
    }
  }, [dispatch]);

  // Convert dynamic forms to pipeline structure when data changes
  useEffect(() => {
   

    if (forms && forms.length > 0) {
      const convertedPipelines: Pipeline[] = forms.map((form) => {
        console.log(
          "DEBUG: form.steps structure:",
          JSON.stringify(form.steps, null, 2)
        );

        return {
          id: form.id || "",
          name: form.form_name,
          description: `${form.pipelines?.name}`,
          active: form.is_enabled,
          steps:
            form.steps?.map((step) => ({
              id: step.id || "",
              name: step.step_name,
            })) || [],
        };
      });

      setPipelines(convertedPipelines);
    } else {
      setPipelines([]);
    }
  }, [forms]);

  const [isCreateFormDialogOpen, setIsCreateFormDialogOpen] = useState(false);
  const [isEditFormDialogOpen, setIsEditFormDialogOpen] = useState(false);
  const [isEditStepDialogOpen, setIsEditStepDialogOpen] = useState(false);
  const [isAddStepDialogOpen, setIsAddStepDialogOpen] = useState(false);
  const [isManageFieldsDialogOpen, setIsManageFieldsDialogOpen] =
    useState(false);
  const [isEditFieldDialogOpen, setIsEditFieldDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareableUrl, setShareableUrl] = useState("");
  // const [shareFormId, setShareFormId] = useState('');

  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [isConfirming, setIsConfirming] = useState(false);

  const [currentPipelineId, setCurrentPipelineId] = useState<string>("");
  const [currentStepId, setCurrentStepId] = useState<string>("");
  const [currentStepName, setCurrentStepName] = useState<string>("");
  const [currentField] = useState<Field | null>(null);
  const [editingStepId, setEditingStepId] = useState<string>("");
  const [editingStepName, setEditingStepName] = useState<string>("");

  const [fields, setFields] = useState<Field[]>([]);

  // Handle drag end for step reordering
  const handleDragEnd = async (event: DragEndEvent, pipelineId: string) => {
    const { active, over } = event;

    // Prevent dragging if positions are being updated
    if (updatingStepPositions.includes(pipelineId)) {
      return;
    }

    if (active.id !== over?.id) {
      const pipeline = pipelines.find(p => p.id === pipelineId);
      if (!pipeline) return;

      const oldIndex = pipeline.steps.findIndex(step => step.id === active.id);
      const newIndex = pipeline.steps.findIndex(step => step.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Update local state immediately for better UX
        const newSteps = arrayMove(pipeline.steps, oldIndex, newIndex);
        const updatedPipeline = { ...pipeline, steps: newSteps };
        
        setPipelines(prev => 
          prev.map(p => p.id === pipelineId ? updatedPipeline : p)
        );

        // Add to updating state
        setUpdatingStepPositions(prev => [...prev, pipelineId]);

        try {
          // Create the steps payload with updated positions
          const stepsPayload = newSteps.map((step, index) => ({
            id: step.id,
            position: index + 1
          }));

          // Update the form with the new step positions
          const reorderData: ReorderStepsData = {
            steps: stepsPayload
          };
          
          await dispatch(updateDynamicForm({
            formId: pipelineId,
            data: reorderData
          })).unwrap();
          
          toast.success("Step order updated successfully!");
        } catch (error) {
          // Revert local state on error
          console.error("Failed to update step order:", error);
          setPipelines(prev => 
            prev.map(p => p.id === pipelineId ? pipeline : p)
          );
          toast.error("Failed to update step order. Please try again.");
        } finally {
          // Remove from updating state
          setUpdatingStepPositions(prev => prev.filter(id => id !== pipelineId));
        }
      }
    }
  };

  // Sync fields when forms update and we have a selected step
  useEffect(() => {
    console.log("DEBUG: useEffect fields sync - forms:", forms);
    console.log("DEBUG: useEffect fields sync - currentStepId:", currentStepId);
    console.log(
      "DEBUG: useEffect fields sync - isManageFieldsDialogOpen:",
      isManageFieldsDialogOpen
    );

    if (forms && forms.length > 0 && currentStepId && isManageFieldsDialogOpen) {
      // Find the step across all forms
      let step = null;
      for (const form of forms) {
        step = form.steps?.find((s) => s.id === currentStepId);
        if (!step) {
          // Try finding by string comparison (in case of type mismatch)
          step = form.steps?.find((s) => String(s.id) === String(currentStepId));
        }
        if (step) break;
      }

      console.log("DEBUG: useEffect - Found step:", step);

      // Handle both API response structures: fields and form_fields
      const fieldsArray =
        (step as { form_fields?: FormField[] })?.form_fields || [];

      if (
        step &&
        fieldsArray &&
        Array.isArray(fieldsArray) &&
        fieldsArray.length > 0
      ) {
        console.log("DEBUG: useEffect - step.fieldsArray:", fieldsArray);
        const convertedFields = fieldsArray.map((field: FormField) => ({
          id: field.id || `temp-${Date.now()}-${Math.random()}`,
          label: field.label || "",
          type: field.field_type || "",
          required: field.is_required || false,
          description: field.description || "",
          mapping: field.mapping_field || "",
          // Add any additional fields that might be needed for backward compatibility
          field_type: field.field_type,
          is_required: field.is_required,
          mapping_field: field.mapping_field,
        }));
        console.log("DEBUG: useEffect - convertedFields:", convertedFields);
        setFields(convertedFields);
      } else {
        console.log("DEBUG: useEffect - No step found or no fields in step");
        setFields([]);
      }
    } else {
      console.log("DEBUG: useEffect - Conditions not met for field sync");
    }
  }, [forms, currentStepId, isManageFieldsDialogOpen]);

  //   const addStep = (pipelineId: string) => {
  //     setPipelines(
  //       pipelines.map((pipeline) => {
  //         if (pipeline.id === pipelineId) {
  //           return {
  //             ...pipeline,
  //             steps: [
  //               ...pipeline.steps,
  //               {
  //                 id: `${pipelineId}-${pipeline.steps.length + 1}`,
  //                 name: "New Step",
  //               },
  //             ],
  //           };
  //         }
  //         return pipeline;
  //       })
  //     );
  //   };

  const togglePipeline = async (formId: string) => {
    try {
      // Find the form from the forms array
      const form = forms.find(f => f.id === formId);
      if (!form) return;

      // Update the form with toggled is_enabled status
      await dispatch(
        updateDynamicForm({
          formId: formId,
          data: {
            is_enabled: !form.is_enabled,
          },
        })
      ).unwrap();

      // No need to refresh the form - the Redux state is automatically updated
      toast.success("Form status updated successfully!");
    } catch (error) {
      console.error("Failed to toggle form status:", error);
      toast.error("Failed to update form status");
    }
  };

  // Dialog handler functions
  const handleCreateForm = (formName: string, pipelineId: string) => {
    // Implement form creation logic
    console.log("Creating new form:", { name: formName, pipeline: pipelineId });
    // You could add a new form to your state here
  };

  const handleUpdateForm = (formName: string, pipelineId: string) => {
    // Implement form update logic
    console.log("Updating form:", { name: formName, pipeline: pipelineId });
    // You could update the form in your state here
  };

  const handleAddStepWithName = () => {
    // Refresh the forms data to get the updated steps from the API
    const userId = getUserId();
    if (userId) {
      dispatch(fetchDynamicFormsByUser(userId));
    }
  };

  const handleSaveField = (newField: Field) => {
    console.log("DEBUG: handleSaveField called with:", newField);
    console.log("DEBUG: current fields before adding:", fields);

    // Add the new field to local state immediately for UI feedback
    setFields([...fields, newField]);

    // Refresh the forms data to get the updated fields from the API
    const userId = getUserId();
    if (userId) {
      dispatch(fetchDynamicFormsByUser(userId));
    }
  };

  const handleUpdateField = (updatedField: Field) => {
    setFields(fields.map((f) => (f.id === updatedField.id ? updatedField : f)));
  };

  const confirmDeletePipeline = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    if (!form) return;

    setConfirmation({
      isOpen: true,
      title: "Are you sure?",
      message: `Do you really want to delete the form "${form.form_name}"? This process cannot be undone.`,
      onConfirm: async () => {
        setIsConfirming(true);
        try {
          await dispatch(deleteDynamicForm(formId)).unwrap();
          toast.success("Form deleted successfully!");
          setConfirmation({ ...confirmation, isOpen: false });
        } catch (error) {
          console.error("Failed to delete form:", error);
          toast.error("Failed to delete form");
          setConfirmation({ ...confirmation, isOpen: false });
        } finally {
          setIsConfirming(false);
        }
      },
    });
  };

  const confirmDeleteStep = (pipelineId: string, stepId: string) => {
    const pipeline = pipelines.find((p) => p.id === pipelineId);
    const step = pipeline?.steps.find((s) => s.id === stepId);
    if (!pipeline || !step) return;

    setConfirmation({
      isOpen: true,
      title: "Are you sure?",
      message: `Do you really want to delete the step "${step.name}"? This process cannot be undone.`,
      onConfirm: async () => {
        setIsConfirming(true);
        try {
          // Delete the step first
          await dispatch(deleteFormStep(stepId)).unwrap();
          
          // After successful deletion, reorder the remaining steps
          const remainingSteps = pipeline.steps.filter(s => s.id !== stepId);
          if (remainingSteps.length > 0) {
            // Create a payload to update all remaining steps with new positions
            const stepsPayload = remainingSteps.map((step, index) => ({
              id: step.id,
              position: index + 1
            }));

            // Update the form with reordered steps
            await dispatch(updateDynamicForm({
              formId: pipelineId,
              data: {
                steps: stepsPayload
              }
            })).unwrap();
          }
          
          toast.success("Step deleted successfully!");
          setConfirmation({ ...confirmation, isOpen: false });
        } catch (error) {
          console.error("Failed to delete step:", error);
          toast.error("Failed to delete step");
          setConfirmation({ ...confirmation, isOpen: false });
        } finally {
          setIsConfirming(false);
        }
      },
    });
  };

  const confirmDeleteField = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;

    setConfirmation({
      isOpen: true,
      title: "Are you sure?",
      message: `Do you really want to delete the field "${field.label}"? This process cannot be undone.`,
      onConfirm: async () => {
        setIsConfirming(true);
        try {
          await dispatch(deleteFormField(fieldId)).unwrap();
          toast.success("Field deleted successfully!");
          setConfirmation({ ...confirmation, isOpen: false });
        } catch (error) {
          console.error("Failed to delete field:", error);
          toast.error("Failed to delete field");
          setConfirmation({ ...confirmation, isOpen: false });
        } finally {
          setIsConfirming(false);
        }
      },
    });
  };

  // Helper functions to open dialogs with context
  const openAddStepDialog = (pipelineId: string) => {
    setCurrentPipelineId(pipelineId);
    setIsAddStepDialogOpen(true);
  };

  const openEditFormDialog = (pipelineId: string) => {
    setCurrentPipelineId(pipelineId);
    setIsEditFormDialogOpen(true);
  };

  const openEditStepDialog = (stepId: string, stepName: string) => {
    setEditingStepId(stepId);
    setEditingStepName(stepName);
    setIsEditStepDialogOpen(true);
  };

  const handleStepUpdate = (updatedStepName: string) => {
    // Update the local state to reflect the change
    setPipelines(prev => 
      prev.map(pipeline => ({
        ...pipeline,
        steps: pipeline.steps.map(step => 
          step.id === editingStepId 
            ? { ...step, name: updatedStepName }
            : step
        )
      }))
    );
  };

  const openManageFieldsDialog = (
    pipelineId: string,
    stepId: string,
    stepName: string
  ) => {
    console.log("DEBUG: openManageFieldsDialog called with:", {
      pipelineId,
      stepId,
      stepName,
    });
    console.log("DEBUG: forms:", forms);

    setCurrentPipelineId(pipelineId);
    setCurrentStepId(stepId);
    setCurrentStepName(stepName);

    // Function to extract and convert fields
    const extractAndConvertFields = () => {
      if (
        !forms ||
        !Array.isArray(forms) ||
        forms.length === 0
      ) {
        console.log("DEBUG: No forms array");
        return [];
      }

      console.log("DEBUG: forms:", forms);

      // Try different step ID matching strategies across all forms
      let step = null;
      for (const form of forms) {
        step = form.steps?.find((s) => s.id === stepId);

        if (!step) {
          // Try finding by string comparison (in case of type mismatch)
          step = form.steps?.find((s) => String(s.id) === String(stepId));
        }

        if (!step) {
          // Try finding by step_name if ID matching fails
          step = form.steps?.find((s) => s.step_name === stepName);
        }

        if (step) break;
      }

      console.log("DEBUG: Found step:", step);

      if (!step) {
        console.log("DEBUG: No matching step found");
        return [];
      }

      // Handle both API response structures: fields and form_fields
      const fieldsArray = (step as { form_fields?: FormField[] }).form_fields || [];

      if (
        !fieldsArray ||
        !Array.isArray(fieldsArray) ||
        fieldsArray.length === 0
      ) {
        console.log("DEBUG: Step has no fields array:", fieldsArray);
        return [];
      }

      console.log("DEBUG: step.fieldsArray:", fieldsArray);

      // Convert API field structure to component field structure
      const convertedFields = fieldsArray.map((field: FormField) => ({
        id: field.id || `temp-${Date.now()}-${Math.random()}`,
        label: field.label || "",
        type: field.field_type || "", // Use field_type from API
        required: field.is_required || false, // Use is_required from API
        description: field.description || "",
        mapping: field.mapping_field || "", // Use mapping_field from API
        // Add any additional fields that might be needed for backward compatibility
        field_type: field.field_type,
        is_required: field.is_required,
        mapping_field: field.mapping_field,
      }));

      console.log("DEBUG: convertedFields:", convertedFields);
      return convertedFields;
    };

    // Extract fields immediately if forms are available
    const extractedFields = extractAndConvertFields();
    setFields(extractedFields);

    // If no fields were extracted and forms are not loaded yet,
    // the useEffect will handle it when the data becomes available
    if (extractedFields.length === 0 && (!forms || forms.length === 0)) {
      console.log("DEBUG: No forms available, waiting for data load");
      // Force a fresh fetch if needed
      const userId = getUserId();
      if (userId) {
        dispatch(fetchDynamicFormsByUser(userId));
      }
    }

    setIsManageFieldsDialogOpen(true);
  };

  //   const openEditFieldDialog = (field: Field) => {
  //     setCurrentField(field);
  //     setIsEditFieldDialogOpen(true);
  //   };

  const closeConfirmation = () => {
    setConfirmation({ ...confirmation, isOpen: false });
  };

  const openShareDialog = (formId: string) => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/form/${formId}`;
    setShareableUrl(shareUrl);
    // setShareFormId(formId);
    setIsShareDialogOpen(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareableUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success("Link copied to clipboard!");
    }
  };

  const openInNewTab = () => {
    window.open(shareableUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Leadpool</h1>
        <button
          className="bg-base text-white text-base px-4 py-2 rounded"
          onClick={() => setIsCreateFormDialogOpen(true)}
        >
          Create New Form
        </button>
      </div>

      {/* Loading state */}
      {isLoadingForms && (
        <div className="text-center w-full flex justify-center items-center py-8">
          <div className="w-6 h-6 border-2 border-base border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error state */}
      {formsError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          Error loading forms: {formsError}
        </div>
      )}

      {/* No forms state */}
      {!isLoadingForms && !formsError && pipelines.length === 0 && (
        <div className="text-center py-8">
          <div className="text-lg text-gray-600">
            No forms found. Create your first form!
          </div>
        </div>
      )}

      {!isLoadingForms &&
        !formsError &&
        pipelines.map((pipeline) => (
          <div
            key={pipeline.id}
            className="bg-white rounded-lg border border-gray-300 mb-6 overflow-hidden"
          >
            <div className="p-4 border-b">
              <div className="flex xsm:flex-col xsm:items-start gap-4 justify-between items-center">
                <div>
                  <h2 className="text-2xl font-semibold text-base">
                    {pipeline.name}
                  </h2>
                  <p className="text-base text-primary pt-2">
                    Pipeline : {pipeline.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 items-center space-x-2">
                  <div
                    className={`w-16 h-6 rounded-full flex items-center ${
                      pipeline.active ? "bg-[#28A745]" : "bg-gray-300"
                    } p-1 cursor-pointer relative ${
                      togglingForms.includes(pipeline.id) ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() => !togglingForms.includes(pipeline.id) && togglePipeline(pipeline.id)}
                  >
                    {togglingForms.includes(pipeline.id) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                        pipeline.active ? "translate-x-[38px]" : ""
                      } ${togglingForms.includes(pipeline.id) ? "opacity-0" : ""}`}
                    ></div>
                  </div>
                  <Link
                    href="/admin/forms/pipeline-performance"
                    className="bg-base text-white py-[10px] px-3 rounded inline-flex items-center justify-center"
                  >
                    <FaLink className="text-md" />
                  </Link>
                  <button className="bg-base text-white p-2 rounded flex items-center">
                    <FaFunnelDollar className="text-sm mr-1" />
                    <span className="text-md">Funnel Editor</span>
                  </button>
                  <button
                    className={`duration-150 text-white p-2 rounded flex items-center ${
                      creatingSteps.includes(pipeline.id)
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#212529] hover:bg-[#424649]"
                    }`}
                    onClick={() => !creatingSteps.includes(pipeline.id) && openAddStepDialog(pipeline.id)}
                    disabled={creatingSteps.includes(pipeline.id)}
                  >
                    {creatingSteps.includes(pipeline.id) ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                    ) : (
                      <span className="text-md mr-1">
                        <FaPlus />
                      </span>
                    )}
                    <span className="text-md">
                      {creatingSteps.includes(pipeline.id) ? "Adding..." : "Add Step"}
                    </span>
                  </button>
                  <button
                    className="bg-[#6C757D] duration-150 hover:bg-[#5C636A] text-white p-[10px] rounded border-none"
                    onClick={() => openEditFormDialog(pipeline.id)}
                  >
                    <FaEdit className="text-lg" />
                  </button>
                  <button
                    onClick={() => confirmDeletePipeline(pipeline.id)}
                    className="bg-[#DC3545] hover:bg-[#DC3545] text-white p-[10px] rounded border-none"
                  >
                    <FaTrash className="text-lg" />
                  </button>
                  <button
                    className="bg-base text-white p-2 rounded flex items-center"
                    onClick={() => openShareDialog(pipeline.id)}
                  >
                    <FaShare className="text-md" />
                  </button>
                  {updatingStepPositions.includes(pipeline.id) && (
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Updating order...
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleDragEnd(event, pipeline.id)}
              >
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left border-b-2  border-black ">
                      <th className="px-6 py-3 text-base font-bold text-primary">
                        Step Name
                      </th>
                      <th className="px-6 py-3 text-base font-bold text-primary">
                        Sorting
                      </th>
                      <th className="px-6 py-3 text-base font-bold text-primary">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <SortableContext
                    items={pipeline.steps.map(step => step.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <tbody className="divide-y divide-gray-200">
                      {pipeline.steps.map((step) => (
                        <SortableTableRow
                          key={step.id}
                          step={step}
                          pipelineId={pipeline.id}
                          onManageFields={openManageFieldsDialog}
                          onDeleteStep={confirmDeleteStep}
                          onEditStep={openEditStepDialog}
                          deletingSteps={deletingSteps}
                          isUpdatingPositions={updatingStepPositions.includes(pipeline.id)}
                        />
                      ))}
                      {pipeline.steps.length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-6 py-4 text-center text-sm text-gray-500"
                          >
                            No steps defined yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </SortableContext>
                </table>
              </DndContext>
            </div>
          </div>
        ))}

      {/* Dialog Components */}
      <CreateFormDialog
        isOpen={isCreateFormDialogOpen}
        onClose={() => setIsCreateFormDialogOpen(false)}
        onSave={handleCreateForm}
        width="max-w-xl"
      />

      <EditFormDialog
        formId={currentPipelineId}
        isOpen={isEditFormDialogOpen}
        onClose={() => setIsEditFormDialogOpen(false)}
        onUpdate={handleUpdateForm}
        initialFormName={
          pipelines.find((p) => p.id === currentPipelineId)?.name || ""
        }
        width="max-w-xl"
      />

      <EditStepDialog
        stepId={editingStepId}
        isOpen={isEditStepDialogOpen}
        onClose={() => setIsEditStepDialogOpen(false)}
        onUpdate={handleStepUpdate}
        initialStepName={editingStepName}
        width="max-w-xl"
      />

      <AddStepDialog
        isOpen={isAddStepDialogOpen}
        onClose={() => setIsAddStepDialogOpen(false)}
        onSave={handleAddStepWithName}
        formId={currentPipelineId}
        width="max-w-xl"
      />

      <ManageFieldsDialog
        isOpen={isManageFieldsDialogOpen}
        onClose={() => setIsManageFieldsDialogOpen(false)}
        stepName={currentStepName}
        stepId={currentStepId}
        onSaveField={handleSaveField}
        existingFields={fields}
        onEditField={handleUpdateField}
        onDeleteField={confirmDeleteField}
        width="max-w-4xl"
      />

      {currentField && (
        <EditFieldDialog
          isOpen={isEditFieldDialogOpen}
          onClose={() => setIsEditFieldDialogOpen(false)}
          onUpdate={handleUpdateField}
          field={currentField}
          stepName={currentStepName}
          width="max-w-2xl"
        />
      )}
      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        title={confirmation.title}
        message={confirmation.message}
        confirmText="Yes"
        cancelText="Cancel"
        onConfirm={confirmation.onConfirm}
        onCancel={closeConfirmation}
        isLoading={isConfirming}
      />

      {isShareDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Share Form</h3>
            <p className="text-base mb-4">
              Share this link with your clients to collect their information:
            </p>
            <div className="flex items-center bg-gray-100 p-2 rounded-md">
              <input
                type="text"
                value={shareableUrl}
                readOnly
                className="flex-1 bg-transparent outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="ml-2 bg-transparent border-none p-0 text-gray-600 hover:text-gray-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
              </button>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={openInNewTab}
                className="bg-base text-white px-4 py-2 rounded-md"
              >
                Open in New Tab
              </button>
              <button
                onClick={() => setIsShareDialogOpen(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormsPage;
