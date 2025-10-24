// components/PipelineModal.tsx
import { useState, useEffect } from "react";
import { IoClose } from 'react-icons/io5';
import { FaEdit, FaTrash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { AppDispatch, RootState } from "@/redux/store";
import { createPipeline, updatePipeline, deletePipeline, Pipeline, fetchPipelines } from "@/redux/slices/pipelineSlice";
import type { CreatePipelineRequest } from "@/redux/slices/pipelineSlice";
import { fetchCompanies } from "@/redux/slices/companiesSlice";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface PipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  setIsCreatingPipeline: (isCreating: boolean) => void;
  isLeadpoolMode?: boolean; // New prop to indicate leadpool pipeline management
}

const PipelineModal = ({ isOpen, onClose, isLeadpoolMode = false }: PipelineModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { pipelines, isLoading } = useSelector((state: RootState) => state.pipeline);
  const { companies, status: companiesStatus } = useSelector((state: RootState) => state.companies);
  
  // Filter pipelines based on mode
  const displayPipelines = isLeadpoolMode 
    ? pipelines.filter(pipeline => pipeline.type === "leadpool")
    : pipelines;
  const currentLoading = isLoading;
  
  const [pipelineName, setPipelineName] = useState("");
  const [pipelineSource, setPipelineSource] = useState("Added manually");
  const [pipelineType, setPipelineType] = useState("Lead pool");
  const [pipelinePursue, setPipelinePursue] = useState("");
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);

  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  const filteredPipelines = displayPipelines.filter((pipeline) => {
    if (type === 'agency') {
      return pipeline.type === 'agency';
    } else {
      return pipeline.type !== 'agency';
    }
  });

  // Fetch pipelines and companies when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchPipelines());
      if (isLeadpoolMode) {
        dispatch(fetchCompanies({ limit: 0 })) // Fetch all companies
          .unwrap()
          .catch((error) => {
            console.error('Failed to fetch companies:', error);
            toast.error('Failed to load companies');
          });
      }
    }
  }, [isOpen, dispatch, isLeadpoolMode]);

  const handleSubmit = async () => {
    if (!pipelineName.trim()) {
      toast.error('Please enter a pipeline name');
      return;
    }

    try {
      if (editingPipeline) {
        const updateData: Partial<CreatePipelineRequest> = {
          name: pipelineName,
          source: pipelineSource,
          type: isLeadpoolMode ? "leadpool" as const : "normal" as const,
          ...(isLeadpoolMode && pipelinePursue && { company_id: pipelinePursue })
        };
        
        await dispatch(updatePipeline({
          id: editingPipeline.id.toString(),
          data: updateData
        })).unwrap();
        toast.success('Pipeline updated successfully');
      } else {
        const createData: CreatePipelineRequest = {
          name: pipelineName,
          source: pipelineSource,
          type: isLeadpoolMode ? "leadpool" as const : "normal" as const,
          ...(isLeadpoolMode && pipelinePursue && { company_id: pipelinePursue })
        };
        
        await dispatch(createPipeline(createData)).unwrap();
        toast.success('Pipeline created successfully');
      }
      
      // Refresh the pipeline list after successful operation
      await dispatch(fetchPipelines());
      resetForm();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Operation failed');
      } else {
        toast.error('Operation failed');
      }
    }
  };

  const handleEdit = (pipeline: Pipeline) => {
    setEditingPipeline(pipeline);
    setPipelineName(pipeline.name);
    setPipelineSource(pipeline.source);
    if (isLeadpoolMode) {
      setPipelineType(pipeline.type === "leadpool" ? "Lead pool" : "Normal");
      // Set company_id if available in pipeline data (you might need to add this field to Pipeline interface)
      setPipelinePursue((pipeline as { company_id?: string | number }).company_id?.toString() || ""); 
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deletePipeline(id.toString())).unwrap();
      toast.success('Pipeline deleted successfully');
      
      // Refresh the pipeline list after successful deletion
      await dispatch(fetchPipelines());
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to delete pipeline');
      } else {
        toast.error('Failed to delete pipeline');
      }
    }
  };

  const resetForm = () => {
    setEditingPipeline(null);
    setPipelineName("");
    setPipelineSource("Added manually");
    setPipelineType("Lead pool");
    setPipelinePursue("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            {isLeadpoolMode ? "Manage Leadpool Pipeline" : "Manage Pipeline"}
          </h2>
          <button onClick={onClose} className="text-black bg-transparent border-0 hover:text-gray-700">
            <IoClose size={34} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pipeline Name
              </label>
              <input
                type="text"
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
                placeholder="Pipeline Name"
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                disabled={currentLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Source
              </label>
              <select
                value={pipelineSource}
                onChange={(e) => setPipelineSource(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                disabled={currentLoading}
              >
                <option value="Added manually">Added manually</option>
                <option value="Manuell hinzugefügt">Manuell hinzugefügt</option>
                <option value="Formular ( my funnel )">Formular ( my funnel )</option>
              </select>
            </div>
          </div>

          {isLeadpoolMode && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={pipelineType}
                  onChange={(e) => setPipelineType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  disabled={currentLoading}
                >
                  <option value="Lead pool">Lead pool</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pursue
                </label>
                <select
                  value={pipelinePursue}
                  onChange={(e) => setPipelinePursue(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  disabled={currentLoading || companiesStatus === 'loading'}
                >
                  <option value="">
                    {companiesStatus === 'loading' 
                      ? 'Loading companies...' 
                      : companiesStatus === 'failed' 
                        ? 'Failed to load companies' 
                        : 'Select company'
                    }
                  </option>
                  {companiesStatus === 'succeeded' && companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={currentLoading}
            className={`w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 flex items-center justify-center ${
              currentLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {currentLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {editingPipeline ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              editingPipeline ? 'Update' : 'Create'
            )}
          </button>
        </div>

        <div className="mt-6">
          <div className="max-h-[400px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">S/L</th>
                  <th className="px-4 py-2 text-left">Pipeline Name</th>
                  <th className="px-4 py-2 text-left">Source</th>
                  <th className="px-4 py-2 text-left">Total Stages</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPipelines.map((pipeline, index) => (
                  <tr key={pipeline.id}>
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{pipeline.name}</td>
                    <td className="px-4 py-2">{pipeline.source}</td>
                    <td className="px-4 py-2">
                      <span className="bg-yellow-400 text-black px-2 py-0.5 rounded-full text-xs">
                        {pipeline.stages?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(pipeline)}
                          disabled={currentLoading}
                          className={`text-blue-600 bg-transparent border-0 hover:text-blue-800 ${
                            currentLoading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <FaEdit size={34} />
                        </button>
                        {type !== 'agency' && (
                          <button
                            onClick={() => handleDelete(pipeline.id)}
                            disabled={currentLoading}
                            className={`text-red-600 bg-transparent border-0 hover:text-red-800 ${currentLoading ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                          >
                            <FaTrash size={30} />
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineModal;
