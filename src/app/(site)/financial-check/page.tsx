"use client";

import React, { useState, ChangeEvent } from "react";
import { motion } from "framer-motion";
import Datepicker from "@/components/shared/DatePicker";
import ConfirmationDialog from "@/components/shared/ConfirmationDialouge";

interface RadioOption {
  id: string;
  label: string;
}

const employmentOptions: RadioOption[] = [
  { id: "job", label: "Job" },
  { id: "business", label: "Business" },
  { id: "jobless", label: "Jobless" },
];

const maritalOptions: RadioOption[] = [
  { id: "single", label: "Single" },
  { id: "married", label: "Married" },
  { id: "divorced", label: "Divorced" },
];

const livingOptions: RadioOption[] = [
  { id: "own", label: "Own home" },
  { id: "rent", label: "Rent" },
  { id: "shared", label: "Shared" },
];

const FinancialCheckPage: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [income, setIncome] = useState<string>("1");
  const [expenditure, setExpenditure] = useState<string>("1");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const nextStep = (): void => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = (): void => setStep((prev) => Math.max(prev - 1, 1));

  const handleIncomeChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setIncome(e.target.value);
  };

  const handleExpenditureChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setExpenditure(e.target.value);
  };
  const handleSubmitClick = () => {
    setIsConfirmationOpen(true);
  };

  const handleConfirm = () => {
    setIsConfirmationOpen(false);
  };
  const handleCancel = () => {
    setIsConfirmationOpen(false);
  };

  const renderRadioGroup = (
    options: RadioOption[],
    name: string,
    defaultCheckedId: string
  ) => (
    <div className="mt-2 space-y-3">
      {options.map((option) => (
        <div key={option.id} className="flex items-center">
          <input
            type="radio"
            id={option.id}
            name={name}
            className="w-4 h-4 accent-[#002B4E]"
            defaultChecked={option.id === defaultCheckedId}
          />
          <label
            htmlFor={option.id}
            className="ml-2 font-roboto text-secondary"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );

  return (
    <div className="border w-full max-w-3xl mx-auto rounded-lg my-44 border-gray-200 py-4 px-[100px] xsm:px-[20px] sm:px-[20px]">
      <div className="max-w-xl w-full mx-auto">
        <h2 className="text-[25px] font-bold text-center font-roboto text-base">
          Financial check step form
        </h2>

        <div className="flex items-center justify-between my-6 relative">
          <div className="absolute w-full h-1 bg-[#E9ECEF] top-1/2 z-0"></div>

          <motion.div
            className="absolute h-1 bg-base top-1/2 z-0"
            initial={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
            animate={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
            transition={{ duration: 0.5 }}
          ></motion.div>

          {[1, 2, 3].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`w-8 h-8 flex items-center justify-center rounded-full z-10 relative ${
                step >= stepNumber
                  ? "bg-base text-white"
                  : "border-[2.5px] border-base bg-white text-base"
              } text-[13px] font-roboto font-semibold`}
            >
              {stepNumber === 1 ? "1" : stepNumber === 2 ? "2" : "3"}
            </div>
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {step === 1 && (
            <div>
              <h3 className="text-[32px] font-bold text-secondary font-roboto">
                Financial
              </h3>
              <div className="mt-2">
                <label className="block text-md font-roboto font-bold text-secondary">
                  income <span className="text-red-500">*</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10000"
                  value={income}
                  onChange={handleIncomeChange}
                  className="w-full appearance-none h-2 bg-gray-200 rounded-lg"
                  style={
                    {
                      "--range-thumb-size": "25px",
                      "--range-thumb-color": "#002345",
                      "--range-track-color": "#E2E8F0",
                      "--range-progress-color": "#E2E8F0",
                    } as React.CSSProperties
                  }
                />
                <style jsx>{`
                  input[type="range"] {
                    -webkit-appearance: none;
                    appearance: none;
                    background: var(--range-track-color);
                    height: 8px;
                    border-radius: 4px;
                  }

                  input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: var(--range-thumb-size);
                    height: var(--range-thumb-size);
                    border-radius: 50%;
                    background-color: var(--range-thumb-color);
                    cursor: pointer;
                    border: none;
                  }

                  input[type="range"]::-moz-range-thumb {
                    width: var(--range-thumb-size);
                    height: var(--range-thumb-size);
                    border-radius: 50%;
                    background-color: var(--range-thumb-color);
                    cursor: pointer;
                    border: none;
                  }

                  input[type="range"]::-webkit-slider-thumb:hover,
                  input[type="range"]:hover::-webkit-slider-thumb {
                    background-color: var(--range-thumb-color);
                  }

                  input[type="range"]::-moz-range-thumb:hover,
                  input[type="range"]:hover::-moz-range-thumb {
                    background-color: var(--range-thumb-color);
                  }

                  input[type="range"] {
                    background: linear-gradient(
                      to right,
                      var(--range-progress-color) 0%,
                      var(--range-progress-color) calc(${income}%),
                      var(--range-track-color) calc(${income}%),
                      var(--range-track-color) 100%
                    );
                  }
                `}</style>
                <p className="text-[21px] text-[#002345] text-center font-roboto font-extrabold mt-2">
                  {income} €
                </p>
              </div>

              {/* Expenditure section similar to income section */}
              <div className="mt-0">
                <label className="block text-md font-roboto font-bold text-secondary">
                  Expenditure <span className="text-red-500">*</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10000"
                  value={expenditure}
                  onChange={handleExpenditureChange}
                  className="w-full appearance-none h-2 bg-gray-200 rounded-lg"
                  style={
                    {
                      "--range-thumb-size": "25px",
                      "--range-thumb-color": "#002345",
                      "--range-track-color": "#E2E8F0",
                      "--range-progress-color": "#E2E8F0",
                    } as React.CSSProperties
                  }
                />
                <style jsx>{`
                  input[type="range"] {
                    -webkit-appearance: none;
                    appearance: none;
                    background: var(--range-track-color);
                    height: 8px;
                    border-radius: 4px;
                  }

                  input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: var(--range-thumb-size);
                    height: var(--range-thumb-size);
                    border-radius: 50%;
                    background-color: var(--range-thumb-color);
                    cursor: pointer;
                    border: none;
                  }

                  input[type="range"]::-moz-range-thumb {
                    width: var(--range-thumb-size);
                    height: var(--range-thumb-size);
                    border-radius: 50%;
                    background-color: var(--range-thumb-color);
                    cursor: pointer;
                    border: none;
                  }

                  input[type="range"]::-webkit-slider-thumb:hover,
                  input[type="range"]:hover::-webkit-slider-thumb {
                    background-color: var(--range-thumb-color);
                  }

                  input[type="range"]::-moz-range-thumb:hover,
                  input[type="range"]:hover::-moz-range-thumb {
                    background-color: var(--range-thumb-color);
                  }

                  input[type="range"] {
                    background: linear-gradient(
                      to right,
                      var(--range-progress-color) 0%,
                      var(--range-progress-color) calc(${expenditure}%),
                      var(--range-track-color) calc(${expenditure}%),
                      var(--range-track-color) 100%
                    );
                  }
                `}</style>
                <p className="text-[21px] text-[#002345] text-center font-roboto font-extrabold mt-2">
                  {expenditure} €
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-[32px] font-bold text-secondary">
                Hello name
              </h3>
              <div className="mt-2">
                <label className="block text-lg font-semibold font-roboto text-secondary">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 outline-[#001A33] p-2 rounded"
                  placeholder="Enter first name"
                />
              </div>
              <div className="mt-2">
                <label className="block text-lg font-semibold font-roboto text-secondary">
                  Surname
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 outline-[#001A33] p-2 rounded"
                  placeholder="Enter last name"
                />
              </div>
              <div className="mt-2">
                <label className="block text-lg font-semibold font-roboto text-secondary">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 outline-[#001A33] p-2 rounded"
                  placeholder="Enter email"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-[32px] font-bold text-secondary">
                Personal Details
              </h3>
              <div className="mt-4">
                <label className="block text-lg font-semibold font-roboto text-secondary">
                  Date of birth
                </label>
                <Datepicker
                  selectedDate={selectedDate}
                  onChange={setSelectedDate}
                  minDate={new Date(1950, 0, 1)} // From January 1, 1950
                  maxDate={new Date()} // Today
                  placeholder="Select a date"
                  className="w-full"
                />
              </div>

              <div className="mt-4">
                <label className="block text-lg font-semibold font-roboto text-secondary">
                  Employment status
                </label>
                {renderRadioGroup(employmentOptions, "employment", "job")}
              </div>

              <div className="mt-4">
                <label className="block text-lg font-semibold font-roboto text-secondary">
                  Post
                </label>
                <input
                  type="text"
                  className="w-full border p-2 rounded outline-[#001A33]"
                  placeholder="Enter Post"
                />
              </div>

              <div className="mt-2">
                <label className="block text-lg font-semibold font-roboto text-secondary">
                  Occupation
                </label>
                <input
                  type="text"
                  className="w-full border p-2 rounded outline-[#001A33]"
                  placeholder="Enter Occupation"
                />
              </div>

              <div className="mt-4">
                <label className="block text-lg font-semibold font-roboto text-secondary">
                  Marital status
                </label>
                {renderRadioGroup(maritalOptions, "marital", "single")}
              </div>

              <div className="mt-4">
                <label className="block text-lg font-semibold font-roboto text-secondary">
                  State
                </label>
                <input
                  type="text"
                  className="w-full border p-2 rounded outline-[#001A33]"
                  placeholder="Enter State"
                />
              </div>

              <div className="mt-4">
                <label className="block text-lg font-semibold font-roboto text-secondary">
                  Place of residence
                </label>
                <input
                  type="text"
                  className="w-full border p-2 rounded outline-[#001A33]"
                  placeholder="Enter Place of residence"
                />
              </div>

              <div className="mt-4">
                <label className="block text-lg font-semibold font-roboto text-secondary">
                  Living status
                </label>
                {renderRadioGroup(livingOptions, "living", "own")}
              </div>
            </div>
          )}
        </motion.div>

        <div className="flex justify-center gap-4 mt-6">
          {step > 1 && (
            <button
              className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-700"
              onClick={prevStep}
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              className="px-6 py-2 bg-base text-white font-semibold rounded-md hover:bg-[#001A33]"
              onClick={nextStep}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmitClick}
              className="px-6 py-2 bg-[#198754] text-white font-semibold rounded-md hover:bg-green-900"
            >
              Submit
            </button>
          )}
        </div>
        <ConfirmationDialog
          isOpen={isConfirmationOpen}
          title="Confirm Submission"
          message="Are you sure you want to submit your information? This action cannot be undone."
          confirmText="Yes, Submit"
          cancelText="Cancel"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default FinancialCheckPage;
