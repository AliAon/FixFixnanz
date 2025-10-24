"use client";
import ConfirmationDialog from "@/components/shared/ConfirmationDialouge";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { 
  fetchCompanies, 
  updateCompany, 
  deleteCompany, 
  createCompany,
  Company 
} from "@/redux/slices/companiesSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Button Loader Component
const ButtonLoader = () => (
  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
      Loading...
    </span>
  </div>
);
const ButtonLoader2 = () => (
  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-black border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
      Loading...
    </span>
  </div>
);

export default function CompanyManagementPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { companies, status } = useSelector((state: RootState) => state.companies);
  
  const [companyName, setCompanyName] = useState("");
  const [companyStatus, setCompanyStatus] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId] = useState<string | null>(null);

  // State for confirmation dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);

  // State for update dialog
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [companyToUpdate, setCompanyToUpdate] = useState<Company | null>(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedStatus, setUpdatedStatus] = useState("");

  const statusOptions = ["active", "inactive"];
  const isLoading = status === 'loading';

  useEffect(() => {
    dispatch(fetchCompanies({}))
      .unwrap()
      .catch((error) => {
        toast.error(error || "Failed to fetch companies");
      });
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName || !companyStatus) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      await dispatch(createCompany({
        name: companyName,
        status: companyStatus,
      })).unwrap();
      
      toast.success("Company created successfully");
      setCompanyName("");
      setCompanyStatus("");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create company');
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Open confirmation dialog
  const handleDeleteClick = (id: string) => {
    setCompanyToDelete(id);
    setIsDialogOpen(true);
  };

  // Confirm deletion
  const handleConfirmDelete = async () => {
    if (companyToDelete !== null) {
      setIsDeleting(true);
      try {
        await dispatch(deleteCompany(companyToDelete)).unwrap();
        toast.success("Company deleted successfully");
        setIsDialogOpen(false);
        setCompanyToDelete(null);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Failed to delete company');
        }
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Cancel deletion
  const handleCancelDelete = () => {
    setIsDialogOpen(false);
    setCompanyToDelete(null);
  };

  // Get company name for confirmation message
  const getCompanyToDeleteName = () => {
    if (companyToDelete === null) return "";
    const company = companies.find((comp) => comp.id === companyToDelete);
    return company ? company.name : "";
  };

  // Open update dialog
  const handleUpdateClick = (company: Company) => {
    setCompanyToUpdate(company);
    setUpdatedName(company.name);
    setUpdatedStatus(company.status);
    setIsUpdateDialogOpen(true);
  };

  // Handle update confirmation
  const handleConfirmUpdate = async () => {
    if (!companyToUpdate) return;

    if (!updatedName.trim() || !updatedStatus) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsUpdating(true);
    try {
      await dispatch(updateCompany({
        id: companyToUpdate.id,
        data: {
          name: updatedName,
          status: updatedStatus,
        }
      })).unwrap();
      
      toast.success("Company updated successfully");
      handleCancelUpdate();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update company');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancel update
  const handleCancelUpdate = () => {
    setIsUpdateDialogOpen(false);
    setCompanyToUpdate(null);
    setUpdatedName("");
    setUpdatedStatus("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <ToastContainer />
      <div className="">
        <h1 className="text-[30px] font-semibold text-gray-800 mb-10">
          Create A Company
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left side - Form */}
          <div className="w-full max-w-[350px] bg-white p-8 rounded-lg shadow">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="companyName"
                  className="block text-lg font-medium text-gray-700 mb-2"
                >
                  Name :
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company name *"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                  disabled={isCreating}
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="companyStatus"
                  className="block text-lg font-medium text-gray-700 mb-2"
                >
                  Status :
                </label>
                <select
                  id="companyStatus"
                  value={companyStatus}
                  onChange={(e) => setCompanyStatus(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                  disabled={isCreating}
                >
                  <option value="">choose a option...</option>
                  {statusOptions.map((status, index) => (
                    <option key={index} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className={`px-6 py-2 bg-[#198754] text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 ${isCreating ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isCreating ? <ButtonLoader /> : null}
                <span>{isCreating ? 'Creating...' : 'Create'}</span>
              </button>
            </form>
          </div>

          {/* Right side - Table */}
          <div className="w-full bg-white rounded-lg px-2 shadow overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th className="py-3 px-2 text-left font-bold">#Id</th>
                  <th className="py-3 px-2 text-left font-bold">Name</th>
                  <th className="py-3 px-2 text-left font-bold">Status</th>
                  <th className="py-3 px-2 text-left font-bold whitespace-nowrap">
                    Created By
                  </th>
                  <th className="py-3 px-2 text-left font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company, index) => (
                  <tr key={company.id} className="border-b border-gray-200">
                    <td className="py-3 px-2">#{index + 1}</td>
                    <td className="py-3 px-2">{company.name}</td>
                    <td className="py-3 px-2">
                      <span className={`${
                        company.status === 'active' ? 'bg-blue-500' : 'bg-red-500'
                      } text-white py-1 px-3 rounded-md`}>
                        {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-2">{company.created_by}</td>
                    <td className="py-3 px-2">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleUpdateClick(company)}
                          disabled={isUpdating || deletingId === company.id}
                          className={`bg-blue-500 text-white p-2 text-sm rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 ${(isUpdating || deletingId === company.id) ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          {isUpdating && companyToUpdate?.id === company.id ? <ButtonLoader /> : null}
                          <span>{isUpdating && companyToUpdate?.id === company.id ? 'Updating...' : 'Update'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(company.id)}
                          disabled={deletingId === company.id || isUpdating}
                          className={`bg-red-500 text-white p-2 text-sm rounded hover:bg-red-600 transition-colors ${(deletingId === company.id || isUpdating) ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {companies.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      No companies found
                    </td>
                  </tr>
                )}
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      <ButtonLoader2 />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        isOpen={isDialogOpen}
        title="Delete Company"
        message={`Are you sure you want to delete "${getCompanyToDeleteName()}"? This action cannot be undone.`}
        confirmText={
          <>
            {isDeleting && <ButtonLoader />}
            <div className="ml-2">{isDeleting ? 'Deleting...' : 'Delete'}</div>
          </>
        }
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isConfirmDisabled={isDeleting}
      />

      {/* Update Company Dialog */}
      {isUpdateDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#32325D]">
                  Update Company Info
                </h2>
                <Link
                  href=""
                  onClick={handleCancelUpdate}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Link>
              </div>

              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Name :
                </label>
                <input
                  type="text"
                  value={updatedName}
                  onChange={(e) => setUpdatedName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={isUpdating}
                />
              </div>

              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Status :
                </label>
                <select
                  value={updatedStatus}
                  onChange={(e) => setUpdatedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={isUpdating}
                >
                  {statusOptions.map((status, index) => (
                    <option key={index} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-start gap-3">
                <button
                  onClick={handleCancelUpdate}
                  disabled={isUpdating}
                  className={`px-4 py-1 bg-[#DC3545] text-white rounded-lg hover:bg-[#BB2D3B] transition-colors ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  Close
                </button>
                <button
                  onClick={handleConfirmUpdate}
                  disabled={isUpdating}
                  className={`px-4 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isUpdating ? <ButtonLoader /> : null}
                  <span>{isUpdating ? 'Updating...' : 'Update'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
