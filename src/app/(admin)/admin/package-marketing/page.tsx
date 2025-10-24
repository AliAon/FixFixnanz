"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaFacebook, FaPlus, FaPencilAlt, FaTrash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  fetchMarketingPackages,
  deleteMarketingPackage,
  updateMarketingPackage,
  clearMessages,
  type MarketingPackage,
  type FetchMarketingPackagesParams,
} from "@/redux/slices/marketingPackagesSlice";
import ConfirmationDialog from "@/components/shared/ConfirmationDialouge";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MarketingCampaignsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    packages,
    isLoading,
    error,
    success,
    totalPackages,
    currentPage,
    totalPages,
  } = useSelector((state: RootState) => state.marketingPackages);

  // State for confirmation dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<string | null>(null);
  
  // State for tracking loading states
  const [loadingStates, setLoadingStates] = useState<{
    deleting: string | null;
    updatingStatus: string | null;
  }>({
    deleting: null,
    updatingStatus: null,
  });

  // State to track user role
  const [userRole, setUserRole] = useState<string | null>(null);

  // Function to get fetch parameters based on user role
  const getFetchParams = (page: number = 1, limit: number = 10): FetchMarketingPackagesParams => {
    const params: FetchMarketingPackagesParams = { page, limit };
    
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        // Set user role for UI rendering
        setUserRole(user.role);
        // If user role is financial-advisor, add advisor_id filter
        if (user.role === "financial-advisor" && user?.id) {
          params.advisor_id = user.id;
        }
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }
    
    return params;
  };

  // Fetch marketing packages on component mount
  useEffect(() => {
    const params = getFetchParams(1, 10);
    dispatch(fetchMarketingPackages(params));
  }, [dispatch]);

  // Handle success/error messages
  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearMessages());
    }
    if (error) {
      toast.error(error);
      dispatch(clearMessages());
    }
  }, [success, error, dispatch]);

  const handleDeleteClick = (id: string) => {
    setPackageToDelete(id);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (packageToDelete) {
      setLoadingStates(prev => ({ ...prev, deleting: packageToDelete }));
      try {
        await dispatch(deleteMarketingPackage(packageToDelete)).unwrap();
        // Refetch the packages after deletion
        const params = getFetchParams(currentPage, 10);
        dispatch(fetchMarketingPackages(params));
        // Success toast is already handled by the Redux slice
      } catch (error) {
        console.error("Failed to delete package:", error);
        toast.error("Failed to delete marketing package");
      } finally {
        setLoadingStates(prev => ({ ...prev, deleting: null }));
      }
    }
    setIsDialogOpen(false);
    setPackageToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDialogOpen(false);
    setPackageToDelete(null);
  };

  const getContactName = (pkg: MarketingPackage): string => {
    if (pkg.customer?.first_name || pkg.customer?.last_name) {
      return `${pkg.customer.first_name || ""} ${pkg.customer.last_name || ""}`.trim();
    }
    return "-";
  };

  const getStatusBadge = (pkg: MarketingPackage) => {
    const isActive = !pkg.is_deleted;
    const isUpdating = loadingStates.updatingStatus === pkg.id;
    
    return (
      <span
        className={`py-1 px-3 rounded-md w-max cursor-pointer transition-colors flex items-center ${
          isActive
            ? "bg-[#19875E] text-white hover:bg-[#157347]"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
        } ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
        onClick={() => !isUpdating && handleStatusToggle(pkg.id, pkg.is_deleted)}
        title={isUpdating ? 'Updating...' : `Click to ${isActive ? 'deactivate' : 'activate'}`}
      >
        {isUpdating && (
          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
        )}
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  const handleStatusToggle = async (packageId: string, currentStatus: boolean) => {
    setLoadingStates(prev => ({ ...prev, updatingStatus: packageId }));
    try {
      const updateData = {
        id: packageId,
        is_deleted: !currentStatus, // Toggle the status
      };
      
      await dispatch(updateMarketingPackage(updateData)).unwrap();
      // Refetch the packages after status update
      const params = getFetchParams(currentPage, 10);
      dispatch(fetchMarketingPackages(params));
      toast.success(`Package ${!currentStatus ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error("Failed to update package status:", error);
      toast.error("Failed to update package status");
    } finally {
      setLoadingStates(prev => ({ ...prev, updatingStatus: null }));
    }
  };

  return (
    <div className="w-full px-4 py-8 bg-white">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-[#333]">
          Marketing-Kampagnen ({totalPackages} total)
        </h1>
        {/* {userRole !== "financial-advisor" && ( */}
          <Link
            href="/admin/package-marketing/add"
            className="bg-[#198754] hover:bg-[#157347] text-white py-2 px-4 rounded-md flex items-center"
          >
            <FaPlus className="mr-2" /> Add Package
          </Link>
      </div>

      {userRole !== "financial-advisor" && (
        <div className="mb-8">
          <button className="bg-[#0866FF] hover:bg-[#0652c7] text-white font-medium py-2 px-4 rounded-md flex items-center">
            <FaFacebook className="mr-2" /> Facebook Connection
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading marketing packages...</span>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="w-full overflow-x-auto border border-gray-100 rounded-lg shadow-sm">
            <table className="min-w-full bg-white table-fixed" style={{ minWidth: '100%' }}>
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-4 text-left whitespace-nowrap font-semibold text-gray-700 w-16">#</th>
                  <th className="py-4 px-4 text-left whitespace-nowrap font-semibold text-gray-700 w-48">Package Name</th>
                  <th className="py-4 px-4 text-left whitespace-nowrap font-semibold text-gray-700 w-28">Status</th>
                  <th className="py-4 px-4 text-left whitespace-nowrap font-semibold text-gray-700 w-36">Business Account</th>
                  <th className="py-4 px-4 text-left whitespace-nowrap font-semibold text-gray-700 w-36">Facebook Connect</th>
                  <th className="py-4 px-4 text-left whitespace-nowrap font-semibold text-gray-700 w-60">Description</th>
                  {userRole !== "financial-advisor" && (
                    <>
                      <th className="py-4 px-4 text-left whitespace-nowrap font-semibold text-gray-700 w-20">Image</th>
                      <th className="py-4 px-4 text-left whitespace-nowrap font-semibold text-gray-700 w-40">Contact Name</th>
                      <th className="py-4 px-4 text-left whitespace-nowrap font-semibold text-gray-700 w-28">Options</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {packages.length === 0 ? (
                  <tr>
                    <td colSpan={userRole === "financial-advisor" ? 6 : 9} className="py-8 text-center text-gray-500">
                      No marketing packages found. 
                      {userRole !== "financial-advisor" && (
                        <Link 
                          href="/admin/package-marketing/add"
                          className="text-blue-500 hover:text-blue-700 ml-1"
                        >
                          Create your first package
                        </Link>
                      )}
                    </td>
                  </tr>
                ) : (
                  packages.map((pkg, index) => (
                    <tr key={pkg.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm">{(currentPage - 1) * 10 + index + 1}</td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="text-sm text-gray-900">{pkg.name}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {userRole === "financial-advisor" ? (
                          <span className="py-1 px-3 rounded-md w-max bg-[#19875E] text-white">
                            Active
                          </span>
                        ) : (
                          getStatusBadge(pkg)
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-500 text-sm">-</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="py-1 px-3 rounded-md bg-[#19875E] text-white text-sm">
                          Connected
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="max-w-[300px]">
                          {pkg.description ? (
                            <span className="text-sm text-gray-900 leading-relaxed">{pkg.description}</span>
                          ) : (
                            <span className="text-gray-500 text-sm">-</span>
                          )}
                        </div>
                      </td>
                      {userRole !== "financial-advisor" && (
                        <>
                          <td className="py-4 px-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
                              <span className="text-gray-500 text-xs">-</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="text-sm text-gray-900">{getContactName(pkg)}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <Link
                                href={`/admin/package-marketing/edit/${pkg.id}`}
                                className="bg-[#198754] hover:bg-[#157347] duration-150 text-white p-2 rounded-md inline-flex items-center"
                                title="Edit"
                              >
                                <FaPencilAlt className="text-xs" />
                              </Link>
                              <button
                                className={`bg-[#DC3545] hover:bg-[#c82333] text-white p-2 rounded-md flex items-center justify-center ${
                                  loadingStates.deleting === pkg.id ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                                onClick={() => loadingStates.deleting !== pkg.id && handleDeleteClick(pkg.id)}
                                title={loadingStates.deleting === pkg.id ? "Deleting..." : "Delete"}
                                disabled={loadingStates.deleting === pkg.id}
                              >
                                {loadingStates.deleting === pkg.id ? (
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <FaTrash className="text-xs" />
                                )}
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => {
                      const params = getFetchParams(page, 10);
                      dispatch(fetchMarketingPackages(params));
                    }}
                    className={`px-3 py-2 rounded ${
                      page === currentPage
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDialogOpen}
        title="Delete Marketing Package"
        message="Are you sure you want to delete this marketing package? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default MarketingCampaignsPage;
