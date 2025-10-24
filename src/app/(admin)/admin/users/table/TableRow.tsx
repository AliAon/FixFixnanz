import React, { useState } from "react";
import Toggle from "./Toggle";
import Dropdown from "./Dropdown";
import { User } from "@/types/TUser";
import { LuLogIn } from "react-icons/lu";
import { FaEye, FaCheck, FaTimes } from "react-icons/fa";
import { MdDelete, MdEdit, MdVerified, MdPending } from "react-icons/md";
import Image from "next/image";
import ConfirmationDialog from "@/components/shared/ConfirmationDialouge";
import Link from "next/link";
import { fetchUsersInfo, updateUserApproval, updateUserProfile, removeUserFromList } from "@/redux/slices/usersSlice";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/redux/store";
import { toast, ToastContainer } from "react-toastify";
import {
  deactivateUserAccount,
} from "@/redux/slices/authSlice";
//import { updateCustomersProfileData } from "@/redux/slices/customersSlice";
import { updateProfilePicture } from "@/redux/slices/profileSlice";
import api from "@/redux/api/axiosConfig";

interface TableRowProps {
  user: User;
  onApprovalToggle: (userId: string) => void;
  onDelete: (userId: string) => void;
}

const TableRow: React.FC<TableRowProps> = ({
  user,
  onDelete,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // State for dialogs
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // State for optimistic updates and loading
  const [localApprovalStatus, setLocalApprovalStatus] = useState<boolean | null>(null);
  const [isTogglingApproval, setIsTogglingApproval] = useState(false);

  // Get avatar URL with fallback
  const avatarUrl = user.avatar_url || "/images/agent-2.jpg";

  // State for edit form
  const [editFormData, setEditFormData] = useState({
    firstName: user.first_name || user.profiles?.first_name || "",
    lastName: user.last_name || user.profiles?.last_name || "",
    phoneNumber: user.phoneNumber || user.phone || "",
    profileStatus: user.active ? "Active" : "Inactive",
    role: user.role,
  });

  // State for profile picture
  const [selectedProfilePicture, setSelectedProfilePicture] = useState<File | null>(null);
  const [previewProfilePicture, setPreviewProfilePicture] = useState<string | null>(null);

  // Function to format date in German format (d.m.Y)
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();

      return `${day}.${month}.${year}`;
    } catch (_error) {
      console.error("Error formatting date:", _error);
      return dateString;
    }
  };

  // Function to get relative time in German
  const getRelativeTimeGerman = (dateString: string | null | undefined): string => {
    if (!dateString) return '';

    try {
      const now = new Date();
      const past = new Date(dateString);
      const diffInMilliseconds = now.getTime() - past.getTime();

      const seconds = Math.floor(diffInMilliseconds / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const months = Math.floor(days / 30);
      const years = Math.floor(days / 365);

      if (seconds < 60) {
        return 'gerade eben';
      } else if (minutes < 60) {
        return minutes === 1 ? 'vor 1 Minute' : `vor ${minutes} Minuten`;
      } else if (hours < 24) {
        return hours === 1 ? 'vor 1 Stunde' : `vor ${hours} Stunden`;
      } else if (days < 30) {
        return days === 1 ? 'vor 1 Tag' : `vor ${days} Tagen`;
      } else if (months < 12) {
        return months === 1 ? 'vor 1 Monat' : `vor ${months} Monaten`;
      } else {
        return years === 1 ? 'vor 1 Jahr' : `vor ${years} Jahren`;
      }
    } catch (_error) {
      console.error("Error calculating relative time:", _error);
      return '';
    }
  };

  // Handle edit form changes
  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // Handle profile picture selection
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedProfilePicture(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewProfilePicture(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async () => {
    setIsUpdating(true);

  try {
    // Prepare update data
    const updateData = {
      first_name: editFormData.firstName,
      last_name: editFormData.lastName,
      phone: editFormData.phoneNumber,
      role: editFormData.role,
      is_active: editFormData.profileStatus === "Active",
    };

    console.log("Submitting user update:", { userId: user.id, updateData });

    // Update user profile using the new action
    await dispatch(updateUserProfile({
      id: user.id,
      data: updateData
    })).unwrap();

    // Handle profile picture upload separately if selected
    if (selectedProfilePicture) {
      try {
        await dispatch(updateProfilePicture(selectedProfilePicture)).unwrap();
      } catch (pictureError) {
        console.warn("Profile picture update failed:", pictureError);
        toast.warn("User updated successfully, but profile picture upload failed");
      }
    }

    toast.success("User profile updated successfully");

    // Refresh the users list after a short delay
    setTimeout(() => {
      dispatch(fetchUsersInfo({ page: 1, limit: 20 }));
    }, 1000);

    // Close dialog and reset form
    setShowEditDialog(false);
    setSelectedProfilePicture(null);
    setPreviewProfilePicture(null);

  } catch (error: unknown) {
    console.error("Error updating user:", error);

    if (error instanceof Error) {
      toast.error(error.message || "Failed to update user profile");
    } else if (typeof error === "string") {
      toast.error(error);
    } else {
      toast.error("An unexpected error occurred while updating the user profile");
    }
  } finally {
    setIsUpdating(false);
  }
};

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    setIsDeactivating(true);

    try {
      // Make the API call to delete
      await dispatch(deactivateUserAccount(user.id)).unwrap();

      // Remove from Redux state immediately
      dispatch(removeUserFromList(user.id));

      toast.success(
        `User ${user.first_name} ${user.last_name} has been deleted successfully.`
      );

      onDelete(user.id);
      setShowDeleteConfirmation(false);

    } catch (error: unknown) {
      console.error("Error deleting user:", error);

      if (error instanceof Error) {
        toast.error(error.message || "Failed to delete user account.");
      } else if (typeof error === "string") {
        toast.error(error);
      } else {
        toast.error("An unexpected error occurred while deleting the user account.");
      }
    } finally {
      setIsDeactivating(false);
    }
  };

  // Get effective approval status (with optimistic updates)
  const isApproved = localApprovalStatus !== null
    ? localApprovalStatus
    : Boolean(user.is_approved !== undefined ? user.is_approved : user.approved);

  // Handle approval toggle with optimistic updates
  const handleApprovalToggle = async () => {
    // Prevent multiple clicks
    if (isTogglingApproval) return;

    try {
      setIsTogglingApproval(true);

      // Use the current displayed state (including local optimistic updates)
      const currentDisplayedStatus = isApproved;
      const newApprovalStatus = !currentDisplayedStatus;

      console.log("Current displayed status:", currentDisplayedStatus);
      console.log("New approval status:", newApprovalStatus);
      console.log("User data - is_approved:", user.is_approved);
      console.log("User data - approved:", user.approved);

      // OPTIMISTIC UPDATE: Update local state immediately for instant UI feedback
      setLocalApprovalStatus(newApprovalStatus);

      // Make the API call in the background
      const result = await dispatch(updateUserApproval({
        userId: user.id,
        is_approved: newApprovalStatus
      })).unwrap();

      console.log("API response:", result);

      // Show success message
      toast.success(
        `User ${user.first_name} ${user.last_name} has been ${newApprovalStatus ? 'approved' : 'unapproved'}.`
      );

      // Keep local state for longer to prevent flickering from data refresh
      setTimeout(() => {
        setLocalApprovalStatus(null);
      }, 2000); // Keep optimistic state for 2 seconds

    } catch (error) {
      console.error("Error updating approval status:", error);

      // ROLLBACK: Revert the optimistic update on error
      setLocalApprovalStatus(null);

      if (error instanceof Error) {
        toast.error(error.message || "Failed to update approval status");
      } else if (typeof error === "string") {
        toast.error(error);
      } else {
        toast.error("An unexpected error occurred while updating approval status");
      }
    } finally {
      setIsTogglingApproval(false);
    }
  };

  const { user: authUser } = useSelector((state: RootState) => state.auth);

  console.debug("Current user:", authUser);

  const handleImpersonateUser = async () => {
    try {
      const currentUserStr = localStorage.getItem("user");
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

      if (!currentUser || currentUser.role !== "admin") {
        toast.error("Only administrators can impersonate users.");
        return;
      }

      const currentToken = localStorage.getItem("token");
      const currentRefreshToken = localStorage.getItem("refreshToken");

      if (currentToken) localStorage.setItem("admin_token", currentToken);
      if (currentUserStr) localStorage.setItem("admin_user", currentUserStr);
      if (currentRefreshToken)
        localStorage.setItem("admin_refresh_token", currentRefreshToken);

      localStorage.setItem("isImpersonating", "true");

      const response = await api.post("/auth/impersonate", { userId: user.id });

      if (response.data.magic_link) {
        window.location.href = response.data.magic_link;
        return;
      }

      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }

        if (response.data.refresh_token) {
          localStorage.setItem("refreshToken", response.data.refresh_token);
        }

        toast.success(`Successfully impersonating user`);
        router.push("/admin");
      } else {
        toast.error("No valid authentication data received");
      }
    } catch (error) {
      console.error("Impersonation error:", error);
      toast.error("Failed to impersonate user");
    }
  };

  // Create action items conditionally - only include Delete for users with "user" role
  const actionItems = [
    {
      label: "Login to User",
      action: handleImpersonateUser,
      icon: <LuLogIn size={16} />,
      color: "bg-[#0B5ED7]",
    },
    {
      label: "View",
      action: () => setShowUserProfile(true),
      icon: <FaEye size={16} />,
      color: "bg-[#0DCAF0]",
    },
    {
      label: "Edit",
      action: () => setShowEditDialog(true),
      icon: <MdEdit size={16} />,
      color: "bg-[#FFC107]",
    },
    // Only include Delete action for users with "user" role
    ...(user.role === "user" || user.role === "financial-advisor" ? [{
      label: "Delete",
      action: () => setShowDeleteConfirmation(true),
      icon: <MdDelete size={16} />,
      color: "bg-[#DC3545]",
    }] : []),
  ];

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <tr className="hover:bg-gray-50">
        {/* User Column: Profile Image + Name */}
        <td className="w-64 px-4 py-3">
          <div className="flex items-center space-x-3">
            <Image
              src={avatarUrl}
              alt=""
              width={40}
              height={40}
              className="rounded-full flex-shrink-0"
              unoptimized
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/agent-2.jpg";
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.first_name || user.profiles?.first_name || ""} {user.last_name || user.profiles?.last_name || ""}
              </p>
            </div>
          </div>
        </td>

        {/* Contact Column: Email + Phone */}
        <td className="w-48 px-4 py-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              {/* Email Verification */}
              <div title={user.emailVerified ? "Email Verified" : "Email Pending"}>
                {user.emailVerified ? (
                  <MdVerified className="w-4 h-4 text-green-500" />
                ) : (
                  <MdPending className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              <p className="text-sm text-gray-900 truncate" title={user.lead_email || user.email || ""}>
                {user.lead_email || user.email || ""}
              </p>
            </div>
            <p className="text-xs text-gray-500">
              {user.phoneNumber || user.phone || "No phone"}
            </p>
          </div>
        </td>

        {/* Role Column */}
        <td className="w-32 px-4 py-3">
          <span className={`px-2 py-1 inline-flex text-xs font-bold rounded-full text-white
            ${user.role === "user" ? "bg-[#6C757D]" :
              user.role === "financial-advisor" ? "bg-[#0DCAF0]" :
                user.role === "admin" ? "bg-[#DC3545]" : "bg-[#FFC107]"}`}>
            {user.role}
          </span>
        </td>

        {/* Status Column: Active + Approval + Email Verification */}
        <td className="w-40 px-4 py-3">
          <div className="space-y-2">
            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${user.approved ? "bg-green-500" : "bg-red-500"}`}></span>
              <span className="text-xs text-gray-600">
                {user.approved ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Status Icons Row */}
            <div className="flex items-center space-x-3">
              {/* Approval Status */}
              <div className="flex items-center" title={isApproved ? "Approved" : "Pending Approval"}>
                <Toggle checked={isApproved} onChange={handleApprovalToggle} />
              </div>
            </div>
          </div>
        </td>

        {/* Activity Column: Registration Date + Last Login */}
        <td className="w-36 px-4 py-3">
          <div className="space-y-1">
            {/* Registration Date - Top */}
            <p className="text-xs text-gray-500" title="Registriert">
              📅 {formatDate(user.registerAt || user.created_at)}
            </p>

            {/* Last Login - Bottom */}
            <p className="text-xs text-gray-600" title="Letzter Login">
              🔐 {user.last_login ?
                `${getRelativeTimeGerman(user.last_login)}` :
                "Nie"
              }
            </p>
          </div>
        </td>

        {/* Contract Column */}
        <td className="w-24 px-4 py-3 text-center">
          {user.contract_uploaded ? (
            <FaCheck className="w-4 h-4 text-green-500 mx-auto" title="Contract Uploaded" />
          ) : (
            <FaTimes className="w-4 h-4 text-red-500 mx-auto" title="No Contract" />
          )}
        </td>

        {/* Actions Column */}
        <td className="w-32 px-4 py-3">
          <Dropdown label="Actions" items={actionItems} variant="secondary" />
        </td>
      </tr>

      {/* User Profile Modal */}
      {showUserProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-10">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl overflow-hidden mx-4 my-auto">
            {/* Blue header */}
            <div className="h-40 bg-blue-600 relative">
              <Link
                href=""
                onClick={() => setShowUserProfile(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Link>

              {/* Profile image */}
              <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-20">
                <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center overflow-hidden border-4 border-white">
                  <Image
                    src={avatarUrl}
                    alt={`${user.first_name} ${user.last_name}`}
                    width={160}
                    height={160}
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/agent-2.jpg";
                    }}
                  />
                </div>
              </div>
            </div>

            {/* User Information */}
            <div className="mt-24 p-6">
              <h2 className="text-3xl font-medium text-gray-800 mb-4 text-center">
                User Information
              </h2>
              <div className="border-t border-gray-300 my-4"></div>

              <div className="space-y-6 mt-6">
                <div className="flex">
                  <div className="w-1/3 text-right pr-8 text-gray-700 font-medium">
                    First Name
                  </div>
                  <div className="w-2/3">
                    : {user.first_name || user.profiles?.first_name || ""}
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/3 text-right pr-8 text-gray-700 font-medium">
                    Last Name
                  </div>
                  <div className="w-2/3">
                    : {user.last_name || user.profiles?.last_name || ""}
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/3 text-right pr-8 text-gray-700 font-medium">
                    Profile Status
                  </div>
                  <div className="w-2/3">
                    :{" "}
                    <span className="text-blue-600">
                      {user.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/3 text-right pr-8 text-gray-700 font-medium">
                    Email
                  </div>
                  <div className="w-2/3">
                    : {user.lead_email || user.email || ""}
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/3 text-right pr-8 text-gray-700 font-medium">
                    Phone Number
                  </div>
                  <div className="w-2/3">
                    : {user.phoneNumber || user.phone || "Not provided"}
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/3 text-right pr-8 text-gray-700 font-medium">
                    Role Name
                  </div>
                  <div className="w-2/3">: {user.role}</div>
                </div>

                <div className="flex">
                  <div className="w-1/3 text-right pr-8 text-gray-700 font-medium">
                    Email Verify
                  </div>
                  <div className="w-2/3">
                    :{" "}
                    <span className="text-blue-600">
                      {user.emailVerified ? "Verified" : "Verify"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Dialog */}
      {showEditDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-10">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 my-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b border-gray-300 pb-4">
                <h2 className="text-xl font-semibold text-[#32325D]">
                  Contact information
                </h2>
                <Link
                  href=""
                  onClick={() => setShowEditDialog(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Link>
              </div>

              {/* Profile Photo */}
              <div className="flex justify-center mb-4">
                <Image
                  src={previewProfilePicture || avatarUrl}
                  alt={`${user.first_name} ${user.last_name}`}
                  width={100}
                  height={100}
                  className="rounded-full object-cover"
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/agent-2.jpg";
                  }}
                />
              </div>

              <div className="mb-2">
                <label className="block text-gray-700 mb-2">Profilfoto :</label>
                <div className="flex">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                    id="profile-picture-input"
                  />
                  <label
                    htmlFor="profile-picture-input"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-l cursor-pointer hover:bg-gray-300 transition-colors"
                  >
                    Choose File
                  </label>
                  <div className="flex-1 border border-gray-300 rounded-r py-2 px-3">
                    {selectedProfilePicture ? selectedProfilePicture.name : "No file chosen"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="mb-2">
                  <label className="block text-gray-700 mb-2">Vorname :</label>
                  <input
                    type="text"
                    name="firstName"
                    value={editFormData.firstName}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-gray-700 mb-2">Nachname :</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editFormData.lastName}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-gray-700 mb-2">
                    Profilestatus :
                  </label>
                  <select
                    name="profileStatus"
                    value={editFormData.profileStatus}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="mb-2">
                  <label className="block text-gray-700 mb-2">E-Mail :</label>
                  <input
                    type="email"
                    value={user.lead_email || user.email || ""}
                    disabled
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
                  />
                  <small className="text-gray-500">Email cannot be edited</small>
                </div>

                <div className="mb-2">
                  <label className="block text-gray-700 mb-2">
                    Telefonnummer :
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={editFormData.phoneNumber}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-gray-700 mb-2">Rolle :</label>
                  <select
                    name="role"
                    value={editFormData.role}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="financial-advisor">Financial Advisor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleEditSubmit}
                  disabled={isUpdating}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "Updating..." : "Speichern"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationDialog
          isOpen={showDeleteConfirmation}
          title="Delete User"
          message={`Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`}
          confirmText={isDeactivating ? "Deleting..." : "Delete"}
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirmation(false)}
      />
    </>
  );
};

export default TableRow;