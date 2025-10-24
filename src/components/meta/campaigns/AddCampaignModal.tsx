// src/components/meta/campaigns/AddCampaignModal.tsx
/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { createCampaign } from '@/redux/slices/campaignSlice';
import { createUserWithConsultant } from '@/redux/slices/usersSlice';
import { fetchAccounts, fetchCampaigns as fetchMetaCampaigns, fetchLeads } from '@/redux/slices/metaGraphSlice';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import { 
  Users, 
  Target, 
  ChevronRight, 
  Check, 
  Download, 
  Loader2,
  AlertCircle,
  User,
  Building2,
  BarChart3,
  Database,
  X,
  Plus
} from 'lucide-react';
import api from '../../../redux/api/axiosConfig';
import { toast } from 'react-toastify';

interface AddCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Pipeline {
  id: string;
  name: string;
  type: string;
  description?: string;
  user_id: string;
}

interface Stage {
  id: string;
  name: string;
  pipeline_id: string;
}

interface Account {
  id: string;
  name: string;
  account_status: number;
  currency: string;
  timezone_name: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  account_id: string;
}

interface Lead {
  id: string;
  created_time: string;
  form_id: string;
  field_data: Array<{
    name: string;
    values: string[];
  }>;
  platform?: 'fb' | 'ig';
  campaign_id?: string;
  ad_id?: string;
}

const LeadsList = ({ leads }: { leads: Lead[] }) => {
  const getFieldValue = (lead: Lead, fieldName: string) => {
    const field = lead.field_data.find(f => f.name === fieldName);
    return field?.values?.[0] || 'N/A';
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 sticky top-0">
        <h3 className="font-medium text-gray-700">Leads ({leads.length})</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {leads.map((lead) => (
          <div key={lead.id} className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {getFieldValue(lead, 'full_name') || 'Unknown Name'}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                  <span>{getFieldValue(lead, 'email')}</span>
                  <span>{getFieldValue(lead, 'phone_number')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {lead.platform === 'fb' ? (
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjvzC_QRv6moAhgNb5C6e3yicKgFND1g2RwA&s"
                    alt="Facebook"
                    className="w-6 h-6 rounded"
                  />
                ) : (
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/2048px-Instagram_icon.png"
                    alt="Instagram"
                    className="w-6 h-6 rounded"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export const getPlatformLabel = (platform: 'fb' | 'ig' | 'meta' | undefined): string => {
  switch (platform) {
    case 'fb':
      return 'Facebook';
    case 'ig':
      return 'Instagram';
    case 'meta':
      return 'Meta';
    default:
      return 'Unknown';
  }
};

export const getPlatformIcon = (platform: 'fb' | 'ig' | 'meta' | undefined): string => {
  switch (platform) {
    case 'fb':
      return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjvzC_QRv6moAhgNb5C6e3yicKgFND1g2RwA&s';
    case 'ig':
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/2048px-Instagram_icon.png';
    default:
      return '';
  }
};

export const AddCampaignModal: React.FC<AddCampaignModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const metaAllAccounts = useSelector((state: RootState) => state.metaGraph.accounts);
  const metaAllCampaigns = useSelector((state: RootState) => state.metaGraph.campaigns);
  const metaLeads = useSelector((state: RootState) => state.metaGraph.leads);
  const loading = useSelector((state: RootState) => state.metaGraph.loading);

  // Local state
  const [users, setUsers] = useState<User[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [campaignName, setCampaignName] = useState('');
  
  // Selection state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPipeline, setPipeline] = useState<Pipeline | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  
  // Pipeline creation state
  const [pipelineOption, setPipelineOption] = useState<'existing' | 'new'>('existing');
  const [newPipelineName, setNewPipelineName] = useState('');
  const [newStageName, setNewStageName] = useState('Standard');
  
  // Export state
  const [exportProgress, setExportProgress] = useState(0);
  const [exportResults, setExportResults] = useState<{
    success: number;
    skipped: number;
    failed?: Array<{lead: Lead, error: string}>
    duplicates?: Array<{lead: Lead, email: string}>
  } | null>(null);
  
  // Loading states
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingPipelines, setIsLoadingPipelines] = useState(false);
  const [isLoadingStages, setIsLoadingStages] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      dispatch(fetchAccounts());
      resetExportState();
    }
  }, [isOpen, dispatch]);

  // Fetch pipelines when user changes
  useEffect(() => {
    if (selectedUser?.id) {
      fetchPipelines(selectedUser.id);
    } else {
      setPipelines([]);
      setPipeline(null);
      setPipelineOption('existing');
    }
  }, [selectedUser]);

  // Fetch stages when pipeline is selected
  useEffect(() => {
    if (selectedPipeline && pipelineOption === 'existing') {
      fetchStages(selectedPipeline.id);
    }
  }, [selectedPipeline, pipelineOption]);

  // Fetch campaigns when account is selected
  useEffect(() => {
    if (selectedAccount) {
      dispatch(fetchMetaCampaigns(selectedAccount.id));
    }
  }, [selectedAccount, dispatch]);

  // Fetch leads when campaign is selected
  useEffect(() => {
    if (selectedCampaign) {
      fetchCampaignLeads(selectedCampaign.id);
      resetExportState();
    }
  }, [selectedCampaign]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
        let allUsers: User[] = [];
        let page = 1;
        let hasNextPage = true;

        // Fetch all pages of users
        while (hasNextPage) {
          const response = await api.get(`/users/financial-advisor?page=${page}&limit=50`);
          const { data, hasNextPage: hasNext } = response.data;

          // Add users from current page to the collection
          allUsers = [...allUsers, ...data];

          // Update pagination info
          hasNextPage = hasNext;
          page++;
        }

        setUsers(allUsers);
    } catch (err) {
      setError(`Failed to fetch users: ${err}`);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchPipelines = async (userId: string) => {
    setIsLoadingPipelines(true);
    try {
      const response = await api.get(`/pipeline/user/${userId}`);
      const metaPipelines = response.data.filter((pipeline: Pipeline) => pipeline.type === 'meta');
      setPipelines(metaPipelines);
      
      // If no meta pipelines exist, automatically switch to 'new' option
      if (metaPipelines.length === 0) {
        setPipelineOption('new');
      } else {
        setPipelineOption('existing');
      }
    } catch (err) {
      setError(`Failed to fetch pipelines: ${err}`);
      setPipelines([]);
      setPipelineOption('new'); // Default to creating new pipeline on error
    } finally {
      setIsLoadingPipelines(false);
    }
  };

  const fetchStages = async (pipelineId: string) => {
    setIsLoadingStages(true);
    try {
      const response = await api.get(`/stage/pipelines/${pipelineId}`);
      setStages(response.data);
    } catch (err) {
      setError(`Failed to fetch stages: ${err}`);
    } finally {
      setIsLoadingStages(false);
    }
  };

  const fetchCampaignLeads = async (campaignId: string) => {
    try {
      const adsResponse = await api.get(`/meta-graph/campaigns/${campaignId}/ads`);
      const ads = adsResponse.data;
      
      const leadsPromises = ads.map(async (ad: any) => {
        try {
          const formId = ad.form_id || ad.id;
          return await dispatch(fetchLeads(formId)).unwrap();
        } catch (error) {
          console.error(`Error fetching leads for ad ${ad.id}:`, error);
          return [];
        }
      });

      await Promise.all(leadsPromises);
    } catch (err) {
      setError(`Failed to fetch campaign leads: ${err}`);
    }
  };

  const createPipelineForUser = async (pipelineData: any, userId: string) => {
    try {
      const response = await api.post(`/pipeline/for-user/${userId}`, pipelineData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const createStageForPipeline = async (stageData: any, pipelineId: string) => {
    try {
      const response = await api.post(`/stage/for-pipeline/${pipelineId}`, stageData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };


  const transformFieldDataToObject = (fieldData: Array<{name: string, values: string[]}>, createdTime?: string) => {
    const result: Record<string, string> = {};
    
    // Fields to exclude from additional_data (since they're stored in user/customer tables)
    const excludeFields = ['full_name', 'email', 'phone_number', 'name_des_unternehmens'];
    
    // Transform field_data array to key-value pairs, excluding standard fields
    fieldData.forEach(field => {
      if (field.values && field.values.length > 0 && !excludeFields.includes(field.name)) {
        result[field.name] = field.values[0]; // Take the first value
      }
    });
    
    // Add created_time if provided
    if (createdTime) {
      result.created_time = createdTime;
    }
    
    return result;
  };


  const handleCreateAndExport = async () => {
    // Validate required fields
    if (!campaignName || !selectedUser || !selectedAccount || !selectedCampaign) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate pipeline selection based on option
    if (pipelineOption === 'existing') {
      if (!selectedPipeline || !selectedStage) {
        setError('Please select a pipeline and stage');
        return;
      }
    } else {
      if (!newPipelineName.trim()) {
        setError('Please enter a pipeline name');
        return;
      }
    }

    // Reset states and show loading indicators
    setIsCreating(true);
    setIsExporting(true);
    setExportProgress(0);
    setExportResults(null);
    setError(null);
    
    const failedLeads: Array<{lead: Lead, error: string}> = [];
    const duplicateLeads: Array<{lead: Lead, email: string}> = [];

    try {
      let finalPipelineId = selectedPipeline?.id;
      let finalStageId = selectedStage?.id;

      // Create new pipeline and stage if needed
      if (pipelineOption === 'new') {
        // Create pipeline for the selected user using the dedicated endpoint
        const newPipeline = await createPipelineForUser({
          name: newPipelineName,
          source: 'meta',
          type: 'meta'
        }, selectedUser.id);

        finalPipelineId = newPipeline.id.toString();

        // Create new stage for the pipeline using the new endpoint
        const newStage = await createStageForPipeline({
          name: newStageName || 'Standard',
          color: '#10b981',
          position: 1
        }, finalPipelineId || '');

        finalStageId = newStage.id;
      }

      // Create the campaign with final pipeline and stage IDs
      const campaignData = {
        name: campaignName,
        user_id: selectedUser.id,
        pipeline_id: finalPipelineId!,
        stage_id: finalStageId!,
        account_id: selectedAccount.id,
        ads_id: selectedCampaign.id,
        status: 'active'
      };

      const createdCampaign = await dispatch(createCampaign(campaignData)).unwrap();
      console.log('Campaign created:', createdCampaign);

      // Process leads in batches if we have any
      if (metaLeads.length > 0) {
        let successCount = 0;
        const batchSize = 5; // Optimal batch size for performance

        for (let i = 0; i < metaLeads.length; i += batchSize) {
          const batch = metaLeads.slice(i, i + batchSize);
          
        // Update the lead processing section in your handleCreateAndExport function
        const results = await Promise.allSettled(
          batch.map(async (lead) => {
            try {
              const fieldData = lead.field_data || [];
              const nameField = fieldData.find(field => field.name === 'full_name');
              const emailField = fieldData.find(field => field.name === 'email');
              const phoneField = fieldData.find(field => field.name === 'phone_number');
              const companyField = fieldData.find(field => field.name === 'name_des_unternehmens');

              const additionalData = transformFieldDataToObject(lead.field_data, lead.created_time);
              const userData = {
                first_name: nameField?.values[0]?.split(' ')[0] || '',
                last_name: nameField?.values[0]?.split(' ').slice(1).join(' ') || '',
                email: emailField?.values[0] || '',
                phone: phoneField?.values[0] || '',
                company_id: companyField?.values[0] || undefined,
                pipeline_id: finalPipelineId!,
                stage_id: finalStageId!,
                consultant_id: selectedUser.id,
                platform: (lead.platform ?? 'meta') as 'meta' | 'fb' | 'ig' | 'manual' | undefined,
                additional_data: additionalData // Add the additional data
              };

              // Try to create the user
              await dispatch(createUserWithConsultant(userData)).unwrap();
              return { status: 'success' };
              
            } catch (error: any) {
              const errorMsg = error.payload || error.message || 'Failed to create user';
              
              // Check if this is a duplicate user error
              if (errorMsg.includes('User already exists')) {
                const email = lead.field_data.find(f => f.name === 'email')?.values[0] || '';
                duplicateLeads.push({ 
                  lead: { 
                    ...lead, 
                    platform: lead.platform === 'fb'
                      ? 'fb'
                      : lead.platform === 'ig'
                      ? 'ig'
                      : undefined
                  } as Lead, 
                  email 
                });
                return { status: 'duplicate', error: errorMsg };
              }
              
              // For other errors
              failedLeads.push({ 
                lead: { 
                    ...lead, 
                    platform: lead.platform === 'fb'
                      ? 'fb'
                      : lead.platform === 'ig'
                      ? 'ig'
                      : undefined
                  } as Lead, 
                error: errorMsg 
              });
              return { status: 'failed', error: errorMsg };
            }
          })
        );

          // Process the batch results
          results.forEach(result => {
            if (result.status === 'fulfilled') {
              if (result.value.status === 'success') {
                successCount++;
              }
            }
          });

          // Update progress
          setExportProgress(Math.round(((i + batchSize) / metaLeads.length) * 100));
        }

        // Set final results
        setExportResults({
          success: successCount,
          skipped: duplicateLeads.length,
          failed: failedLeads,
          duplicates: duplicateLeads
        });

        // Show appropriate toast messages
        if (duplicateLeads.length > 0 && failedLeads.length > 0) {
          toast.error(
            `Processed ${successCount} leads, skipped ${duplicateLeads.length} duplicates, and failed to import ${failedLeads.length} leads`
          );
        } else if (duplicateLeads.length > 0) {
          toast.warning(
            `Processed ${successCount} leads (${duplicateLeads.length} duplicates skipped)`
          );
        } else if (failedLeads.length > 0) {
          toast.error(
            `Processed ${successCount} leads but failed to import ${failedLeads.length} leads`
          );
        } else {
          toast.success(`Successfully processed ${successCount} leads`);
        }
      }

      // Success message for pipeline creation
      if (pipelineOption === 'new') {
        toast.success(`Campaign created successfully with new pipeline: ${newPipelineName}`);
      } else {
        toast.success('Campaign created successfully');
      }

      // Close modal if everything went well
      onClose();
      resetForm();

    } catch (err: any) {
      console.error('Create and export error:', err);
      
      // Handle different error types
      const errorMsg = err.payload || err.message || 'Failed to create campaign';
      
      if (errorMsg.includes('User already exists')) {
        setError('Some leads were skipped because they already exist in the system');
        toast.warning('Some leads already exist and were skipped');
      } else {
        setError(errorMsg);
        toast.error(errorMsg);
      }
      
    } finally {
      setIsCreating(false);
      setIsExporting(false);
    }
  };
        
  const resetForm = () => {
    setCampaignName('');
    setSelectedUser(null);
    setPipeline(null);
    setSelectedStage(null);
    setSelectedAccount(null);
    setSelectedCampaign(null);
    setStages([]);
    setPipelineOption('existing');
    setNewPipelineName('');
    setNewStageName('');
    setError(null);
    resetExportState();
  };

  const resetExportState = () => {
    setExportProgress(0);
    setExportResults(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Campaign" size="xl">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
              <button 
                onClick={() => setError(null)} 
                className="ml-auto text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Selection Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Enter campaign name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Part 1: Users & Pipeline */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Users & Pipeline Management
              </h3>

              {/* Users Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User *
                </label>
                {isLoadingUsers ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600">Loading users...</span>
                  </div>
                ) : (
                  <select
                    value={selectedUser?.id || ''}
                    onChange={(e) => {
                      const user = users.find(u => u.id === e.target.value);
                      setSelectedUser(user || null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a user...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Pipeline Option Selection */}
              {selectedUser && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Pipeline Selection *
                  </label>
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="existing"
                        checked={pipelineOption === 'existing'}
                        onChange={(e) => setPipelineOption(e.target.value as 'existing' | 'new')}
                        disabled={pipelines.length === 0}
                        className="mr-2"
                      />
                      <span className={pipelines.length === 0 ? 'text-gray-400' : 'text-gray-700'}>
                        Use Existing Meta Pipeline
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="new"
                        checked={pipelineOption === 'new'}
                        onChange={(e) => setPipelineOption(e.target.value as 'existing' | 'new')}
                        className="mr-2"
                      />
                      <span className="text-gray-700">Create New Meta Pipeline</span>
                    </label>
                  </div>

                  {pipelines.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span className="text-yellow-800 text-sm">
                          No Meta pipelines found for this user. A new pipeline will be created.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Existing Pipeline Selection */}
              {selectedUser && pipelineOption === 'existing' && pipelines.length > 0 && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Meta Pipeline *
                    </label>
                    {isLoadingPipelines ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-600">Loading pipelines...</span>
                      </div>
                    ) : (
                      <select
                        value={selectedPipeline?.id || ''}
                        onChange={(e) => {
                          const pipeline = pipelines.find(p => p.id === e.target.value);
                          setPipeline(pipeline || null);
                          setSelectedStage(null);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Choose a pipeline...</option>
                        {pipelines.map(pipeline => (
                          <option key={pipeline.id} value={pipeline.id}>
                            {pipeline.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Stages Selection */}
                  {selectedPipeline && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Stage *
                      </label>
                      {isLoadingStages ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-gray-600">Loading stages...</span>
                        </div>
                      ) : (
                        <select
                          value={selectedStage?.id || ''}
                          onChange={(e) => {
                            const stage = stages.find(s => s.id === e.target.value);
                            setSelectedStage(stage || null);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Choose a stage...</option>
                          {stages.map(stage => (
                            <option key={stage.id} value={stage.id}>
                              {stage.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* New Pipeline Creation */}
              {selectedUser && pipelineOption === 'new' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Pipeline Name *
                    </label>
                    <input
                      type="text"
                      value={newPipelineName}
                      onChange={(e) => setNewPipelineName(e.target.value)}
                      placeholder="Enter pipeline name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Pipeline Type: Meta (automatically assigned)
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Stage Name *
                    </label>
                    <input
                      type="text"
                      value={newStageName}
                      onChange={(e) => setNewStageName(e.target.value)}
                      placeholder="Enter stage name (e.g. Lead, Prospect, Customer)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      This will be the first stage in your new pipeline
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Part 2: Meta Graph Data */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Meta Graph Data Selection
              </h3>

              {/* Accounts Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Account *
                </label>
                {loading.accounts ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600">Loading accounts...</span>
                  </div>
                ) : (
                  <select
                    value={selectedAccount?.id || ''}
                    onChange={(e) => {
                      const account = metaAllAccounts.find(a => a.id === e.target.value);
                      setSelectedAccount(account || null);
                      setSelectedCampaign(null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Choose an account...</option>
                    {metaAllAccounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} ({account.id})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Campaigns Selection */}
              {selectedAccount && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Campaign *
                  </label>
                  {loading.campaigns ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-600">Loading campaigns...</span>
                    </div>
                  ) : (
                    <select
                      value={selectedCampaign?.id || ''}
                      onChange={(e) => {
                        const campaign = metaAllCampaigns.find(c => c.id === e.target.value);
                        setSelectedCampaign(campaign || null);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Choose a campaign...</option>
                      {metaAllCampaigns.map(campaign => (
                        <option key={campaign.id} value={campaign.id}>
                          {campaign.name} ({campaign.id})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            {/* Leads Section */}
            {selectedCampaign && (
              <div className="space-y-4">
                {metaLeads.length > 0 ? (
                  <>
                    <LeadsList
                      leads={metaLeads.map(lead => ({
                        ...lead,
                        platform: lead.platform === 'fb'
                          ? 'fb'
                          : lead.platform === 'ig'
                          ? 'ig'
                          : undefined
                      }))}
                    />
                    
                    {isExporting && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Exporting leads...</span>
                          <span>{exportProgress}%</span>
                        </div>
                        <Progress value={exportProgress} className="h-2" />
                      </div>
                    )}

                    {exportResults && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Export Results</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-2 rounded border border-green-200">
                            <p className="text-sm text-gray-600">Successfully exported</p>
                            <p className="text-lg font-bold text-green-600">{exportResults.success}</p>
                          </div>
                          <div className="bg-white p-2 rounded border border-yellow-200">
                            <p className="text-sm text-gray-600">Skipped/Failed</p>
                            <p className="text-lg font-bold text-yellow-600">{exportResults.skipped}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <Database className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">No Leads Available</h3>
                    <p className="text-xs text-gray-600">This campaign doesn&apos;t have any leads yet</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Selected Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Selection Summary</h3>
            
            <div className="space-y-4">
              {/* User Selection */}
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">User</p>
                  {selectedUser ? (
                    <p className="text-sm text-gray-900">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">Not selected</p>
                  )}
                </div>
              </div>

              {/* Pipeline Selection */}
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Pipeline</p>
                  {pipelineOption === 'new' && newPipelineName ? (
                    <div>
                      <p className="text-sm text-gray-900">{newPipelineName}</p>
                      <p className="text-xs text-blue-600">New Meta Pipeline</p>
                    </div>
                  ) : selectedPipeline ? (
                    <p className="text-sm text-gray-900">{selectedPipeline.name}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Not selected</p>
                  )}
                </div>
              </div>

              {/* Stage Selection */}
              <div className="flex items-center gap-3">
                <ChevronRight className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Stage</p>
                  {pipelineOption === 'new' && newStageName ? (
                    <div>
                      <p className="text-sm text-gray-900">{newStageName}</p>
                      <p className="text-xs text-blue-600">New Stage</p>
                    </div>
                  ) : selectedStage ? (
                    <p className="text-sm text-gray-900">{selectedStage.name}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Not selected</p>
                  )}
                </div>
              </div>

              <hr className="border-gray-300" />

              {/* Account Selection */}
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Account</p>
                  {selectedAccount ? (
                    <div>
                      <p className="text-sm text-gray-900">{selectedAccount.name}</p>
                      <p className="text-xs text-gray-500">{selectedAccount.id}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Not selected</p>
                  )}
                </div>
              </div>

              {/* Campaign Selection */}
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Campaign</p>
                  {selectedCampaign ? (
                    <div>
                      <p className="text-sm text-gray-900">{selectedCampaign.name}</p>
                      <p className="text-xs text-gray-500">{selectedCampaign.id}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Not selected</p>
                  )}
                </div>
              </div>

              {/* Leads Count */}
              {metaLeads.length > 0 && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {metaLeads.length} leads ready for export
                    </span>
                  </div>
                </div>
              )}

              {/* Pipeline Creation Notice */}
              {pipelineOption === 'new' && (
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      New pipeline & stage will be created
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateAndExport}
            disabled={
              isExporting || 
              isCreating || 
              !campaignName || 
              !selectedUser || 
              !selectedAccount || 
              !selectedCampaign ||
              (pipelineOption === 'existing' && (!selectedPipeline || !selectedStage)) ||
              (pipelineOption === 'new' && (!newPipelineName.trim())) ||
              metaLeads.length === 0
            }
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            {isExporting || isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {pipelineOption === 'new' ? 'Create Pipeline & Export Leads' : 'Create & Export Leads'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};