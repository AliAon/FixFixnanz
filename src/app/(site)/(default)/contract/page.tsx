"use client";
import React, { useEffect, useState, useRef } from "react";
import { Search, Edit, Trash2, Copy } from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchContracts, deleteContract } from "@/redux/slices/contractsSlice";
import { AppDispatch } from "@/redux/store";
import { fetchCompanies, Company } from "@/redux/slices/companiesSlice";
import {
  fetchCategories,
  ContractCategory,
} from "@/redux/slices/contractCategoriesSlice";
import ConfirmationDialog from "@/components/shared/ConfirmationDialouge";
import { toast } from "react-toastify";
import { useSearchParams, useRouter } from "next/navigation";
import { generateContractPdf } from "@/utils/contractPdf";
import { fetchProfileData } from "@/redux/slices/profileSlice";
import ShareContractModal from "@/components/modal/ShareContractModal";

interface Contract {
  id: string;
  company_id: string;
  start_of_contract: string;
  expire_date: string;
  number: string;
  amount: number;
  payment_frequency: string;
  service_id: string;
  sent_email: boolean;
  share: unknown[];
  created_by: string;
  length_of_term: number;
  invitation_token: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  // Optional fields that might come from joins
  society?: string;
  category?: string;
  service?: string;
}

interface RootState {
  contracts: {
    contracts: Contract[];
    loading: boolean;
  };
  companies: {
    companies: Company[];
    status: "idle" | "loading" | "succeeded" | "failed";
  };
  contractCategories: {
    categories: ContractCategory[];
    loading: boolean;
  };
  auth: {
    user: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
    } | null;
  };
  profile: {
    data: {
      business: {
        address: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
      };
    };
  };
}

const ContractManagementPage = () => {
  // const contracts: Contract[] = [
  //   {
  //     id: "1",
  //     contractNumber: "12345676",
  //     society: "Allianz Deutschland AG",
  //     category: "Gesundheit und Pflege",
  //     amount: "1.234,00€",
  //     payment: "Jährlich",
  //     contractDuration: "2 Tage",
  //     service: "Stromvertrag",
  //     startDate: "10 Feb, 24",
  //     endDate: "28 Feb, 25",
  //   },
  // ];

  // fetchCustomerProfile
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasShownToastRef = useRef(false);

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // State for share contract modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [contractToShare, setContractToShare] = useState<Contract | null>(null);

  // Data selectors
  const data = useSelector((state: RootState) => state.contracts.contracts);

  const companies = useSelector(
    (state: RootState) => state.companies.companies
  );

  const categories = useSelector(
    (state: RootState) => state.contractCategories.categories
  );

  // User data selectors
  const user = useSelector((state: RootState) => state.auth.user);
  const profileData = useSelector((state: RootState) => state.profile.data);

  // Loading state selectors
  const contractsLoading = useSelector(
    (state: RootState) => state.contracts.loading
  );

  const companiesLoading = useSelector(
    (state: RootState) => state.companies.status === "loading"
  );

  const categoriesLoading = useSelector(
    (state: RootState) => state.contractCategories.loading
  );

  // Combined loading state - only for initial data loading, not for delete operations
  const isInitialLoading = (contractsLoading && !isDeleting) || companiesLoading || categoriesLoading;

  useEffect(() => {
    async function fetchData() {
      await dispatch(fetchContracts());
      await dispatch(fetchCompanies({}));
      await dispatch(fetchCategories());
      await dispatch(fetchProfileData());
    }
    fetchData();
  }, [dispatch]);

  // Check for success message from edit page
  useEffect(() => {
    const updated = searchParams.get("updated");
    if (updated === "true" && !hasShownToastRef.current) {
      // Dismiss any existing toasts first
      toast.dismiss();
      // Show success toast with unique ID
      toast.success("Contract updated successfully!", {
        toastId: "contract-update-success",
      });
      // Clean up the URL by removing the search parameter
      router.replace("/contract");
      hasShownToastRef.current = true;
    } else if (updated !== "true") {
      // Reset the ref when parameter is not present
      hasShownToastRef.current = false;
    }
  }, [searchParams, router]);

  // Helper function to get company name by ID
  const getCompanyName = (companyId: string): string => {
    if (!companies.length) return companyId;
    const company = companies.find((comp) => comp.id === companyId);
    return company ? company.name : companyId;
  };

  // Helper function to get category name by ID
  const getCategoryName = (serviceId: string): string => {
    if (!categories.length) return serviceId;

    // Try matching as string first (UUID)
    let category = categories.find((cat) => cat.id.toString() === serviceId);

    // If not found, try converting serviceId to number (in case it's a numeric string)
    if (!category) {
      const numericId = parseInt(serviceId);
      if (!isNaN(numericId)) {
        category = categories.find((cat) => cat.id === numericId);
      }
    }

    return category ? category.name : serviceId;
  };

  // console.log(data);

  //   {
  //     "id": "f3f82d2a-2f2f-4c20-8e24-a748f3404b98",
  //     "company_id": "d29b75c2-6414-4731-a9aa-2e586e1cc80f",
  //     "start_of_contract": "2025-06-20",
  //     "expire_date": "2025-07-03",
  //     "number": "12345678911",
  //     "amount": 50,
  //     "payment_frequency": "monthly",
  //     "service_id": "55def9cd-ec94-4508-9a93-f019fe4cd7d3",
  //     "sent_email": false,
  //     "share": [],
  //     "created_by": "4a50e118-d2cf-4845-b71b-a335122f4e4d",
  //     "length_of_term": 12,
  //     "invitation_token": null,
  //     "is_deleted": false,
  //     "created_at": "2025-06-21T12:31:41.607886+00:00",
  //     "updated_at": "2025-06-21T12:31:41.607886+00:00"
  // }

  // Delete handlers
  const handleDeleteClick = (contract: Contract) => {
    setContractToDelete(contract);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!contractToDelete) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteContract(contractToDelete.id)).unwrap();

      // Show success message
      toast.success("Contract deleted successfully!");

      // Close modal and reset state after successful deletion
      setIsDeleteModalOpen(false);
      setContractToDelete(null);
    } catch (error) {
      // Keep modal open on error so user can retry
      toast.error("Failed to delete contract. Please try again.");
      console.error("Delete contract error:", error);
    } finally {
      // Always reset loading state
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    // Only allow cancel if not currently deleting
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
      setContractToDelete(null);
    }
  };

  // Open share contract modal
  const handleCheckContract = (contract: Contract) => {
    setContractToShare(contract);
    setIsShareModalOpen(true);
  };

  // Handle sharing contract with selected experts
  const handleShareContract = (selectedExperts: string[]) => {
    if (!contractToShare) return;

    try {
      // Get user name
      const userName = user 
        ? `${user.first_name} ${user.last_name}`.trim() 
        : "N/A";

      // Get user address
      const userAddress = profileData?.business 
        ? `${profileData.business.address}${profileData.business.city ? ', ' + profileData.business.city : ''}${profileData.business.state ? ', ' + profileData.business.state : ''}${profileData.business.postal_code ? ' ' + profileData.business.postal_code : ''}`.trim()
        : undefined;

      // Clean up address if it's just commas or empty
      const cleanUserAddress = userAddress && userAddress.replace(/^[,\s]+|[,\s]+$/g, '') !== '' 
        ? userAddress.replace(/^[,\s]+|[,\s]+$/g, '')
        : undefined;

      // Prepare contract data for PDF
      const contractPdfData = {
        contractNumber: contractToShare.number,
        companyName: getCompanyName(contractToShare.company_id),
        categoryName: getCategoryName(contractToShare.service_id),
        startDate: contractToShare.start_of_contract,
        endDate: contractToShare.expire_date,
        amount: contractToShare.amount,
        paymentFrequency: contractToShare.payment_frequency,
        duration: contractToShare.length_of_term,
        userName: userName,
        userAddress: cleanUserAddress,
      };

      // Generate PDF
      generateContractPdf(contractPdfData);
      
      // Show success message
      toast.success(`Contract shared with ${selectedExperts.length} expert(s) successfully!`);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate contract PDF. Please try again.");
    }
  };

  // Close share modal
  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    setContractToShare(null);
  };

  // Show loading state while any data is being fetched
  if (isInitialLoading) {
    return (
      <div className="p-4 max-w-[950px] w-full">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          {/* <span className="ml-2">Loading contracts data...</span> */}
        </div>
      </div>
    );
  }

  return (
    <div className=" p-4 max-w-[950px] w-full">
      <div className="flex justify-between xsm:flex-col mb-6">
        <Link
          href="/contract/create"
          className="bg-[#1477BC] text-white font-roboto py-2 px-4 rounded flex items-center"
        >
          Create new contract
        </Link>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Searching..."
            className="w-full border border-gray-300 rounded py-2 px-4 pr-10"
          />
          <Search
            className="absolute right-3 top-2.5 text-gray-400"
            size={18}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded ">
        <table className="w-full bg-white overflow-x-auto">
          <thead className="bg-pink-100 ">
            <tr>
              <th className="py-2 font-roboto text-[16px] px-4 text-left font-semibold whitespace-nowrap ">
                Contract number{" "}
              </th>
              <th className="py-2 font-roboto text-[16px] px-4 text-left font-semibold whitespace-nowrap ">
                Company
              </th>
              <th className="py-2 font-roboto text-[16px] px-4 text-left font-semibold whitespace-nowrap ">
                Category
              </th>
              <th className="py-2 font-roboto text-[16px] px-4 text-left font-semibold whitespace-nowrap ">
                Amount{" "}
              </th>
              <th className="py-2 font-roboto text-[16px] px-4 text-left font-semibold whitespace-nowrap ">
                Payment
              </th>
              <th className="py-2 font-roboto text-[16px] px-4 text-left font-semibold whitespace-nowrap ">
                Contract duration{" "}
              </th>
              <th className="py-2 font-roboto text-[16px] px-4 text-left font-semibold whitespace-nowrap ">
                Service
              </th>
              <th className="py-2 font-roboto text-[16px] px-4 text-left font-semibold whitespace-nowrap ">
                Start of contract
              </th>
              <th className="py-2 font-roboto text-[16px] px-4 text-left font-semibold whitespace-nowrap ">
                End of contract
              </th>
              <th className="py-2 font-roboto text-[16px] px-4 text-left font-semibold whitespace-nowrap ">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((contract: Contract) => (
                <tr
                  key={contract.id}
                  className="border-b text-[#747F8F] font-roboto hover:bg-gray-50"
                >
                  <td className="py-3 px-4 whitespace-nowrap">
                    {contract.number}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getCompanyName(contract.company_id)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getCategoryName(contract.service_id)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {contract.amount}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {contract.payment_frequency}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {contract.length_of_term} days
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {contract.service || getCategoryName(contract.service_id)}
                  </td>
                  <td className="py-3 px-2 ">
                    <span className="bg-[#DBF6EF] rounded-md text-[#00BF8C] p-2">
                      {" "}
                      {contract.start_of_contract}
                    </span>
                  </td>
                  <td className="py-3 px-2 ">
                    <span className="bg-[#DBF6EF] rounded-md text-[#00BF8C] p-2">
                      {contract.expire_date}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCheckContract(contract)}
                        className="bg-[#1477BC] hover:bg-[#125a94] text-white text-sm py-2 px-2 rounded transition-colors"
                      >
                        Check Contract
                      </button>
                        <Link
                          href={`/contract/edit/${contract.id}`}
                          className="bg-[#0DCAF0] hover:bg-[#31D2F2] p-2 rounded-md text-black text-center"
                        >
                          <Edit size={16} />
                        </Link>

                      <Link
                        href=""
                        className="bg-[#198754] hover:bg-[#157347] p-2 rounded-md text-black text-center"
                      >
                        <Copy size={16} />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(contract)}
                        className=" hover:bg-[#BB2D3B] bg-[#DC3545] p-2 rounded-md text-white text-center"
                        disabled={isDeleting}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="py-8 text-center text-gray-500">
                  No contracts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        isOpen={isDeleteModalOpen}
        title="Delete Contract"
        message={`Are you sure you want to delete contract "${contractToDelete?.number}"? This action cannot be undone.`}
        confirmText={
          <>
            {isDeleting && (
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent align-[-0.125em] mr-2" />
            )}
            {isDeleting ? "Deleting..." : "Delete"}
          </>
        }
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isConfirmDisabled={isDeleting}
      />

      {/* Share Contract Modal */}
      <ShareContractModal
        isOpen={isShareModalOpen}
        onClose={handleCloseShareModal}
        onCheckContract={handleShareContract}
        contractNumber={contractToShare?.number || ""}
      />

      {/* Toast Container */}
      {/* <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      /> */}
    </div>
  );
};

export default ContractManagementPage;
