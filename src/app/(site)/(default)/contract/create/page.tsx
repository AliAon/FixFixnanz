/* eslint-disable  @typescript-eslint/no-explicit-any */
"use client";
import SearchablDropdown from "@/components/dashboard-sections/Dropdown";
import SearchabDropdown from "@/components/dashboard-sections/_comp/DropCate";
import SearchableDropdown from "@/components/dashboard-sections/_comp/SearDow";
import Datepicker from "@/components/shared/DatePicker";
import { fetchCompanies } from "@/redux/slices/companiesSlice";
import { fetchCategories } from "@/redux/slices/contractCategoriesSlice";
import { addContract } from "@/redux/slices/contractsSlice";
import { AppDispatch } from "@/redux/store";
import React, { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

interface Option {
  value: string;
  label: string;
}

interface ContractData {
  company_id: string;
  start_of_contract: string;
  expire_date: string;
  number: string;
  amount: string;
  payment_frequency: string;
  service_id: string;
}

interface Company {
  id: string;
  name: string;
}

interface RootState {
  contractCategories: any;
  contracts: {
    contracts: unknown[];
  };
  companies: {
    companies: Company[];
  };
}

const CreateContractForm = () => {
  const [society, setSociety] = useState<string>("");
  const [payment, setPayment] = useState<string>("");
  const [category, setCategory] = useState<string>("Health and care");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [contractNumber, setContractNumber] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [cId, setCId] = useState<string>("");
  const [cId2, setCId2] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const obj: ContractData = {
        company_id: cId,
        start_of_contract: startDate.toISOString().split("T")[0],
        expire_date: endDate.toISOString().split("T")[0],
        number: contractNumber,
        amount: amount,
        payment_frequency: payment,
        service_id: cId2,
      }

      const result = await dispatch(addContract({ data: obj }));

      if (addContract.fulfilled.match(result)) {
        toast.success("Contract created successfully!");
        // Reset form after successful creation
        setSociety("");
        setPayment("");
        setCategory("Health and care");
        setStartDate(new Date());
        setEndDate(new Date());
        setContractNumber("");
        setAmount("");
        setCId("");
        setCId2("");
      } else {
        toast.error("Failed to create contract. Please try again.");
      }
    } catch (error) {
      console.error("Error creating contract:", error);
      toast.error("An error occurred while creating the contract.");
    }
  };

  const handleContractNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    setContractNumber(e.target.value);
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  // const companyName: Option[] = [
  //   { value: "company", label: "Company" },
  //   { value: "company1", label: "Company1" },
  //   { value: "company2", label: "Company2" },
  //   { value: "company3", label: "Company3" },
  // ];

  const payments: Option[] = [
    { value: "monthly", label: "Monthly" },
    { value: "annually", label: "Annually" },
  ];

  /*const categorys: Option[] = [
    { value: "liability", label: "Liability" },
    { value: "labor", label: "Labor and Income" },
    { value: "insurance", label: "Property Insurance" },
    { value: "assets", label: "Asset and legal protection" },
  ];*/



  const dispatch = useDispatch<AppDispatch>();
  // const data = useSelector(
  //   (state: RootState) => state.contracts.contracts
  // );

  const companiesData = useSelector(
    (state: RootState) => state.companies.companies
  );

  const categoriesData = useSelector(
    (state: RootState) => state.contractCategories
  );

  useEffect(() => {
    async function fetchData() {
      await dispatch(fetchCompanies({}));
      await dispatch(fetchCategories());
    }
    fetchData();
  }, []);


  return (
    <div className="bg-white rounded-lg p-8 shadow-lg">
      <h1 className="text-[32px] font-bold font-roboto text-gray-800 mb-6">
        Create a new contract
      </h1>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="mb-4">
          <div className="relative">
            <SearchableDropdown
              label="Society:"
              options={companiesData}
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
              Start date
            </label>
            <Datepicker
              selectedDate={startDate}
              onChange={setStartDate}
              minDate={new Date(2023, 0, 1)}
              maxDate={new Date(2025, 11, 31)}
              placeholder="Select start date"
              className="w-full"
            />
          </div>

          <div className="mt-2">
            <label className="block font-roboto text-secondary">End date</label>
            <Datepicker
              selectedDate={endDate}
              onChange={setEndDate}
              minDate={new Date(2023, 0, 1)}
              maxDate={new Date(2025, 11, 31)}
              placeholder="Select end date"
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
          />
        </div>

        <div className="mb-4">
          <div className="relative">
            <SearchablDropdown
              label="Payment:"
              options={payments}
              value={payment}
              onChange={setPayment}
              placeholder="Choose a payment..."
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <SearchabDropdown
              setCId={setCId2}
              label="Category:"
              options={categoriesData.categories}
              value={category}
              onChange={setCategory}
              placeholder="Health and Care"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-[#198754] hover:bg-[#157347] font-roboto text-white font-medium py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default CreateContractForm;
