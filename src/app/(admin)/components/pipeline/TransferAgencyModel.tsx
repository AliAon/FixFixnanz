import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchAgencyPipelinesOnly } from "@/redux/slices/pipelineSlice";
import { transferCustomersToAgencyStage } from "@/redux/slices/customersSlice";
import { toast } from "react-toastify";

interface TransferAgencyModelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCustomerIds: string[];
}

const TransferAgencyModel: React.FC<TransferAgencyModelProps> = ({
  isOpen,
  onClose,
  selectedCustomerIds,
}) => {

  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();
  const { agencyPipelines, isLoading } = useSelector(
    (state: RootState) => state.pipeline
  );
  const { isLoading: isTransferring, error: transferError } = useSelector(
    (state: RootState) => state.customers
  );

  const [selectedPipeline, setSelectedPipeline] = useState<string>("");
  const [selectedStage, setSelectedStage] = useState<string>("");

  // Get stages for selected pipeline
  const selectedPipelineData = agencyPipelines.find(
    (pipeline) => pipeline.id.toString() === selectedPipeline
  );
  const availableStages = selectedPipelineData?.stages || [];

  // Fetch agency pipelines when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAgencyPipelinesOnly());
    }
  }, [isOpen, dispatch]);

  // Reset stage selection when pipeline changes
  useEffect(() => {
    setSelectedStage("");
  }, [selectedPipeline]);

  // Show transfer errors if they occur
  useEffect(() => {
    if (transferError) {
      toast.error(transferError);
    }
  }, [transferError]);

  const handleTransfer = async () => {
    // Validation
    if (!selectedPipeline) {
      toast.error("Please select an agency pipeline");
      return;
    }

    if (!selectedStage) {
      toast.error("Please select a stage");
      return;
    }

    if (!selectedCustomerIds || selectedCustomerIds.length === 0) {
      toast.error("No customers selected for transfer");
      return;
    }

    try {
      // Call the API to transfer customers
      const result = await dispatch(
        transferCustomersToAgencyStage({
          customer_ids: selectedCustomerIds,
          agency_pipeline_id: selectedPipeline,
          target_stage_id: selectedStage,
        })
      ).unwrap();

      console.debug("Transfer result:", result);

      // Success
      toast.success(
        `Successfully transferred customer(s) to the agency pipeline`
      );

      router.push(`/admin/pipeline?id=${selectedPipeline}&type=agency`);
      // Close modal and reset
      handleClose();
    } catch (error) {
      // Error handling
      const errorMessage =
        typeof error === "string"
          ? error
          : "Failed to transfer customers to agency stage";

      toast.error(errorMessage);
      console.error("Transfer error:", error);
    }
  };

  const handleClose = () => {
    // Reset selections when closing
    setSelectedPipeline("");
    setSelectedStage("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Transfer Agency
          </h2>
          <button
            className="text-gray-500 bg-transparent border-0 p-0 hover:text-gray-700"
            onClick={handleClose}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Selection Summary */}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select agency pipeline
              </label>
              <div className="relative">
                <select
                  className="w-full p-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedPipeline}
                  onChange={(e) => setSelectedPipeline(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="" disabled>
                    {isLoading
                      ? "Loading pipelines..."
                      : "Select an agency pipeline"}
                  </option>
                  {agencyPipelines.map((pipeline) => (
                    <option key={pipeline.id} value={pipeline.id.toString()}>
                      {pipeline.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stage
              </label>
              <div className="relative">
                <select
                  className="w-full p-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  disabled={!selectedPipeline || availableStages.length === 0}
                >
                  <option value="" disabled>
                    {!selectedPipeline
                      ? "Select a pipeline first"
                      : availableStages.length === 0
                      ? "No stages available"
                      : "Select a stage"}
                  </option>
                  {availableStages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button
            className="px-4 py-2 bg-[#002D51] cursor-pointer text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            onClick={handleTransfer}
            disabled={
              !selectedPipeline ||
              !selectedStage ||
              selectedCustomerIds.length === 0 ||
              isTransferring
            }
          >
            {isTransferring ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Transferring...
              </>
            ) : (
                `Transfer Now`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferAgencyModel;
