"use client";
import { RootState } from "@/redux/store";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

interface PasswordChangeFormProps {
  email?: string;
  onSubmit?: (data: {
    email: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => void;
  isSubmitting?: boolean;
}


export default function PasswordChangeForm({
  email = "",
  onSubmit,
  isSubmitting = false,
}: PasswordChangeFormProps) {
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: user?.email || email,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Update email when prop changes
  useEffect(() => {
    if (email) {
      setFormData(prev => ({
        ...prev,
        email: email
      }));
    }
  }, [email]);

  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Skip email changes since it's read-only
    if (name === 'email') return;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Email validation is skipped since it's read-only
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Aktuelles Passwort ist erforderlich";
      isValid = false;
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Neues Passwort ist erforderlich";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Passwortbestätigung ist erforderlich";
      isValid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwörter stimmen nicht überein";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      if (validateForm()) {
        onSubmit?.(formData);
      }
    } catch (error) {
      // Optional: add error handling
      console.error("Submission error:", error);
      toast.error("An error occurred during submission");
    }
  };

  return (
    <div className="max-w-xl w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="flex items-center gap-2 text-[16px] font-bold text-primary"
          >
            E-Mail:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            readOnly
            className="mt-1 block w-full border border-gray-300 p-2 bg-gray-100 cursor-not-allowed rounded-md shadow-sm py-2 px-3"
            placeholder={formData.email}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="currentPassword"
            className="flex items-center gap-2 text-[16px] font-bold text-primary"
          >
            aktuelles Passwort:
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#C2DBFE] rounded-md shadow-sm py-2 px-3 "
            placeholder="aktuelles Passwort"
          />
          {errors.currentPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.currentPassword}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="flex items-center gap-2 text-[16px] font-bold text-primary"
          >
            Neues Passwort:
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#C2DBFE] rounded-md shadow-sm py-2 px-3 "
            placeholder="Neues Passwort"
          />
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="flex items-center gap-2 text-[16px] font-bold text-primary"
          >
            Neues Passwort wiederholen:
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#C2DBFE] rounded-md shadow-sm py-2 px-3 "
            placeholder="Neues Passwort wiederholen"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="bg-[#198754] hover:bg-[#157347] duration-0 text-white py-2 px-6 rounded font-medium"
          >
            {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Saving...
                  </div>
                ) : (
                  "Save"
                )}
          </button>
        </div> 
      </form>
    </div>
  );
}
