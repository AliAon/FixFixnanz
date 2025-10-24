"use client";
import ConfirmationDialog from "@/components/shared/ConfirmationDialouge";
import React from "react";
import { useState } from "react";
import { MdDelete } from "react-icons/md";

interface UserProfile {
  isActive: boolean;
  joinedDate: string;
  company: string;
}

const SettingsPage: React.FC = () => {
  const [userProfile] = useState<UserProfile>({
    isActive: false,
    joinedDate: "1 week",
    company: "Fixfinance",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDeleteAccount = () => {
    setIsDialogOpen(true);
  };

  const confirmDelete = () => {
    console.log("Account deletion confirmed");
    setIsDialogOpen(false);
  };

  const cancelDelete = () => {
    console.log("Account deletion cancelled");
    setIsDialogOpen(false);
  };

  return (
    <div className="max-w-4xl  p-4">
      <h1 className="text-[40px] font-semibold text-primary mb-4">
        Settings & Configurations
      </h1>

      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-[23px] font-semibold text-primary mb-2">
          User Profile
        </h2>

        <div className="flex items-center gap-8">
          <div className="mb-6">
            <div className="text-[16px] font-bold text-gray-800">
              {userProfile.isActive ? "Account active" : "Account inactive"}
            </div>

            <div className="mt-2 text-gray-700">
              You have been with{" "}
              <span className="font-bold">{userProfile.company}</span> for{" "}
              <span className="font-bold">{userProfile.joinedDate}</span>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleDeleteAccount}
              className="bg-[#DC3545] hover:bg-[#BB2D3B] duration-0 border-none text-[16px] text-white py-2 px-4 rounded flex items-center justify-center"
            >
              <span className="mr-1">
                <MdDelete size={20} />
              </span>
              Permanently Delete Account
            </button>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDialogOpen}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default SettingsPage;
