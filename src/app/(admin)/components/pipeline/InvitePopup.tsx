"use client";
import { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { AppDispatch} from "@/redux/store";
import { inviteUser } from "@/redux/slices/authSlice";
import { updateInvitationStatus } from "@/redux/slices/customersSlice";
import { toast } from "react-toastify";

// Global singleton to track ongoing API calls
class ApiCallTracker {
  private static instance: ApiCallTracker;
  private ongoingCalls = new Set<string>();

  static getInstance(): ApiCallTracker {
    if (!ApiCallTracker.instance) {
      ApiCallTracker.instance = new ApiCallTracker();
    }
    return ApiCallTracker.instance;
  }

  isCallInProgress(key: string): boolean {
    return this.ongoingCalls.has(key);
  }

  startCall(key: string): void {
    this.ongoingCalls.add(key);
  }

  endCall(key: string): void {
    this.ongoingCalls.delete(key);
  }
}

interface InvitePopupProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  userId?: string;
  instanceId?: string; // Add unique instance identifier
}

const InvitePopup: React.FC<InvitePopupProps> = ({ 
  isOpen, 
  onClose, 
  email, 
  userId,
  instanceId = 'default'
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [isInviting, setIsInviting] = useState(false);
  const [isContractServiceEnabled, setIsContractServiceEnabled] = useState(true);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [lastToggleTime, setLastToggleTime] = useState(0);

  // Handle contract service toggle
  const handleToggleContractService = async () => {
    if (!userId) {
      toast.error("User ID is required to update invitation status");
      return;
    }

    const tracker = ApiCallTracker.getInstance();
    const callKey = `updateInvitationStatus-${userId}`;

    // Prevent multiple simultaneous calls globally
    if (isTogglingStatus || tracker.isCallInProgress(callKey)) {
      console.log("API call already in progress, skipping...");
      return;
    }

    // Prevent rapid successive calls (debounce)
    const now = Date.now();
    if (now - lastToggleTime < 1000) { // 1 second debounce
      return;
    }
    setLastToggleTime(now);

    // Dismiss any existing toasts before making new request
    toast.dismiss(`contract-service-${instanceId}-${userId}-error`);
    toast.dismiss(`contract-service-${instanceId}-${userId}-success`);

    setIsTogglingStatus(true);
    tracker.startCall(callKey);

    try {
      const newStatus = isContractServiceEnabled ? "inactive" : "active";
      
      const result = await dispatch(updateInvitationStatus({
        id: userId,
        status: newStatus
      }));

      if (updateInvitationStatus.fulfilled.match(result)) {
        setIsContractServiceEnabled(!isContractServiceEnabled);
        toast.success(`Contract service ${newStatus === "active" ? "enabled" : "disabled"} successfully!`, {
          toastId: `contract-service-${instanceId}-${userId}-success`
        });
      } else if (updateInvitationStatus.rejected.match(result)) {
        toast.error(result.payload as string || "Failed to update invitation status", {
          toastId: `contract-service-${instanceId}-${userId}-error`
        });
      }
    } catch (error) {
      toast.error("An error occurred while updating invitation status", {
        toastId: `contract-service-${instanceId}-${userId}-error`
      });
      console.error("Toggle error:", error);
    } finally {
      setIsTogglingStatus(false);
      tracker.endCall(callKey);
    }
  };

  // Handle invite user
  const handleInvite = async () => {
    if (!userId) {
      toast.error("User ID is required to send invitation");
      return;
    }

    setIsInviting(true);

    try {
      const result = await dispatch(inviteUser(userId));

      if (inviteUser.fulfilled.match(result)) {
        toast.success("Invitation sent successfully!");
        onClose(); // Close the popup on success
      } else if (inviteUser.rejected.match(result)) {
        toast.error(result.payload as string || "Failed to send invitation");
      }
    } catch (error) {
      toast.error("An error occurred while sending the invitation");
      console.error("Invite error:", error);
    } finally {
      setIsInviting(false);
    }
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    // Close popup when pressing Escape key
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      // Add event listeners only when popup is open
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);

      // Prevent body scrolling when popup is open
      document.body.style.overflow = "hidden";
    } else {
      // Dismiss any existing toasts for this instance when popup closes
      toast.dismiss(`contract-service-${instanceId}-${userId}-error`);
      toast.dismiss(`contract-service-${instanceId}-${userId}-success`);
    }

    return () => {
      // Clean up event listeners
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);

      // Restore body scrolling when popup closes
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, instanceId, userId]);

  // Don't render anything if popup is not open
  if (!isOpen) return null;

  // Handler to prevent click propagation
  const handlePopupClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Use React Portal to render outside of parent component's DOM hierarchy
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
      onClick={handlePopupClick}
    >
      <div
        ref={popupRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-lg"
        onClick={handlePopupClick}
      >
        <div className="flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold text-center w-full text-[#383874]">
              Invite your lead and make it a real fixed finance user!
            </h2>
            <button onClick={onClose} className="text-gray-500 bg-transparent border-none p-0">
              <IoClose size={24} />
            </button>
          </div>

          <div className="p-4 grid grid-cols-4">
            <div className="col-span-3">
              {email && (
                <div className="mb-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-blue-700">
                    <strong>Inviting:</strong> {email}
                  </p>
                </div>
              )}
              <p className="text-gray-800">
                Allow your lead to register with Fixfinanz and become a real
                user. So he can safely manage his contracts and share them
                directly with you. Activate the contract service and send the
                invitation in a few seconds.
              </p>

              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <span className="bg-[#002d51] text-white p-1 rounded mr-2">
                    ✓
                  </span>
                  <span>Increase customer loyalty</span>
                </div>
                <div className="flex items-center">
                  <span className="bg-[#002d51] text-white p-1 rounded mr-2">
                    ✓
                  </span>
                  <span>Improved contract management</span>
                </div>
              </div>
            </div>

            <div className="col-span-1 border-l pl-4 flex flex-col items-center">
              <div className="text-center mb-4">
                <p className="font-bold">Fixed finance contract service</p>
              </div>

              <button
                onClick={handleToggleContractService}
                disabled={isTogglingStatus}
                className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors duration-200 ${
                  isContractServiceEnabled 
                    ? 'bg-[#002d51]' 
                    : 'bg-gray-400'
                } ${isTogglingStatus ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
              >
                <div 
                  className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    isContractServiceEnabled ? 'ml-auto' : 'ml-0'
                  }`}
                />
              </button>

              <span className={`mt-2 font-medium ${
                isContractServiceEnabled ? 'text-green-600' : 'text-red-600'
              }`}>
                {isTogglingStatus ? (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  isContractServiceEnabled ? 'Enabled' : 'Disabled'
                )}
              </span>
            </div>

            <div className="flex justify-between p-4 border-t mt-auto col-span-4">
              <button
                onClick={onClose}
                disabled={isInviting}
                className={`font-bold px-4 py-2 rounded ${
                  isInviting 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-300 text-[#383874] hover:bg-gray-400'
                }`}
              >
                Invite later
              </button>
              <button 
                onClick={handleInvite}
                disabled={isInviting || !userId}
                className={`font-bold px-4 py-2 rounded flex items-center gap-2 ${
                  isInviting || !userId
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-[#002d51] text-white hover:bg-[#003d61]'
                }`}
              >
                {isInviting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  "Invite now"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default InvitePopup;
