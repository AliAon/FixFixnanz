/* eslint-disable  @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { FaExternalLinkAlt, FaUser, FaEnvelope, FaTasks, FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { RootState, AppDispatch } from "@/redux/store";
import { fetchPipelinesWithCustomerCount } from "@/redux/slices/usersSlice";
import { createPipeline, deletePipeline } from "@/redux/slices/pipelineSlice";
import { createStage } from "@/redux/slices/stageSlice";

// User role types
type UserRole = 'user' | 'financial-advisor' | 'admin' | 'free-advisor' | 'agency-advisor' | 'premium-advisor';

// Pipeline type categories
const PIPELINE_CATEGORIES = {
  profile: {
    label: 'Profile',
    description: 'Default pipeline for profile requests',
    deletable: false,
    color: '#002d51'
  },
  manual: {
    label: 'Manual',
    description: 'Freely created pipelines',
    deletable: true,
    color: '#10B981'
  },
  meta: {
    label: 'Meta',
    description: 'Linked advertising campaigns',
    deletable: false, // Cannot be deleted by financial advisor
    color: '#7cc1e6ff'
  }
};

console.debug('Pipeline categories:', PIPELINE_CATEGORIES);

// Type colors for visual distinction
const TYPE_COLORS = {
  manual: '#10B981',
  meta: '#7cc1e6ff',
  agency: '#002d51',
  profile: '#002d51',
  marketing: '#7cc1e6ff',
  normal: '#10B981',
  leadpool: '#F59E0B',
};

interface CreatePipelineForm {
  name: string;
  type: "normal" | "profile";
  company_id?: string;
}

const PipelineOverviewPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    pipelinesWithCustomerCount, 
    pipelinesLoading, 
    pipelinesError 
  } = useSelector((state: RootState) => state.users);

  // Get user role from cookies
  const getUserRole = (): UserRole => {
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
        const [name, value] = cookie.split('=');
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);

      const userDataStr = cookies["userData"];

      if (userDataStr) {
        try {
          const userData = JSON.parse(decodeURIComponent(userDataStr));
          return userData?.role || 'user';
        } catch (error) {
          console.error('Error parsing user data from cookies:', error);
          return 'user';
        }
      }
    }
    return 'user';
  };

  const [userRole] = useState<UserRole>(getUserRole());
  const [hasMetaCampaign, setHasMetaCampaign] = useState(true); // This should come from your API

  console.debug('Has meta campaign:', hasMetaCampaign);
  console.debug('has set meta Campaign:', setHasMetaCampaign);

  // Filter state
  const [selectedType, setSelectedType] = useState<string>('All');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pipelineToDelete, setPipelineToDelete] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<CreatePipelineForm>({
    name: '',
    type: 'normal'
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Fetch pipelines with customer count on component mount
  useEffect(() => {
    dispatch(fetchPipelinesWithCustomerCount());
  }, [dispatch]);

  const isAdminImpersonating = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("isImpersonating") === "true" &&
        localStorage.getItem("admin_token") !== null;
    }
    return false;
  };

  // Update the getAvailablePipelineTypes function
  const getAvailablePipelineTypes = () => {
    const baseTypes = [
    { value: 'manual', label: 'Manual' }
  ];
  // Show meta type only for:
  // 1. Regular admin users
    // 2. Admin users who are impersonating other users
    console.log(userRole, isAdminImpersonating());

    if (userRole === 'admin' || isAdminImpersonating()) {
      baseTypes.push({ value: 'meta', label: 'Meta' });
    }
  // Also show for agency advisors (as per original logic)
    // else if (userRole === 'agency-advisor') {
    //   baseTypes.push({ value: 'meta', label: 'Meta' });
    // }

  return baseTypes;
};

  // Check if user can create pipelines
  const canCreatePipelines = () => {
    return ['free-advisor', 'premium-advisor', 'agency-advisor', 'financial-advisor', 'admin'].includes(userRole);
  };

  // Check if pipeline is deletable
  const isPipelineDeletable = (pipeline: any) => {
    // Admins can delete any pipeline except profile
    if (userRole === 'admin') {
      return pipeline.type !== 'profile';
    }

    // Financial advisors can only delete normal pipelines they created
    if (['free-advisor', 'premium-advisor', 'agency-advisor', 'financial-advisor'].includes(userRole)) {
      return pipeline.type === 'normal';
    }

    return false;
  };

  // Get pipeline type color
  const getPipelineColor = (type: string) => {
    return TYPE_COLORS[type as keyof typeof TYPE_COLORS] || '#002d51';
  };

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Get available types for filtering from actual pipeline.type
  const availableTypes = ['All', ...new Set(pipelinesWithCustomerCount.map(p => p.type).filter(Boolean))];

  // Get count for each type
  const getTypeCount = (type: string) => {
    if (type === 'All') return pipelinesWithCustomerCount.length;
    return pipelinesWithCustomerCount.filter(p => p.type === type).length;
  };

  // Filter pipelines based on actual pipeline.type
  const filteredPipelines = selectedType === 'All'
    ? pipelinesWithCustomerCount
    : pipelinesWithCustomerCount.filter(p => p.type === selectedType);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'Pipeline name is required';
    }

    if (!formData.type) {
      errors.type = 'Pipeline type is required';
    }

    // Validate type permissions
    const availableTypes = getAvailablePipelineTypes();
    if (!availableTypes.some(t => t.value === formData.type)) {
      errors.type = 'You do not have permission to create this pipeline type';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const payload = {
        ...formData,
        source: formData.type === 'normal' ? 'manual' : formData.type // keep "manual" as source for legacy
      };

      const result = await dispatch(createPipeline(payload));

      if (createPipeline.fulfilled.match(result)) {
        const createdPipeline = result.payload;

        // Create default stage for the new pipeline
        if (createdPipeline?.id) {
          const stagePayload = {
            pipeline_id: createdPipeline.id,
            name: "Standart",
            color: "#007bff",
            position: 0
          };

          try {
            await dispatch(createStage(stagePayload)).unwrap();
          } catch (stageError) {
            console.error('Failed to create default stage:', stageError);
          }
        }

        // Success - Reset form and close modal
        setFormData({
          name: '',
          type: 'normal'
        });
        setFormErrors({});
        setShowModal(false);
        dispatch(fetchPipelinesWithCustomerCount());
      } else {
        const errorMessage = result.payload as string || 'Failed to create pipeline';
        setFormErrors({ submit: errorMessage });
      }
    } catch (error) {
      console.error('Failed to create pipeline:', error);
      setFormErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete pipeline
  const handleDeletePipeline = async () => {
    if (!pipelineToDelete || isDeleting) return;

    setIsDeleting(true);

    try {
      const result = await dispatch(deletePipeline(pipelineToDelete.id));

      if (deletePipeline.fulfilled.match(result)) {
        setShowDeleteModal(false);
        setPipelineToDelete(null);
        dispatch(fetchPipelinesWithCustomerCount());
      } else {
        console.error('Failed to delete pipeline');
      }
    } catch (error) {
      console.error('Error deleting pipeline:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (pipeline: any) => {
    setPipelineToDelete(pipeline);
    setShowDeleteModal(true);
  };

  // Close modal and reset form
  const closeModal = () => {
    if (isSubmitting) return;
    setShowModal(false);
    setFormData({
      name: '',
      type: 'normal'
    });
    setFormErrors({});
    setIsSubmitting(false);
  };

  // Close delete modal
  const closeDeleteModal = () => {
    if (isDeleting) return;
    setShowDeleteModal(false);
    setPipelineToDelete(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[40px] font-semibold" style={{ color: '#002d51' }}>
          Pipeline overview
        </h2>

        {canCreatePipelines() && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all font-medium shadow-md"
            style={{ backgroundColor: '#002d51' }}
          >
            <FaPlus />
            Add Pipeline
          </button>
        )}
      </div>

      {/* Filter Section */}
      {pipelinesWithCustomerCount.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-3">
            {availableTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type ?? 'All')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${selectedType === type
                  ? 'text-white shadow-md transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                style={selectedType === type ? { backgroundColor: type === 'All' ? '#002d51' : getPipelineColor(type) } : {}}
              >
                <span>{capitalizeFirstLetter(type ?? 'All')}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${selectedType === type
                  ? 'bg-black bg-opacity-20'
                  : 'bg-gray-200 text-gray-600'
                  }`}>
                  {getTypeCount(type ?? 'All')}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-y-auto h-[calc(100vh-10rem)]">
        {pipelinesLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: '#002d51', borderTopColor: 'transparent' }}></div>
          </div>
        ) : pipelinesError ? (
          <div className="text-center text-red-600 p-4">
            <p className="font-medium">Error loading pipelines</p>
            <p className="text-sm">{pipelinesError}</p>
            <button
              onClick={() => dispatch(fetchPipelinesWithCustomerCount())}
                className="mt-4 px-4 py-2 text-white rounded hover:opacity-90"
                style={{ backgroundColor: '#002d51' }}
            >
              Retry
            </button>
          </div>
        ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...filteredPipelines]
                  .sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                  )
                  .map((pipeline) => {
                    const isDeletable = isPipelineDeletable(pipeline);
                    return (
                      <div
                        key={pipeline.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                      >
                        {/* Pipeline Header */}
                        <div className="p-6 border-b border-gray-100">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: getPipelineColor(pipeline.type ?? 'All') }}
                              ></div>
                              <div>
                                <h3 className="text-xl font-bold mb-1" style={{ color: '#002d51' }}>
                                  {pipeline.name}
                                </h3>
                                {!isDeletable && pipeline.type === 'meta' && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    Agency managed
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                                style={{ backgroundColor: getPipelineColor(pipeline.type ?? 'All') }}
                              >
                                {capitalizeFirstLetter(pipeline.type ?? 'All')}
                              </span>
                            </div>
                          </div>

                          {/* Pipeline Stages */}
                          {Array.isArray(pipeline.stages) && pipeline.stages.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {[...pipeline.stages]
                                .sort((a, b) => a.position - b.position)
                                .map((stage) => (
                                  <span
                                    key={stage.id}
                                    className="px-3 py-1 text-sm font-medium border-l-4 bg-gray-100 rounded-l-md"
                                    style={{
                                      borderLeftColor: stage.color || '#002d51',
                                      color: '#374151'
                                    }}
                                  >
                                    {stage.name}
                                  </span>
                                ))}
                            </div>
                          ) : (
                              <div className="mb-4">
                                <span className="text-gray-500 text-sm">No stages defined</span>
                              </div>
                          )}

                          {/* Pipeline Metadata */}
                          <div className="space-y-2">
                            <div className="text-sm text-gray-500">
                              <span className="font-medium">Erstellt:</span> {new Date(pipeline.created_at).toLocaleDateString('de-DE')}
                            </div>
                            <div className="text-sm text-gray-500">
                              <span className="font-medium">Quelle:</span> {pipeline.source || 'Manuell hinzugefügt'}
                            </div>
                          </div>
                        </div>

                        {/* Pipeline Actions */}
                        <div className="p-6 bg-gray-50">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2 text-xl font-bold" style={{ color: '#002d51' }}>
                                <span className="text-4xl font-bold">{pipeline.customer_count}</span>
                              </div>
                              <span className="flex gap-1 text-sm text-gray-500">  <FaUser className="text-gray-500 gap-2" />  Kontakte</span>
                            </div>

                            <div className="flex items-center gap-3">
                              {isDeletable && (
                                <button
                                  onClick={() => openDeleteModal(pipeline)}
                                  className="flex items-center gap-2 px-4 py-3 bg-[#f9fafb] border border-[#002d51] text-[#002d51] hover:bg-[#002d51] hover:text-white rounded-lg hover:text-red-600 transition-colors font-medium"
                                  title="Delete pipeline"
                                >
                                  <FaTrash size={14} className="text-red-500" />
                                </button>
                              )}



                              <Link
                                href={`/admin/overview/detail?id=${pipeline.id}&type=${pipeline.type}`}
                                className="flex items-center gap-2 px-4 py-2 text-[#002d51] border border-[#002d51] rounded-lg hover:bg-[#002d51] hover:text-white transition-colors font-medium"
                              >
                                <FaEnvelope />
                                Einstellungen
                              </Link>

                              <Link
                                href={`/admin/pipeline?id=${pipeline.id}&type=${pipeline.type}`}
                                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all font-medium shadow-md"
                                style={{ backgroundColor: getPipelineColor(pipeline.type ?? 'All') }}
                              >
                                <FaExternalLinkAlt />
                                Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
        )}
        
        {/* Empty State */}
        {!pipelinesLoading && !pipelinesError && filteredPipelines.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTasks className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {selectedType === 'All' ? 'No pipelines found' : `No ${selectedType} pipelines found`}
            </h3>
            <p className="text-gray-500">
              {selectedType === 'All'
                ? 'Create your first pipeline to get started'
                : `Try selecting a different type or create a new ${selectedType} pipeline`
              }
            </p>
          </div>
        )}
      </div>

      {/* Create Pipeline Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: '#002d51' }}>
                Create New Pipeline
              </h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-500 hover:text-gray-700 bg-transparent border-none focus:outline-none"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Pipeline Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Pipeline Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter pipeline name"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Pipeline Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pipeline Type *
                </label>

                <div className="flex flex-wrap gap-2 mt-2">
                  {getAvailablePipelineTypes().map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        handleInputChange({
                          target: { name: 'type', value: option.value },
                        } as any)
                      }
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors
          ${formData.type === option.value
                          ? 'text-white border-[#002d51] bg-[#002d51]'
                          : 'text-gray-700 border-gray-300 bg-white hover:border-gray-500'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {formErrors.type && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.type}</p>
                )}
              </div>


              {/* Submit Error */}
              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{formErrors.submit}</p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-400 text-gray-700 rounded-lg bg-transparent hover:border-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#002d51' }}
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && pipelineToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-red-600">
                Delete Pipeline
              </h3>
              <button
                onClick={closeDeleteModal}
                className="p-2 text-gray-500 hover:text-gray-700 bg-transparent border-none focus:outline-none"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete the pipeline:
              </p>
              <p className="font-bold text-gray-900">
                &quot;{pipelineToDelete.name}&quot;
              </p>
              <p className="text-sm text-red-600 mt-2">
                This action cannot be undone and will remove all associated data.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-400 text-gray-700 rounded-lg bg-transparent hover:border-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePipeline}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineOverviewPage;