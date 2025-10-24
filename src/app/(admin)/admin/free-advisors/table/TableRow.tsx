import React, { useState } from "react";
import Toggle from "./Toggle";
import Dropdown from "./Dropdown";
import { User } from "@/types/TUser";
import { LuLogIn } from "react-icons/lu";
import { FaEye } from "react-icons/fa";
import { MdDelete, MdEdit } from "react-icons/md";
import Image from "next/image";
import ConfirmationDialog from "@/components/shared/ConfirmationDialouge";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { localUpdateApproval, fetchUsersInfo } from "@/redux/slices/usersSlice"; // Adjust path as needed
import { AppDispatch } from "@/redux/store";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { updateCustomersProfileData } from "@/redux/slices/customersSlice";
import { updateProfilePicture } from "@/redux/slices/profileSlice";
import api from "@/redux/api/axiosConfig";
import { deactivateUserAccount } from "@/redux/slices/authSlice";

interface TableRowProps {
  user: User;
  onApprovalToggle: (userId: string) => void;
  onDelete?: (userId: string) => void;
}

const TableRow: React.FC<TableRowProps> = ({
  user,
  onApprovalToggle,
  onDelete = (id) => console.log(`Delete user with ID: ${id}`),
}) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  // State for dialogs
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Get avatar URL with fallback
  const avatarUrl = user.avatar_url || "/images/agent-2.jpg"; // Default image path

  // Debug: Log the avatar URL to see what's being used
  console.log("User avatar_url:", user.avatar_url);
  console.log("Final avatarUrl:", avatarUrl);

  // State for edit form
  const [editFormData, setEditFormData] = useState({
    firstName: user.first_name || user.profiles?.first_name || "",
    lastName: user.last_name || user.profiles?.last_name || "",
    phoneNumber: user.phoneNumber || user.phone || "",
    profileStatus: user.active ? "Active" : "Inactive",
    role: user.role,
  });

  // State for profile picture
  const [selectedProfilePicture, setSelectedProfilePicture] =
    useState<File | null>(null);
  const [previewProfilePicture, setPreviewProfilePicture] = useState<
    string | null
  >(null);

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
  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedProfilePicture(file);

      // Create preview URL
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
      // Prepare data for API call (excluding email)
      const updateData = {
        first_name: editFormData.firstName,
        last_name: editFormData.lastName,
        phone: editFormData.phoneNumber,
        status: editFormData.profileStatus,
        role: editFormData.role,
        // Note: email is intentionally excluded as per requirements
      };

      // Update customer profile data
      await dispatch(
        updateCustomersProfileData({
          id: user.id,
          data: updateData,
        })
      ).unwrap();

      // Update profile picture if selected
      if (selectedProfilePicture) {
        await dispatch(updateProfilePicture(selectedProfilePicture)).unwrap();
      }

      toast.success("Financial advisor profile updated successfully");
      setTimeout(() => {
        dispatch(fetchUsersInfo({ page: 1, limit: 20 }));
      }, 1000);
      setShowEditDialog(false);

      // Reset profile picture states
      setSelectedProfilePicture(null);
      setPreviewProfilePicture(null);
    } catch (error: unknown) {
      console.error("Error updating financial advisor:", error);

      if (error instanceof Error) {
        toast.error(
          error.message || "Failed to update financial advisor profile"
        );
      } else if (typeof error === "string") {
        toast.error(error);
      } else {
        toast.error(
          "An unexpected error occurred while updating the financial advisor profile"
        );
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete confirmation (deactivate account)
  const handleDeleteConfirm = async () => {
    setIsDeactivating(true);

    try {
      await dispatch(deactivateUserAccount(user.id)).unwrap();

      toast.success(
        `Financial Advisor ${user.first_name} ${user.last_name} has been deleted successfully.`
      );

      // Call the original onDelete to update the parent component's state
      onDelete(user.id);

      setShowDeleteConfirmation(false);
    } catch (error: unknown) {
      console.error("Error deleting financial advisor:", error);

      if (error instanceof Error) {
        toast.error(error.message || "Failed to delete advisor account.");
      } else if (typeof error === "string") {
        toast.error(error);
      } else {
        toast.error(
          "An unexpected error occurred while deleting the advisor account."
        );
      }
    } finally {
      setIsDeactivating(false);
    }
  };

  // Use is_approved if available, otherwise fall back to approved
  const isApproved =
    user.is_approved !== undefined ? user.is_approved : user.approved;

  // Handle approval toggle with local state and Redux
  const handleApprovalToggle = () => {
    // Update local state for immediate UI feedback
    onApprovalToggle(user.id);

    // Update Redux state
    dispatch(localUpdateApproval(user.id));
  };

  // Handle impersonation
  const handleImpersonateUser = async () => {
    try {
      console.log(
        "Current token before impersonation:",
        localStorage.getItem("token")
      );
      // Validate admin role
      const currentUserStr = localStorage.getItem("user");
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

      if (!currentUser || currentUser.role !== "admin") {
        toast.error("Only administrators can impersonate users.");
        return;
      }

      // Before impersonating, backup current admin session
      const currentToken = localStorage.getItem("token");
      const currentRefreshToken = localStorage.getItem("refreshToken");

      // Store admin credentials for later restoration
      if (currentToken) localStorage.setItem("admin_token", currentToken);
      if (currentUserStr) localStorage.setItem("admin_user", currentUserStr);
      if (currentRefreshToken)
        localStorage.setItem("admin_refresh_token", currentRefreshToken);

      // Set flag to indicate impersonation is active
      localStorage.setItem("isImpersonating", "true");

      // Make API call to impersonate
      const response = await api.post("/auth/impersonate", { userId: user.id });

      // If magic link is provided, FOLLOW it (don't try to extract the token)
      if (response.data.magic_link) {
        console.log("Following magic link:", response.data.magic_link);

        // Simply redirect to the magic link - this will eventually redirect to your callback
        window.location.href = response.data.magic_link;
        return;
      }

      // Fallback for direct token response
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

  // Financial advisor action items (all users are advisors)
  const actionItems = [
    {
      label: "Login to User",
      action: handleImpersonateUser,
      icon: <LuLogIn size={18} />,
      color: "bg-[#0B5ED7]",
    },
    {
      label: "View",
      action: () => setShowUserProfile(true),
      icon: <FaEye size={18} />,
      color: "bg-[#0DCAF0]",
    },
    {
      label: "Edit",
      action: () => setShowEditDialog(true),
      icon: <MdEdit size={18} />,
      color: "bg-[#FFC107]",
    },
    {
      label: "Delete",
      action: () => setShowDeleteConfirmation(true),
      icon: <MdDelete size={18} />,
      color: "bg-[#DC3545]",
    },
  ];

  return (
    <>
      <tr className="">
        <td className="px-4 py-4 whitespace-nowrap text-base font-medium text-gray-900">
          {user.first_name}
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-base text-primary">
          {user.last_name}
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-base text-primary">
          {user.phoneNumber || ""}
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-base text-primary">
          <Image
            src={avatarUrl}
            alt=""
            width={50}
            height={50}
            className="rounded-full"
            unoptimized
            onError={(e) => {
              // Fallback to default image if external URL fails
              const target = e.target as HTMLImageElement;
              target.src = "/images/agent-2.jpg";
            }}
          />
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <span
            className={`p-1 inline-flex text-xs font-bold rounded-md ${
              user.active
                ? "bg-[#198754] text-white"
                : "bg-[#DC3545] text-white"
            }`}
          >
            {user.active ? "Active" : "Inactive"}
          </span>
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-base text-primary">
          {user.lead_email || user.email || ""}
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <span className="px-2 py-1 inline-flex text-white font-bold text-xs rounded-md bg-[#28a745]">
            {user.role}
          </span>
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-base text-primary">
          {user.contract || ""}
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-base text-primary">
          {user.last_login}
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-base text-primary">
          {user.registerAt}
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <Toggle checked={isApproved} onChange={handleApprovalToggle} />
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <span className="px-2 py-1 inline-flex text-xs font-bold rounded-md bg-[#0D6EFD] text-white">
            {user.emailVerified ? "Verified" : "Pending"}
          </span>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <Dropdown label="Actions" items={actionItems} variant="primary" />
        </td>
      </tr>

      {/* User Profile Modal */}
      {showUserProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-10">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl overflow-hidden mx-4 my-auto">
            {/* Green header for financial advisors */}
            <div className="h-40 bg-green-600 relative">
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
                Financial Advisor Profile
              </h2>
              <div className="border-t border-gray-300 my-4"></div>

              <div className="space-y-6 mt-6">
                <div className="flex">
                  <div className="w-1/3 text-right pr-8 text-gray-700 font-medium">
                    First Name
                  </div>
                  <div className="w-2/3">: {user.first_name}</div>
                </div>

                <div className="flex">
                  <div className="w-1/3 text-right pr-8 text-gray-700 font-medium">
                    Last Name
                  </div>
                  <div className="w-2/3">: {user.last_name}</div>
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
                    : {user.phoneNumber || "Not provided"}
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

                {/* Financial advisor specific fields */}
                <div className="flex">
                  <div className="w-1/3 text-right pr-8 text-gray-700 font-medium">
                    Advisor Type
                  </div>
                  <div className="w-2/3">: Financial Advisor</div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-right pr-8 text-gray-700 font-medium">
                    Commission Rate
                  </div>
                  <div className="w-2/3">: Standard Rate</div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-right pr-8 text-gray-700 font-medium">
                    Client Count
                  </div>
                  <div className="w-2/3">: Not Available</div>
                </div>
              </div>

              {/* Advisor action buttons */}
              <div className="flex justify-center mt-8 space-x-4">
                <button
                  onClick={() => console.log("View clients for", user.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  View Clients
                </button>
                <button
                  onClick={() =>
                    console.log("View commission reports for", user.id)
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Commission Reports
                </button>
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
                    {selectedProfilePicture
                      ? selectedProfilePicture.name
                      : "No file chosen"}
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
                  <small className="text-gray-500">
                    Email cannot be edited
                  </small>
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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        title="Delete Financial Advisor"
        message={`Are you sure you want to delete ${user.first_name} ${user.last_name}? This will remove all advisor information including client relationships.`}
        confirmText={isDeactivating ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirmation(false)}
      />
    </>
  );
};

export default TableRow;
