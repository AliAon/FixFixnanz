"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { FaTools, FaUserFriends } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { IoIosAdd, IoMdArrowDropdown } from "react-icons/io";
import Link from "next/link";
import { PiExportBold } from "react-icons/pi";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchUsersByConsultant, clearUsers } from "@/redux/slices/usersSlice";
import {
  fetchPipelineById,
  fetchPipelines,
} from "@/redux/slices/pipelineSlice";
import {
  fetchStagesByPipeline,
  createStage,
  updateStage,
  deleteStage,
  clearStages,
} from "@/redux/slices/stageSlice";
import PipelineModal from "../../components/pipeline/ManagePiplelineDialouge";
import PropertiesModal from "../../components/pipeline/PropertiesDialouge";
import NewDealModal from "../../components/pipeline/NewDealModel";
import ImportContactModal from "../../components/pipeline/ImportContactModel";
import MobileHeader from "../../components/pipeline/MobileHeader";
import ContactModal from "../../components/pipeline/ContactModel";
import ManageStageModal from "../../components/pipeline/ManageStageModal";
import { Contact } from "@/types/Contact";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TransferAgencyModel from "../../components/pipeline/TransferAgencyModel";

const LeadpoolPipelinesDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { pipelines } = useSelector((state: RootState) => state.pipeline);
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPipelineId = searchParams.get("id");

  // Filter to show only leadpool pipelines
  const leadpoolPipelines = pipelines.filter(
    (pipeline) => pipeline.type === "leadpool"
  );

  const handlePipelineClick = (pipelineId: string) => {
    router.push(`/admin/leadpool-pipeline?id=${pipelineId}`);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const currentPipeline = leadpoolPipelines.find(
    (p) => p.id.toString() === currentPipelineId
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="mr-2 font-semibold text-white">
          {currentPipeline?.name || "Leadpool Pipelines"}
        </span>
        <IoMdArrowDropdown className="text-white" />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-64 bg-[#00528B] text-white rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
          {leadpoolPipelines.length > 0 ? (
            leadpoolPipelines.map((pipeline) => (
              <div
                key={pipeline.id}
                className="flex items-center justify-between px-4 py-2 hover:bg-[#1477BC] rounded-lg cursor-pointer"
                onClick={() => handlePipelineClick(pipeline.id.toString())}
              >
                <span className="text-white">{pipeline.name}</span>
                <span className="bg-yellow-400 text-black px-2 py-0.5 rounded-full text-xs">
                  {pipeline.stages?.length || 0}
                </span>
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-white">
              No leadpool pipelines available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function LeadpoolPipelinePage() {
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pipelineId = searchParams.get("id");
  const {
    currentPipeline,
    pipelines,
    error: pipelineError,
  } = useSelector((state: RootState) => state.pipeline);
  const { pipelinesWithCustomerCount } = useSelector(
    (state: RootState) => state.users
  );
  const { stages, error: stageError } = useSelector(
    (state: RootState) => state.stage
  );
  const { users, error: usersError } = useSelector(
    (state: RootState) => state.users
  );
  const [isCreatingPipeline, setIsCreatingPipeline] = useState(false);
  const [isLoadingStages, setIsLoadingStages] = useState(false);

  // Add state to track pipeline switching and data loading
  const [currentLoadingPipelineId, setCurrentLoadingPipelineId] = useState<
    string | null
  >(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasDataLoaded, setHasDataLoaded] = useState(false);
  const [isSwitchingPipeline, setIsSwitchingPipeline] = useState(false);

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [transferAgency, setTransferAgency] = useState(false);

  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(
    new Set()
  );

  const userId = currentPipeline?.user_id;

  // Get current pipeline from the customer count API data
  const currentPipelineWithCount = pipelinesWithCustomerCount.find(
    (p) => p.id === pipelineId
  );

  // Create stable reference for first stage ID to prevent infinite re-renders
  const firstStageId = useMemo(() => {
    return stages.length > 0 ? stages[0].id.toString() : null;
  }, [stages]);

  // Fetch pipelines with customer count on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await dispatch(fetchPipelines()).unwrap();
        setIsInitialLoad(false);
      } catch (error) {
        console.error("Failed to fetch pipelines:", error);
        setIsInitialLoad(false);
      }
    };
    loadInitialData();
  }, [dispatch]);

  // Auto-select first leadpool pipeline if none is selected
  useEffect(() => {
    if (!isInitialLoad && !pipelineId && pipelines.length > 0) {
      console.log(
        "All pipelines:",
        pipelines.map((p) => ({ id: p.id, name: p.name, type: p.type }))
      );
      const leadpoolPipelines = pipelines.filter(
        (pipeline) => pipeline.type === "leadpool"
      );
      console.log("Leadpool pipelines found:", leadpoolPipelines.length);

      if (leadpoolPipelines.length > 0) {
        const firstLeadpoolPipeline = leadpoolPipelines[0];
        console.log(
          "Auto-selecting first leadpool pipeline:",
          firstLeadpoolPipeline.name
        );
        router.push(`/admin/leadpool-pipeline?id=${firstLeadpoolPipeline.id}`);
      } else {
        console.log(
          "No leadpool pipelines found. Available types:",
          pipelines.map((p) => p.type)
        );
      }
    }
  }, [isInitialLoad, pipelineId, pipelines, router]);

  // Handle initial pipeline load from URL
  useEffect(() => {
    if (pipelineId && !isInitialLoad && !currentLoadingPipelineId) {
      setIsSwitchingPipeline(true);
      setCurrentLoadingPipelineId(pipelineId);
      setHasDataLoaded(false);
      dispatch(clearUsers()); // Clear any existing data
      dispatch(clearStages()); // Clear any existing stages
    }
  }, [pipelineId, isInitialLoad, currentLoadingPipelineId, dispatch]);

  // Handle pipeline switching and data loading
  useEffect(() => {
    if (!pipelineId) {
      setIsSwitchingPipeline(false);
      setHasDataLoaded(false);
      setCurrentLoadingPipelineId(null);
      setSelectedContacts(new Set()); // Clear selections
      dispatch(clearUsers()); // Clear users data
      dispatch(clearStages()); // Clear stages data
      return;
    }

    // If we're switching to a different pipeline, mark as loading
    if (pipelineId !== currentLoadingPipelineId) {
      setIsSwitchingPipeline(true); // Set switching state immediately
      setCurrentLoadingPipelineId(pipelineId);
      setHasDataLoaded(false);
      setSelectedContacts(new Set()); // Clear selections when switching pipelines
      dispatch(clearUsers()); // Clear old users data immediately
      dispatch(clearStages()); // Clear old stages data immediately to prevent wrong stage_id

      // Load pipeline and stages data
      const loadPipelineData = async () => {
        try {
          await Promise.all([
            dispatch(fetchPipelineById(pipelineId)).unwrap(),
            dispatch(fetchStagesByPipeline(pipelineId)).unwrap(),
          ]);
          setIsSwitchingPipeline(false); // Clear switching state after data loads
        } catch (error) {
          console.error("Failed to load pipeline data:", error);
          setIsSwitchingPipeline(false); // Clear switching state even on error
        }
      };

      loadPipelineData();
    }
  }, [pipelineId, dispatch, currentLoadingPipelineId]);

  // Fetch users when pipeline data is ready
  useEffect(() => {
    if (
      userId &&
      pipelineId &&
      firstStageId &&
      pipelineId === currentLoadingPipelineId &&
      !hasDataLoaded
    ) {
      const loadUsers = async () => {
        try {
          await dispatch(
            fetchUsersByConsultant({
              consultantId: userId,
              stage_id: firstStageId,
            })
          ).unwrap();
          // Only set hasDataLoaded if we're still loading the same pipeline
          if (pipelineId === currentLoadingPipelineId) {
            setHasDataLoaded(true);
            setIsSwitchingPipeline(false); // Clear switching state when users are loaded
          }
        } catch (error) {
          console.error("Failed to load users:", error);
          // Only set hasDataLoaded if we're still loading the same pipeline
          if (pipelineId === currentLoadingPipelineId) {
            setHasDataLoaded(true); // Set to true even on error to stop loading state
            setIsSwitchingPipeline(false); // Clear switching state even on error
          }
        }
      };

      loadUsers();
    }
  }, [
    userId,
    pipelineId,
    firstStageId,
    dispatch,
    currentLoadingPipelineId,
    hasDataLoaded,
  ]);

  const handleContactRowClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsContactModalOpen(true);
  };

  const handleSelectContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);
  const [isPropertiesModalOpen, setIsPropertiesModalOpen] = useState(false);
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
  const [isImportContactModalOpen, setIsImportContactModalOpen] =
    useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobileView(window.innerWidth < 999);
    };

    checkIsMobile();

    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  const handleCreateStage = async (data: {
    pipeline_id: string;
    name: string;
    color: string;
    position: number;
  }) => {
    setIsLoadingStages(true);
    try {
      await dispatch(createStage(data)).unwrap();
      if (pipelineId) {
        await dispatch(fetchStagesByPipeline(pipelineId)).unwrap();
      }
      toast.success("Stage created successfully");
    } catch (error) {
      toast.error("Failed to create stage");
      console.error("Error creating stage:", error);
    } finally {
      setIsLoadingStages(false);
    }
  };

  const handleUpdateStage = async (
    id: string,
    data: { name: string; color: string }
  ) => {
    setIsLoadingStages(true);
    try {
      await dispatch(updateStage({ id, data })).unwrap();
      if (pipelineId) {
        await dispatch(fetchStagesByPipeline(pipelineId)).unwrap();
      }
      toast.success("Stage updated successfully");
    } catch (error) {
      toast.error("Failed to update stage");
      console.error("Error updating stage:", error);
    } finally {
      setIsLoadingStages(false);
    }
  };

  const handleDeleteStage = async (id: string) => {
    setIsLoadingStages(true);
    try {
      await dispatch(deleteStage(id)).unwrap();
      if (pipelineId) {
        await dispatch(fetchStagesByPipeline(pipelineId)).unwrap();
      }
      toast.success("Stage deleted successfully");
    } catch (error) {
      toast.error("Failed to delete stage");
      console.error("Error deleting stage:", error);
    } finally {
      setIsLoadingStages(false);
    }
  };

  const isContentLoading = useMemo(() => {
    return (
      isSwitchingPipeline ||
      (pipelineId && pipelineId === currentLoadingPipelineId && !hasDataLoaded)
    );
  }, [
    pipelineId,
    currentLoadingPipelineId,
    hasDataLoaded,
    isSwitchingPipeline,
  ]);

  // Convert users to contacts format - only if data is for current pipeline
  const contacts: Contact[] = useMemo(() => {
    // CRITICAL: Always return empty during any loading state or pipeline switching
    if (
      isSwitchingPipeline ||
      isContentLoading ||
      !hasDataLoaded ||
      !pipelineId
    ) {
      return [];
    }

    // Ensure we only show data for the current pipeline we're loading
    if (pipelineId !== currentLoadingPipelineId) {
      return [];
    }

    // If users array is empty, return empty array (this is valid for pipelines with no contacts)
    if (!users || users.length === 0) {
      return [];
    }

    return (users as unknown as Array<Record<string, unknown>>).map((item) => {
      // Extract data from the new API structure
      const user =
        ((item as Record<string, unknown>).user as Record<string, unknown>) ||
        item ||
        {};
      const customer =
        ((item as Record<string, unknown>).customer as Record<
          string,
          unknown
        >) || {};
      const stage =
        ((item as Record<string, unknown>).stage as Record<string, unknown>) ||
        {};
      const pipeline =
        ((item as Record<string, unknown>).pipeline as Record<
          string,
          unknown
        >) || {};

      return {
        id: String(user?.id || customer?.id || item?.id || ""),
        firstName: String(user?.first_name || ""),
        lastName: String(user?.last_name || ""),
        company: String(customer?.company_name || ""),
        phone: String(user?.lead_phone || user?.phone || ""),
        email: String(user?.lead_email || user?.email || ""),
        stage: String(stage?.name || ""),
        leadSource: String(pipeline?.name || currentPipeline?.source || ""),
        status: user?.is_approved ? "Terminiert" : "Nicht erreicht",
        createdAt:
          customer?.created_at || user?.created_at
            ? new Date(String(customer?.created_at || user?.created_at || ""))
                .toLocaleString("de-DE", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
                .replace(",", " -")
                .padStart(2, "0") + " Uhr"
            : "",
        updatedAt:
          customer?.updated_at || user?.updated_at
            ? new Date(String(customer?.updated_at || user?.updated_at || ""))
                .toLocaleString("de-DE", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
                .replace(",", " -")
                .padStart(2, "0") + " Uhr"
            : "",
        pipeline: String(pipeline?.name || currentPipeline?.name || ""),
        // Add additional properties that might be needed for the contact modal
        pipeline_id: String(pipeline?.id || ""),
        stage_id: String(stage?.id || ""),
        company_name: String(customer?.company_name || ""),
        // Add the customer object directly from the API response
        customer: {
          id: String(customer?.id || ""),
          company_name: String(customer?.company_name || ""),
          website: String(customer?.website || user?.website || ""),
          status: String(customer?.status || ""),
        },
      };
    });
  }, [
    users,
    hasDataLoaded,
    pipelineId,
    currentLoadingPipelineId,
    currentPipeline,
    isContentLoading,
    isSwitchingPipeline,
  ]);

  const handleSelectAll = () => {
    if (selectedContacts.size === contacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(contacts.map((contact) => contact.id)));
    }
  };

  const isAllSelected =
    contacts.length > 0 && selectedContacts.size === contacts.length;
  const hasSelectedContacts = selectedContacts.size > 0;

  // Show toast for errors instead of error screen
  useEffect(() => {
    if (pipelineError) {
      toast.error(pipelineError);
    }
    if (stageError) {
      toast.error(stageError);
    }
    if (usersError) {
      toast.error(usersError);
    }
  }, [pipelineError, stageError, usersError]);

  // Display customer count from the API or fallback to contacts length
  const displayCustomerCount =
    currentPipelineWithCount?.customer_count ?? contacts.length;

  return (
    <div className="bg-gray-100">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {isMobileView ? (
        <MobileHeader
          onManagePipelineClick={() => setIsPipelineModalOpen(true)}
          onPropertiesClick={() => setIsPropertiesModalOpen(true)}
          onNewDealClick={() => setIsNewDealModalOpen(true)}
          onImportContactClick={() => setIsImportContactModalOpen(true)}
          contactCount={isContentLoading ? 0 : displayCustomerCount}
        />
      ) : (
        <header className="bg-base text-white p-4">
          <div className="">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsPipelineModalOpen(true);
                  }}
                  className={`flex items-center bg-[#FFC107] justify-center hover:bg-[#FFCA2C] text-black font-bold py-2 px-4 rounded ${
                    isCreatingPipeline ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                  disabled={isCreatingPipeline}
                >
                  {isCreatingPipeline ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span className="mr-2">
                        <FaTools />
                      </span>
                      <div>
                        <span className="block font-normal text-center">
                          Manage Pipeline
                        </span>
                      </div>
                    </>
                  )}
                </button>

                <div className="flex items-center">
                  <span className="mr-2 font-semibold">All Contacts</span>
                  {isContentLoading ? (
                    <span className="bg-yellow-400 text-black rounded-full px-2 py-0.5 text-xs">
                      -
                    </span>
                  ) : (
                    <span className="bg-yellow-400 text-black rounded-full px-2 py-0.5 text-xs">
                      {displayCustomerCount}
                    </span>
                  )}
                </div>
                <LeadpoolPipelinesDropdown />

                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => setIsPropertiesModalOpen(true)}
                >
                  <FiMenu className="mr-2 font-semibold" />
                  <span>Properties</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Link
                  href=""
                  className="flex items-center font-semibold"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsNewDealModalOpen(true);
                  }}
                >
                  <IoIosAdd size={28} className="mr-1" />
                  <span>New Deal</span>
                </Link>

                <Link
                  href=""
                  onClick={(e) => {
                    e.preventDefault();
                    setIsImportContactModalOpen(true);
                  }}
                  className="flex items-center font-semibold"
                >
                  <PiExportBold size={24} className="mr-2" />
                  <span>Import Contact</span>
                </Link>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Suchen..."
                    className="bg-white text-gray-800 rounded-md py-2 px-4 w-48"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="my-6 px-4">
        <div className="bg-white rounded-lg shadow-sm p-4 overflow-x-auto w-full">
          {/* Stages Section */}
          <div className="flex items-center gap-2 mb-4">
            {isContentLoading ? (
              <div className="flex items-center gap-2">
                {/* <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> */}
                {/* <span className="text-gray-500">Loading stages...</span> */}
              </div>
            ) : (
              <>
                {stages.map((stage) => (
                  <div
                    key={stage.id}
                    className="flex items-center gap-1 bg-white border border-gray-300 rounded px-3 py-1"
                    style={{ borderColor: stage.color }}
                  >
                    <span>{stage.name}</span>
                    <span className="bg-gray-200 text-gray-700 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {
                        contacts.filter(
                          (contact) => contact.stage === stage.name
                        ).length
                      }
                    </span>
                  </div>
                ))}
                <button
                  onClick={() => setIsStageModalOpen(true)}
                  className="flex items-center gap-1 bg-white border border-gray-300 rounded px-3 py-1 text-blue-600 hover:bg-gray-50"
                >
                  <span>New stage</span>
                  <span className="text-lg">+</span>
                </button>
              </>
            )}
          </div>
          {!isContentLoading && (
            <div className="flex items-center gap-2 justify-end mb-4">
              <button
                onClick={() => hasSelectedContacts && setTransferAgency(true)}
                disabled={!hasSelectedContacts}
                className={`px-4 py-2 rounded-md transition-all duration-200 ${
                  hasSelectedContacts
                    ? "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                    : "bg-blue-500 opacity-60 text-white cursor-not-allowed"
                }`}
              >
                Transfer Selected
              </button>
            </div>
          )}
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="py-3 px-2 text-left">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                  Leadpool Pipeline
                </th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                  First Name
                </th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                  SurName
                </th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                  Company
                </th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                  Phone
                </th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                  E-Mail
                </th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                  Stage
                </th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                  Lead - origin
                </th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                  Status
                </th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                  Created:
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {!isInitialLoad &&
              pipelines.length > 0 &&
              pipelines.filter((p) => p.type === "leadpool").length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center">
                    <h2 className="text-2xl font-semibold text-primary mb-2">
                      No Leadpool Pipelines Found
                    </h2>
                    <p className="text-gray-600 text-xs mb-4">
                      You need to create leadpool pipelines first. Click
                      &quot;Manage Pipeline&quot; to create one.
                    </p>
                    <button
                      onClick={() => setIsPipelineModalOpen(true)}
                      className="bg-[#FFC107] hover:bg-[#FFCA2C] border-none text-black font-bold py-3 px-6 rounded-md flex items-center mx-auto"
                    >
                      <FaTools className="mr-2" />
                      <span>Create Leadpool Pipeline</span>
                    </button>
                  </td>
                </tr>
              ) : isContentLoading ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center">
                    <div className="flex flex-col justify-center items-center">
                      <div className="w-16 h-16 border-4 border-t-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="mt-4 text-gray-600">
                        Loading leadpool pipeline data...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (contacts.length === 0 || stages.length === 0) &&
                hasDataLoaded &&
                !isContentLoading &&
                pipelineId === currentLoadingPipelineId ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center">
                    <h2 className="text-2xl font-semibold text-primary mb-2">
                      Noch keine Kundenanfragen
                    </h2>
                    <p className="text-gray-600 text-xs mb-4">
                      You currently have no new customer inquiries.
                    </p>
                    <button className="bg-[#FFC107] hover:bg-[#FFCA2C] border-none text-black font-bold py-3 px-6 rounded-md flex items-center mx-auto">
                      <FaUserFriends className="mr-2" />
                      <span>Neue Kunden erhalten</span>
                    </button>
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleContactRowClick(contact)}
                  >
                    <td
                      className="py-4 px-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedContacts.has(contact.id)}
                        onChange={() => handleSelectContact(contact.id)}
                      />
                    </td>
                    <td className="py-4 px-2">
                      {contact.pipeline || "Leadpool Pipeline"}
                    </td>
                    <td className="py-4 px-2">{contact.firstName || "-"}</td>
                    <td className="py-4 px-2">{contact.lastName || "-"}</td>
                    <td className="py-4 px-2">{contact.company || "-"}</td>
                    <td className="py-4 px-2">{contact.phone || "-"}</td>
                    <td className="py-4 px-2">{contact.email}</td>
                    <td className="py-4 px-2">
                      <span className="bg-yellow-400 text-black px-2 py-0.5 rounded-full text-xs">
                        {contact.stage}
                      </span>
                    </td>
                    <td className="py-4 px-2">{contact.leadSource}</td>
                    <td className="py-4 px-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          contact.status === "Terminiert"
                            ? "bg-green-500 text-white"
                            : contact.status === "Nicht erreicht"
                            ? "bg-red-500 text-white"
                            : contact.status === "Follow up"
                            ? "bg-yellow-400 text-black"
                            : "bg-gray-500 text-white"
                        }`}
                      >
                        {contact.status}
                      </span>
                    </td>
                    <td className="py-4 px-2">{contact.createdAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modals */}
      <PipelineModal
        isOpen={isPipelineModalOpen}
        onClose={() => setIsPipelineModalOpen(false)}
        setIsCreatingPipeline={setIsCreatingPipeline}
        isLeadpoolMode={true}
      />
      <PropertiesModal
        isOpen={isPropertiesModalOpen}
        onClose={() => setIsPropertiesModalOpen(false)}
      />
      <NewDealModal
        isOpen={isNewDealModalOpen}
        onClose={() => setIsNewDealModalOpen(false)}
      />
      <TransferAgencyModel
        isOpen={transferAgency}
        onClose={() => setTransferAgency(false)}
        selectedCustomerIds={Array.from(selectedContacts)}
      />
      <ImportContactModal
        isOpen={isImportContactModalOpen}
        onClose={() => setIsImportContactModalOpen(false)}
        pipelines={pipelines.map((p) => ({
          id: p.id.toString(),
          name: p.name,
        }))}
        stages={stages}
      />
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        contact={
          selectedContact
            ? {
                ...selectedContact,
                pipeline_id:
                  (selectedContact as { pipeline_id?: string }).pipeline_id ||
                  "",
                stage_id:
                  (selectedContact as { stage_id?: string }).stage_id || "",
                customer: {
                  id:
                    (selectedContact as { customer?: { id?: string } }).customer
                      ?.id || "",
                  company_name:
                    (
                      selectedContact as {
                        customer?: { company_name?: string };
                      }
                    ).customer?.company_name ||
                    selectedContact.company ||
                    "",
                  website:
                    (selectedContact as { customer?: { website?: string } })
                      .customer?.website || "",
                  status:
                    (selectedContact as { customer?: { status?: string } })
                      .customer?.status || "",
                },
              }
            : null
        }
        currentPipelineId={pipelineId || undefined}
      />
      <ManageStageModal
        isOpen={isStageModalOpen}
        onClose={() => setIsStageModalOpen(false)}
        pipelines={pipelines.map((p) => ({
          id: p.id.toString(),
          name: p.name,
        }))}
        stages={stages}
        onCreateStage={handleCreateStage}
        onUpdateStage={handleUpdateStage}
        onDeleteStage={handleDeleteStage}
        currentPipelineId={pipelineId || undefined}
        isLoading={isLoadingStages}
      />
    </div>
  );
}
