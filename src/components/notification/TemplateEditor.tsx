// components/notification/TemplateEditor.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { IoClose } from "react-icons/io5";
import Link from "next/link";
import { Editor as PrimeEditor } from "primereact/editor";
import Quill from "quill";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { 
  createPipelineNotificationTemplate, 
  updatePipelineNotificationTemplate, 
  NotificationCategory, 
  NotificationType,
} from "@/redux/slices/notificationTemplateSlice";
import { EmailSignature, fetchEmailSignatures } from "@/redux/slices/emailSignatureSlice";
import { toast } from "react-toastify";
import { EmailTemplate } from "./TemplateCard";
import TestEmailDialog from "./TestEmailDialog";

interface TemplateEditorProps {
  setEffectChange: (value: string) => void;
  effectChange: string;
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplate | null;
  pipelineId: string;
}

type PlaceholderInfo = {
  value: string;
  display: string;
  colorClass: string;
  borderColorClass: string;
  hoverBgClass: string;
};

// Template mapping for backend integration
const templateMapping = {
  "video-confirmation": { category: "video_consultation", type: "appointment_confirmation" },
  "video-change": { category: "video_consultation", type: "date_change" },
  "video-cancellation": { category: "video_consultation", type: "appointment_cancellation" },
  "video-reminder": { category: "video_consultation", type: "appointment_reminder" },
  "phone-confirmation": { category: "telephone_appointments", type: "appointment_confirmation" },
  "lead-advisor": { category: "lead_notification", type: "for_advisor" },
  "lead-customer": { category: "lead_notification", type: "for_customer" },
};

// Default template bodies
const getDefaultTemplateBody = (templateId: string): string => {
  const defaultBodies: Record<string, string> = {
    "video-confirmation": `Dear [customer_name],

Your video consultation appointment has been confirmed.

Details:
- Date: [appointment_date]
- Time: [appointment_time]
- Duration: [duration]
- Meeting Link: [meeting_link]

Please join the meeting at the scheduled time. If you need to reschedule or have any questions, please contact us.

Best regards,
The FixFinanz Team`,

    "video-change": `Dear [customer_name],

Your video consultation appointment has been rescheduled.

New Details:
- Date: [appointment_date]
- Time: [appointment_time]
- Duration: [duration]
- Meeting Link: [meeting_link]

Please note the new time and join at the updated schedule. If you have any questions, please contact us.

Best regards,
The FixFinanz Team`,

    "video-cancellation": `Dear [customer_name],

Unfortunately, we need to cancel your video consultation appointment scheduled for [appointment_date] at [appointment_time].

We apologize for any inconvenience this may cause. Please contact us to reschedule your appointment at your convenience.

Best regards,
The FixFinanz Team`,

    "video-reminder": `Dear [customer_name],

This is a reminder of your upcoming video consultation in 1 hour.

Details:
- Date: [appointment_date]
- Time: [appointment_time]
- Duration: [duration]
- Meeting Link: [meeting_link]

Please join the meeting at the scheduled time. See you soon!

Best regards,
The FixFinanz Team`,

    "phone-confirmation": `Dear [customer_name],

Your telephone appointment has been confirmed.

Details:
- Date: [appointment_date]
- Time: [appointment_time]
- Duration: [duration]

We will call you at the scheduled time. Please ensure you're available.

Best regards,
The FixFinanz Team`,

    "lead-advisor": `New Lead Notification

A new customer request has been received.

Customer Details:
- Name: [customer_name]
- Email: [customer_email]

Please follow up with the customer as soon as possible.

Best regards,
System Notification`,

    "lead-customer": `Dear [customer_name],

Thank you for your interest in our services. We have received your request and will get back to you shortly.

One of our financial advisors will contact you within 24 hours to discuss your needs.

Best regards,
Customer Service Team`
  };

  return defaultBodies[templateId] || `Dear [customer_name],

This is a template for ${templateId}.

Please customize this content according to your needs.

Best regards,
The FixFinanz Team`;
};

const header = () => {
  return `<div class="lop" style="background-color: #101d48; pointer-events: none; color: white; padding: 8px; margin-bottom: 16px; text-align: center;"><h3 class="lop" style="font-weight: bold; padding: 8px; width: 100%;">FixFinanz</h3></div>`;
}

const footer = () => {
  return `<div style="background-color: #101d48; pointer-events: none; color: white; padding: 16px 8px 8px 8px; text-align: center; margin-top: 24px;">
  <div style="margin-bottom: 4px;">Best regards,</div>
  <div>The FixFinanz Team</div>
  <div style="font-size: 13px;">Copyright © 2024 FixFinanz. All rights reserved.</div>
</div>`;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ 
  setEffectChange, 
  isOpen, 
  onClose, 
  template, 
  pipelineId 
}) => {
  const [bodyContent, setBodyContent] = useState("");
  const bodyContentRef = useRef(bodyContent);
  const signatures = useSelector((state: RootState) => state.emailSignature.signatures);

  useEffect(() => {
    bodyContentRef.current = bodyContent;
  }, [bodyContent]);

  const editorValue = useMemo(() => {
    // If content already has the header/footer structure, return as is
    if (bodyContent.startsWith(`<h3 class="ql-align`) || bodyContent.includes('class="lop"')) {
      return bodyContent;
    }
    
    // If bodyContent is empty, just return header and footer
    if (!bodyContent.trim()) {
      return `${header()} ${footer()}`;
    }
    
    // Format the body content with proper paragraph styling
    const formattedContent = bodyContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => `<p style="font-size: medium; color: rgb(0, 0, 0); font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif;">${line}</p>`)
      .join('\n');
    
    return `${header()} ${formattedContent} ${footer()}`;
  }, [bodyContent]);

  const [subjectText, setSubjectText] = useState("");
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [apiTemplate, setApiTemplate] = useState<{
    id: string;
    user_id: string;
    category: string;
    type: string;
    title: string;
    body: string;
    cc_emails: string[];
    signature_id: string | null;
    is_default: boolean;
    created_at: string;
    updated_at: string;
  } | null>(null);
  const [ccEmails, setCcEmails] = useState<string>("");

  const editorRef = useRef<PrimeEditor | null>(null);

  const placeholders: PlaceholderInfo[] = [
    {
      value: "[customer_name]",
      display: "Kundenname",
      colorClass: "text-gray-600",
      borderColorClass: "border-gray-600",
      hoverBgClass: "hover:bg-gray-600",
    },
    {
      value: "[appointment_date]",
      display: "Date",
      colorClass: "text-green-600",
      borderColorClass: "border-green-600",
      hoverBgClass: "hover:bg-green-600",
    },
    {
      value: "[appointment_time]",
      display: "Appointment Time",
      colorClass: "text-red-600",
      borderColorClass: "border-red-600",
      hoverBgClass: "hover:bg-red-600",
    },
    {
      value: "[duration]",
      display: "Duration",
      colorClass: "text-yellow-600",
      borderColorClass: "border-yellow-600",
      hoverBgClass: "hover:bg-yellow-600",
    },
    {
      value: "[meeting_link]",
      display: "Meeting Link",
      colorClass: "text-cyan-600",
      borderColorClass: "border-cyan-600",
      hoverBgClass: "hover:bg-cyan-600",
    },
    {
      value: "[meeting_type]",
      display: "Meeting Type",
      colorClass: "text-blue-600",
      borderColorClass: "border-blue-600",
      hoverBgClass: "hover:bg-blue-600",
    },
    {
      value: "[registration_link]",
      display: "Registration Link",
      colorClass: "text-gray-800",
      borderColorClass: "border-gray-800",
      hoverBgClass: "hover:bg-gray-800",
    },
    {
      value: "[customer_email]",
      display: "Lead Email",
      colorClass: "text-blue-600",
      borderColorClass: "border-blue-600",
      hoverBgClass: "hover:bg-blue-600",
    },
  ];

  const insertPlaceholder = (placeholder: string) => {
    try {
      console.log("Inserting placeholder:", placeholder);

      if (!editorRef.current) {
        console.error("Editor ref is not available");
        setBodyContent((prev) => prev + " " + placeholder);
        return;
      }

      const editorInstance = editorRef.current?.getQuill() as Quill | undefined;

      if (!editorInstance) {
        console.error("Could not get Quill instance from ref");
        setBodyContent((prev) => prev + " " + placeholder);
        return;
      }

      console.log("Quill instance found");
      editorInstance.focus();

      let range = editorInstance.getSelection();
      console.log("Initial range:", range);

      if (!range) {
        console.log("No selection found, setting cursor at end");
        const length = editorInstance.getLength();
        editorInstance.setSelection(length - 1, 0);
        range = editorInstance.getSelection();
        console.log("Created range:", range);
      }

      if (!range) {
        console.log("Still no range, using default position");
        range = { index: 0, length: 0 };
      }

      console.log("Inserting at position:", range.index);
      editorInstance.insertText(range.index, placeholder);
      editorInstance.setSelection(range.index + placeholder.length, 0);

      const htmlContent = editorInstance.root.innerHTML;
      console.log("New content generated");
      setBodyContent(htmlContent);
    } catch (error) {
      console.error("Error inserting placeholder:", error);
      setBodyContent((prev) => prev + " " + placeholder);
    }
  };

  const [emails, setEmails] = useState<string[]>([]);

  // Reset all state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setBodyContent("");
      setSubjectText("");
      setApiTemplate(null);
      setEmails([]);
      setCcEmails("");
      setTestEmailOpen(false);
      setLoading(false);
    }
  }, [isOpen]);

  // Load template data when modal opens
  useEffect(() => {
    const loadTemplateData = async () => {
      if (!isOpen || !template) return;

      setLoading(true);
      try {
        dispatch(fetchEmailSignatures());

        // Check if template has backend data already
        if (template.backendId && template.body) {
          // Template exists in backend, load it directly
          setApiTemplate({
            id: template.backendId,
            user_id: "",
            category: template.category || "",
            type: template.type || "",
            title: template.title,
            body: template.body,
            cc_emails: template.cc_emails || [],
            signature_id: template.signature_id || null,
            is_default: false,
            created_at: "",
            updated_at: ""
          });
          setSubjectText(template.title);
          setBodyContent(template.body);
          setEmails(template.cc_emails || []);
        } else {
          // Template doesn't exist in backend, use default content
          setApiTemplate(null);
          setSubjectText(template.title);
          const defaultBody = getDefaultTemplateBody(template.id);
          setBodyContent(defaultBody);
          setEmails([]);
        }
      } catch (err) {
        console.log("Error loading template:", err);
        setApiTemplate(null);
        setSubjectText(template.title);
        const defaultBody = getDefaultTemplateBody(template.id);
        setBodyContent(defaultBody);
        setEmails([]);
      } finally {
        setLoading(false);
      }
    };

    loadTemplateData();
  }, [isOpen, template, dispatch]);

  if (!isOpen || !template) return null;

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = async (opt?: boolean, redpEmail?: string) => {
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.id;

    // Update emails array
    const updatedEmails = opt
      ? ccEmails.trim()
        ? [...emails, ccEmails.trim()]
        : [...emails]
      : emails.filter((e: string) => e !== redpEmail);

    // Get category and type from template
    const { category, type } = template.category && template.type 
      ? { category: template.category, type: template.type }
      : templateMapping[template.id as keyof typeof templateMapping] || { category: "", type: "" };

    if (!category || !type) {
      toast.error("Invalid template configuration");
      return;
    }

    try {
      setLoading(true);
      
      // Check if template exists in backend (has backendId or apiTemplate with id)
      const isExistingTemplate = template.backendId || (apiTemplate?.id);
      
      if (isExistingTemplate) {
        // Update existing template
        const templateId = template.backendId || apiTemplate!.id;
        
        const resultAction = await dispatch(updatePipelineNotificationTemplate({
          pipelineId,
          templateId,
          title: subjectText,
          body: bodyContent,
          cc_emails: updatedEmails.flat().filter(email => email && email.trim()),
          signature_id: null,
        }));

        if (updatePipelineNotificationTemplate.fulfilled.match(resultAction)) {
          const updatedTemplate = resultAction.payload;
          
          // Update apiTemplate state with the updated template data
          if (updatedTemplate) {
            setApiTemplate({
              id: updatedTemplate.id || templateId,
              user_id: updatedTemplate.user_id || userId || "",
              category: updatedTemplate.category || category,
              type: updatedTemplate.type || type,
              title: updatedTemplate.title || subjectText,
              body: updatedTemplate.body || bodyContent,
              cc_emails: updatedTemplate.cc_emails || updatedEmails.flat().filter(email => email && email.trim()),
              signature_id: updatedTemplate.signature_id || null,
              is_default: updatedTemplate.is_default || false,
              created_at: updatedTemplate.created_at || apiTemplate?.created_at || new Date().toISOString(),
              updated_at: updatedTemplate.updated_at || new Date().toISOString()
            });
          }

          toast.success("Template updated successfully!");
          
          // Close the modal after successful update
          onClose();
          
        } else {
          throw new Error(
            typeof resultAction.payload === "string"
              ? resultAction.payload
              : "Failed to update template"
          );
        }
      } else {
        // Create new template
        const basePayload = {
          category: category as NotificationCategory,
          type: type as NotificationType,
          title: subjectText,
          body: bodyContent,
          cc_emails: updatedEmails.flat().filter(email => email && email.trim()),
          signature_id: null,
        };

        const resultAction = await dispatch(createPipelineNotificationTemplate({
          pipelineId,
          ...basePayload,
        }));

        if (createPipelineNotificationTemplate.fulfilled.match(resultAction)) {
          const savedTemplate = resultAction.payload;
          
          // Update apiTemplate state with the returned template data
          if (savedTemplate && savedTemplate.id) {
            setApiTemplate({
              id: savedTemplate.id,
              user_id: savedTemplate.user_id || userId || "",
              category: savedTemplate.category || category,
              type: savedTemplate.type || type,
              title: savedTemplate.title || subjectText,
              body: savedTemplate.body || bodyContent,
              cc_emails: savedTemplate.cc_emails || updatedEmails.flat().filter(email => email && email.trim()),
              signature_id: savedTemplate.signature_id || null,
              is_default: savedTemplate.is_default || false,
              created_at: savedTemplate.created_at || new Date().toISOString(),
              updated_at: savedTemplate.updated_at || new Date().toISOString()
            });
          }

          toast.success("Template created successfully!");
          
          // Close the modal after successful creation
          onClose();
          
        } else {
          throw new Error(
            typeof resultAction.payload === "string"
              ? resultAction.payload
              : "Failed to create template"
          );
        }
      }

      // Update emails state
      setEmails(updatedEmails.flat().filter(email => email && email.trim()));
      setCcEmails("");
      
      // Optional: Refresh data without closing modal
      // You can uncomment the next line if you want to refresh the page
      // window.location.reload();
      
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "An error occurred while saving the template."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-10"
      onClick={handleOutsideClick}
    >
      <div className="bg-white rounded-md shadow-lg w-full max-w-4xl my-auto">
        <div className="flex justify-between items-center border-b p-4 bg-white z-10">
          <h2 className="text-lg font-bold text-[#32325D]">
            {template.title}
            {template.isFromBackend && (
              <span className="ml-2 text-xs bg-[#002d51] text-white px-2 py-1 rounded-full">
                Backend Template
              </span>
            )}
          </h2>
          <div className="flex items-center gap-6">
            <Link
              href=""
              onClick={() => setTestEmailOpen(true)}
              className="bg-[#212529] px-3 py-2 rounded-md text-white hover:bg-[#424649]"
            >
              E-Mail testen
            </Link>
            <Link
              href=""
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <IoClose size={28} />
            </Link>
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading template data...</p>
            </div>
          ) : (
            <>
              <div className="my-3 flex items-center flex-wrap gap-2">
                {emails.length > 0 && emails.map((email: string, i: number) => (
                  <span key={i} className="bg-[#002d51] flex items-center justify-between gap-1 text-white border border-gray-300 rounded-xl px-2 py-1 mr-2">
                    {email}
                    <IoClose className="text-[red] font-extrabold cursor-pointer" size={20} onClick={() => {
                      setEmails(emails.filter((e: string) => e !== email));
                    }} />
                  </span>
                ))}
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (ccEmails.trim()) {
                  // Add the email and clear the input
                  setEmails([...emails, ccEmails.trim()]);
                  setCcEmails("");
                }
              }} className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter cc emails"
                    className="flex-1 p-2 border border-gray-300 outline-none rounded"
                    value={ccEmails}
                    onChange={(e) => setCcEmails(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                    disabled={!ccEmails.trim()}
                  >
                    Add
                  </button>
                </div>
              </form>

              <div className="mb-4">
                <p className="text-base font-bold mb-2 text-[#4D5B65]">
                  {template.description}
                </p>
                {template.category && template.type && (
                  <p className="text-sm text-gray-600 mb-2">
                    Category: {template.category} | Type: {template.type}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <p className="text-sm mb-2">Select Email template type</p>
                <div>
                  <p className="font-bold mb-1">Subject:</p>
                  <input
                    type="text"
                    className="w-full p-2 outline-none border rounded"
                    value={subjectText}
                    onChange={(e) => setSubjectText(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <p className="font-bold mb-1">Placeholder</p>
                <div className="flex flex-wrap gap-2">
                  {placeholders.map((placeholder, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        insertPlaceholder(placeholder.value);
                      }}
                      className={`bg-white ${placeholder.colorClass} duration-150 border ${placeholder.borderColorClass} ${placeholder.hoverBgClass} hover:text-white rounded-md text-sm py-1 px-2`}
                    >
                      {placeholder.display}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="font-bold mb-1">Signature</p>
                <div className="flex items-center flex-wrap gap-2">
                  {signatures.map((signature: EmailSignature) => (
                    <button
                      className="bg-white text-purple-600 duration-150 border border-purple-600 hover:bg-purple-600 hover:text-white rounded-md text-sm py-1 px-2"
                      key={signature.id}
                      onClick={(e) => {
                        e.preventDefault();
                        insertPlaceholder(`[sign-${signature.tag}]`);
                      }}
                    >
                      <span>{signature?.tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="font-bold mb-1">E-Mail Text</p>
                <div className="border rounded">
                  <PrimeEditor
                    ref={editorRef}
                    value={editorValue}
                    onTextChange={(e) => {
                      if (e.htmlValue !== bodyContentRef.current) {
                        setBodyContent(e.htmlValue || "");
                      }
                    }}
                    style={{ height: "320px" }}
                    pt={{
                      content: { className: "editor-content" },
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors duration-200"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => { handleSave(false, "") }}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    // Check if template exists in backend
                    (template.backendId || apiTemplate?.id) ? "Update Template" : "Save Template"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <TestEmailDialog
        editorRef={editorRef as React.RefObject<PrimeEditor>}
        isOpen={testEmailOpen}
        onClose={() => setTestEmailOpen(false)}
        subject={subjectText}
        setbodyContent={setBodyContent}
        emailContent={bodyContent}
        setEffectChange={setEffectChange}
        template={template}
        emails={emails}
      />
    </div>
  );
};

export default TemplateEditor;