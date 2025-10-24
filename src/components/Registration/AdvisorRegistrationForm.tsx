/* eslint-disable  @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { registerUser } from "@/redux/slices/authSlice";
import { Category, fetchCategories } from "@/redux/slices/categoriesSlice";
import { Company, fetchCompanies } from "@/redux/slices/companiesSlice";
import { checkEmailExists, clearEmailCheck, resetEmailCheck } from "@/redux/slices/usersSlice";
import { FcGoogle } from "react-icons/fc";
import { FaCheckCircle, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TermsAndConditions from "@/app/(admin)/components/Advisor/Terms";
import SimpleAddressAutocomplete from "@/components/google-map/AddressAutocomplete";

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  category_id: string;
  company: string;
  isBroker: boolean;
  address: string;
  postal_code: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  website: string;
  accept_terms: boolean;
}

const AdvisorRegistrationForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [companySearchTerm, setCompanySearchTerm] = useState("");

  // Add debounce timer for email checking
  const [emailCheckTimer, setEmailCheckTimer] = useState<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    category_id: "",
    company: "",
    isBroker: false,
    address: "",
    postal_code: "",
    city: "",
    state: "",
    country: "",
    phone: "",
    website: "",
    accept_terms: false,
  });

  // Add coordinates state
  const [coordinates, setCoordinates] = useState({
    lat: 0,
    lng: 0
  });

  console.debug("Coordinates:", coordinates);

  // Get email check state from Redux
  const {
    emailCheckLoading,
    emailExists
  } = useSelector((state: RootState) => state.users);

  // Get other Redux state
  const { categories } = useSelector((state: RootState) => state.categories);
  const { companies } = useSelector((state: RootState) => state.companies);
  const { error } = useSelector((state: RootState) => state.auth);

  // Debounced email validation function
  const debouncedEmailCheck = useCallback((email: string) => {
    if (emailCheckTimer) {
      clearTimeout(emailCheckTimer);
    }

    const timer = setTimeout(() => {
      if (email && isValidEmail(email)) {
        dispatch(checkEmailExists({ email }));
      } else {
        dispatch(resetEmailCheck());
      }
    }, 800); // Wait 800ms after user stops typing

    setEmailCheckTimer(timer);
  }, [dispatch, emailCheckTimer]);

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email change with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFormData({ ...formData, email });

    // Reset email check state when user starts typing
    if (email !== formData.email) {
      dispatch(resetEmailCheck());
    }

    // Start debounced email check
    debouncedEmailCheck(email);
  };

  // Check if we can proceed to next step
  const canProceedFromStep1 = () => {
    if (!searchTerm) return false;
    if (!formData.email || !isValidEmail(formData.email)) return false;
    if (emailCheckLoading) return false;
    if (emailExists) return false;
    return true;
  };

  // Restore Account Modal Component
  const RestoreAccountModal = () => {
    if (!showRestoreModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
          <button
            onClick={() => setShowRestoreModal(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="mb-4">
              <FaExclamationTriangle className="w-12 h-12 text-yellow-500 mx-auto" />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Email Already Registered
            </h3>
            
            <p className="text-sm text-gray-600 mb-6">
              The email <strong>{formData.email}</strong> is already associated with an account. 
              Would you like to restore your account or sign in instead?
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowRestoreModal(false);
                  router.push("/password-reset");
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Restore Your Account
              </button>
              
              <button
                onClick={() => {
                  setShowRestoreModal(false);
                  router.push("/login");
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors duration-200 font-medium"
              >
                Sign In Instead
              </button>
              
              <button
                onClick={() => setShowRestoreModal(false)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Use Different Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!searchTerm) {
        toast.error("Please select your area of expertise");
        return;
      }
      if (!formData.email || !isValidEmail(formData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }
      if (emailCheckLoading) {
        toast.error("Please wait while we check your email");
        return;
      }
      if (emailExists) {
        // Show modal instead of toast
        setShowRestoreModal(true);
        return;
      }
    }
    if (currentStep === 2) {
      // Add validation for company OR broker selection
      if (!formData.company.trim() && !formData.isBroker) {
        toast.error("Please select a company or check the broker option");
        return;
      }
    }

    if (currentStep === 3) {
      if (
        !formData.address.trim() ||
        !formData.postal_code.trim() ||
        !formData.city.trim() ||
        !formData.state.trim()
      ) {
        toast.error("Please fill in all address fields");
        return;
      }
    }

    if (currentStep === 4) {
      if (!formData.accept_terms) {
        toast.error("Please accept the terms and conditions");
        return;
      }
    }

    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    if (currentStep === 1) {
      router.push("/login");
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddressSelected = (addressData: any) => {
    setFormData(prev => ({
      ...prev,
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      country: addressData.country,
      postal_code: addressData.postal_code,
    }));

    setCoordinates({
      lat: addressData.lat,
      lng: addressData.lng
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const resultAction = await dispatch(
        registerUser({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          role: "financial-advisor",
          category_id: formData.category_id,
          lead_email: formData.email,
          avatar_url: null,
          username: null,
          phone: formData.phone || null,
          company: formData.company,
          isBroker: formData.isBroker,
          address: formData.address,
          postal_code: formData.postal_code,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          website: formData.website || null
        })
      );

      setIsLoading(false);

      if (registerUser.fulfilled.match(resultAction)) {
        toast.success(
          "Registration successful! Please check your email for verification."
        );

        localStorage.setItem("justRegistered", "true");
        router.push("/unverified-user?from=registration");
      } else {
        const errorMessage =
          typeof resultAction.payload === "string"
            ? resultAction.payload
            : "Registration failed";
        toast.error(errorMessage);
      }
    } catch (error) {
      setIsLoading(false);
      if (error instanceof Error) {
        toast.error(error.message || "An error occurred during registration");
      } else {
        toast.error("An error occurred during registration");
      }
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleCompanyDropdown = () => {
    setIsCompanyOpen(!isCompanyOpen);
  };

  const canProceedFromStep2 = () => {
    // Either company must be selected OR broker must be checked
    return formData.company.trim() !== '' || formData.isBroker;
  };

  const handleOptionClick = (option: Category) => {
    setSearchTerm(option.name);
    setFormData({
      ...formData,
      category_id: option.id,
    });
    setIsOpen(false);
  };

  const handleCompanyOptionClick = (company: Company) => {
    setCompanySearchTerm(company.name);
    setFormData({
      ...formData,
      company: company.name,
      isBroker: false, // Uncheck broker when company is selected
    });
    setIsCompanyOpen(false);
  };

  const handleGoogleSignup = () => {
    toast.info("Google signup feature coming soon!");
  };

  // Remove this line - we're not filtering options anymore
  const filteredOptions = categories.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.debug("Filtered Options:", filteredOptions);

  // Fetch categories on mount
  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
    if (companies.length === 0) {
      dispatch(fetchCompanies({}));
    }
  }, [dispatch, categories.length, companies.length]);

  // Show auth errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('expertise-dropdown');
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup email check timer on unmount
  useEffect(() => {
    return () => {
      if (emailCheckTimer) {
        clearTimeout(emailCheckTimer);
      }
      dispatch(clearEmailCheck());
    };
  }, [emailCheckTimer, dispatch]);

  // Email validation status component with enhanced restore account functionality
  const EmailValidationStatus = () => {
    if (!formData.email) return null;

    if (!isValidEmail(formData.email)) {
      return (
        <div className="flex items-center gap-2 mt-1 text-red-500 text-sm">
          <FaExclamationTriangle className="w-4 h-4" />
          <span>Please enter a valid email address</span>
        </div>
      );
    }

    if (emailCheckLoading) {
      return (
        <div className="flex items-center gap-2 mt-1 text-blue-500 text-sm">
          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span>Checking email availability...</span>
        </div>
      );
    }

    if (emailExists) {
      return (
        <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-500 text-sm mb-2">
            <FaExclamationTriangle className="w-4 h-4" />
            <span>This email is already registered.</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => router.push("/password-reset")}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Restore Your Account
            </button>
            <Link
              href="/login"
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors duration-200 font-medium text-center"
            >
              Sign In Instead
            </Link>
          </div>
        </div>
      );
    }

    if (formData.email && isValidEmail(formData.email) && !emailCheckLoading && !emailExists) {
      return (
        <div className="flex items-center gap-2 mt-1 text-green-500 text-sm">
          <FaCheckCircle className="w-4 h-4" />
          <span>Email is available</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex gap-8 w-full sm:flex-col xsm:flex-col">
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

      {/* Restore Account Modal */}
      <RestoreAccountModal />

      <div className="bg-white max-w-[800px] sm:max-w-full h-full w-full rounded-2xl pb-4">
        <h2 className="text-xl font-bold rounded-t-2xl text-white bg-base py-3 px-4 text-center">
          Now for free register
        </h2>

        <div className="my-6">
          <p className="text-center text-secondary pb-3 border-b border-[#D8D8D8]">
            How do you want <span className="font-bold">FixFinanz</span> use?
          </p>
        </div>

        {/* Step 1: Basic Info + Email Validation */}
        {currentStep === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNextStep();
            }}
            className="space-y-4 w-full px-6"
          >
            <div className="flex items-center gap-5 w-full">
              <div className="w-full">
                <label className="block text-md text-secondary font-roboto mb-1">
                  First name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Your first name"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  className="placeholder:text-[#6C757D] w-full p-4 outline-none duration-300 hover:border-blue-600 border-b border-[#C3C3C3] rounded-b"
                  required
                />
              </div>

              <div className="w-full">
                <label className="block text-md text-secondary font-roboto mb-1">
                  Surname
                </label>
                <input
                  type="text"
                  placeholder="Your last name"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  className="placeholder:text-[#6C757D] w-full p-4 outline-none duration-300 hover:border-blue-600 border-b border-[#C3C3C3] rounded-b"
                />
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="w-full">
                <label className="block text-md text-secondary font-roboto mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Your email address"
                  value={formData.email}
                  onChange={handleEmailChange}
                  className={`placeholder:text-[#6C757D] w-full p-4 outline-none duration-300 border-b rounded-b ${emailExists
                      ? 'border-red-500 hover:border-red-600'
                      : 'border-[#C3C3C3] hover:border-blue-600'
                    }`}
                  required
                />
                <EmailValidationStatus />
              </div>

              <div className="w-full">
                <label className="block text-md text-secondary font-roboto mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Set a password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="placeholder:text-[#6C757D] w-full p-4 outline-none duration-300 hover:border-blue-600 border-b border-[#C3C3C3] rounded-b"
                  required
                />
              </div>
            </div>

            <div className="w-full pt-2">
              <div className="mb-4">
                <label className="block text-secondary text-lg mb-2">
                  Financial services <span className="text-red-500">*</span>
                </label>

                <div className="relative" id="expertise-dropdown">
                  <div
                    className="border rounded-lg cursor-pointer bg-white"
                    onClick={toggleDropdown}
                  >
                    <div className="flex justify-between items-center p-3">
                      <input
                        type="text"
                        placeholder="Choose your area of expertise"
                        className="w-full outline-none placeholder:text-gray-600"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setIsOpen(true);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex items-center gap-2">
                        {/* Clear button when there's a selection */}
                        {searchTerm && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSearchTerm("");
                              setFormData({
                                ...formData,
                                category_id: "",
                              });
                              setIsOpen(true);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors bg-[#002c50] text-white"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        )}
                        {isOpen ? (
                          <IoIosArrowUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <IoIosArrowDown className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      <div className="py-2">
                        <div className="bg-[#0072BC] text-white py-2 px-4 flex justify-between items-center">
                          <span>Choose your area of expertise</span>
                          <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-200 transition-colors"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Show ALL categories always - no filtering */}
                        {categories.map((option) => (
                          <div
                            key={option.id}
                            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-600 flex items-center justify-between ${option.name === searchTerm ? 'bg-blue-50 text-blue-700 font-medium' : ''
                              }`}
                            onClick={() => handleOptionClick(option)}
                          >
                            <span>{option.name}</span>
                            {option.name === searchTerm && (
                              <FaCheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                        ))}

                        {categories.length === 0 && (
                          <div className="px-4 py-2 text-gray-500 text-center">
                            No options available
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Show selected expertise summary below dropdown when closed */}
                {!isOpen && searchTerm && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-700 font-medium">Selected expertise:</span>
                        <span className="text-green-700">{searchTerm}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center gap-4 mt-6">
              <button
                type="button"
                className="px-6 py-2 bg-[#212529] font-roboto text-white rounded-xl"
                onClick={() => router.push("/login")}
              >
                Back
              </button>

              <button
                type="submit"
                disabled={!canProceedFromStep1()}
                className={`btn-shine min-h-[50px] hover:bg-[#1778F2] py-0 font-medium font-roboto bg-gradient-to-r from-[#434370] to-[#13214e] px-6 text-white rounded-xl ${!canProceedFromStep1() ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                Continue
              </button>
            </div>

            <div className="text-center my-4">
              <p className="font-roboto py-6">or</p>
              <button
                type="button"
                className="flex items-center justify-center border-none shadow-xl py-3 w-full bg-white mt-2 p-2 text-secondary rounded"
                onClick={handleGoogleSignup}
              >
                <FcGoogle className="text-xl mr-2" />
                registration with Google
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 mt-4">
              <p className="font-roboto text-[#817081]">
                Do you already have an account?
              </p>
              <Link
                href="/login"
                className="bg-[#1477BB] text-white font-roboto px-3 py-[6px] rounded-md"
              >
                login
              </Link>
            </div>
          </form>
        )}

        {/* Step 2: Company Information */}
        {currentStep === 2 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNextStep();
            }}
            className="space-y-4 w-full px-6"
          >
            <div className="w-full pt-2">
              <label className="block text-secondary text-lg mb-2">
                Which company do you work for? <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Please select a company OR check the broker option below
              </p>

              <div className="space-y-4">
                {/* Company Selection */}
                <div className="relative w-full" id="company-dropdown">
                  <div
                    className={`border rounded-lg cursor-pointer bg-white ${formData.isBroker ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    onClick={!formData.isBroker ? toggleCompanyDropdown : undefined}
                  >
                    <div className="flex justify-between items-center p-3">
                      <input
                        type="text"
                        placeholder={formData.isBroker ? "Disabled - Broker selected" : "Company Name"}
                        className="w-full outline-none placeholder:text-gray-600"
                        value={formData.isBroker ? '' : companySearchTerm}
                        onChange={(e) => {
                          if (!formData.isBroker) {
                            setCompanySearchTerm(e.target.value);
                            setIsCompanyOpen(true);
                            setFormData({
                              ...formData,
                              company: e.target.value,
                            });
                          }
                        }}
                        onFocus={() => {
                          if (!formData.isBroker) {
                            setIsCompanyOpen(true);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        disabled={formData.isBroker}
                      />
                      {!formData.isBroker && (
                        <div className="flex items-center gap-2">
                          {/* Clear button when there's a selection */}
                          {companySearchTerm && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCompanySearchTerm("");
                                setFormData({
                                  ...formData,
                                  company: "",
                                });
                                setIsCompanyOpen(true);
                              }}
                              className="text-gray-400 hover:text-gray-600 transition-colors bg-[#002c50] text-white"
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
                          )}
                          {isCompanyOpen ? (
                            <IoIosArrowUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <IoIosArrowDown className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {isCompanyOpen && !formData.isBroker && (
                    <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      <div className="py-2">
                        <div className="bg-[#0072BC] text-white py-2 px-4 flex justify-between items-center sticky top-0">
                          <span>Choose your company</span>
                        </div>

                        {/* Show ALL companies always */}
                        {companies.map((company) => (
                          <div
                            key={company.id}
                            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-600 flex items-center justify-between ${company.name === companySearchTerm ? 'bg-blue-50 text-blue-700 font-medium' : ''
                              }`}
                            onClick={() => handleCompanyOptionClick(company)}
                          >
                            <span>{company.name}</span>
                            {company.name === companySearchTerm && (
                              <FaCheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                        ))}

                        {companies.length === 0 && (
                          <div className="px-4 py-2 text-gray-500 text-center">
                            No companies available
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* OR Divider */}
                <div className="flex items-center justify-center my-4">
                  <div className="border-t border-gray-300 flex-grow"></div>
                  <span className="px-3 text-gray-500 bg-white">OR</span>
                  <div className="border-t border-gray-300 flex-grow"></div>
                </div>

                {/* Broker Option */}
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <input
                    type="checkbox"
                    id="broker"
                    checked={formData.isBroker}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setFormData({
                        ...formData,
                        isBroker: isChecked,
                        company: isChecked ? '' : formData.company // Clear company if broker is selected
                      });
                      if (isChecked) {
                        setCompanySearchTerm(''); // Clear company search term
                        setIsCompanyOpen(false); // Close company dropdown
                      }
                    }}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="broker" className="text-lg text-secondary">
                    I am an independent broker
                  </label>
                </div>

                {/* Show current selection */}
                {(formData.company || formData.isBroker) && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm">
                      Selected: {formData.isBroker ? 'Independent Broker' : formData.company}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center gap-4 mt-6">
              <button
                type="button"
                className="px-6 py-2 bg-[#212529] font-roboto text-white rounded-xl"
                onClick={handlePrevStep}
              >
                Back
              </button>

              <button
                type="submit"
                disabled={!canProceedFromStep2()}
                className={`btn-shine min-h-[50px] hover:bg-[#1778F2] py-0 font-medium font-roboto bg-gradient-to-r from-[#434370] to-[#13214e] px-6 text-white rounded-xl ${!canProceedFromStep2() ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                Continue
              </button>
            </div>

            <div className="text-center my-4">
              <p className="font-roboto py-6">or</p>
              <button
                type="button"
                className="flex items-center justify-center border-none shadow-xl py-3 w-full bg-white mt-2 p-2 text-secondary rounded"
                onClick={handleGoogleSignup}
              >
                <FcGoogle className="text-xl mr-2" />
                registration with Google
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 mt-4">
              <p className="font-roboto text-[#817081]">
                Do you already have an account?
              </p>
              <Link
                href="/login"
                className="bg-[#1477BB] text-white font-roboto px-3 py-[6px] rounded-md"
              >
                login
              </Link>
            </div>
          </form>
        )}


        {/* Step 3: Address Information */}
        {currentStep === 3 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNextStep();
            }}
            className="space-y-4 w-full px-6"
          >
            <div className="flex items-center gap-5 w-full">
              <div className="mb-4 w-full">
                <label
                  htmlFor="address"
                  className="block text-[16px] text-primary font-bold mb-1"
                >
                  Street, house number <span className="text-red-500">*</span>
                </label>
                <SimpleAddressAutocomplete
                  value={formData.address}
                  onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
                  onAddressSelected={handleAddressSelected}
                  placeholder="Enter your address..."
                  className="placeholder:text-[#6C757D] w-full p-4 outline-none duration-300 hover:border-blue-600 border-b border-[#C3C3C3] rounded-b"
                />
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="w-full">
                <label className="block text-base font-bold text-secondary font-roboto mb-1">
                  Postal code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Postal code"
                  value={formData.postal_code}
                  onChange={(e) =>
                    setFormData({ ...formData, postal_code: e.target.value })
                  }
                  className="placeholder:text-[#6C757D] w-full p-4 outline-none duration-300 hover:border-blue-600 border-b border-[#C3C3C3] rounded-b"
                  required
                />
              </div>
              
              <div className="w-full">
                <label className="block text-base font-bold text-secondary font-roboto mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="placeholder:text-[#6C757D] w-full p-4 outline-none duration-300 hover:border-blue-600 border-b border-[#C3C3C3] rounded-b"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="w-full">
                <label className="block text-base font-bold text-secondary font-roboto mb-1">
                  Telephone number
                </label>
                <input
                  type="tel"
                  placeholder="Telephone number"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="placeholder:text-[#6C757D] w-full p-4 outline-none duration-300 hover:border-blue-600 border-b border-[#C3C3C3] rounded-b"
                />
              </div>

              <div className="w-full">
                <label className="block text-base font-bold text-secondary font-roboto mb-1">
                  Your website
                </label>
                <input
                  type="url"
                  placeholder="Your website"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  className="placeholder:text-[#6C757D] w-full p-4 outline-none duration-300 hover:border-blue-600 border-b border-[#C3C3C3] rounded-b"
                />
              </div>
            </div>

            <div className="flex justify-between items-center gap-4 mt-6">
              <button
                type="button"
                className="px-6 py-2 bg-[#212529] font-roboto text-white rounded-xl"
                onClick={handlePrevStep}
              >
                Back
              </button>

              <button
                type="submit"
                className="btn-shine min-h-[50px] hover:bg-[#1778F2] py-0 font-medium font-roboto bg-gradient-to-r from-[#434370] to-[#13214e] px-6 text-white rounded-xl"
              >
                Next
              </button>
            </div>

            <div className="text-center my-4">
              <p className="font-roboto py-6">or</p>
              <button
                type="button"
                className="flex items-center justify-center border-none shadow-xl py-3 w-full bg-white mt-2 p-2 text-secondary rounded"
                onClick={handleGoogleSignup}
              >
                <FcGoogle className="text-xl mr-2" />
                registration with Google
              </button>
            </div>
          </form>
        )}

        {/* Step 4: Terms and Conditions */}
        {currentStep === 4 && (
          <form onSubmit={handleSubmit} className="space-y-4 w-full px-6">
            {/* Scrollable Terms and Conditions Container */}
            <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto border border-gray-300">
              <div>
                <TermsAndConditions />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={formData.accept_terms}
                onChange={(e) =>
                  setFormData({ ...formData, accept_terms: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                required
              />
              <label htmlFor="terms" className="text-sm text-secondary">
                I accept the terms and conditions{" "}
                <span className="text-red-500">*</span>
              </label>
            </div>

            <div className="flex justify-between items-center gap-4 mt-6">
              <button
                type="button"
                className="px-6 py-2 bg-[#212529] font-roboto text-white rounded-xl"
                onClick={handlePrevStep}
              >
                Back
              </button>

              <button
                type="submit"
                disabled={isLoading || !formData.accept_terms}
                className={`btn-shine min-h-[50px] hover:bg-[#1778F2] py-0 font-medium font-roboto bg-gradient-to-r from-[#434370] to-[#13214e] px-6 text-white rounded-xl ${
                  isLoading || !formData.accept_terms
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Account...
                  </div>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Right sidebar */}
      <div className="bg-[#D3D3D3] border border-[#B9B9B9] h-full rounded-3xl p-4 max-w-[400px] sm:max-w-full xsm:max-w-full w-full">
        <h1 className="text-xl font-bold font-roboto mb-2">
          The No. 1 financial platform
        </h1>

        <p className="text-[#647082] font-roboto mb-4">
          Discover independent consultants, coaches and experts for every area.
        </p>

        <div className="space-y-8">
          <div className="px-4">
            <h2 className="text-xl font-bold font-roboto mb-4">
              For every user
            </h2>
            <div className="bg-white rounded-md shadow-sm space-y-2 py-2">
              <div className="flex items-center gap-2 border-b border-[#DFDFDF] px-4 pb-2">
                <FaCheckCircle className="w-4 h-4" />
                <span className="text-[16px] font-roboto">
                  Find the right financial advisor
                </span>
              </div>
              <div className="flex items-center gap-2 px-4">
                <FaCheckCircle className="w-4 h-4" />
                <span className="text-[16px] font-roboto">
                  let advise you independently
                </span>
              </div>
            </div>
          </div>

          <div className="px-4">
            <h2 className="text-xl font-bold font-roboto mb-4">
              For financial advisors
            </h2>
            <div className="bg-white rounded-xl shadow-sm space-y-2 p-4">
              <div className="flex items-start gap-2">
                <div className="pt-2">
                  <FaCheckCircle className="w-4 h-4" />
                </div>
                <span className="text-[16px] font-roboto">
                  Become better found as a financial advisor
                </span>
              </div>
              <div className="flex items-start gap-2">
                <div className="pt-2">
                  <FaCheckCircle className="w-4 h-4" />
                </div>
                <span className="text-[16px] font-roboto">
                  Get real customer reviews for more trust
                </span>
              </div>
              <div className="flex items-start gap-2">
                <div className="pt-2">
                  <FaCheckCircle className="w-4 h-4" />
                </div>
                <span className="text-[16px] font-roboto">
                  Automation - Book your appointment directly, manage your
                  events and customers
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorRegistrationForm;