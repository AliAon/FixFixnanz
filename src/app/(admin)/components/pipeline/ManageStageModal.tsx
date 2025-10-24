import { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Stage } from '@/redux/slices/stageSlice';
import SearchableDropdown from '../common/SearchableDropdown';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ManageStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipelines: Array<{ id: string; name: string }>;
  stages: Stage[];
  onCreateStage: (data: { pipeline_id: string; name: string; color: string; position: number }) => void;
  onUpdateStage: (id: string, data: { name: string; color: string }) => void;
  onDeleteStage: (id: string) => void;
  currentPipelineId?: string;
  isLoading?: boolean;
}

export default function ManageStageModal({
  isOpen,
  onClose,
  pipelines,
  stages,
  onCreateStage,
  onUpdateStage,
  onDeleteStage,
  currentPipelineId,
  isLoading = false
}: ManageStageModalProps) {
  const [selectedPipelineId, setSelectedPipelineId] = useState(currentPipelineId || '');
  const [stageName, setStageName] = useState('');
  const [stageColor, setStageColor] = useState('#000000');
  const [editingStage, setEditingStage] = useState<Stage | null>(null);

  useEffect(() => {
    if (currentPipelineId) {
      setSelectedPipelineId(currentPipelineId);
    }
  }, [currentPipelineId]);

  const handleSubmit = async () => {
    if (!stageName.trim()) {
      toast.error('Please enter a stage name');
      return;
    }

    if (!selectedPipelineId) {
      toast.error('Please select a pipeline');
      return;
    }

    try {
      if (editingStage) {
        await onUpdateStage(editingStage.id, {
          name: stageName,
          color: stageColor
        });
      } else {
        await onCreateStage({
          pipeline_id: selectedPipelineId,
          name: stageName,
          color: stageColor,
          position: stages.length
        });
      }
      resetForm();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (stage: Stage) => {
    setEditingStage(stage);
    setStageName(stage.name);
    setStageColor(stage.color);
  };

  const handleDelete = async (id: string) => {
    await onDeleteStage(id);
  };

  const resetForm = () => {
    setEditingStage(null);
    setStageName('');
    setStageColor('#000000');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Manage Stage</h2>
          <button onClick={onClose} className="text-black bg-transparent border-0 hover:text-gray-700">
            <IoClose size={34} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <SearchableDropdown
                label="Pipeline"
                showSearchbar={false}
                options={pipelines.map(p => ({ value: p.id, label: p.name }))}
                value={selectedPipelineId}
                onChange={(value) => setSelectedPipelineId(value)}
                placeholder="Choose Pipeline"
                disabled={!!currentPipelineId || isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stage Name
              </label>
              <input
                type="text"
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                placeholder="Enter Stage Name"
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <input
              type="color"
              value={stageColor}
              onChange={(e) => setStageColor(e.target.value)}
              className="w-full h-10 p-1 border border-gray-300 rounded"
              disabled={isLoading}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 flex items-center justify-center ${
              isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {editingStage ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              editingStage ? 'Update' : 'Create'
            )}
          </button>
        </div>

        <div className="mt-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">S/L</th>
                <th className="px-4 py-2 text-left">Stage Name</th>
                <th className="px-4 py-2 text-left">Color</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stages.map((stage, index) => (
                <tr key={stage.id}>
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{stage.name}</td>
                  <td className="px-4 py-2">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: stage.color }}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(stage)}
                        disabled={isLoading}
                        className={`text-blue-600 bg-transparent border-0 hover:text-blue-800 ${
                          isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <FaEdit size={34} />
                      </button>
                      <button
                        onClick={() => handleDelete(stage.id)}
                        disabled={isLoading}
                        className={`text-red-600 bg-transparent border-0 hover:text-red-800 ${
                          isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <FaTrash size={30} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 