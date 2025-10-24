// components/notification/TemplateCard.tsx
import React, { useState } from "react";
import { TbEdit } from "react-icons/tb";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { updatePipelineTemplateStatus, toggleTemplateStatusOptimistically } from "@/redux/slices/notificationTemplateSlice";
import { toast } from "react-toastify";

export interface EmailTemplate {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  body?: string;
  cc_emails?: string[];
  signature_id?: string | null;
  backendId?: string;
  category?: string;
  type?: string;
  isFromBackend?: boolean;
  is_enabled?: boolean; // Add is_enabled field
}

interface TemplateCardProps {
  setEffectChange: (value: string) => void;
  template: EmailTemplate;
  onToggle: (id: string) => void;
  onEdit: (template: EmailTemplate) => void;
  pipelineId: string; // Add pipelineId prop
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  setEffectChange,
  template,
  onToggle,
  onEdit,
  pipelineId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isToggling, setIsToggling] = useState(false);

  // Use is_enabled if available, otherwise fall back to isActive
  const isEnabled = template.is_enabled ?? template.isActive;

  const handleToggle = async () => {
    // Don't proceed if template doesn't have a backend ID
    if (!template.backendId) {
      toast.error("Template must be saved before you can enable/disable it");
      // Call parent onToggle for non-backend templates
      onToggle(template.id);
      return;
    }

    if (isToggling) return;

    setIsToggling(true);
    const newStatus = !isEnabled;

    try {
      // Optimistic update for better UX
      dispatch(toggleTemplateStatusOptimistically({
        templateId: template.backendId,
        is_enabled: newStatus
      }));

      // Make API call
      const resultAction = await dispatch(updatePipelineTemplateStatus({
        pipelineId,
        templateId: template.backendId,
        is_enabled: newStatus
      }));

      if (updatePipelineTemplateStatus.fulfilled.match(resultAction)) {
        toast.success(`Template ${newStatus ? 'enabled' : 'disabled'} successfully`);
      } else {
        // Revert optimistic update on failure
        dispatch(toggleTemplateStatusOptimistically({
          templateId: template.backendId,
          is_enabled: isEnabled
        }));
        throw new Error(
          typeof resultAction.payload === "string"
            ? resultAction.payload
            : "Failed to update template status"
        );
      }
    } catch (error) {
      console.error("Error toggling template status:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update template status"
      );
      // Revert optimistic update on error
      dispatch(toggleTemplateStatusOptimistically({
        templateId: template.backendId,
        is_enabled: isEnabled
      }));
    } finally {
      setIsToggling(false);
    }

    // Don't call parent onToggle for backend templates since we handle it here
    // onToggle(template.id); // Remove this line
  };

  return (
    <div className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
      {/* Gradient overlay for active state */}
      {isEnabled && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#002d51]/5 to-[#002d51]/10 rounded-2xl -z-10"></div>
      )}

      {/* Status indicator dot */}
      <div className="absolute top-4 right-4">
        <div className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-emerald-400 shadow-emerald-400/50 shadow-lg' : 'bg-gray-300'} transition-all duration-300`}></div>
      </div>

      <div className="flex items-start justify-between gap-6">
        {/* Left Section - Icon & Content */}
        <div className="flex items-start space-x-4 flex-1 min-w-0">
          {/* Modern Icon Container */}
          <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[#002d51] to-[#004080] rounded-xl flex items-center justify-center shadow-lg shadow-[#002d51]/25 group-hover:shadow-[#002d51]/40 transition-all duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-[#002d51] transition-colors duration-200">
                {template.title}
              </h3>
              {template.isFromBackend ? (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Customized
                </span>
              ) : (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Default
                </span>
              )}
              {/* Show if template is not saved yet */}
              {!template.backendId && (
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                  Not Saved
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-2 line-clamp-2">
              {template.description}
            </p>
            {template.category && template.type && (
              <p className="text-xs text-gray-500 mb-4">
                {template.category} • {template.type}
              </p>
            )}

            {/* Edit Button */}
            <button
              className="inline-flex items-center gap-2 bg-[#002d51] hover:bg-[#003d61] text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#002d51]/25 active:scale-95"
              onClick={() => {
                onEdit(template);
                setEffectChange(template.id);
              }}
            >
              <TbEdit size={16} />
              Edit Template
            </button>
          </div>
        </div>

        {/* Right Section - Toggle */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          {/* Modern Toggle Switch */}
          <div
            className={`relative w-14 h-7 rounded-full cursor-pointer transition-all duration-300 shadow-inner ${!template.backendId
              ? "bg-gray-200 cursor-not-allowed opacity-50"
              : isToggling
                ? "bg-gray-300 cursor-wait"
                : isEnabled
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-emerald-500/25"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            onClick={handleToggle}
            title={!template.backendId ? "Save template first to enable/disable" : isToggling ? "Updating..." : undefined}
          >
            {/* Loading spinner for toggle */}
            {isToggling && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            <div
              className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-lg transform transition-all duration-300 ${isEnabled ? "translate-x-7" : "translate-x-0.5"
                } ${!isToggling && template.backendId ? "hover:scale-110" : ""}`}
            >
              {/* Inner dot for active state */}
              {isEnabled && !isToggling && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                </div>
              )}
            </div>
          </div>

          {/* Status Label */}
          <div className="text-right">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${!template.backendId
              ? "bg-orange-100 text-orange-700"
              : isToggling
                ? "bg-blue-100 text-blue-700"
                : isEnabled
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-600"
              }`}>
              {!template.backendId
                ? "Not Saved"
                : isToggling
                  ? "Updating..."
                  : isEnabled
                    ? "Active"
                    : "Inactive"
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;