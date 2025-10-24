"use client";
import SearchablDropdown from "@/components/dashboard-sections/Dropdown";
import SearchabDropdown from "@/components/dashboard-sections/_comp/DropCate";
import SearchableDropdown from "@/components/dashboard-sections/_comp/SearDow";
import Datepicker from "@/components/shared/DatePicker";
import { fetchCompanies } from "@/redux/slices/companiesSlice";
import { fetchCategories } from "@/redux/slices/contractCategoriesSlice";
import { fetchContractById, updateContract } from "@/redux/slices/contractsSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useParams, useRouter } from "next/navigation";
import React, { useState, FormEvent, ChangeEvent, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

interface Option {
  value: string;
  label: string;
}

interface UpdateContractData {
  company_id: string;
  start_of_contract: string;
  expire_date: string;
  number: string;
  amount: string;
  payment_frequency: string;
  service_id: string;
  length_of_term: number;
}

const EditContractForm = () => {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  const [society, setSociety] = useState<string>("");
  const [payment, setPayment] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [contractNumber, setContractNumber] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [cId, setCId] = useState<string>("");
  const [cId2, setCId2] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const hasSubmittedRef = useRef<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const contract = useSelector((state: RootState) => state.contracts.contract);
  const companiesData = useSelector((state: RootState) => state.companies.companies);
  const categoriesData = useSelector((state: RootState) => state.contractCategories);
  const contractLoading = useSelector((state: RootState) => state.contracts.loading);

  const payments: Option[] = [
    { value: "monthly", label: "Monthly" },
    { value: "annually", label: "Annually" },
  ];

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Reset submission flag when loading new contract
        hasSubmittedRef.current = false;
        await Promise.all([
          dispatch(fetchContractById(contractId)),
          dispatch(fetchCompanies({})),
          dispatch(fetchCategories())
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load contract data");
      } finally {
        setIsLoading(false);
      }
    };

    if (contractId) {
      fetchData();
    }
  }, [contractId, dispatch]);

  // Populate form when contract data is loaded
  useEffect(() => {
    if (contract && companiesData.length > 0 && categoriesData.categories?.length > 0) {
      // Find company name
      const company = companiesData.find(comp => comp.id === contract.company_id);
      if (company) {
        setSociety(company.name);
        setCId(contract.company_id);
      }

      // Find category name
      const contractCategory = categoriesData.categories.find(cat => 
        cat.id.toString() === contract.service_id
      );
      if (contractCategory) {
        setCategory(contractCategory.name);
        setCId2(contract.service_id);
      }

      // Set other fields
      setContractNumber(contract.number);
      setAmount(contract.amount.toString());
      setPayment(contract.payment_frequency);
      
      // Set dates
      if (contract.start_of_contract) {
        setStartDate(new Date(contract.start_of_contract));
      }
      if (contract.expire_date) {
        setEndDate(new Date(contract.expire_date));
      }
    }
  }, [contract, companiesData, categoriesData]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting || hasSubmittedRef.current) {
      return;
    }

    // Mark as submitted to prevent duplicates
    hasSubmittedRef.current = true;

    // Form validation
    if (!cId) {
      toast.error("Please select a company");
      hasSubmittedRef.current = false;
      return;
    }
    if (!startDate) {
      toast.error("Please select a start date");
      hasSubmittedRef.current = false;
      return;
    }
    if (!endDate) {
      toast.error("Please select an end date");
      hasSubmittedRef.current = false;
      return;
    }
    if (!contractNumber.trim()) {
      toast.error("Please enter a contract number");
      hasSubmittedRef.current = false;
      return;
    }
    if (!payment) {
      toast.error("Please select a payment frequency");
      hasSubmittedRef.current = false;
      return;
    }
    if (!cId2) {
      toast.error("Please select a category");
      hasSubmittedRef.current = false;
      return;
    }

    // Validate end date is after start date
    if (endDate <= startDate) {
      toast.error("End date must be after start date");
      hasSubmittedRef.current = false;
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate the number of days between start and end date
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const updateData: UpdateContractData = {
        company_id: cId,
        start_of_contract: startDate.toISOString().split("T")[0],
        expire_date: endDate.toISOString().split("T")[0],
        number: contractNumber,
        amount: amount,
        payment_frequency: payment,
        length_of_term: diffDays,
        service_id: cId2,
      };

      console.log("Dispatching updateContract action for ID:", contractId);
      const result = await dispatch(updateContract({ id: contractId, data: updateData }));

      if (updateContract.fulfilled.match(result)) {
        console.log("Update successful, navigating back");
        // Navigate back with success parameter
        router.push("/contract?updated=true");
      } else {
        toast.error("Failed to update contract. Please try again.");
        hasSubmittedRef.current = false;
      }
    } catch (error) {
      console.error("Error updating contract:", error);
      toast.error("An error occurred while updating the contract.");
      hasSubmittedRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContractNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    setContractNumber(e.target.value);
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  // Show error if contract not found (but only after loading is complete and no contract)
  if (!isLoading && !contractLoading && !contract) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-lg">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Contract Not Found</h2>
          <p className="text-gray-600 mb-6">The contract you are looking for does not exist.</p>
          <button
            onClick={() => router.push("/contract")}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Back to Contracts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[32px] font-bold font-roboto text-gray-800">
          Edit Contract
        </h1>
        <button
          onClick={() => router.push("/contract")}
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
        >
          Back to Contracts
        </button>
      </div>

      {/* Show loading indicator only for the form area */}
      {/* {(isLoading || contractLoading) && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        </div>
      )} */}

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="mb-4">
          <div className="relative">
            <label className="block font-roboto text-secondary">Company:</label>
            <SearchableDropdown
              label="Company: *"
              options={companiesData}
              showSearchbar={false}
              value={society}
              onChange={setSociety}
              setCId={setCId}
              placeholder="Choose a company..."
            />
          </div>
        </div>

        <div className="grid grid-cols-2 xsm:grid-cols-1 gap-4 mb-4">
          <div className="mt-2">
            <label className="block font-roboto text-secondary">
              Start of contract
            </label>
            <Datepicker
              selectedDate={startDate}
              onChange={setStartDate}
              minDate={new Date(2023, 0, 1)}
              maxDate={new Date(2025, 11, 31)}
              placeholder="mm/dd/yyyy"
              className="w-full"
            />
          </div>

          <div className="mt-2">
            <label className="block font-roboto text-secondary">End of contract</label>
            <Datepicker
              selectedDate={endDate}
              onChange={setEndDate}
              minDate={new Date(2023, 0, 1)}
              maxDate={new Date(2025, 11, 31)}
              placeholder="mm/dd/yyyy"
              className="w-full"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Contract number *:</label>
          <input
            type="text"
            placeholder="Enter number"
            value={contractNumber}
            onChange={handleContractNumberChange}
            className="block w-full p-3 border border-gray-300 rounded focus:outline-none"
            disabled={isLoading || contractLoading}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Contribution amount:
          </label>
          <input
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={handleAmountChange}
            className="block w-full p-3 border border-gray-300 rounded focus:outline-none"
            disabled={isLoading || contractLoading}
          />
        </div>

        <div className="mb-4">
          <div className="relative">
            <label className="block font-roboto text-secondary">Payment:</label>
            <SearchablDropdown
              label="Payment: *"
              options={payments}
              value={payment}
              onChange={setPayment}
              placeholder="Choose a payment..."
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <label className="block font-roboto text-secondary">Category:</label>
            <SearchabDropdown
              setCId={setCId2}
              label="Category:"
              options={categoriesData.categories?.map(cat => ({
                ...cat,
                id: cat.id.toString()
              })) || []}
              showSearchbar={false}
              value={category}
              onChange={setCategory}
              placeholder="Choose a category"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className={`font-roboto text-white font-medium py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center gap-2 ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#198754] hover:bg-[#157347]'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            )}
            {isSubmitting ? "Updating..." : "Update Contract"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/contract")}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded focus:outline-none"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditContractForm; 