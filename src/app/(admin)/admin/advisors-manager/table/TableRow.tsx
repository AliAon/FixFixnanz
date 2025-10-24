import React, { useState } from "react";
import Toggle from "./Toggle";
import Dropdown from "./Dropdown";
import { User } from "@/types/TUser";
import { LuLogIn } from "react-icons/lu";
import { FaEye } from "react-icons/fa";
import { MdDelete, MdEdit } from "react-icons/md";
import Image from "next/image";
import ConfirmationDialog from "@/components/shared/ConfirmationDialouge";
import { toast, ToastContainer } from "react-toastify";
// import { impersonateUser } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import api from "@/redux/api/axiosConfig";

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
  // State for dialogs
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // State for profile image
  // const [profileImage, setProfileImage] = useState<string | null>(null);
  // const [profileFile] = useState<File | null>(null);

  // State for edit form
  // const [editFormData, setEditFormData] = useState({
  //   firstName: user.first_name,
  //   lastName: user.last_name,
  //   email: user.email,
  //   phoneNumber: user.phoneNumber || "",
  //   profileStatus: user.active ? "Active" : "Inactive",
  //   role: user.role,
  // });

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
  // Updated switchBackToAdmin function
  // const handleSwitchBackToAdmin = () => {
  //   try {
  //     // Retrieve admin tokens
  //     const adminToken = localStorage.getItem("admin_token");
  //     const adminUser = localStorage.getItem("admin_user");
  //     const adminRefreshToken = localStorage.getItem("admin_refresh_token");

  //     if (!adminToken || !adminUser) {
  //       toast.error("No admin session found");
  //       return;
  //     }

  //     // Restore admin tokens
  //     localStorage.setItem("token", adminToken);
  //     localStorage.setItem("user", adminUser);
  //     if (adminRefreshToken)
  //       localStorage.setItem("refreshToken", adminRefreshToken);

  //     // Clear backup admin tokens
  //     localStorage.removeItem("admin_token");
  //     localStorage.removeItem("admin_user");
  //     localStorage.removeItem("admin_refresh_token");
  //     localStorage.removeItem("isImpersonating");

  //     // Update API instance headers
  //     api.defaults.headers.common["Authorization"] = `Bearer ${adminToken}`;

  //     toast.success("Switched back to admin account");
  //     router.push("/admin/users");
  //   } catch (error) {
  //     console.error("Switch back error:", error);
  //     toast.error("Failed to switch back to admin");
  //   }
  // };

  // Handle edit form changes
  // const handleEditInputChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  // ) => {
  //   const { name, value } = e.target;
  //   setEditFormData({
  //     ...editFormData,
  //     [name]: value,
  //   });
  // };

  // Handle edit form submission
  // const handleEditSubmit = () => {
  //   console.log("Updating user with data:", {
  //     ...editFormData,
  //     profileImage: profileFile,
  //   });
  //   // Implement your update logic here
  //   setShowEditDialog(false);
  // };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    onDelete(user.id);
    setShowDeleteConfirmation(false);
  };

  // Clean up object URLs when the component unmounts
  // React.useEffect(() => {
  //   return () => {
  //     if (profileImage) {
  //       URL.revokeObjectURL(profileImage);
  //     }
  //   };
  // }, [profileImage]);

  // Determine role color and display
  const getRoleColorAndDisplay = () => {
    switch (user.role.toLowerCase()) {
      case "admin":
        return "bg-[#0DCAF0]";
      case "user":
        return "bg-[#6C757D]";
      case "financial-advisor":
        return "bg-[#198754]";
      default:
        return "bg-[#6C757D]";
    }
  };

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
            src="/images/agent-2.jpg"
            alt=""
            width={50}
            height={50}
            className="rounded-full"
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
          {user.email}
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <span
            className={`px-2 py-1 inline-flex text-white font-bold text-xs rounded-md ${getRoleColorAndDisplay()}`}
          >
            {user.role}
          </span>
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-base text-primary">
          {user.contract || ""}
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-base text-primary">
          {user.last_login || ""}
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-base text-primary">
          {user.registerAt}
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <Toggle
            checked={user.approved}
            onChange={() => onApprovalToggle(user.id)}
          />
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <span className="px-2 py-1 inline-flex text-xs font-bold rounded-md bg-[#0D6EFD] text-white">
            {user.emailVerified ? "Verified" : "Pending"}
          </span>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <Dropdown label="Actions" items={actionItems} />
        </td>
      </tr>

      {/* User Profile Modal - No changes needed here */}
      {showUserProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-10">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl overflow-hidden mx-4 my-auto">
            {/* ... existing profile modal code ... */}
          </div>
        </div>
      )}

      {/* Edit User Dialog - No changes needed here */}
      {showEditDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-10">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 my-auto">
            {/* ... existing edit dialog code ... */}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        title="Delete User"
        message={`Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirmation(false)}
      />
    </>
  );
};

export default TableRow;
