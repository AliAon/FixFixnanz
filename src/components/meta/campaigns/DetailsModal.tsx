/* eslint-disable  @typescript-eslint/no-explicit-any */
// src/components/meta/campaigns/DetailsModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { MetaCampaign } from '@/redux/slices/campaignSlice';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { 
  DollarSign, 
  MousePointer, 
  Eye, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  Loader2,
  Activity,
  Calendar,
  User,
  Hash,
  RefreshCw,
  Users,
  BarChart3
} from 'lucide-react';
import api from '../../../redux/api/axiosConfig';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: MetaCampaign;
}

interface CostPerResult {
  indicator: string;
  [key: string]: any;
}

interface Results {
  indicator: string;
  [key: string]: any;
}

interface CampaignInsightsData {
  impressions: string;
  clicks: string;
  spend: string;
  reach: string;
  frequency: string;
  cost_per_result: CostPerResult[];
  cpm: string;
  cpp: string;
  ctr: string;
  date_start: string;
  date_stop: string;
  results: Results[];
}

type CampaignInsights = CampaignInsightsData[];

export const DetailsModal: React.FC<DetailsModalProps> = ({ isOpen, onClose, campaign }) => {
  const [insights, setInsights] = useState<CampaignInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && campaign.id) {
      fetchInsights();
    } else {
      setInsights(null);
      setError(null);
    }
  }, [isOpen, campaign.id]);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/meta-graph/campaigns/${campaign.ads_id}/insights`);
      setInsights(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load insights');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (str?: string) => {
    if (!str) return '0';
    const num = parseFloat(str);
    return isNaN(num) ? '0' : num.toLocaleString();
  };

  const formatCurrency = (str?: string) => {
    if (!str) return '$0.00';
    const num = parseFloat(str);
    return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
  };

  const formatPercent = (str?: string) => {
    if (!str) return '0%';
    const num = parseFloat(str);
    return isNaN(num) ? '0%' : `${num.toFixed(2)}%`;
  };

  const formatFrequency = (str?: string) => {
    if (!str) return '0';
    const num = parseFloat(str);
    return isNaN(num) ? '0' : num.toFixed(1);
  };

  // Get the first (most recent) insights data
  const data = insights && insights.length > 0 ? insights[0] : null;

  // Calculate CPC
  const calculateCPC = (spend?: string, clicks?: string) => {
    if (!spend || !clicks) return '$0.00';
    const spendNum = parseFloat(spend);
    const clicksNum = parseFloat(clicks);
    if (isNaN(spendNum) || isNaN(clicksNum) || clicksNum === 0) return '$0.00';
    return `$${(spendNum / clicksNum).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Campaign Details" size="md">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-3" />
          <p className="text-gray-600 text-sm">Loading campaign insights...</p>
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Campaign Details" size="md">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 mb-2">Unable to Load Data</h3>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={fetchInsights} size="sm" className="flex items-center gap-2">
              <RefreshCw className="w-3 h-3" />
              Retry
            </Button>
            <Button size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Campaign Analytics" size="md">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center pb-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-1">{campaign.account_name}</h2>
          <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {campaign.account_id?.slice(0, 20)}...
            </span>
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              <span className="capitalize text-green-600 font-medium">{campaign.status}</span>
            </span>
            {data && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {data.date_start} to {data.date_stop}
              </span>
            )}
          </div>
        </div>

        {data ? (
          <div className="space-y-4">
            {/* Primary Metrics - 2x2 Grid */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Key Performance</h3>
              <div className="grid grid-cols-2 gap-3">
                {/* Total Spend */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-xs font-medium text-green-700">TOTAL SPEND</span>
                  </div>
                  <div className="text-xl font-bold text-green-900">{formatCurrency(data.spend)}</div>
                </div>

                {/* Total Clicks */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MousePointer className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">CLICKS</span>
                  </div>
                  <div className="text-xl font-bold text-blue-900">{formatNumber(data.clicks)}</div>
                  <div className="text-xs text-blue-600 mt-1">CPC: {calculateCPC(data.spend, data.clicks)}</div>
                </div>

                {/* Impressions */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-purple-600" />
                    <span className="text-xs font-medium text-purple-700">IMPRESSIONS</span>
                  </div>
                  <div className="text-xl font-bold text-purple-900">{formatNumber(data.impressions)}</div>
                  <div className="text-xs text-purple-600 mt-1">CPM: {formatCurrency(data.cpm)}</div>
                </div>

                {/* CTR */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    <span className="text-xs font-medium text-orange-700">CLICK RATE</span>
                  </div>
                  <div className="text-xl font-bold text-orange-900">{formatPercent(data.ctr)}</div>
                  <div className="text-xs text-orange-600 mt-1">CTR</div>
                </div>
              </div>
            </div>

            {/* Secondary Metrics - 3x1 Grid */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Audience & Cost</h3>
              <div className="grid grid-cols-3 gap-3">
                {/* Reach */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-medium text-indigo-700">REACH</span>
                  </div>
                  <div className="text-lg font-bold text-indigo-900">{formatNumber(data.reach)}</div>
                  <div className="text-xs text-indigo-600">Unique Users</div>
                </div>

                {/* Frequency */}
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <BarChart3 className="w-4 h-4 text-pink-600" />
                    <span className="text-xs font-medium text-pink-700">FREQUENCY</span>
                  </div>
                  <div className="text-lg font-bold text-pink-900">{formatFrequency(data.frequency)}</div>
                  <div className="text-xs text-pink-600">Avg/User</div>
                </div>

                {/* Cost Per Lead */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Target className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-medium text-red-700">COST/LEAD</span>
                  </div>
                  <div className="text-lg font-bold text-red-900">{formatCurrency(data.cpp)}</div>
                  <div className="text-xs text-red-600">CPP</div>
                </div>
              </div>
            </div>

            {/* Campaign Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Campaign Details</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-600">OWNER</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {campaign.users?.first_name} {campaign.users?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{campaign.users?.email}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-600">PIPELINE</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{campaign.pipelines?.name || 'No Pipeline'}</p>
                    <p className="text-xs text-gray-500">{campaign.stages?.name || 'No Stage'}</p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-600">CAMPAIGN PERIOD</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{data.date_start} to {data.date_stop}</p>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Performance Summary</h4>
              <p className="text-xs text-blue-800 leading-relaxed">
                Over {Math.ceil((new Date(data.date_stop).getTime() - new Date(data.date_start).getTime()) / (1000 * 60 * 60 * 24))} days, 
                this campaign spent <strong>{formatCurrency(data.spend)}</strong> to reach{' '}
                <strong>{formatNumber(data.reach)} unique users</strong> with{' '}
                <strong>{formatNumber(data.impressions)} impressions</strong>.
                Generated <strong>{formatNumber(data.clicks)} clicks</strong> at{' '}
                <strong>{formatPercent(data.ctr)} CTR</strong> and{' '}
                <strong>{formatCurrency(data.cpp)} cost per lead</strong>.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No Analytics Data</h3>
            <p className="text-sm text-gray-600">Performance insights are not available yet.</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <Button onClick={fetchInsights} size="sm" className="flex items-center gap-2">
            <RefreshCw className="w-3 h-3" />
            Refresh
          </Button>
          <Button onClick={onClose} size="sm">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};