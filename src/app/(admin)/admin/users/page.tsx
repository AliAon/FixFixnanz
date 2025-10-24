"use client";

import { useDispatch, useSelector } from "react-redux";
import Header from "./table/Header";
import UserTable from "./table/UserTable";
import Pagination from "./table/Pagination";
import { localUpdateApproval } from "@/redux/slices/usersSlice";
import { RootState } from "@/redux/store";
import { AppDispatch } from "@/redux/store";

export default function UsersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    users,
    isLoading,
    error,
    totalPages,
  } = useSelector((state: RootState) => state.users);

  const handleApprovalToggle = (userId: string) => {
    dispatch(localUpdateApproval(userId));
  };

  const handleDeleteUser = (userId: string) => {
    console.log(userId);
    // dispatch(deleteUser(userId));
  };

  // Show loading state
  const showLoadingState = isLoading;

  return (
    <div className="w-full h-full">
      <div className="bg-white shadow rounded-lg overflow-x-hidden w-full px-8">
        <Header />

        {showLoadingState && (
          <div className="text-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        )}

        {error && (
          <div className="text-center p-6 text-red-500">
            <p className="font-medium">Error loading users</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!showLoadingState && (
          <div className="overflow-x-auto min-w-full">
            <UserTable
              users={users}
              onApprovalToggle={handleApprovalToggle}
              onDelete={handleDeleteUser}
            />
          </div>
        )}

        {totalPages > 1 && !showLoadingState && <Pagination />}
      </div>
    </div>
  );
}
