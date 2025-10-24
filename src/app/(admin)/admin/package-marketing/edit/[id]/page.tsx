"use client";
import React, { useState, useEffect } from "react";
import { FaFile } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchCustomers } from "@/redux/slices/usersSlice";
import { User } from "@/types/TUser";
import { 
  fetchMarketingPackageById, 
  updateMarketingPackage, 
  clearMessages
} from "@/redux/slices/marketingPackagesSlice";
import { useRouter, useParams } from "next/navigation";

interface FormData {
  user: string;
  packageName: string;
  description: string;
}

const EditPackagePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const packageId = params.id as string;

  const {
    customers,
    isLoading: usersLoading,
    error: usersError,
  } = useSelector((state: RootState) => state.users);
  const { 
    currentPackage, 
    isLoading: submitting, 
    error: submitError, 
    success 
  } = useSelector((state: RootState) => state.marketingPackages);

  const [formData, setFormData] = useState<FormData>({
    user: "",
    packageName: "",
    description: "",
  });

  // Fetch customers and package data on component mount
  useEffect(() => {
    dispatch(fetchCustomers({ 
      limit: 100,
      is_active: true,
      is_approved: true 
    }));
    if (packageId) {
      dispatch(fetchMarketingPackageById(packageId));
    }
  }, [dispatch, packageId]);

  // Populate form when package data is loaded
  useEffect(() => {
    if (currentPackage) {
      setFormData({
        user: currentPackage.customer_id || "",
        packageName: currentPackage.name || "",
        description: currentPackage.description || "",
      });
    }
  }, [currentPackage]);

  // Handle success/error messages
  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearMessages());
      // Redirect back to the packages page after successful update
      setTimeout(() => {
        router.push("/admin/package-marketing");
      }, 1000);
    }
    if (submitError) {
      toast.error(submitError);
      dispatch(clearMessages());
    }
  }, [success, submitError, dispatch, router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.user || !formData.packageName || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!packageId) {
      toast.error("Package ID not found");
      return;
    }

    // Get advisor ID from localStorage
    const advisorData = localStorage.getItem("user");
    let advisorId = "";
    
    if (advisorData) {
      try {
        const advisor = JSON.parse(advisorData);
        advisorId = advisor.id;
      } catch (error) {
        console.error("Error parsing advisor data:", error);
        toast.error("Unable to get advisor information");
        return;
      }
    } else {
      toast.error("Advisor information not found. Please login again.");
      return;
    }

    try {
      const updateData = {
        id: packageId,
        advisor_id: advisorId,
        customer_id: formData.user,
        name: formData.packageName,
        description: formData.description,
      };

      console.log("Updating package with data:", updateData);
      await dispatch(updateMarketingPackage(updateData)).unwrap();
    } catch (error) {
      console.error("Failed to update package:", error);
    }
  };

  if (!currentPackage && !submitting) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Package not found</div>
      </div>
    );
  }

  return (
    <div className=" px-4 py-8 bg-white">
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
      <div className="border rounded-md max-w-5xl mx-auto">
        <div className="border-b py-2 px-4 mb-6 bg-[#F7F7F7] rounded-t-md">
          <h2 className="text-base  flex items-center">
            <FaFile className="mr-2 text-primary" /> Edit marketing plan
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid xsm:grid-cols-1 sm:grid-cols-1 grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="user" className="block text-primary mb-2">
                Select User
              </label>
              <select
                id="user"
                name="user"
                value={formData.user}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={usersLoading}
              >
                <option value="">
                  {usersLoading ? "Loading Users..." : "Select User"}
                </option>
                {customers.map((customer: User) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.first_name || '-'} {customer.last_name || '-'}
                    {customer.email && ` (${customer.email})`}
                  </option>
                ))}
              </select>

              {usersError && (
                <div className="mt-2 text-sm text-red-500">
                  Error loading customers: {usersError}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="packageName" className="block text-primary mb-2">
                Package Name
              </label>
              <input
                type="text"
                id="packageName"
                name="packageName"
                placeholder="Enter package name"
                value={formData.packageName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-primary  mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => router.push("/admin/package-marketing")}
              className="bg-gray-500 duration-150 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || usersLoading}
              className="bg-[#19875E] duration-150 hover:bg-[#146c4a] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-md flex items-center"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating...
                </>
              ) : (
                "Update Package"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPackagePage; 