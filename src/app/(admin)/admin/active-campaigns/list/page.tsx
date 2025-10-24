/* eslint-disable  @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { 
  fetchAccounts
} from "@/redux/slices/metaGraphSlice";
// Import user slice actions (adjust path as needed)
import { fetchUsers } from "@/redux/slices/usersSlice";
// Import pipeline slice actions (adjust path as needed)
import { 
  fetchPipelines
} from "@/redux/slices/pipelineSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Users, User, GitBranch } from 'lucide-react';

const CampaignsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // 1. GETTING DATA FROM MULTIPLE SLICES
  // Campaign slice selectors - for accounts data
  const {
    campaigns,
    isLoading: campaignLoading,
    error: campaignError
  } = useSelector((state: RootState) => state.campaign);

  // User slice selectors - for users data
  const {
    users,
    isLoading: userLoading,
    error: userError
  } = useSelector((state: RootState) => state.users || { users: [], isLoading: false, error: null });

  // Pipeline slice selectors - for pipelines data  
  const {
    pipelines,
    isLoading: pipelineLoading,
    error: pipelineError
  } = useSelector((state: RootState) => state.pipeline || { pipelines: [], isLoading: false, error: null });
  
  // Current tab state to switch between different data
  const [currentTab, setCurrentTab] = useState<'accounts' | 'users' | 'pipelines'>('accounts');

  // 2. COMBINING LOADING STATES FROM MULTIPLE SLICES
  const isLoading = campaignLoading || userLoading || pipelineLoading;

  // 3. LOADING DATA FROM MULTIPLE SLICES ON COMPONENT MOUNT
  useEffect(() => {
    // Dispatch actions to fetch data from all three slices
    dispatch(fetchAccounts());    // From campaign slice
    dispatch(fetchUsers({ roles: ["financial-advisor", "admin"] }));       // From user slice  
    dispatch(fetchPipelines());   // From pipeline slice
  }, [dispatch]);

  // 4. HANDLING ERRORS FROM MULTIPLE SLICES
  useEffect(() => {
    if (campaignError) {
      toast.error(`Account Error: ${campaignError}`);
    }
    if (userError) {
      toast.error(`User Error: ${userError}`);
    }
    if (pipelineError) {
      toast.error(`Pipeline Error: ${pipelineError}`);
    }
  }, [campaignError, userError, pipelineError]);

  // 5. REUSABLE TAB BUTTON COMPONENT
  const TabButton = ({ 
    tab, 
    label, 
    count, 
    isActive, 
    icon: Icon
  }: { 
    tab: string; 
    label: string; 
    count: number; 
    isActive: boolean; 
    icon: any;
  }) => (
    <button
      onClick={() => setCurrentTab(tab as any)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
        isActive
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label} ({count})
    </button>
  );

  return (
    <div className="my-8 px-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER WITH TAB NAVIGATION */}
      <div className="pb-6 flex justify-between items-center">
        <h1 className="text-[30px] font-semibold text-[#32325D]">
          Multi-Slice Data Management
        </h1>
        
        {/* 6. TAB NAVIGATION TO SWITCH BETWEEN DIFFERENT SLICE DATA */}
        <div className="flex gap-2">
          <TabButton
            tab="accounts"
            label="Accounts"
            count={campaigns.length}        // Count from campaign slice
            isActive={currentTab === 'accounts'}
            icon={Users}
          />
          <TabButton
            tab="users"
            label="Users"
            count={users.length}           // Count from user slice
            isActive={currentTab === 'users'}
            icon={User}
          />
          <TabButton
            tab="pipelines"
            label="Pipelines"
            count={pipelines.length}       // Count from pipeline slice
            isActive={currentTab === 'pipelines'}
            icon={GitBranch}
          />
        </div>
      </div>

      {/* LOADING STATE FOR ALL SLICES */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          <span className="ml-3 text-gray-600">Loading data from multiple sources...</span>
        </div>
      ) : (
        <>
          {/* 7. CONDITIONAL RENDERING BASED ON SELECTED TAB */}
          
          {/* ACCOUNTS TAB - DATA FROM CAMPAIGN SLICE */}
          {currentTab === 'accounts' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Accounts from Campaign Slice ({campaigns.length} total)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((accountItem: any) => (
                  <div key={accountItem.id} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Users className="h-8 w-8 text-blue-500" />
                      <span className={`px-2 py-1 rounded text-xs ${
                        accountItem.account_status === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {accountItem.account_status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {accountItem.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      ID: {accountItem.id}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      Currency: {accountItem.currency}
                    </p>
                    <p className="text-sm text-gray-600">
                      Timezone: {accountItem.timezone_name}
                    </p>
                    {accountItem.business && (
                      <p className="text-sm text-gray-500 mt-2">
                        Business: {accountItem.business.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* USERS TAB - DATA FROM USER SLICE */}
          {currentTab === 'users' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Users from User Slice ({users.length} total)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((userItem: any) => (
                  <div key={userItem.id} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <User className="h-8 w-8 text-indigo-500" />
                      <span className={`px-2 py-1 rounded text-xs ${
                        userItem.status === 'active' || userItem.is_active
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {userItem.status || (userItem.is_active ? 'Active' : 'Inactive')}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {userItem.name || userItem.username || `${userItem.first_name || ''} ${userItem.last_name || ''}`.trim()}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      ID: {userItem.id}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      Email: {userItem.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      Role: {userItem.role || userItem.user_type || 'User'}
                    </p>
                    {userItem.phone && (
                      <p className="text-sm text-gray-500 mt-2">
                        Phone: {userItem.phone}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PIPELINES TAB - DATA FROM PIPELINE SLICE */}
          {currentTab === 'pipelines' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Pipelines from Pipeline Slice ({pipelines.length} total)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pipelines.map((pipelineItem: any) => (
                  <div key={pipelineItem.id} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <GitBranch className="h-8 w-8 text-orange-500" />
                      <span className={`px-2 py-1 rounded text-xs ${
                        pipelineItem.status === 'active' || pipelineItem.is_active
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {pipelineItem.status || (pipelineItem.is_active ? 'Active' : 'Inactive')}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {pipelineItem.name || pipelineItem.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      ID: {pipelineItem.id}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      Description: {pipelineItem.description || 'No description'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Stages: {pipelineItem.stages?.length || pipelineItem.stage_count || 'N/A'}
                    </p>
                    {pipelineItem.deals_count !== undefined && (
                      <p className="text-sm text-gray-500 mt-2">
                        Deals: {pipelineItem.deals_count}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 8. DATA SUMMARY SECTION - SHOWING ALL SLICE DATA COUNTS */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Data Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded p-4 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{campaigns.length}</p>
            <p className="text-sm text-gray-600">Accounts</p>
            <p className="text-xs text-gray-500">From Campaign Slice</p>
          </div>
          <div className="bg-white rounded p-4 text-center">
            <User className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-indigo-600">{users.length}</p>
            <p className="text-sm text-gray-600">Users</p>
            <p className="text-xs text-gray-500">From User Slice</p>
          </div>
          <div className="bg-white rounded p-4 text-center">
            <GitBranch className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">{pipelines.length}</p>
            <p className="text-sm text-gray-600">Pipelines</p>
            <p className="text-xs text-gray-500">From Pipeline Slice</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignsPage;