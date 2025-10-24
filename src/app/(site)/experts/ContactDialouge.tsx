"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { LiaTimesSolid } from "react-icons/lia";
import { HiOutlineMail } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { sendMessageFromProfile } from "@/redux/slices/messagesSlice";

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  advisorId: string;
}

const ContactDialog: React.FC<ContactDialogProps> = ({
  isOpen,
  onClose,
  recipientName,
  advisorId,
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
    acceptPrivacy: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Vorname ist erforderlich";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Nachname ist erforderlich";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-Mail Adresse ist erforderlich";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Ungültige E-Mail Adresse";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefonnummer ist erforderlich";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Nachricht ist erforderlich";
    }

    if (!formData.acceptPrivacy) {
      newErrors.acceptPrivacy =
        "Sie müssen die Datenschutzerklärung akzeptieren";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      setIsSubmitting(true);
      
      try {
        await dispatch(sendMessageFromProfile({
          advisor_id: advisorId,
          content: formData.message,
          message_type: "text",
        })).unwrap();
        
        toast.success("Your message has been sent successfully!");
        onClose();
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          message: "",
          acceptPrivacy: false,
        });
      } catch (error) {
        toast.error("Failed to send message. Please try again.");
        console.error("Send message error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto my-8">
          <div className="bg-[#1F5CB7] text-white py-3 px-4 rounded-t-lg flex justify-between items-center">
            <h2 className="text-xl font-bold font-roboto">
              Nachricht {recipientName}
            </h2>
            <Link
              href=""
              onClick={onClose}
              className="text-2xl hover:text-gray-200"
              aria-label="Close"
            >
              <LiaTimesSolid fill="#000" />
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="p-4 font-roboto">
            <div className="mb-4">
              <label
                htmlFor="firstName"
                className="block text-primary font-bold text-base mb-1"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="lastName"
                className="block text-primary font-bold text-base mb-1"
              >
                Surname
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-primary font-bold text-base mb-1"
              >
                E-Mail Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="phone"
                className="block text-primary font-bold text-base mb-1"
              >
                Telephone number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="message"
                className="block text-primary font-bold text-base mb-1"
              >
                Your message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className={`w-full px-3 py-2 border rounded-md resize-none ${
                  errors.message ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={`Bitte beschreibe deine Situation und deinen Beratungsbedarf so genau wie möglich.`}
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">{errors.message}</p>
              )}
            </div>
            <h1 className="text-base font-roboto text-primary font-bold mb-3">
              Data protection notice:
            </h1>
            <div className="mb-4">
              <div className="flex  items-start">
                <input
                  type="checkbox"
                  id="acceptPrivacy"
                  name="acceptPrivacy"
                  checked={formData.acceptPrivacy}
                  onChange={handleChange}
                  className={`mt-1 mr-2 ${
                    errors.acceptPrivacy ? "border-red-500" : ""
                  }`}
                />
                <label htmlFor="acceptPrivacy" className="text-gray-700">
                  I have that <b>data protection</b> read and accept this
                </label>
              </div>
              {errors.acceptPrivacy && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.acceptPrivacy}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1 bg-gray-500 duration-200 hover:bg-gray-600 text-white rounded"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-1 duration-200 text-white rounded flex items-center ${
                  isSubmitting 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-[#1477BC] hover:bg-blue-600"
                }`}
              >
                <HiOutlineMail size={20} className="mr-2" />
                {isSubmitting ? "Sending..." : "Send request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactDialog;
