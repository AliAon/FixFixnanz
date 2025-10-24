/* eslint-disable  @typescript-eslint/no-explicit-any */
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
import {
  fetchUsersByConsultant,
  fetchPipelinesWithCustomerCount,
  clearUsers,
} from "@/redux/slices/usersSlice";
import { fetchPipelineById } from "@/redux/slices/pipelineSlice";
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

// Updated PipelinesDropdown with proper customer counts from customer_stage table
const PipelinesDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { pipelinesWithCustomerCount } = useSelector(
    (state: RootState) => state.users
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPipelineId = searchParams.get("id");

  const handlePipelineClick = (pipelineId: string, pipelineType?: string) => {
    const url = pipelineType ?
      `/admin/pipeline?id=${pipelineId}&type=${pipelineType}` :
      `/admin/pipeline?id=${pipelineId}`;
    router.push(url);
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

  const currentPipeline = pipelinesWithCustomerCount.find(
    (p) => p.id === currentPipelineId
  );

  const pipelineType = searchParams.get("type");

  // Filter pipelines based on the current page type
  const filteredPipelines = pipelinesWithCustomerCount.filter((pipeline) => {
    if (pipelineType === 'agency') {
      return pipeline.type === 'agency';
    } else {
      return pipeline.type !== 'agency';
    }
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="mr-2 font-semibold text-white">
          {currentPipeline?.name || "Select Pipeline"}
        </span>
        <IoMdArrowDropdown className="text-white" />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-80 bg-[#00528B] text-white rounded-lg shadow-lg max-h-[400px] overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-gray-300 mb-2 px-2">
              Available Pipelines ({filteredPipelines.length})
            </div>

            {filteredPipelines.length > 0 ? (
              filteredPipelines.map((pipeline) => (
                <div
                  key={pipeline.id}
                  className={`flex items-center justify-between px-3 py-3 hover:bg-[#1477BC] rounded-lg cursor-pointer transition-colors ${currentPipelineId === pipeline.id ? 'bg-[#1477BC] border-l-4 border-yellow-400' : ''
                    }`}
                  onClick={() => handlePipelineClick(pipeline.id, pipeline.type)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{pipeline.name}</span>
                      {pipeline.type && (
                        <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                          {pipeline.type}
                        </span>
                      )}
                    </div>

                    {/* Show pipeline stages */}
                    {pipeline.stages && pipeline.stages.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {[...pipeline.stages]
                          .sort((a, b) => a.position - b.position)
                          .slice(0, 3) // Show first 3 stages
                          .map((stage) => (
                            <span
                              key={stage.id}
                              className="text-xs bg-white bg-opacity-10 text-gray-200 px-2 py-0.5 rounded-full border-l-2"
                              style={{ borderLeftColor: stage.color }}
                            >
                              {stage.name}
                            </span>
                          ))}
                        {pipeline.stages.length > 3 && (
                          <span className="text-xs text-gray-300">
                            +{pipeline.stages.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-3">
                    {/* Customer count badge - this represents total customer_stage records for all stages in this pipeline */}
                    <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                      {pipeline.customer_count || 0}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-center">
                <div className="text-gray-300 mb-2">No pipelines available</div>
                <div className="text-xs text-gray-400">
                  {pipelineType === 'agency'
                    ? 'No agency pipelines found'
                    : 'No pipelines found for this user'
                  }
                </div>
              </div>
            )}
          </div>

          {/* Footer with total count */}
          {filteredPipelines.length > 0 && (
            <div className="border-t border-white border-opacity-20 px-3 py-2">
              <div className="text-xs text-gray-300 text-center">
                Total Contacts: {filteredPipelines.reduce((sum, p) => sum + (p.customer_count || 0), 0)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function PipelinePage() {
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
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
  const {
    users,
    error: usersError,
  } = useSelector((state: RootState) => state.users);
  const [isCreatingPipeline, setIsCreatingPipeline] = useState(false);
  const [isLoadingStages, setIsLoadingStages] = useState(false);
  
  // Add state to track pipeline switching and data loading
  const [currentLoadingPipelineId, setCurrentLoadingPipelineId] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasDataLoaded, setHasDataLoaded] = useState(false);
  const [isSwitchingPipeline, setIsSwitchingPipeline] = useState(false);

  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);
  const [isPropertiesModalOpen, setIsPropertiesModalOpen] = useState(false);
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
  const [isImportContactModalOpen, setIsImportContactModalOpen] =
    useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
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

  // Stage-wise filtering state
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({});
  const [activeStageFilter, setActiveStageFilter] = useState<string | null>(null);
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);

  const firstStageId = useMemo(() => {
    return stages.length > 0 ? stages[0].id.toString() : null;
  }, [stages]);

  // Helper function to parse and extract additional data fields
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
              console.warn('Original data:', data);
              return {};
            }
          }
        }
      }
      
      return {};
    } catch (error) {
      console.warn('Failed to parse additional_data:', error);
      console.warn('Data:', data);
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

  // Update the fetchUsersByConsultant call to include stage filtering
  const refreshTableData = async (stageId?: string) => {
    if (!userId || !pipelineId) return;

   try {
    // If no specific stage is provided, refresh current active stage
    const targetStageId = stageId || activeStageFilter || firstStageId;

    if (targetStageId) {
      await dispatch(
        fetchUsersByConsultant({
          consultantId: userId,
          stage_id: targetStageId,
        })
      ).unwrap();
    }

    // Also refresh stage counts to ensure accuracy
    await loadAllStageCounts();

   } catch (error) {
     console.error("Failed to refresh table data:", error);
   }
 };


  const loadAllStageCounts = async () => {
    if (!stages.length || !userId || !pipelineId) return;

  console.log('Loading stage counts for all stages...');
  setIsLoadingCounts(true);

  try {
    const newStageCounts: Record<string, number> = {};

    // Load counts for each stage concurrently (faster than sequential)
    const stageCountPromises = stages.map(async (stage) => {
      try {
        const result = await dispatch(
          fetchUsersByConsultant({
            consultantId: userId,
            stage_id: stage.id,
          })
        ).unwrap();

        return {
          stageId: stage.id,
          count: Array.isArray(result) ? result.length : 0
        };
      } catch (error) {
        console.error(`Failed to load count for stage ${stage.name}:`, error);
        return {
          stageId: stage.id,
          count: 0
        };
      }
    });

    const stageCountResults = await Promise.all(stageCountPromises);

    stageCountResults.forEach(({ stageId, count }) => {
      newStageCounts[stageId] = count;
    });

    setStageCounts(newStageCounts);
    console.log('Stage counts loaded:', newStageCounts);
  } catch (error) {
    console.error("Failed to load stage counts:", error);
  } finally {
    setIsLoadingCounts(false);
  }
};
  // Handle stage filter click
  const handleStageFilterClick = async (stageId: string) => {
    console.log(`Filtering by stage: ${stageId}`);

    if (activeStageFilter === stageId) {
      // If clicking the same stage again, do nothing (keep it selected)
      return;
    }

    // Select new stage filter
    setActiveStageFilter(stageId);

    // Load contacts for this specific stage
    await dispatch(
      fetchUsersByConsultant({
        consultantId: userId!,
        stage_id: stageId,
      })
    ).unwrap();
  };

  // Set first stage as active when stages load and load its data
  useEffect(() => {
    if (userId && pipelineId && firstStageId && pipelineId === currentLoadingPipelineId && !hasDataLoaded) {
      const loadUsers = async () => {
        try {
          console.log('Loading initial data for pipeline:', pipelineId);

          // Load counts for all stages
          await loadAllStageCounts();

          // Load contacts for the FIRST stage initially
          await dispatch(
            fetchUsersByConsultant({
              consultantId: userId,
              stage_id: firstStageId,
            })
          ).unwrap();

          // Set the first stage as active
          setActiveStageFilter(firstStageId);

          if (pipelineId === currentLoadingPipelineId) {
            setHasDataLoaded(true);
            setIsSwitchingPipeline(false);
          }
        } catch (error) {
          console.error("Failed to load users:", error);
          if (pipelineId === currentLoadingPipelineId) {
            setHasDataLoaded(true);
            setIsSwitchingPipeline(false);
          }
        }
      };

      loadUsers();
    }
  }, [userId, pipelineId, firstStageId, dispatch, currentLoadingPipelineId, hasDataLoaded]);

  // Reset stage filter when switching pipelines
  useEffect(() => {
    if (pipelineId !== currentLoadingPipelineId) {
      setActiveStageFilter(null);
      setStageCounts({});
    }
  }, [pipelineId, currentLoadingPipelineId]);

  // Fetch pipelines with customer count on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await dispatch(fetchPipelinesWithCustomerCount()).unwrap();
        setIsInitialLoad(false);
      } catch (error) {
        console.error("Failed to fetch pipelines:", error);
        setIsInitialLoad(false);
      }
    };
    loadInitialData();
  }, [dispatch]);

  // Handle initial pipeline load from URL
  useEffect(() => {
    if (pipelineId && !isInitialLoad && !currentLoadingPipelineId) {
      setIsSwitchingPipeline(true);
      setCurrentLoadingPipelineId(pipelineId);
      setHasDataLoaded(false);
      dispatch(clearUsers());
      dispatch(clearStages());
    }
  }, [pipelineId, isInitialLoad, currentLoadingPipelineId, dispatch]);

  // Handle pipeline switching and data loading
  useEffect(() => {
    if (!pipelineId) {
      setIsSwitchingPipeline(false);
      setHasDataLoaded(false);
      setCurrentLoadingPipelineId(null);
      setSelectedContacts(new Set());
      setActiveStageFilter(null);
      dispatch(clearUsers());
      dispatch(clearStages());
      return;
    }

    // If we're switching to a different pipeline, mark as loading
    if (pipelineId !== currentLoadingPipelineId) {
      setIsSwitchingPipeline(true);
      setCurrentLoadingPipelineId(pipelineId);
      setHasDataLoaded(false);
      setSelectedContacts(new Set());
      setActiveStageFilter(null);
      dispatch(clearUsers());
      dispatch(clearStages());
      
      // Load pipeline and stages data
      const loadPipelineData = async () => {
        try {
          await Promise.all([
            dispatch(fetchPipelineById(pipelineId)).unwrap(),
            dispatch(fetchStagesByPipeline(pipelineId)).unwrap()
          ]);
          setIsSwitchingPipeline(false);
        } catch (error) {
          console.error("Failed to load pipeline data:", error);
          setIsSwitchingPipeline(false);
        }
      };
      
      loadPipelineData();
    }
  }, [pipelineId, dispatch, currentLoadingPipelineId]);

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
      const newStage = await dispatch(createStage(data)).unwrap();
      if (pipelineId) {
        // Fetch updated stages list first
        await dispatch(fetchStagesByPipeline(pipelineId)).unwrap();

        // Initialize count for the new stage immediately
        if (newStage?.id) {
          setStageCounts(prev => ({
            ...prev,
            [newStage.id]: 0 // New stage starts with 0 contacts
          }));
        }

        // Then refresh all stage counts to ensure accuracy
        await loadAllStageCounts();

        // If this is the first stage, automatically set it as active and load its data
        if (stages.length === 0 && newStage?.id) {
          setActiveStageFilter(newStage.id);
          await dispatch(
            fetchUsersByConsultant({
              consultantId: userId!,
              stage_id: newStage.id,
            })
          ).unwrap();
        }
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
        await loadAllStageCounts(); // Refresh stage counts after updating stage
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
        await loadAllStageCounts(); // Refresh stage counts after deleting stage
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
    return isSwitchingPipeline || (pipelineId && pipelineId === currentLoadingPipelineId && !hasDataLoaded);
  }, [pipelineId, currentLoadingPipelineId, hasDataLoaded, isSwitchingPipeline]);

  // Convert users to contacts format - only if data is for current pipeline
  const contacts: Contact[] = useMemo(() => {
    // Always return empty during any loading state or pipeline switching
    if (isSwitchingPipeline || isContentLoading || !hasDataLoaded || !pipelineId) {
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

    console.log('Raw users data:', users); // Debug log

    return (users as unknown as Array<Record<string, unknown>>).map((item, index) => {
      console.log(`Processing user ${index}:`, item); // Debug log
      
      // Extract data from the new API structure
      const user =
        ((item as Record<string, unknown>).user as Record<string, unknown>) ||
        item ||
        {};
      const customer =
        ((item as Record<string, unknown>).customer as Record<string, unknown>) ||
        {};
      const stage =
        ((item as Record<string, unknown>).stage as Record<string, unknown>) ||
        {};
      const pipeline =
        ((item as Record<string, unknown>).pipeline as Record<string, unknown>) ||
        {};

      console.log(`User ${index} - customer.additional_data:`, customer?.additional_data); // Debug log

      // Parse additional_data to get created_time
      const additionalData = parseAdditionalData(customer?.additional_data);
      const createdTime = additionalData?.created_time;

      const contact = {
        id: String(user?.id || customer?.id || item?.id || ""),
        firstName: String(user?.first_name || ""),
        lastName: String(user?.last_name || ""),
        company: String(customer?.company_name || ""),
        phone: String(user?.lead_phone || user?.phone || ""),
        email: String(user?.lead_email || user?.email || ""),
        stage: String(stage?.name || ""),
        leadSource: String(pipeline?.name || currentPipeline?.source || ""),
        status: String(customer?.status || "No Status"),
        platform: String(customer?.platform || ""),
        additional_data: customer?.additional_data || null, // Add additional_data field
        createdAt:
          createdTime
            ? new Date(createdTime)
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
            : customer?.created_at || user?.created_at
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
        pipeline_id: String(pipeline?.id || ""),
        stage_id: String(stage?.id || ""),
        company_name: String(customer?.company_name || ""),
        customer: {
          id: String(customer?.id || ""),
          company_name: String(customer?.company_name || ""),
          website: String(customer?.website || user?.website || ""),
          status: String(customer?.status || ""),
          platform: String(customer?.platform || ""),
        },
      };

      console.log(`Processed contact ${index}:`, contact); // Debug log
      return contact;
    });
  }, [users, hasDataLoaded, pipelineId, currentLoadingPipelineId, currentPipeline, isContentLoading, isSwitchingPipeline]);

  // Extract all unique additional data fields from contacts
  const additionalDataFields = useMemo(() => {
    console.log('Extracting additional data fields from contacts:', contacts); // Debug log
    
    const fields = new Set<string>();
    
    contacts.forEach((contact, index) => {
      console.log(`Contact ${index} additional_data:`, contact.additional_data); // Debug log
      
      if (contact.additional_data) {
        const parsedData = parseAdditionalData(contact.additional_data);
        console.log(`Contact ${index} parsed data:`, parsedData); // Debug log
        
        Object.keys(parsedData).forEach(key => {
          // Exclude certain meta fields that shouldn't be displayed as columns
          if (key !== 'created_time' && key !== 'id' && key !== 'form_id') {
            fields.add(key);
            console.log(`Added field: ${key}`); // Debug log
          }
        });
      }
    });
    
    const fieldsArray = Array.from(fields).sort();
    console.log('Final additional data fields:', fieldsArray); // Debug log
    
    return fieldsArray;
  }, [contacts]);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'fb':
        return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjvzC_QRv6moAhgNb5C6e3yicKgFND1g2RwA&s";
      case 'ig':
        return "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/2048px-Instagram_icon.png";
      case 'meta':
        return "/meta-icon.png";
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

                <div className="flex items-center bg-white bg-opacity-10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white border-opacity-20">
                  <div className="flex items-center gap-3">
                    {/* Pipeline Icon */}
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center" style={{ backgroundColor: '#002d51' }}>
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                    </div>

                    {/* Pipeline Info */}
                    <div className="flex flex-col">
                      <span className="text-white font-semibold text-sm leading-tight">
                        {isContentLoading ? (
                          <div className="w-32 h-4 bg-white bg-opacity-20 rounded animate-pulse"></div>
                        ) : (
                          currentPipelineWithCount?.name || currentPipeline?.name || "No Pipeline Selected"
                        )}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {currentPipelineWithCount?.type && (
                          <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: '#002d51', opacity: 0.8 }}>
                            {currentPipelineWithCount.type}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Customer Count Badge */}
                    <div className="ml-4 flex items-center justify-center">
                      {isContentLoading ? (
                        <div className="w-8 h-8 bg-opacity-30 rounded-full animate-pulse" style={{ backgroundColor: '#FFC107' }}></div>
                      ) : (
                        <div className="text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm" style={{ backgroundColor: '#FFC107' }}>
                          {displayCustomerCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              <PipelinesDropdown />

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
              <div className="animate-pulse bg-gray-200 rounded px-3 py-1 h-8 w-24"></div>
              <div className="animate-pulse bg-gray-200 rounded px-3 py-1 h-8 w-20"></div>
              <div className="animate-pulse bg-gray-200 rounded px-3 py-1 h-8 w-28"></div>
            </div>
          ) : (
            <>
                {stages.map((stage) => {
                  const stageContactCount = stageCounts[stage.id] || 0;
                  const isActive = activeStageFilter === stage.id;

                  return (
                    <button
                      key={stage.id}
                    onClick={() => handleStageFilterClick(stage.id)}
                    className={`flex items-center gap-1 border rounded px-3 py-1 transition-colors cursor-pointer ${isActive
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white border-gray-300 hover:bg-gray-50"
                      }`}
                    style={{
                      borderColor: isActive ? '#3B82F6' : stage.color,
                      backgroundColor: isActive ? '#3B82F6' : 'white'
                    }}
                    title={`Filter by ${stage.name} stage - ${stageContactCount} contacts`}
                    disabled={isLoadingCounts}
                  >
                    <span className={isActive ? 'text-white' : 'text-gray-800'}>
                      {stage.name}
                    </span>
                    <span className={`rounded-full w-5 h-5 flex items-center justify-center text-xs ${isActive
                      ? 'bg-white text-blue-500'
                      : 'bg-gray-200 text-gray-700'
                      }`}>
                      {isLoadingCounts ? '...' : stageContactCount}
                    </span>
                  </button>
                );
              })}

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
                  disabled={contacts.length === 0}
                />
              </th>
              <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                Agency Pipeline
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
                {/* Dynamic additional data columns */}
                {additionalDataFields.map((field) => (
                  <th key={field} className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                    {formatFieldName(field)}
                  </th>
                ))}
              <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                Stage
              </th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                Platform
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
              {isContentLoading ? (
                <tr>
                  <td colSpan={12 + additionalDataFields.length} className="py-16 text-center">
                    <div className="flex flex-col justify-center items-center">
                      <div className="w-16 h-16 border-4 border-t-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="mt-4 text-gray-600">
                        Loading pipeline data...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (contacts.length === 0 || stages.length === 0) && hasDataLoaded && !isContentLoading && pipelineId === currentLoadingPipelineId ? (
                <tr>
                  <td colSpan={12 + additionalDataFields.length} className="py-16 text-center">
                    <h2 className="text-2xl font-semibold text-primary mb-2">
                      Noch keine Kundenanfragen
                    </h2>
                    <p className="text-gray-600 text-xs mb-4">
                      You currently have no customer inquiries in this stage.
                    </p>
                    <button className="bg-[#FFC107] hover:bg-[#FFCA2C] border-none text-black font-bold py-3 px-6 rounded-md flex items-center mx-auto">
                      <FaUserFriends className="mr-2" />
                      <span>Neue Kunden erhalten</span>
                    </button>
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => {
                  const additionalData = parseAdditionalData(contact.additional_data);
                  
                  // Determine row background color based on status - skip for "No Status"
                  const getRowBackgroundColor = (status: string) => {
                    switch (status) {
                      case "Terminiert":
                        return "bg-[#157347] bg-opacity-30"; // Darker green
                      case "Nicht erreicht":
                        return "bg-[#0D6EFD] bg-opacity-30"; // Darker blue
                      case "Follow up":
                        return "bg-[#FFC107] bg-opacity-40"; // Darker yellow
                      case "Ungeeignet":
                        return "bg-[#DC3545] bg-opacity-30"; // Darker red
                      default:
                        return ""; // No background for "No Status" or unknown status
                    }
                  };

                  const rowClass = `${getRowBackgroundColor(contact.status)} hover:bg-opacity-50 cursor-pointer transition-colors`;

                  return (
                    <tr
                      key={contact.id}
                      className={rowClass}
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
                        {contact.pipeline || "Agency Pipeline"}
                      </td>
                      <td className="py-4 px-2">{contact.firstName || "-"}</td>
                      <td className="py-4 px-2">{contact.lastName || "-"}</td>
                      <td className="py-4 px-2">{contact.company || "-"}</td>
                      <td className="py-4 px-2">{contact.phone || "-"}</td>
                      <td className="py-4 px-2">{contact.email}</td>
                      {/* Dynamic additional data columns */}
                      {additionalDataFields.map((field) => (
                        <td key={field} className="py-4 px-2">
                          <span className="text-sm text-gray-700">
                            {formatFieldValue(additionalData[field])}
                          </span>
                        </td>
                      ))}
                      <td className="py-4 px-2">
                        <span className="bg-yellow-400 text-black px-2 py-0.5 rounded-full text-xs">
                          {contact.stage}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2">
                          {contact.platform && (contact.platform == 'fb' || contact.platform == 'ig') ? (
                            <>
                              <img
                                src={getPlatformIcon(contact.platform)}
                                alt={getPlatformLabel(contact.platform)}
                                className="w-5 h-5 rounded"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-500">M</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            contact.status === "Terminiert"
                            ? "bg-[#157347] text-white"
                              : contact.status === "Nicht erreicht"
                              ? "bg-[#0D6EFD] text-white"
                              : contact.status === "Follow up"
                                ? "bg-[#FFC107] text-black"
                                : contact.status === "Ungeeignet"
                                  ? "bg-[#DC3545] text-white"
                              : "bg-gray-500 text-white"
                          }`}
                        >
                          {contact.status}
                        </span>
                      </td>
                      <td className="py-4 px-2">{contact.createdAt}</td>
                    </tr>
                  );
                })
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
    />
    <PropertiesModal
      isOpen={isPropertiesModalOpen}
      onClose={() => setIsPropertiesModalOpen(false)}
    />
    <NewDealModal
      isOpen={isNewDealModalOpen}
      onClose={() => setIsNewDealModalOpen(false)}
        onContactAdded={async (stageId?: string) => {
          console.log('Contact added to stage:', stageId);

          // If stage ID is provided, increment that stage's count immediately
          if (stageId) {
            setStageCounts(prev => {
              const newCounts = {
                ...prev,
                [stageId]: (prev[stageId] || 0) + 1
              };
              console.log('Updated stage counts:', newCounts);
              return newCounts;
            });
          }

          // Small delay to ensure state update, then refresh
          await new Promise(resolve => setTimeout(resolve, 100));

          // Refresh all stage counts for accuracy
          await loadAllStageCounts();

        // Refresh the current stage's contacts if it matches
        if (activeStageFilter && (!stageId || stageId === activeStageFilter)) {
          await dispatch(
            fetchUsersByConsultant({
              consultantId: userId!,
              stage_id: activeStageFilter,
            })
          ).unwrap();
        }
      }}
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
        onImportComplete={async (importedStageId?: string, importedCount?: number) => {
          // If stage ID and count provided, update that stage's count immediately
          if (importedStageId && importedCount) {
            setStageCounts(prev => ({
              ...prev,
              [importedStageId]: (prev[importedStageId] || 0) + importedCount
            }));
          }

          // Refresh all stage counts for accuracy
          await loadAllStageCounts();

        // Refresh the current stage's contacts if it matches
        if (activeStageFilter && (!importedStageId || importedStageId === activeStageFilter)) {
          await dispatch(
            fetchUsersByConsultant({
              consultantId: userId!,
              stage_id: activeStageFilter,
            })
          ).unwrap();
        }
      }}
    />
    <ContactModal
      isOpen={isContactModalOpen}
      onClose={() => setIsContactModalOpen(false)}
      contact={
        selectedContact
          ? {
              ...selectedContact,
            pipeline_id: selectedContact.pipeline_id || pipelineId || "",
            stage_id: selectedContact.stage_id || activeStageFilter || "", // Use the filtered stage
              customer: {
                id: selectedContact.customer?.id || "",
                company_name: selectedContact.customer?.company_name || selectedContact.company || "",
                website: selectedContact.customer?.website || "",
                status: selectedContact.status || "",
              },
            }
          : null
      }
      currentPipelineId={pipelineId || undefined}
        onStatusUpdate={refreshTableData}
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