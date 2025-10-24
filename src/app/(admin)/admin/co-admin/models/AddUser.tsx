import Link from "next/link";
import React, { useState } from "react";
import { LiaTimesSolid } from "react-icons/lia";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: UserFormData) => void;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  uniqueId: string;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    email: "",
    uniqueId: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      uniqueId: "",
    });
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg overflow-hidden my-8 mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-[#32325D]">
            Add Hubspot Users
          </h2>
          <Link
            href=""
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <LiaTimesSolid size={24} />
          </Link>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-primary mb-2">
              First Name:
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-[6px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-primary mb-2">
              Last Name:
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-[6px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-primary mb-2">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-[6px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="uniqueId" className="block text-primary mb-2">
              Unique Id:
            </label>
            <input
              type="text"
              id="uniqueId"
              name="uniqueId"
              placeholder="Unique Id"
              value={formData.uniqueId}
              onChange={handleChange}
              className="w-full px-4 py-[6px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end p-6 border-t">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
