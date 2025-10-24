"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { IoMail } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { 
  fetchPipelineNotificationTemplates,
  updateNotificationSettings,
  NotificationTemplate
} from "@/redux/slices/notificationTemplateSlice";
import { toast, ToastContainer } from "react-toastify";

// Import the separated components
import TemplateCard, { EmailTemplate } from "@/components/notification/TemplateCard";
import TemplateEditor from "@/components/notification/TemplateEditor";

// Rename local NotificationType to NotificationTabType to avoid import conflict
type NotificationTabType =
  | "Video consultations"
  | "Telephone appointments"
  | "Lead notification";

type ITabProps = {
  label: NotificationTabType;
  active: boolean;
  onClick: () => void;
};

const Tab = ({ label, active, onClick }: ITabProps) => (
  <button
    onClick={onClick}
    className={`py-3 px-6 w-full max-w-[300px] text-[19.2px] font-bold duration-0 border-none rounded-b-none ${active
        ? "bg-base text-white"
        : "bg-white hover:bg-base hover:text-white text-base"
      }`}
  >
    {label}
  </button>
);

// Template mapping for backend integration with reverse lookup
const templateMapping = {
  "video-confirmation": { category: "video_consultation", type: "appointment_confirmation" },
  "video-change": { category: "video_consultation", type: "date_change" },
  "video-cancellation": { category: "video_consultation", type: "appointment_cancellation" },
  "video-reminder": { category: "video_consultation", type: "appointment_reminder" },
  "phone-confirmation": { category: "telephone_appointments", type: "appointment_confirmation" },
  "lead-advisor": { category: "lead_notification", type: "for_advisor" },
  "lead-customer": { category: "lead_notification", type: "for_customer" },
};

// Tab to category mapping
const tabToCategoryMapping: Record<NotificationTabType, string[]> = {
  "Video consultations": ["video_consultation"],
  "Telephone appointments": ["telephone_appointments"],
  "Lead notification": ["lead_notification"],
};

export default function OverviewDetailPage() {
  const searchParams = useSearchParams();
  const pipelineId = searchParams.get('id') || ""; // Get pipeline ID from URL params
  
  const [activeTab, setActiveTab] = useState<NotificationTabType>("Video consultations");
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [effectChange, setEffectChange] = useState<string>("");
  
  const dispatch = useDispatch<AppDispatch>();
  const { pipelineTemplates, loading: backendLoading, error } = useSelector(
    (state: RootState) => state.notificationTemplateFilters
  );

  // Default template data
  const defaultTemplateData: Record<NotificationTabType, EmailTemplate[]> = {
    "Video consultations": [
      {
        id: "video-confirmation",
        title: "Appointment confirmation",
        description: "The invited person receives confirmation of the video consultation booking.",
        isActive: true,
        is_enabled: true,
      },
      {
        id: "video-change",
        title: "Date change",
        description: "Notification when the video consultation is rescheduled.",
        isActive: false,
        is_enabled: false,
      },
      {
        id: "video-cancellation",
        title: "Appointment cancellation",
        description: "Information if the video consultation is canceled.",
        isActive: false,
        is_enabled: false,
      },
      {
        id: "video-reminder",
        title: "Appointment reminder",
        description: "Reminder with video link sent 1 hour before the consultation.",
        isActive: false,
        is_enabled: false,
      },
    ],
    "Telephone appointments": [
      {
        id: "phone-confirmation",
        title: "Appointment confirmation",
        description: "The client receives confirmation of the telephone appointment schedule.",
        isActive: false,
        is_enabled: false,
      },
    ],
    "Lead notification": [
      {
        id: "lead-advisor",
        title: "For the financial advisor",
        description: "An email will be sent when a new customer request is received.",
        isActive: false,
        is_enabled: false,
      },
      {
        id: "lead-customer",
        title: "The customer request",
        description: "The new customer request receives a confirmation email for the request.",
        isActive: true,
        is_enabled: true,
      },
    ],
  };

  const [templateData, setTemplateData] = useState<Record<NotificationTabType, EmailTemplate[]>>(
    defaultTemplateData
  );

  // Fetch backend templates on component mount
  useEffect(() => {
    const fetchBackendTemplates = async () => {
      if (!pipelineId) return;

      try {
        await dispatch(fetchPipelineNotificationTemplates({
          pipelineId: pipelineId,
          limit: 100,
        })).unwrap();
      } catch (error) {
        console.error('Failed to fetch backend templates:', error);
      }
    };

    fetchBackendTemplates();
  }, [pipelineId, dispatch]);

  // Merge backend templates with default templates when pipelineTemplates change
  useEffect(() => {
    if (!pipelineTemplates.length) {
      setTemplateData(defaultTemplateData);
      return;
    }

    const mergedData = { ...defaultTemplateData };

    // Create a map of backend templates by category-type
    const backendTemplateMap = new Map<string, NotificationTemplate>();
    pipelineTemplates.forEach((template: NotificationTemplate) => {
      const key = `${template.category}-${template.type}`;
      backendTemplateMap.set(key, template);
    });

    // Update existing default templates with backend data
    Object.entries(templateMapping).forEach(([templateId, mapping]) => {
      const key = `${mapping.category}-${mapping.type}`;
      const backendTemplate = backendTemplateMap.get(key);

      if (backendTemplate) {
        // Find and update the template in the appropriate category
        Object.entries(mergedData).forEach(([category, templates]) => {
          const templateIndex = templates.findIndex(t => t.id === templateId);
          if (templateIndex !== -1) {
            mergedData[category as NotificationTabType][templateIndex] = {
              ...templates[templateIndex],
              body: backendTemplate.body,
              cc_emails: backendTemplate.cc_emails,
              signature_id: backendTemplate.signature_id,
              backendId: backendTemplate.id,
              category: backendTemplate.category,
              type: backendTemplate.type,
              isActive: backendTemplate.is_enabled ?? backendTemplate.is_default ?? templates[templateIndex].isActive,
              is_enabled: backendTemplate.is_enabled ?? templates[templateIndex].is_enabled,
              isFromBackend: true
            };
          }
        });
        backendTemplateMap.delete(key);
      }
    });

    // Add backend templates that don't have default counterparts
    backendTemplateMap.forEach((template) => {
      const tabEntry = Object.entries(tabToCategoryMapping).find(([, categories]) =>
        categories.includes(template.category)
      );

      if (tabEntry) {
        const [tabName] = tabEntry;
        const newTemplate: EmailTemplate = {
          id: `backend-${template.id}`,
          title: template.title,
          description: `Custom template: ${template.title}`,
          isActive: template.is_enabled ?? template.is_default ?? false,
          is_enabled: template.is_enabled ?? false,
          body: template.body,
          cc_emails: template.cc_emails,
          signature_id: template.signature_id,
          backendId: template.id,
          category: template.category,
          type: template.type,
          isFromBackend: true
        };

        mergedData[tabName as NotificationTabType].push(newTemplate);
      }
    });

    setTemplateData(mergedData);
  }, [pipelineTemplates]);

  const tabs: NotificationTabType[] = [
    "Video consultations",
    "Telephone appointments",
    "Lead notification",
  ];

  // Helper to map template id/title to category/type
  const getCategoryAndType = (template: EmailTemplate) => {
    if (template.category && template.type) {
      return { category: template.category, type: template.type };
    }

    const mapping = templateMapping[template.id as keyof typeof templateMapping];
    return mapping || { category: "", type: "" };
  };

  const handleToggle = (id: string) => {
    // Find the template being toggled
    const currentTabTemplates = templateData[activeTab] || [];
    const toggledTemplate = currentTabTemplates.find(template => template.id === id);

    // If template has backendId, let TemplateCard handle it completely
    if (toggledTemplate?.backendId) {
      // Don't update local state for backend templates
      // TemplateCard will handle the API call and Redux state update
      return;
    }

    // Only handle non-backend templates (default templates) here
    let nonBackendTemplate: EmailTemplate | null = null;

    setTemplateData((prevData) => {
      const newData = { ...prevData };
      const currentTab = newData[activeTab];

      const updatedTemplates = currentTab.map((template) => {
        if (template.id === id && !template.backendId) {
          nonBackendTemplate = template;
          const newIsActive = !template.isActive;
          return {
            ...template,
            isActive: newIsActive,
            is_enabled: newIsActive
          };
        }
        return template;
      });

      newData[activeTab] = updatedTemplates;
      return newData;
    });

    // Only call notification settings API for non-backend templates
    setTimeout(() => {
      if (nonBackendTemplate) {
        const { category, type } = getCategoryAndType(nonBackendTemplate);
        const is_enabled = !nonBackendTemplate.isActive;
        if (category && type) {
          dispatch(updateNotificationSettings({ category, type, is_enabled }))
            .unwrap()
            .then(() => {
              toast.success(`Notification ${is_enabled ? "enabled" : "disabled"} successfully!`);
            })
            .catch((err) => {
              toast.error(err || "Failed to update notification settings");
            });
        }
      }
    }, 0);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setSelectedTemplate(null);

    if (pipelineId) {
      // Refresh templates and update local state
      dispatch(fetchPipelineNotificationTemplates({
        pipelineId: pipelineId,
        limit: 100,
      })).then(() => {
        // The useEffect will automatically sync the templateData when pipelineTemplates updates
      });
    }
  };

  const currentTabTemplates = templateData[activeTab] || [];

  if (backendLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002d51]"></div>
        <span className="ml-2 text-gray-600">Loading templates...</span>
      </div>
    );
  }

  return (
    <div className="py-6 px-[20px]">
      <ToastContainer />
      <h1 className="text-[28px] font-medium mb-8 flex items-center">
        <div className="mr-2 text-3xl">
          <IoMail />
        </div>
        Email templates for notifications
      </h1>

      <div className="flex border-b mb-4">
        {tabs.map((tab) => (
          <Tab
            key={tab}
            label={tab}
            active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error loading templates: {error}
        </div>
      )}

      <div className="space-y-4">
        {currentTabTemplates.length > 0 ? (
          currentTabTemplates.map((template) => (
            <TemplateCard
              setEffectChange={setEffectChange}
              key={template.id}
              template={template}
              onToggle={handleToggle}
              onEdit={handleEditTemplate}
              pipelineId={pipelineId}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No templates available for {activeTab}
          </div>
        )}
      </div>

      <TemplateEditor
        setEffectChange={setEffectChange}
        effectChange={effectChange}
        isOpen={editorOpen}
        onClose={closeEditor}
        template={selectedTemplate}
        pipelineId={pipelineId}
      />
    </div>
  );
}