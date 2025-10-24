/* eslint-disable  @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState } from "react";
import { FaCalendarAlt, FaUser } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { Editor as PrimeEditor } from "primereact/editor";
import InvitePopup from "./InvitePopup";
import AppointmentModel from "./AppointmentModel";
import TransferAgencyModel from "./TransferAgencyModel";
import { MdOutlineSort } from "react-icons/md";
import { CiStickyNote } from "react-icons/ci";
import { TiUserAdd } from "react-icons/ti";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import {
  updateCustomerProfile,
  updateComprehensiveCustomerProfile,
  updateCustomerStatus,
} from "@/redux/slices/customersSlice";
import { createLeadTracking } from "@/redux/slices/leadTrackingSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LeadTrackingActivities from "./LeadTrackingActivities";
import { RootState } from "@/redux/store";

// Helper function to parse additional data
const parseAdditionalData = (data: any) => {
  if (!data) return {};
  
  try {
    // If it's already an object, return it
    if (typeof data === 'object' && data !== null) {
      return data;
    }
    
    // If it's a string, try to parse it (handle multiple levels of escaping)
    if (typeof data === 'string') {
      let parsedData = data;
      
      // Handle multiple levels of JSON escaping
      try {
        // First attempt - direct parse
        parsedData = JSON.parse(data);
        if (typeof parsedData === 'object') {
          return parsedData;
        }
      } catch {
        // If that fails, try unescaping first
        try {
          // Remove extra backslashes and unescape
          const unescaped = data
            .replace(/\\\\/g, '\\')  // Replace double backslashes with single
            .replace(/\\"/g, '"');   // Replace escaped quotes
          
          parsedData = JSON.parse(unescaped);
          if (typeof parsedData === 'object') {
            return parsedData;
          }
        } catch {
          // If still fails, try more aggressive unescaping
          try {
            const moreUnescaped = data
              .replace(/\\\\\\\\/g, '\\')  // Handle quadruple backslashes
              .replace(/\\\\"/g, '"')      // Handle double-escaped quotes
              .replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
                return String.fromCharCode(parseInt(code, 16));
              });
            
            parsedData = JSON.parse(moreUnescaped);
            return parsedData;
          } catch (finalError) {
            console.warn('Failed to parse additional_data after all attempts:', finalError);
            return {};
          }
        }
      }
    }
    
    return {};
  } catch (error) {
    console.warn('Failed to parse additional_data:', error);
    return {};
  }
};

// Helper function to format field names for display
const formatFieldName = (key: string) => {
  return key
    .replace(/[_\\]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/Ü/g, 'Ü')
    .replace(/Ä/g, 'Ä')
    .replace(/Ö/g, 'Ö')
    .replace(/ß/g, 'ß');
};

// Helper function to format field values for display
const formatFieldValue = (value: any) => {
  if (value === null || value === undefined) return '-';
  
  if (typeof value === 'string') {
    return value
      .replace(/[_\\]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .replace(/Ü/g, 'Ü')
      .replace(/Ä/g, 'Ä')
      .replace(/Ö/g, 'Ö')
      .replace(/ß/g, 'ß');
  }
  
  return String(value);
};

// Additional Data Section Component
const AdditionalDataSection: React.FC<{ additionalData: any }> = ({ additionalData }) => {
  const parsedData = parseAdditionalData(additionalData);
  const dataKeys = Object.keys(parsedData).filter(key => 
    key !== 'created_time' && key !== 'id' && key !== 'form_id'
  );

  if (dataKeys.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 p-4 rounded mb-4">
      <h3 className="font-bold mb-4">Additional Information</h3>
      <div className="grid grid-cols-1 gap-2">
        {dataKeys.map((key) => (
          <div key={key} className="flex items-start gap-2">
            <p className="text-sm text-gray-500 min-w-0 flex-shrink-0">
              {formatFieldName(key)}:
            </p>
            <p className="text-sm break-words">
              {formatFieldValue(parsedData[key])}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  currentPipelineId: string | undefined;
  currentStageId?: string; // Add this optional prop
  onStatusUpdate?: () => Promise<void>;
}
interface Contact {
  id: number | string;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  email: string;
  stage: string;
  leadSource: string;
  createdAt: string;
  updatedAt?: string;
  pipeline_id: string;
  stage_id: string;
  email_verified?: boolean;
  additional_data?: any; // Added additional_data field
  customer: {
    id: string;
    company_name: string | null;
    website: string;
    status: string;
    platform?: string;
    additional_data?: any; // Added additional_data field to customer
  };
  stage_assignment?: {
    id: string;
    user_id: string;
  };
  user?: {
    id: string;
  };
  pipeline?: string;
  lead_email?: string;
  lead_phone?: string;
  platform?: string;
}

const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  contact,
  currentStageId,
  onStatusUpdate,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "activity">(
    "overview"
  );
  const [activeActivityTab, setActiveActivityTab] = useState<
    "contact" | "activity" | "note"
  >("contact");
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [showInvitePopup2, setShowInvitePopup2] = useState(false);
  const [showAppointment, setAppointment] = useState(false);
  const [transferAgency, settransferAgency] = useState(false);
  const [testEmailContent, setTestEmailContent] = useState<string>("");
  const dispatch = useDispatch<AppDispatch>();
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [activityType, setActivityType] = useState("By Telefonisch");
  const [reached, setReached] = useState("Yes");
  const [activityDate, setActivityDate] = useState("");
  const [activityTime, setActivityTime] = useState("");
  const [activityPhone, setActivityPhone] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [isAddingActivity, setIsAddingActivity] = useState(false);

  // New state for status update functionality
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [localContact, setLocalContact] = useState<Contact | null>(contact);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  // Update local contact when contact prop changes - but preserve any local updates
  useEffect(() => {
    if (contact && (!localContact || localContact.id !== contact.id)) {
    // Only update if it's a new contact, not if it's the same contact
      setLocalContact(contact);
    }
  }, [contact?.id]); // Only depend on contact.id, not the entire contact object

  const currentPipeline = useSelector(
    (state: RootState) => state.pipeline.currentPipeline
  );
  const stages = currentPipeline?.stages || [];
  const { pipelines } = useSelector((state: RootState) => state.pipeline);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    lead_phone: "",
    website: "",
    company_name: "",
    pipeline_id: pipelines[0]?.id?.toString() || "",
    stage_id: stages[0]?.id || "",
    status: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (contact) {
      // Use the currentStageId if provided, otherwise fall back to contact's stage_id
      const stageId = currentStageId || contact.stage_id || stages[0]?.id || "";

      setForm({
        first_name: contact.firstName || "",
        last_name: contact.lastName || "",
        lead_phone: contact.phone || "",
        website: contact.customer?.website || "",
        company_name: contact.customer?.company_name || "",
        pipeline_id: contact.pipeline_id || pipelines[0]?.id?.toString() || "",
        stage_id: stageId,
        status: contact.customer?.status || "",
      });
    }
  }, [contact, pipelines, stages, currentStageId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };


  const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'fb':
      return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjvzC_QRv6moAhgNb5C6e3yicKgFND1g2RwA&s";
    case 'ig':
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/2048px-Instagram_icon.png";
    case 'meta':
      return "/meta-icon.png"; // You'll need to add this icon
    default:
      return "";
  }
};

const getPlatformLabel = (platform: string) => {
  switch (platform) {
    case 'fb':
      return 'Facebook';
    case 'ig':
      return 'Instagram';
    case 'meta':
      return 'Meta';
    default:
      return 'Manual';
  }
};

const getPlatformBadgeColor = (platform: string) => {
  switch (platform) {
    case 'fb':
      return 'bg-blue-500 text-white';
    case 'ig':
      return 'bg-pink-500 text-white';
    case 'meta':
      return 'bg-gray-600 text-white';
    default:
      return 'bg-gray-400 text-white';
  }
};

const handleSave = async () => {
  setSaving(true);
  
  // Debug logging to identify the correct user ID
  console.log('Contact object:', contact);
  console.log('Contact ID:', contact?.id);
  console.log('Contact User ID:', contact?.user?.id);
  console.log('Contact stage_assignment user_id:', contact?.stage_assignment?.user_id);
  
  try {
    // Use the correct user_id - try multiple sources
    const userId = contact?.user?.id || 
                   contact?.stage_assignment?.user_id || 
                   String(contact!.id);
    
    console.log('Using userId for update:', userId);
    
    await dispatch(
      updateComprehensiveCustomerProfile({
        user_id: userId, // Use the correct user_id
        profileData: form,
      })
    ).unwrap();

    // Update local contact state to reflect the changes immediately
    if (localContact) {
      const selectedPipeline = pipelines.find(
        (p) => p.id.toString() === form.pipeline_id
      );
      const selectedStage = stages.find((s) => s.id === form.stage_id);

      setLocalContact((prev) =>
        prev
          ? {
            ...prev,
            firstName: form.first_name,
            lastName: form.last_name,
            lead_phone: form.lead_phone,
            phone: form.lead_phone,
            website: form.website,
            company: form.company_name,
            customer: {
              ...prev.customer,
              company_name: form.company_name,
              website: form.website,
              status: form.status,
            },
            pipeline: selectedPipeline?.name || prev.pipeline,
            stage: selectedStage?.name || prev.stage,
            pipeline_id: form.pipeline_id,
            stage_id: form.stage_id,
          }
          : null
      );
    }

    toast.success("Customer profile updated successfully");

    // Call the refresh callback to update the main table
    if (onStatusUpdate) {
      await onStatusUpdate();
    }

    // Close the modal after successful save
    onClose();

  } catch (error: unknown) {
    console.error('Update error details:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to update customer profile";
    toast.error(errorMessage);
  } finally {
    setSaving(false);
  }
};

  // Add a separate state to force re-rendering of status display
  const [statusForceUpdate, setStatusForceUpdate] = useState(0);

  // Helper function to get current status consistently
  const getCurrentStatus = () => {
    const status = localContact?.customer?.status || contact?.customer?.status || "No Status";
    console.log("getCurrentStatus called:", {
      localContactStatus: localContact?.customer?.status,
      contactStatus: contact?.customer?.status,
      finalStatus: status,
      statusForceUpdate
    });
    return status;
  };

  // Function to update customer status using Redux action
  const handleUpdateCustomerStatus = async (newStatus: string) => {
    if (!contact?.customer?.id) {
      console.log("Validation failed - Customer ID is missing");
      toast.error("Customer ID is missing");
      return;
    }

    try {
      setUpdatingStatus(newStatus);

      await dispatch(
        updateCustomerStatus({
          customerId: contact.customer.id,
          status: newStatus,
        })
      ).unwrap();

      // Update local contact state with the new status immediately
      setLocalContact((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          customer: {
            ...prev.customer,
            status: newStatus
          }
        };
      });

      // Force re-render of status displays
      setStatusForceUpdate(prev => prev + 1);

      // Call the refresh callback to update the main table
      if (onStatusUpdate) {
        await onStatusUpdate();
      }

      toast.success(`Status updated to: ${newStatus}`);

    } catch (error: unknown) {
      console.error("Error updating customer status:", error);
      const errorMessage =
        typeof error === 'string'
          ? error
          : "Failed to update status";

      toast.error(errorMessage);

      // Revert local state on error
      setLocalContact(contact);
    } finally {
      setUpdatingStatus(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        !showInvitePopup &&
        !showAppointment &&
        !showInvitePopup2 &&
        !transferAgency
      ) {
        onClose();
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !showInvitePopup &&
        !showAppointment &&
        !showInvitePopup2 &&
        !transferAgency
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [
    isOpen,
    onClose,
    showInvitePopup,
    showAppointment,
    showInvitePopup2,
    transferAgency,
  ]);

  if (!isOpen || !contact) return null;

  const fullName = `${localContact?.firstName || contact.firstName || ""} ${
    localContact?.lastName || contact.lastName || ""
  }`;

  const renderActivityContent = () => {
    switch (activeActivityTab) {
      case "contact":
        return (
          <div className="bg-gray-50 p-6 rounded-lg mb-4">
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Deal name
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={`${form.first_name} - Deal`}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Pipelines
                </label>
                <div className="relative">
                  <select
                    className="w-full p-2 border rounded appearance-none bg-white"
                    name="pipeline_id"
                    value={form.pipeline_id}
                    onChange={handleChange}
                  >
                    {pipelines.length > 0 ? (
                      pipelines.map((pipeline) => (
                        <option
                          key={pipeline.id}
                          value={pipeline.id.toString()}
                        >
                          {pipeline.name}
                        </option>
                      ))
                    ) : (
                      <option>No pipelines</option>
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Stage
                </label>
                <div className="relative">
                  <select
                    className="w-full p-2 border rounded appearance-none bg-white"
                    name="stage_id"
                    value={form.stage_id}
                    onChange={handleChange}
                  >
                    {stages.length > 0 ? (
                      stages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.name}
                        </option>
                      ))
                    ) : (
                      <option>No stages</option>
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  First name
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Surname
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Telephone number
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  name="lead_phone"
                  value={form.lead_phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full p-2 border rounded"
                  name="lead_email"
                  value={contact.lead_email || contact.email || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">
                Website
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                name="website"
                value={form.website || contact.customer?.website || ""}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        );

      case "activity":
        return (
          <div className="bg-gray-50 p-6 rounded-lg mb-4">
            <h3 className="text-lg font-semibold mb-4">Activities</h3>
            <div className="flex items-center justify-between w-full">
              <div className="relative">
                <select
                  className="w-[250px] p-2 border rounded appearance-none bg-white"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                >
                  <option>By Telefonisch</option>
                  <option>By Email</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Has it been reached?
                </label>
                <div className="relative">
                  <select
                    className="w-full p-2 border rounded appearance-none bg-white"
                    value={reached}
                    onChange={(e) => setReached(e.target.value)}
                  >
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Time</label>
                <input
                  type="time"
                  className="w-full p-2 border rounded"
                  value={activityTime}
                  onChange={(e) => setActivityTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  By phone
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="Enter phone"
                  value={activityPhone}
                  onChange={(e) => setActivityPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">
                Description
              </label>
              <textarea
                className="w-full p-2 border rounded h-32"
                placeholder="Enter description here..."
                value={activityDescription}
                onChange={(e) => setActivityDescription(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-end mt-4">
              <button
                className="bg-green-500 text-white px-6 py-2 rounded disabled:opacity-50"
                disabled={isAddingActivity}
                onClick={async () => {
                  if (!contact?.id) {
                    toast.error("Contact ID is missing!");
                    return;
                  }
                  setIsAddingActivity(true);
                  const html = `<div class="relative mb-6">
  <div class="absolute left-4 -ml-2 h-4 w-4 rounded-full bg-blue-500 border-4 border-white"></div>
  <div class="ml-12 bg-gray-50 p-4 rounded shadow-sm">
    <div class="flex items-center mb-2">
      <p class="font-bold mr-2">Erreicht:</p>
      <span class="bg-red-500 text-white px-2 py-0.5 rounded text-xs">${reached}</span>
      <p class="ml-auto">Typ: ${activityType}</p>
    </div>
    <p>Datum: ${activityDate} - ${activityTime} Uhr</p>
    <p>Telefonisch: ${activityPhone}</p>
    <p>Aktualisierung des Deal-Status auf: ${activityDescription}</p>
    <p>Erstellt bei: ${activityTime} Uhr</p>
  </div>
</div>`;

                  const htmlEmail = `<div class="relative mb-6">
<div class="absolute left-4 -ml-2 h-4 w-4 rounded-full bg-blue-500 border-4 border-white"></div>
<div class="ml-12 bg-gray-50 p-4 rounded shadow-sm">
  <div class="flex items-center mb-2">
    <p class="ml-auto"><span class="font-bold mr-1">Typ:</span>${activityType}</p>
  </div>
  <p>E-Mail wurde erfolgreich versendet an ${
    contact.lead_email || contact.email
  }</p>
  <p>Message: ${activityDescription}</p>
  <p>Erstellt bei: ${activityDate} - ${activityTime} Uhr</p>
</div>
</div>`;

                  try {
                    await dispatch(
                      createLeadTracking({
                        userId: String(contact.id),
                        activity:
                          activityType === "By Telefonisch"
                            ? html
                            : activityType === "By Email"
                            ? htmlEmail
                            : "",
                      })
                    );
                    toast.success("Activity created successfully");
                  } finally {
                    setIsAddingActivity(false);
                  }
                }}
              >
                {isAddingActivity ? "Adding..." : "Add"}
              </button>
            </div>


            <div className="mt-8 relative">
              <div className="absolute h-full left-6 top-0 border-l-2 border-blue-300"></div>
              <LeadTrackingActivities
                userId={String(contact.id)}
                contactCreatedAt={contact.createdAt}
              />
            </div>
          </div>
        );
      case "note":
        return (
          <div className="bg-gray-50 p-6 rounded-lg mb-4">
            <h3 className="text-lg font-semibold mb-4">Note</h3>
            <div className="mb-4">
              <PrimeEditor
                value={testEmailContent}
                onTextChange={(e) => setTestEmailContent(e.htmlValue ?? "")}
                style={{ height: "200px" }}
              />
            </div>
            <div className="flex justify-end mt-4">
              <button
                className="bg-green-500 text-white px-6 py-2 rounded disabled:opacity-50"
                disabled={isSavingNote}
                onClick={async () => {
                  if (!contact || !contact.id) {
                    toast.error("No user selected or user ID is missing!");
                    return;
                  }
                  setIsSavingNote(true);
                  try {
                    await dispatch(
                      updateCustomerProfile({
                        userId: String(contact.id),
                        profileData: { news: testEmailContent },
                      })
                    );
                    toast.success("Note saved successfully");
                  } catch (error) {
                    console.log(error, "error");
                    toast.error("Failed to save note. Please try again.");
                  } finally {
                    setIsSavingNote(false);
                  }
                }}
              >
                {isSavingNote ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isOpen || !contact) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div
          ref={modalRef}
          className="bg-[#EBEBEB] rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] "
        >
          <div className="flex justify-between bg-white items-center px-4 py-2 border-b">
            <h2 className="text-xl font-bold">{fullName}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 bg-transparent duration-100 border-none hover:text-gray-700"
            >
              <IoClose size={24} />
            </button>
          </div>

          <div className="flex h-auto bg-[#EBEBEB] p-4">
            {/* Left sidebar */}
            <div className="w-full max-w-xs md:w-1/4 rounded-lg bg-gray-50 p-4 border-r">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full mb-3 flex items-center justify-center overflow-hidden">
                  <div className="text-3xl font-bold text-gray-600">
                    {contact.firstName ? contact.firstName.charAt(0) : ""}
                    {contact.lastName ? contact.lastName.charAt(0) : ""}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-center">{fullName}</h3>

                <div className="mt-4 flex flex-col items-center justify-center w-full">
                  <div
                    onClick={() => setShowInvitePopup2(true)}
                    className="bg-[#002d51] cursor-pointer text-white py-2 px-4 rounded flex items-center justify-center gap-2 max-w-[250px] mb-2"
                  >
                    <FaUser /> Fixfinanz Vertragssevice
                  </div>
                  <button
                    onClick={() => settransferAgency(true)}
                    className="bg-[#FFC107] hover:bg-yellow-500 text-black py-2 px-4 rounded w-full flex items-center max-w-[270px] justify-center"
                  >
                    <span className="mr-2">
                      <FaUser />
                    </span>
                    Übertragung an die Agentur
                  </button>
                </div>

                <div className="mt-4 w-full text-sm">
                  <p className="mb-2 text-center text-gray-500">
                    Deal wurde erstellt: {contact.createdAt || ""}
                  </p>

                  {/* Email Verification Status */}
                  {contact.email_verified && (
                    <div className="my-3 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-sm font-medium text-green-700">Real user</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-sm font-medium text-green-700">Email verified</span>
                      </div>
                    </div>
                  )}

                  <h4 className="font-bold mt-4 mb-2">Leads Info</h4>
                  <div className="space-y-1">
                    <p>
                      E-Mail:{" "}
                      <a
                        href={`mailto:${
                          contact.lead_email || contact.email || ""
                        }`}
                        className="text-blue-500"
                      >
                        {contact.lead_email || contact.email || ""}
                      </a>
                    </p>
                    <p>
                      Telefonnummer:{" "}
                      {localContact?.lead_phone ||
                        localContact?.phone ||
                        contact.phone ||
                        contact.lead_phone ||
                        "-"}
                    </p>
                    <p>
                      Company:{" "}
                      {localContact?.company ||
                        localContact?.customer?.company_name ||
                        contact.company ||
                        "-"}
                    </p>
                    <p>
                      Pipeline:{" "}
                      {localContact?.pipeline || contact.pipeline || "Termin"}
                    </p>
                    <p>
                      Stage:{" "}
                      <span className="bg-[#FFC107] px-2 py-0.5 rounded text-xs">
                        {localContact?.stage || contact.stage || ""}
                      </span>
                    </p>


                    <p>
                      Status: 
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        getCurrentStatus() === "Terminiert"
                          ? "bg-[#157347] text-white"
                        : getCurrentStatus() === "Nicht erreicht"
                          ? "bg-[#0D6EFD] text-white"
                          : getCurrentStatus() === "Follow up"
                          ? "bg-[#FFC107] text-black"
                            : getCurrentStatus() === "Ungeeignet"
                          ? "bg-[#DC3545] text-white"
                          : "bg-gray-500 text-white"
                      }`}>
                        {getCurrentStatus()}
                      </span>
                    </p>
                  </div>

                  <h4 className="font-bold mt-4 mb-2">Lead Status:</h4>

                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => handleUpdateCustomerStatus("Terminiert")}
                      disabled={updatingStatus !== null}
                      className={`text-white text-xs font-bold px-2 py-1 rounded transition-opacity ${
                        updatingStatus === "Terminiert"
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-[#157347] hover:bg-[#0f5132] cursor-pointer"
                      }`}
                    >
                      {updatingStatus === "Terminiert"
                        ? "Updating..."
                        : "Terminiert"}
                    </button>
                    <button
                      onClick={() => handleUpdateCustomerStatus("Nicht erreicht")}
                      disabled={updatingStatus !== null}
                      className={`text-white text-xs font-bold px-2 py-1 rounded transition-opacity ${
                        updatingStatus === "Nicht erreicht"
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-[#0D6EFD] hover:bg-[#0a58ca] cursor-pointer"
                      }`}
                    >
                      {updatingStatus === "Nicht erreicht"
                        ? "Updating..."
                        : "Nicht erreicht"}
                    </button>
                    <button
                      onClick={() => handleUpdateCustomerStatus("Follow up")}
                      disabled={updatingStatus !== null}
                      className={`text-black text-xs font-bold px-2 py-1 rounded transition-opacity ${
                        updatingStatus === "Follow up"
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-[#FFC107] hover:bg-[#ffca2c] cursor-pointer"
                      }`}
                    >
                      {updatingStatus === "Follow up"
                        ? "Updating..."
                        : "Follow up"}
                    </button>
                    <button
                      onClick={() => handleUpdateCustomerStatus("Ungeeignet")}
                      disabled={updatingStatus !== null}
                      className={`text-white text-xs font-bold px-2 py-1 rounded transition-opacity ${
                        updatingStatus === "Ungeeignet"
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-[#DC3545] hover:bg-[#bb2d3b] cursor-pointer"
                      }`}
                    >
                      {updatingStatus === "Ungeeignet"
                        ? "Updating..."
                        : "Ungeeignet"}
                    </button>
                  </div>

                  <div className="mt-4">
                    <p className="font-bold">
                      Anfrage wurde erstellt: {contact.createdAt || ""}
                    </p>

                    <h4 className="font-bold mt-4 mb-1">
                      Weitere Informationen
                    </h4>
                    <p>Lead - Herkunft: {contact.leadSource}</p>

                  </div>
                  {/* Additional Data Display - Form Style */}
                  {(() => {
                    const additionalData = contact.additional_data || contact.customer?.additional_data;
                    const parsedData = parseAdditionalData(additionalData);
                    const dataKeys = Object.keys(parsedData).filter(key => 
                      key !== 'created_time' && key !== 'id' && key !== 'form_id'
                    );

                    if (dataKeys.length === 0) {
                      return null;
                    }

                    return (
                      <div className="mt-4">
                        <div className="p-3 text-sm">
                          <div className="space-y-3">
                            {dataKeys.map((key, index) => (
                              <div key={key}>
                                <p className="text-gray-800 font-medium mb-1">
                                  {formatFieldName(key)}
                                </p>
                                <p className="text-blue-600 font-semibold">
                                  Antwort: {formatFieldValue(parsedData[key])}
                                </p>
                                {index < dataKeys.length - 1 && (
                                  <div className="border-b border-gray-100 mt-2"></div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Footer with platform info */}
                          <div className="mt-3 pt-2 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-gray-600">Lead - Herkunft:</p>
                              {(contact.platform || contact.customer?.platform) ? (
                                <div className="flex items-center gap-1">
                                  {((contact.platform === 'fb' || contact.platform === 'ig') || 
                                    (contact.customer?.platform === 'fb' || contact.customer?.platform === 'ig')) && (
                                    <img
                                      src={getPlatformIcon(contact.platform || contact.customer?.platform || '')}
                                      alt={getPlatformLabel(contact.platform || contact.customer?.platform || '')}
                                      className="w-4 h-4 rounded"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  )}
                                  <span className="text-xs font-medium text-blue-600">
                                    {getPlatformLabel(contact.platform || contact.customer?.platform || '')}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-600">Manual</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Right content area */}
            <div className="w-full md:w-3/4 p-4 border-b pb-4">
              <div className="flex border-b mb-4">
                <button
                  className={`px-6 py-[6px] text-sm rounded-none duration-0 ${
                    activeTab === "overview"
                      ? "bg-[#112A73] text-white"
                      : "bg-transparent text-black"
                  }`}
                  onClick={() => setActiveTab("overview")}
                >
                  Overview
                </button>
                <button
                  className={`px-6 py-[6px] text-sm rounded-none duration-0 ${
                    activeTab === "activity"
                      ? "bg-[#112A73] text-white"
                      : "bg-transparent text-black"
                  }`}
                  onClick={() => setActiveTab("activity")}
                >
                  Activity
                </button>
                <div className="ml-auto">
                  <button
                    onClick={() => setAppointment(true)}
                    className="bg-[#FFC107] text-black flex items-center gap-1 border-none p-2 rounded"
                  >
                    <FaCalendarAlt /> Termin
                  </button>
                </div>
              </div>

              {activeTab === "overview" ? (
                <>
                  <div className="bg-gray-50 p-4 rounded mb-4">
                    <h3 className="font-bold mb-4">Data Highlights</h3>
                    <div className="grid grid-cols-3 xsm:grid-cols-1 sm:grid-cols-1 gap-4">
                      <div className="flex items-center justify-center flex-col">
                        <p className="text-xs text-black font-semibold">
                          Erstellung
                        </p>
                        <p className="text-sm text-gray-500">
                          {contact.createdAt || ""}
                        </p>
                      </div>
                      <div className="flex items-center justify-center flex-col">
                        <p className="text-xs text-black font-semibold">
                          DEAL PHASE
                        </p>
                        <p className="text-sm text-gray-500">
                          {localContact?.pipeline ||
                            contact.pipeline ||
                            "Termin"}{" "}
                          ({localContact?.stage || contact.stage || "Standard"})
                        </p>
                      </div>
                      <div className="flex items-center justify-center flex-col">
                        <p className="text-xs text-black font-semibold">
                          Die letzte Aktivität
                        </p>
                        <p className="text-sm text-gray-500">
                          {contact.updatedAt || "Keine Aktivität"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded mb-4">
                    <h3 className="font-bold mb-4">Leads Info</h3>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500">E-Mail:</p>
                        <p>
                          <a
                            href={`mailto:${contact.lead_email || contact.email || ""
                              }`}
                            className="text-blue-500"
                          >
                            {contact.email || ""}
                          </a>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500">Telefonnummer:</p>
                        <p>
                          {localContact?.lead_phone ||
                            localContact?.phone ||
                            contact.phone ||
                            "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500">Company:</p>
                        <p>
                          {localContact?.company ||
                            localContact?.customer?.company_name ||
                            contact.company ||
                            "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500">Pipeline:</p>
                        <p>
                          {localContact?.pipeline ||
                            contact.pipeline ||
                            "Termin"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500">Stage:</p>
                        <p>
                          <span className="bg-[#FFC107] px-2 py-0.5 rounded text-xs">
                            {localContact?.stage || contact.stage || "Standard"}
                          </span>
                        </p>
                      </div>
                       {/* Platform Display */}
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-500">Platform:</p>
                          {(contact.platform || contact.customer?.platform) ? (
                            <div className="flex items-center gap-2">
                              {/* Only show image for fb or ig platforms */}
                              {((contact.platform === 'fb' || contact.platform === 'ig') || 
                                (contact.customer?.platform === 'fb' || contact.customer?.platform === 'ig')) && (
                                <img
                                  src={getPlatformIcon(contact.platform || contact.customer?.platform || '')}
                                  alt={getPlatformLabel(contact.platform || contact.customer?.platform || '')}
                                  className="w-4 h-4 rounded"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                getPlatformBadgeColor(contact.platform || contact.customer?.platform || '')
                              }`}>
                                {getPlatformLabel(contact.platform || contact.customer?.platform || '')}
                              </span>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-400 text-white">
                              Manual
                            </span>
                          )}
                        </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500">Status:</p>
                        <p>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${getCurrentStatus() === "Terminiert"
                              ? "bg-[#157347] text-white"
                              : getCurrentStatus() === "Nicht erreicht"
                                ? "bg-[#0D6EFD] text-white"
                                : getCurrentStatus() === "Follow up"
                                  ? "bg-[#FFC107] text-black"
                                  : getCurrentStatus() === "Ungeeignet"
                                    ? "bg-[#DC3545] text-white"
                                    : "bg-gray-500 text-white"
                            }`}>
                            {getCurrentStatus()}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Data Section - NEW */}
                  <AdditionalDataSection 
                    additionalData={contact.additional_data || contact.customer?.additional_data} 
                  />

                  <div>
                    <h3 className="font-bold mb-4">Vergangene Aktivitäten</h3>
                    <div className="relative pb-12">
                      <div className="absolute h-full left-6 top-0 border-l-2 border-blue-300"></div>
                      <LeadTrackingActivities
                        userId={String(contact.id)}
                        contactCreatedAt={contact.createdAt}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="mb-4">
                    <div className="flex mb-4 border-b pb-2">
                      <button
                        className={`px-4 py-2 rounded-lg flex items-center mr-2 ${
                          activeActivityTab === "contact"
                            ? "bg-[#002D51] text-white"
                            : "bg-[#002D51] text-white"
                        }`}
                        onClick={() => setActiveActivityTab("contact")}
                      >
                        <span className="mr-1">
                          <FaUser />
                        </span>
                        Contact
                      </button>
                      <button
                        className={`px-4 py-2 rounded-lg flex items-center mr-2 ${
                          activeActivityTab === "activity"
                            ? "bg-[#002D51] text-white"
                            : "bg-[#002D51] text-white"
                        }`}
                        onClick={() => setActiveActivityTab("activity")}
                      >
                        <span className="mr-1">
                          <MdOutlineSort />
                        </span>
                        Activity
                      </button>
                      <button
                        className={`px-4 py-2 rounded-lg flex items-center mr-2 ${
                          activeActivityTab === "note"
                            ? "bg-[#002D51] text-white"
                            : "bg-[#002D51] text-white"
                        }`}
                        onClick={() => setActiveActivityTab("note")}
                      >
                        <span className="mr-1">
                          <CiStickyNote />
                        </span>
                        Note
                      </button>

                      <button
                        className="px-4 py-2 rounded-lg flex items-center bg-[#002D51] text-white"
                        onClick={() => setShowInvitePopup(true)}
                      >
                        <span className="mr-1">
                          <TiUserAdd />
                        </span>
                        Invite Lead
                      </button>
                    </div>
                  </div>

                  {renderActivityContent()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <InvitePopup
        isOpen={showInvitePopup}
        onClose={() => setShowInvitePopup(false)}
        userId={String(contact?.id)}
        instanceId="activity-tab"
      />
      <InvitePopup
        isOpen={showInvitePopup2}
        onClose={() => setShowInvitePopup2(false)}
        userId={String(contact?.id)}
        instanceId="overview-section"
      />
      <AppointmentModel
        emailContact={contact.email || contact.lead_email || ""}
        nameContact={`${contact.firstName} ${contact.lastName}` || ""}
        idContact={String(contact.id) || ""}
        pipelineId={contact.pipeline_id || ""}
        stageId={contact.stage_id || currentStageId || ""}
        userId={currentUser?.id || ""}
        isOpen={showAppointment}
        onClose={() => setAppointment(false)}
      />
      <TransferAgencyModel
        isOpen={transferAgency}
        onClose={() => settransferAgency(false)}
        selectedCustomerIds={contact ? [String(contact.id)] : []}
      />
    </>
  );
};

export default ContactModal;