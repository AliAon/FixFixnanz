/* eslint-disable  @typescript-eslint/no-explicit-any */
// components/notification/TemplateList.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { 
  fetchPipelineNotificationTemplates, 
  selectPipelineNotificationTemplates,
  selectNotificationTemplatesLoading,
  selectNotificationTemplatesError,
} from "@/redux/slices/notificationTemplateSlice";
import TemplateCard, { EmailTemplate } from "./TemplateCard";
import TemplateEditor from "./TemplateEditor";
import { toast } from "react-toastify";

interface TemplateListProps {
  pipelineId: string;
}

const TemplateList: React.FC<TemplateListProps> = ({ pipelineId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const templates = useSelector(selectPipelineNotificationTemplates);
  const loading = useSelector(selectNotificationTemplatesLoading);
  const error = useSelector(selectNotificationTemplatesError);
  
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [effectChange, setEffectChange] = useState("");

  // Fetch templates on component mount
  useEffect(() => {
    if (pipelineId) {
      dispatch(fetchPipelineNotificationTemplates({ pipelineId }));
    }
  }, [dispatch, pipelineId]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Transform backend templates to EmailTemplate format
  const transformToEmailTemplate = (backendTemplate: any): EmailTemplate => {
    return {
      id: backendTemplate.id || `template-${backendTemplate.category}-${backendTemplate.type}`,
      title: backendTemplate.title || "Untitled Template",
      description: `${backendTemplate.category} - ${backendTemplate.type}`,
      isActive: backendTemplate.is_enabled ?? true,
      body: backendTemplate.body,
      cc_emails: backendTemplate.cc_emails || [],
      signature_id: backendTemplate.signature_id,
      backendId: backendTemplate.id,
      category: backendTemplate.category,
      type: backendTemplate.type,
      isFromBackend: !backendTemplate.is_default,
      is_enabled: backendTemplate.is_enabled ?? true, // Add is_enabled field
    };
  };

  // Convert backend templates to EmailTemplate format
  const emailTemplates: EmailTemplate[] = templates.map(transformToEmailTemplate);

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsEditorOpen(true);
  };

  const handleToggle = (templateId: string) => {
    // The toggle logic is now handled inside TemplateCard component
    // This is kept for any additional logic you might need
    console.log(`Template ${templateId} toggled`);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setSelectedTemplate(null);
    // Refetch templates to get updated data
    if (pipelineId) {
      dispatch(fetchPipelineNotificationTemplates({ pipelineId }));
    }
  };

  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error && templates.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Templates</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchPipelineNotificationTemplates({ pipelineId }))}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notification Templates</h2>
          <p className="text-gray-600">Manage your pipeline notification templates</p>
        </div>
        <div className="text-sm text-gray-500">
          {templates.length} template{templates.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Templates Grid */}
      {emailTemplates.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {emailTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEdit}
              onToggle={handleToggle}
              setEffectChange={setEffectChange}
              pipelineId={pipelineId} // Pass pipelineId to TemplateCard
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H9a1 1 0 00-1 1H4a1 1 0 00-1 1v1" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates Found</h3>
          <p className="text-gray-600">No notification templates have been created for this pipeline yet.</p>
        </div>
      )}

      {/* Template Editor Modal */}
      <TemplateEditor
        isOpen={isEditorOpen}
        onClose={closeEditor}
        template={selectedTemplate}
        setEffectChange={setEffectChange}
        effectChange={effectChange}
        pipelineId={pipelineId}
      />
    </div>
  );
};

export default TemplateList;