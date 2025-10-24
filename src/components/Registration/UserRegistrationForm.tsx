/* eslint-disable  @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { registerUser } from "@/redux/slices/authSlice";
import { checkEmailExists, clearEmailCheck, resetEmailCheck } from "@/redux/slices/usersSlice";
import { FcGoogle } from "react-icons/fc";
import { FaCheckCircle, FaHandshake, FaUser, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiClock } from "react-icons/fi";
import { MdComputer } from "react-icons/md";
import TermsAndConditions from "@/app/(admin)/components/Advisor/Terms";
import SimpleAddressAutocomplete from "@/components/google-map/AddressAutocomplete";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface ContactData {
  salutation: string;
  dateOfBirth: string;
  street: string;
  postalCode: string;
  city: string;
  state: string;
  phone: string;
}

interface SignatureData {
  signature: string;
  termsAccepted: boolean;
  dataProtectionAccepted: boolean;
  consentAccepted: boolean;
}

const MultiStepRegistration = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  // Add debounce timer for email checking
  const [emailCheckTimer, setEmailCheckTimer] = useState<NodeJS.Timeout | null>(null);

  // Step 1: Basic Registration Data
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  // Step 2: Contact Information
  const [contactData, setContactData] = useState<ContactData>({
    salutation: "Mr.",
    dateOfBirth: "",
    street: "",
    postalCode: "",
    city: "",
    state: "",
    phone: "",
  });

  // Step 4: Signature Data
  const [signatureData, setSignatureData] = useState<SignatureData>({
    signature: "",
    termsAccepted: false,
    dataProtectionAccepted: false,
    consentAccepted: false,
  });

  // Canvas for signature
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Get email check state from Redux
  const {
    emailCheckLoading,
    emailExists
  } = useSelector((state: RootState) => state.users);

  const { error } = useSelector((state: RootState) => state.auth);

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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

  // Email validation status component
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
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors duration-200 font-medium"
            >
              Sign In Instead
            </button>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Email validation checks
    if (!isValidEmail(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (emailCheckLoading) {
      toast.error("Please wait while we check your email");
      return;
    }

    if (emailExists) {
      setShowRestoreModal(true);
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      // Simulating API call
      setTimeout(() => {
        setIsLoading(false);
        setCurrentStep(2);
      }, 1500);
    } catch (error: unknown) {
      setIsLoading(false);
      if (error instanceof Error) {
        console.log(error);
      } else {
        console.log("Failed to register user");
      }
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactData.dateOfBirth || !contactData.street || !contactData.city) {
      toast.error("Please fill in all required fields");
      return;
    }
    setCurrentStep(3);
  };

  const handleBrokerageNext = () => {
    setCurrentStep(4);
  };

  const handleSignatureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureData.signature) {
      toast.error("Please provide your signature");
      return;
    }
    if (!signatureData.termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }
    setCurrentStep(5);
  };

  const handleGoogleSignup = () => {
    toast.info("Google signup feature coming soon!");
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Cleanup email check timer on unmount
  useEffect(() => {
    return () => {
      if (emailCheckTimer) {
        clearTimeout(emailCheckTimer);
      }
      dispatch(clearEmailCheck());
    };
  }, [emailCheckTimer, dispatch]);

  // Address autocomplete handler
  const handleAddressSelected = (addressData: any) => {
    setContactData(prev => ({
      ...prev,
      street: addressData.address,
      city: addressData.city,
      state: addressData.state,
      postalCode: addressData.postal_code,
    }));
  };

  // Signature Canvas Functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!canvasRef.current) return;
    setIsDrawing(false);
    const dataURL = canvasRef.current.toDataURL();
    setSignatureData({ ...signatureData, signature: dataURL });
  };

  const clearSignature = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setSignatureData({ ...signatureData, signature: "" });
    }
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);

    try {
      const resultAction = await dispatch(
        registerUser({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email || "",
          lead_email: formData.email || "",
          password: formData.password,
          role: "user",
          category_id: "c2e47f28-4ccc-47e8-ab6b-930e71e9941f",
          avatar_url: null,
          username: null,
          phone: contactData.phone || null,
          company: "",
          isBroker: false,
          address: contactData.street,
          postal_code: contactData.postalCode,
          city: contactData.city,
          state: contactData.state,
          country: "",
          website: null,
          accept_terms: signatureData.termsAccepted,
          dob: contactData.dateOfBirth,
          signature: signatureData.signature,
          salutation: contactData.salutation,
        })
      );

      setIsLoading(false);

      if (registerUser.fulfilled.match(resultAction)) {
        toast.success(
          "Registration successful! Please check your email for verification."
        );

        // Set flag for unverified-user page to start timer automatically
        localStorage.setItem("justRegistered", "true");

        // Redirect to unverified-user page
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

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Get step title
  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Now for free register";
      case 2:
        return "Contact information";
      case 3:
        return "Brokerage mandate";
      case 4:
        return "Sign brokerage mandate";
      case 5:
        return "Preview";
      default:
        return "Registration";
    }
  };

  // Check if we can proceed from step 1
  const canProceedFromStep1 = () => {
    if (!formData.firstName || !formData.email || !formData.password) return false;
    if (!isValidEmail(formData.email)) return false;
    if (emailCheckLoading) return false;
    if (emailExists) return false;
    if (formData.password.length < 6) return false;
    return true;
  };

  // Step 1: Original Registration Form with Email Validation
  const renderStep1 = () => (
    <>
      <div className="my-6">
        <p className="text-center text-secondary pb-3 border-b border-[#D8D8D8]">
          How do you want <span className="font-bold">FixFinanz</span> use?
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 mx-auto max-w-[500px] px-6"
      >
        <div>
          <label className="block text-md text-secondary font-roboto mb-1">
            First name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Your first name"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            onBlur={(e) => {
              if (e.target.value && e.target.value.length < 2) {
                toast.warn("First name should be at least 2 characters");
              }
            }}
            className="placeholder:text-[#6C757D] w-full p-4 outline-none duration-300 hover:border-blue-600 border-b border-[#D8D8D8] rounded-b"
            required
          />
        </div>

        <div>
          <label className="block text-md text-secondary font-roboto mb-1">
            Surname
          </label>
          <input
            type="text"
            placeholder="Your last name"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            className="placeholder:text-[#6C757D] w-full p-4 outline-none duration-300 hover:border-blue-600 border-b border-[#D8D8D8] rounded-b"
          />
        </div>

        <div>
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
              : 'border-[#D8D8D8] hover:border-blue-600'
              }`}
            required
          />
          <EmailValidationStatus />
        </div>

        <div>
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
            onBlur={(e) => {
              if (e.target.value && e.target.value.length < 6) {
                toast.warn("Password should be at least 6 characters");
              }
            }}
            className="placeholder:text-[#6C757D] w-full p-4 outline-none duration-300 hover:border-blue-600 border-b border-[#D8D8D8] rounded-b"
            required
          />
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
            className={`btn-shine min-h-[50px] hover:bg-[#1778F2] py-0 font-medium font-roboto bg-gradient-to-r from-[#434370] to-[#13214e] px-6 text-white rounded-xl ${
              !canProceedFromStep1() ? "opacity-50 cursor-not-allowed" : ""
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
                "Complete Registration"
            )}
          </button>
        </div>
      </form>
    </>
  );

  // Step 2: Contact Information with Address Autocomplete
  const renderStep2 = () => (
    <>
      <div className="my-6">
        <p className="text-center text-secondary pb-3 border-b border-[#D8D8D8]">
          Please enter your details. Which person does the specified insurance
          belong to?
        </p>
      </div>

      <form
        onSubmit={handleContactSubmit}
        className="space-y-6 mx-auto max-w-[500px] px-6"
      >
        <div>
          <label className="block text-lg font-bold mb-4">Salutation</label>
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="salutation"
                value="Mr."
                checked={contactData.salutation === "Mr."}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    salutation: e.target.value,
                  })
                }
                className="mr-2 font-bold"
              />
              Mr.
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="salutation"
                value="woman"
                checked={contactData.salutation === "woman"}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    salutation: e.target.value,
                  })
                }
                className="mr-2 font-bold"
              />
              woman
            </label>
          </div>
        </div>

        <div>
          <label className="block text-base font-medium mb-2">
            Date of birth (DD.MM.YYYY) <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={contactData.dateOfBirth}
            onChange={(e) =>
              setContactData({ ...contactData, dateOfBirth: e.target.value })
            }
            className="w-full p-3 border-b-2 border-gray-300 focus:border-blue-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-md font-bold mb-2">
            Street, house number <span className="text-red-500">*</span>
          </label>
          <SimpleAddressAutocomplete
            value={contactData.street}
            onChange={(value) => setContactData(prev => ({ ...prev, street: value }))}
            onAddressSelected={handleAddressSelected}
            placeholder="Enter your address..."
            className="w-full p-3 border-b-2 border-gray-300 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-md font-bold mb-2">Postal code</label>
            <input
              type="text"
              placeholder="Postal code"
              value={contactData.postalCode}
              onChange={(e) =>
                setContactData({ ...contactData, postalCode: e.target.value })
              }
              className="w-full p-3 border-b-2 border-gray-300 focus:border-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-md font-bold mb-2">City</label>
            <input
              type="text"
              placeholder="City"
              value={contactData.city}
              onChange={(e) =>
                setContactData({ ...contactData, city: e.target.value })
              }
              className="w-full p-3 border-b-2 border-gray-300 focus:border-blue-500 outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-md font-bold mb-2">Phone Number</label>
            <input
              type="tel"
              placeholder="Your phone number"
              value={contactData.phone}
              onChange={(e) =>
                setContactData({ ...contactData, phone: e.target.value })
              }
              className="w-full p-3 border-b-2 border-gray-300 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={goBack}
            className="px-8 py-3 bg-gray-800 text-white rounded-lg font-medium"
          >
            Back
          </button>
          <button
            type="submit"
            className="btn-shine min-h-[50px] hover:bg-[#1778F2] py-0 font-medium font-roboto bg-gradient-to-r from-[#434370] to-[#13214e] px-6 text-white rounded-xl"
          >
            Continue
          </button>
        </div>
      </form>
    </>
  );

  // Step 3: Brokerage Mandate
  const renderStep3 = () => (
    <>
      <div className="my-6">
        <p className="text-center text-secondary pb-3 border-b border-[#D8D8D8]">
          In the next few minutes, Fixfinanzde will be a digital insurance
          broker.
        </p>
      </div>

      <div className="mx-auto max-w-[500px] px-6">
        <h3 className="text-2xl font-bold mb-6 text-center">Your advantages</h3>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <FiClock size={23} className="mt-1" />
            <div>
              <h4 className="text-xl font-bold mb-2">
                All around insured - at the best price
              </h4>
              <p className="text-gray-600">
                Always get the best protection for your individual insurance
                situation.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <MdComputer size={23} className="mt-1" />
            <div>
              <h4 className="text-xl font-bold mb-2">
                Everything in one place
              </h4>
              <p className="text-gray-600">
                With fixed finance, you manage and optimize all your contracts
                digitally.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <FaUser size={40} className="mb-1" />
            <div>
              <h4 className="text-xl font-bold mb-2">100% free service</h4>
              <p className="text-gray-600">
                Fixed finance is permanently free of charge for you. As an
                insurance broker, we receive commission for the management of
                your insurance from the insurance companies.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <FaHandshake size={24} className=" mt-1" />
            <div>
              <h4 className="text-xl font-bold mb-2">Full control</h4>
              <p className="text-gray-600">
                DU decides on changes. The mandate can be revoked at any time.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-8">
          <button
            onClick={goBack}
            className="px-8 py-3 bg-gray-800 text-white rounded-lg font-medium"
          >
            Back
          </button>
          <button
            onClick={handleBrokerageNext}
            className="btn-shine min-h-[50px] hover:bg-[#1778F2] py-0 font-medium font-roboto bg-gradient-to-r from-[#434370] to-[#13214e] px-6 text-white rounded-xl"
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );

  // Step 4: Signature with Scrollable Terms
  const renderStep4 = () => (
    <>
      <div className="my-6">
        <p className="text-center text-secondary pb-3 border-b border-[#D8D8D8]">
          You are only one step away from digitally and effortlessly managing
          your insurance situation!
        </p>
        <div className="text-center mt-4">
          <a href="#" className="text-blue-500 underline">
            More information about Brokerage mandate
          </a>
        </div>
      </div>

      <form onSubmit={handleSignatureSubmit} className="space-y-6  px-12 sm:px-8 xsm:px-8">
        <div>
          <label className="block text-lg font-medium mb-4">
            Please sign here:
          </label>
          <div className=" max-w-[500px] mx-auto">
            <canvas
              ref={canvasRef}
              width={400}
              height={150}
              className="border border-gray-300 w-full cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            <div className="flex justify-start gap-6 items-center mt-2">
              <button
                type="button"
                onClick={clearSignature}
                className="text-red-500 p-0 bg-transparent border-none"
              >
                Remove
              </button>
              <p className="text-gray-500 text-sm">
                This signature may differ from your normal signature
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Scrollable Terms and Conditions */}
          <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
            <TermsAndConditions />
          </div>

          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={signatureData.termsAccepted}
              onChange={(e) =>
                setSignatureData({
                  ...signatureData,
                  termsAccepted: e.target.checked,
                })
              }
              className="mt-1"
              required
            />
            <span className="text-sm">
              I accept the Terms and Conditions <span className="text-red-500">*</span>
            </span>
          </label>
        </div>

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={goBack}
            className="px-8 py-3 bg-gray-800 text-white rounded-lg font-medium"
          >
            Back
          </button>
          <button
            type="submit"
            className="btn-shine min-h-[50px] hover:bg-[#1778F2] py-0 font-medium font-roboto bg-gradient-to-r from-[#434370] to-[#13214e] px-6 text-white rounded-xl"
          >
            Continue
          </button>
        </div>
      </form>
    </>
  );

  // Step 5: Preview
  const renderStep5 = () => (
    <>
      <div className="my-6">
        <p className="text-center text-secondary pb-3 border-b border-[#D8D8D8]">
          Please check your information again
        </p>
      </div>

      <div className="mx-auto max-w-[500px] px-6">
        <div className="space-y-4 text-lg">
          <div className="flex">
            <span className="font-medium w-32">Full name:</span>
            <span>
              {contactData.salutation} {formData.firstName} {formData.lastName}
            </span>
          </div>

          <div className="flex">
            <span className="font-medium w-32">Date of Birth:</span>
            <span>{contactData.dateOfBirth}</span>
          </div>

          <div className="flex">
            <span className="font-medium w-32">Email:</span>
            <span>{formData.email}</span>
          </div>

          <div className="flex">
            <span className="font-medium w-32">Address:</span>
            <span>
              {contactData.street}, {contactData.postalCode}
            </span>
          </div>

          <div className="flex">
            <span className="font-medium w-32">City, State:</span>
            <span>
              {contactData.city}, {contactData.state}
            </span>
          </div>

          {contactData.phone && (
            <div className="flex">
              <span className="font-medium w-32">Phone:</span>
              <span>{contactData.phone}</span>
            </div>
          )}

          {signatureData.signature && (
            <div className="border-t pt-4">
              <span className="font-medium block mb-2">Signature:</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={signatureData.signature}
                alt="Signature"
                className="border border-gray-300 max-w-xs"
              />
            </div>
          )}
        </div>

        <div className="flex justify-between pt-8">
          <button
            onClick={goBack}
            className="px-8 py-3 bg-gray-800 text-white rounded-lg font-medium"
          >
            Back
          </button>
          <button
            onClick={handleFinalSubmit}
            disabled={isLoading}
            className={`btn-shine min-h-[50px] hover:bg-[#1778F2] py-0 font-medium font-roboto bg-gradient-to-r from-[#434370] to-[#13214e] px-6 text-white rounded-xl ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
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
                "Create an account"
            )}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-no-repeat bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/path-to-your-background-image.jpg')" }}>
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

      <div className="flex gap-8 w-full sm:flex-col xsm:flex-col">
        <div className="bg-white max-w-[800px] sm:max-w-full h-full w-full rounded-2xl pb-4">
          <h2 className="text-xl font-bold rounded-t-2xl text-white bg-base py-3 px-4 text-center">
            {getStepTitle()}
          </h2>

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}

          <div className="text-center my-4 px-6">
            <p className="font-roboto py-6">or</p>
            <button
              type="button"
              className="flex items-center justify-center border-none shadow-xl py-3 w-full bg-white mt-2 p-2 text-secondary rounded"
              onClick={handleGoogleSignup}
            >
              <FcGoogle className="text-xl mr-2" />
              Registration with Google
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 px-6">
            <p className="font-roboto text-[#817081]">
              Do you already have an account?
            </p>
            <button
              type="button"
              className="bg-[#1477BB] text-white font-roboto px-3 py-[6px] rounded-md"
              onClick={() => router.push("/login")}
            >
              login
            </button>
          </div>
        </div>

        <div className="bg-[#D3D3D3] border border-[#B9B9B9] h-full rounded-3xl p-4 max-w-[400px] sm:max-w-full xsm:max-w-full w-full">
          <h1 className="text-xl font-bold font-roboto mb-2">
            The No. 1 financial platform
          </h1>

          <p className="text-[#647082] font-roboto mb-4">
            Discover independent consultants, coaches and experts for every
            area.
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
    </div>
  );
};

export default MultiStepRegistration;