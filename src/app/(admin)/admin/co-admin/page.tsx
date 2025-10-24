"use client";
import React, { useState } from "react";
import { NextPage } from "next";
import AddUserModal from "./models/AddUser";
import UserDetailsModal from "./models/Detail";
import { FiLogIn } from "react-icons/fi";
import ConfirmationDialog from "@/components/shared/ConfirmationDialouge";

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  twilioNumber?: string;
  userType: string;
  inviteStatus: string | null;
  phone?: string;
  address?: string;
  state?: string;
  city?: string;
  company?: string;
  company_id?: string;
  pipeline_id?: string;
  stage_id?: string;  
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  uniqueId: string;
}

const CoAdminPage: NextPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const users: User[] = [
    {
      userId: "672433830",
      firstName: "Andreas",
      lastName: "Kosche",
      email: "andreas@digitale-neukunden.de",
      twilioNumber: "+4934160823041",
      userType: "API",
      inviteStatus: "Accepted",
    },
    {
      userId: "49466414",
      firstName: "Martin",
      lastName: "Zenner",
      email: "martinzenner1990@gmail.com",
      twilioNumber: "",
      userType: "API",
      inviteStatus: null,
    },
    {
      userId: "1615192699",
      firstName: "Martin",
      lastName: "Zenner",
      email: "vertriebdnk@gmail.com",
      twilioNumber: "",
      userType: "API",
      inviteStatus: null,
    },
    {
      userId: "2003888019",
      firstName: "saiful",
      lastName: "saif",
      email: "saifulsaif5854@gmail.com",
      twilioNumber: "",
      userType: "API",
      inviteStatus: null,
    },
  ];

  const handleSendInvitation = (user: User) => {
    setSelectedUser(user);
    setIsConfirmDialogOpen(true);
  };

  const confirmSendInvitation = () => {
    // Here you would implement the actual invitation sending logic
    console.log("Sending invitation to:", selectedUser);
    setIsConfirmDialogOpen(false);
    // Optionally refresh data or update UI after successful invitation
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-[#32325D]">Hubspot Users</h1>
        <button
          className="bg-[#002D51] duration-0 text-white font-medium py-2 px-4 rounded"
          onClick={() => setIsAddModalOpen(true)}
        >
          Add User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border-b border-gray-300">
          <thead>
            <tr className="border-b-2 border-primary">
              <th className="py-3 px-4 text-left font-bold text-primary">
                User ID
              </th>
              <th className="py-3 px-4 text-left font-bold text-primary">
                First Name
              </th>
              <th className="py-3 px-4 text-left font-bold text-primary">
                Last Name
              </th>
              <th className="py-3 px-4 text-left font-bold text-primary">
                Email
              </th>
              <th className="py-3 px-4 text-left font-bold text-primary">
                Twilio Number
              </th>
              <th className="py-3 px-4 text-left font-bold text-primary">
                User Type
              </th>
              <th className="py-3 px-4 text-left font-bold text-primary">
                Invite Status
              </th>
              <th className="py-3 px-4 text-left font-bold text-primary">
                Option
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.userId} className="border-b border-gray-200">
                <td className="py-4 px-4 text-primary text-[15px]">
                  {user.userId}
                </td>
                <td className="py-4 px-4 text-primary text-[15px]">
                  {user.firstName}
                </td>
                <td className="py-4 px-4 text-primary text-[15px]">
                  {user.lastName}
                </td>
                <td className="py-4 px-4 text-primary text-[15px]">
                  {user.email}
                </td>
                <td className="py-4 px-4">
                  {user.twilioNumber ? (
                    <button className="bg-[#0D6EFD] duration-100 hover:bg-blue-600 text-white py-1 px-2 text-sm rounded">
                      {user.twilioNumber}
                    </button>
                  ) : (
                    <button className="bg-[#0D6EFD] duration-100 hover:bg-blue-600 text-white py-1 px-2 text-sm rounded">
                      Twilio Number
                    </button>
                  )}
                </td>
                <td className="py-4 px-4 text-primary text-[15px]">
                  {user.userType}
                </td>
                <td className="py-4 px-4">
                  {user.inviteStatus ? (
                    <span className="bg-[#198754] text-xs font-bold text-white p-1 rounded">
                      {user.inviteStatus}
                    </span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="py-4 px-4">
                  {user.inviteStatus === "Accepted" ? (
                    <div className="space-y-2">
                      <button
                        className="bg-[#198754] hover:bg-green-700 text-white py-2 px-3 w-full rounded text-sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDetailsModalOpen(true);
                        }}
                      >
                        Co-Admin Details
                      </button>
                      <button className="bg-[#3B82F6] hover:bg-[#0B5ED7] text-white py-2 px-3 w-full rounded text-sm flex items-center justify-center">
                        <FiLogIn />
                        Login
                      </button>
                    </div>
                  ) : (
                    <button
                      className="bg-[#002D51] text-white py-2 px-3 rounded text-sm"
                      onClick={() => handleSendInvitation(user)}
                    >
                      Send Invitation
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={(userData: UserFormData) => {
          console.log("New user data:", userData);
          // Here you would typically save the data to your backend
          setIsAddModalOpen(false);
        }}
      />

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        userData={selectedUser}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        title="Are you sure?"
        message="Are you sure you want to send Co-Admin Invitation?"
        confirmText="Yes"
        cancelText="Cancel"
        onConfirm={confirmSendInvitation}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />
    </div>
  );
};

export default CoAdminPage;
