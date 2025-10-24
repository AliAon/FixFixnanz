// src/components/meta/campaigns/CampaignRow.tsx
import React, { useState } from 'react';
import { MetaCampaign, deleteCampaign } from '@/redux/slices/campaignSlice';
import { LeadsModal } from './LeadsModal';
import { DetailsModal } from './DetailsModal';
import { Users, Eye, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { toast } from 'react-toastify';

interface CampaignRowProps {
  campaign: MetaCampaign;
}

// Confirmation Modal Component
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Deleting..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CampaignRow: React.FC<CampaignRowProps> = ({ campaign }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  const [showLeadsModal, setShowLeadsModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLeadsView = () => {
    setShowLeadsModal(true);
  };

  const handleDetailsView = () => {
    setShowDetailsModal(true);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      // Get userId from authenticated user, fallback to campaign's user_id if needed
      const userId = authUser?.id || campaign.user_id || '324';
      
      await dispatch(deleteCampaign({ 
        id: campaign.id, 
        userId: userId 
      })).unwrap();
      
      toast.success(`Campaign "${campaign.name}" has been deleted successfully.`);
      setShowDeleteConfirmation(false);
    } catch (error: unknown) {
      console.error("Error deleting campaign:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Failed to delete campaign");
      } else if (typeof error === "string") {
        toast.error(error);
      } else {
        toast.error("An unexpected error occurred while deleting the campaign");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return first + last || 'U';
  };

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors">
        {/* Advisor */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              {campaign.users?.avatar_url ? (
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={campaign.users.avatar_url}
                  alt={`${campaign.users.first_name} ${campaign.users.last_name}`}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {getInitials(campaign.users?.first_name, campaign.users?.last_name)}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {campaign.users?.first_name} {campaign.users?.last_name}
              </div>
              <div className="text-sm text-gray-500">
                {campaign.users?.email}
              </div>
            </div>
          </div>
        </td>
        
       {/* Package */}
        <td className="px-6 py-4">
          <div>
            <div className="text-sm font-medium text-gray-900 mb-1">
              {campaign.name}
            </div>
          </div>
        </td>
                
        {/* Campaign */}
        <td className="px-6 py-4">
          <div>
            <div className="text-sm font-medium text-gray-900 mb-1">
              {campaign.account_name}
            </div>
            <div className="text-xs text-gray-500">
              Acc.ID: {campaign.account_id}
            </div>
            <div className="text-xs text-gray-500">
              Com.ID: {campaign.ads_id}
            </div>
          </div>
        </td>
        
        {/* Status */}
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {campaign.status}
          </span>
        </td>
        
        {/* Pipeline */}
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {campaign.pipelines?.name || 'No pipeline'}
        </td>
        
        {/* Stage */}
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {campaign.stages?.name || 'No stage'}
        </td>
        
        {/* Leads */}
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-lg font-bold text-gray-900">
            {campaign.stages?.customer_stage_count || '0'}
          </span>
        </td>
        
        {/* Actions */}
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
          <button
            onClick={handleLeadsView}
            className="rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center text-white hover:opacity-90 focus:ring-blue-500 px-3 py-1.5 text-sm flex items-center gap-1"
            style={{ backgroundColor: 'rgb(0, 45, 81)' }}
          >
            <Users size={14} />
            Leads
          </button>
          <button
            onClick={handleDetailsView}
            className="rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-500 px-3 py-1.5 text-sm flex items-center gap-1"
          >
            <Eye size={14} />
            Details
          </button>
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 px-3 py-1.5 text-sm flex items-center gap-1"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </td>
      </tr>

      {/* Modals */}
      {showLeadsModal && (
        <LeadsModal
          isOpen={showLeadsModal}
          onClose={() => setShowLeadsModal(false)}
          campaign={campaign}
        />
      )}

      {showDetailsModal && (
        <DetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          campaign={campaign}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Campaign"
        message={`Are you sure you want to delete the campaign "${campaign.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </>
  );
};