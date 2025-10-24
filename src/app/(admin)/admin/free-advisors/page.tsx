"use client";

import {  useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "./table/Header";
import UserTable from "./table/UserTable";
import Pagination from "./table/Pagination";
import { localUpdateApproval } from "@/redux/slices/usersSlice";
import { RootState } from "@/redux/store";
import { AppDispatch } from "@/redux/store";
import { toast } from "react-toastify";

export default function FreeAdvisorPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    financialAdvisors,
    financialAdvisorLoading,
    financialAdvisorError,
    financialAdvisorTotalPages,
  } = useSelector((state: RootState) => state.users);

  // No need to fetch here since Header component handles initial data loading

  const handleApprovalToggle = (userId: string) => {
    dispatch(localUpdateApproval(userId));
  };

  // Show loading state
  const showLoadingState = financialAdvisorLoading;

  useEffect(() => {
    if (financialAdvisorError) {
      toast.error(financialAdvisorError);
    }
  }, [financialAdvisorError]);

  return (
    <div className="w-full h-full">
      <div className="bg-white shadow rounded-lg overflow-x-hidden w-full px-8">
        <Header />

        {showLoadingState && (
          <div className="text-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading financial advisors...</p>
          </div>
        )}

        {!showLoadingState && (
          <div className="overflow-x-auto min-w-full">
            <UserTable
              users={financialAdvisors}
              onApprovalToggle={handleApprovalToggle}
            />
          </div>
        )}

        {financialAdvisorTotalPages > 1 && !showLoadingState && <Pagination />}
      </div>
    </div>
  );
}
