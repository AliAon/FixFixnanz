/* eslint-disable  @typescript-eslint/no-explicit-any */
// src/components/meta/campaigns/LeadsModal.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { MetaCampaign } from '@/redux/slices/campaignSlice';
import { fetchAds, fetchLeads, clearAdState, clearLeadState } from '@/redux/slices/metaGraphSlice';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Filter, Users, AlertCircle, Download } from 'lucide-react';

interface LeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: MetaCampaign;
}

const PlatformIcon: React.FC<{ platform: 'fb' | 'ig' }> = ({ platform }) => {
  if (platform === 'fb') {
    return (
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjvzC_QRv6moAhgNb5C6e3yicKgFND1g2RwA&s"
        alt="Facebook"
        className="w-6 h-6 rounded"
      />
    );
  }
  
  return (
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/2048px-Instagram_icon.png"
      alt="Instagram"
      className="w-6 h-6 rounded"
    />
  );
};

export const LeadsModal: React.FC<LeadsModalProps> = ({ isOpen, onClose, campaign }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const ads = useSelector((state: RootState) => state.metaGraph.ads);
  //const leads = useSelector((state: RootState) => state.metaGraph.leads);
  const loading = useSelector((state: RootState) => state.metaGraph.loading);
  const isLoading = useSelector((state: RootState) => state.metaGraph.isLoading);
  const error = useSelector((state: RootState) => state.metaGraph.error);

  // Local state for filters and pagination
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'fb' | 'ig'>('all');
  const [fetchingStep, setFetchingStep] = useState<'idle' | 'fetching-ads' | 'fetching-leads' | 'completed'>('idle');
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage] = useState(50); // Show 50 leads per page
  const [fetchProgress, setFetchProgress] = useState({ current: 0, total: 0 });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      dispatch(clearAdState());
      dispatch(clearLeadState());
      setAllLeads([]);
      setCurrentPage(1);
      setFetchingStep('idle');
      setFetchProgress({ current: 0, total: 0 });
      fetchCampaignLeads();
    } else {
      setFetchingStep('idle');
      setAllLeads([]);
    }
  }, [isOpen, dispatch]);

  const fetchCampaignLeads = async () => {
    if (!campaign.id) return;

    try {
      setFetchingStep('fetching-ads');
      
      // Step 1: Fetch ads for the campaign using campaign ID
      const adsResult = await dispatch(fetchAds(campaign.ads_id)).unwrap();
      
      if (adsResult && adsResult.length > 0) {
        setFetchingStep('fetching-leads');
        setFetchProgress({ current: 0, total: adsResult.length });
        
        let allCampaignLeads: any[] = [];
        
        // Step 2: For each ad, fetch leads using form_id
        for (let i = 0; i < adsResult.length; i++) {
          const ad = adsResult[i];
          try {
            setFetchProgress({ current: i + 1, total: adsResult.length });
            
            // Use the form_id from the ad, fallback to ad.id
            const formId = ad.form_id || ad.id;
            
            // Fetch leads for this specific form
            const leadsResult = await dispatch(fetchLeads(formId)).unwrap();
            
            // Add the leads to our collection
            if (leadsResult && Array.isArray(leadsResult)) {
              allCampaignLeads = [...allCampaignLeads, ...leadsResult];
            }
            
            // Small delay to avoid rate limiting
            if (i < adsResult.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          } catch (error) {
            console.error(`Error fetching leads for ad ${ad.id}:`, error);
            // Continue with other ads even if one fails
          }
        }
        
        // Remove duplicates based on lead ID
        const uniqueLeads = allCampaignLeads.filter((lead, index, self) => 
          index === self.findIndex(l => l.id === lead.id)
        );
        
        setAllLeads(uniqueLeads);
        setFetchingStep('completed');
      } else {
        setFetchingStep('completed');
      }
    } catch (error) {
      console.error('Error fetching campaign leads:', error);
      setFetchingStep('completed');
    }
  };

  // Transform leads data to match the expected format
  const transformedLeads = useMemo(() => {
    return allLeads.map(lead => {
      // Extract data from field_data array based on actual field names
      const fieldData = lead.field_data || [];
      
      // Find fields by their actual names from your sample data
      const fullNameField = fieldData.find((field: { name: string; }) => field.name === 'full_name');
      const emailField = fieldData.find((field: { name: string; }) => field.name === 'email');
      const phoneField = fieldData.find((field: { name: string; }) => field.name === 'phone_number');
      const companyField = fieldData.find((field: { name: string; }) => field.name === 'company');
      const employeeField = fieldData.find((field: { name: string; }) => field.name === 'wie_viele_mitarbeiter_hast_du?');

      return {
        id: lead.id,
        name: fullNameField?.values[0] || 'N/A',
        email: emailField?.values[0] || 'N/A',
        phone: phoneField?.values[0] || 'N/A',
        company: companyField?.values[0] || 'N/A',
        employees: employeeField?.values[0] || 'N/A',
        platform: lead.platform as 'fb' | 'ig',
        createdAt: lead.created_time,
        ad_id: lead.ad_id,
        campaign_id: lead.campaign_id,
        form_id: lead.form_id,
        is_organic: lead.is_organic
      };
    });
  }, [allLeads]);

  // Filter leads based on date and platform
  const filteredLeads = useMemo(() => {
    let filtered = transformedLeads;

    // Filter by platform
    if (platformFilter !== 'all') {
      filtered = filtered.filter(lead => lead.platform === platformFilter);
    }

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        return leadDate >= start && leadDate <= end;
      });
    }

    return filtered;
  }, [transformedLeads, platformFilter, startDate, endDate]);

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const endIndex = startIndex + leadsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleClose = () => {
    dispatch(clearAdState());
    dispatch(clearLeadState());
    setAllLeads([]);
    setFetchingStep('idle');
    onClose();
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Name', 'Company', 'Phone', 'Email', 'Employees', 'Platform', 'Created Date', 'Ad ID', 'Form ID'],
      ...filteredLeads.map(lead => [
        lead.name,
        lead.company,
        lead.phone,
        lead.email,
        lead.employees,
        lead.platform,
        formatDate(lead.createdAt),
        lead.ad_id,
        lead.form_id
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${campaign.name}_leads.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isLoadingData = loading.ads || loading.leads || isLoading || fetchingStep !== 'completed';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`${campaign.users?.first_name || 'Campaign'} - All Leads`} size="xl">
      <div className="space-y-6">
        {/* Loading State */}
        {isLoadingData && (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-gray-600">
                {fetchingStep === 'fetching-ads' && 'Fetching ads...'}
                {fetchingStep === 'fetching-leads' && `Fetching leads... (${fetchProgress.current}/${fetchProgress.total} ads)`}
                {fetchingStep === 'idle' && 'Loading...'}
              </span>
              {fetchingStep === 'fetching-leads' && fetchProgress.total > 0 && (
                <div className="w-64 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(fetchProgress.current / fetchProgress.total) * 100}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoadingData && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">Error: {error}</span>
            </div>
            <button 
              onClick={fetchCampaignLeads}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Campaign Info */}
        {!isLoadingData && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                  <p className="text-sm text-gray-600">
                    Campaign ID: {campaign.id} | Found {ads.length} ads | {transformedLeads.length} total leads
                  </p>
                </div>
              </div>
              {filteredLeads.length > 0 && (
                <Button 
                  onClick={handleExportCSV}
                  className="flex items-center gap-2"
                >
                  <Download size={16} />
                  Export CSV
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        {!isLoadingData && transformedLeads.length > 0 && (
          <div className="flex flex-wrap items-end gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col min-w-[180px]">
              <label className="text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col min-w-[180px]">
              <label className="text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col min-w-[180px]">
              <label className="text-sm font-medium text-gray-700 mb-1">Platform</label>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value as 'all' | 'fb' | 'ig')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Platforms</option>
                <option value="fb">Facebook</option>
                <option value="ig">Instagram</option>
              </select>
            </div>
            <div className="flex flex-col min-w-[120px]">
              <Button className="h-[42px] flex items-center gap-2">
                <Filter size={16} />
                Filter ({filteredLeads.length})
              </Button>
            </div>
          </div>
        )}

        {/* Leads Table */}
        {!isLoadingData && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created DateTime
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentLeads.length > 0 ? (
                  currentLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {lead.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.employees}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <PlatformIcon platform={lead.platform} />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(lead.createdAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <div className="text-yellow-600 bg-yellow-50 p-4 rounded-lg">
                        {transformedLeads.length === 0 ? 'No leads found for this campaign.' : 'No leads match the current filters.'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoadingData && filteredLeads.length > leadsPerPage && (
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredLeads.length)} of {filteredLeads.length} leads
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-3 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Summary */}
        {!isLoadingData && (
          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
            <span className="text-sm text-gray-600">
              Total: {transformedLeads.length} leads | Filtered: {filteredLeads.length} leads
            </span>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
