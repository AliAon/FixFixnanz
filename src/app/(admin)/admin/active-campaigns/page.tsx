// src/app/campaigns/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchCampaigns } from '@/redux/slices/campaignSlice';
import { CampaignTable } from '@/components/meta/campaigns/CampaignTable';
import { AddCampaignModal } from '@/components/meta/campaigns/AddCampaignModal';
import { Button } from '@/components/meta/ui/Button';
import { Plus } from 'lucide-react';

export default function CampaignsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const campaigns = useSelector((state: RootState) => state.campaign.campaigns);
  const isLoading = useSelector((state: RootState) => state.campaign.isLoading);
  const error = useSelector((state: RootState) => state.campaign.error);

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchCampaigns());
  };

  const handleAddCampaign = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    // Refresh campaigns after modal closes (in case a new campaign was created)
    dispatch(fetchCampaigns());
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Error: {error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Active Advertising Campaigns</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your meta advertising campaigns and track performance
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* <Button
              onClick={handleRefresh}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button> */}
            
            <Button
              onClick={handleAddCampaign}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Campaign
            </Button>
          </div>
        </div>

        {/* Campaigns Table */}
        <CampaignTable campaigns={campaigns} />

        {/* Add Campaign Modal */}
        <AddCampaignModal
          isOpen={showAddModal}
          onClose={handleCloseModal}
        />
      </div>
    </main>
  );
}