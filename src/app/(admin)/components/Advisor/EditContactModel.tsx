// File: app/components/EditContactModal.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
  avVertag: string;
  number?: string;
}

interface EditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

const EditContactModal = ({
  isOpen,
  onClose,
  customer,
}: EditContactModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Add effect to prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen || !customer) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      setImagePreview(URL.createObjectURL(files[0]));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Saving contact information");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl my-8">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-700">
            Kontaktinformationen
          </h2>
          <Link
            href=""
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-2">
                <Image
                  src={imagePreview || customer.profileImage}
                  alt={`${customer.firstName} ${customer.lastName}`}
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/profile-placeholder.jpg";
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">
              Profilfoto :
            </label>
            <div className="flex">
              <label className="flex-1">
                <div className="inline-block py-2 px-4 bg-gray-200 text-gray-700 rounded cursor-pointer hover:bg-gray-300">
                  Choose File
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <span className="flex-1 py-2 px-4 border border-gray-300 rounded bg-white ml-2">
                {file ? file.name : "No file chosen"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Vorname :
              </label>
              <input
                type="text"
                className="block w-full p-2.5 bg-white border border-gray-300 rounded-md"
                defaultValue={customer.firstName}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">
                Nachname :
              </label>
              <input
                type="text"
                className="block w-full p-2.5 bg-white border border-gray-300 rounded-md"
                defaultValue={customer.lastName}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Profilestatus :
              </label>
              <input
                type="text"
                className="block w-full p-2.5 bg-white border border-gray-300 rounded-md"
                defaultValue="Active"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">E-Mail :</label>
              <input
                type="email"
                className="block w-full p-2.5 bg-white border border-gray-300 rounded-md"
                defaultValue={customer.email}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Telefonnummer :
              </label>
              <input
                type="text"
                className="block w-full p-2.5 bg-white border border-gray-300 rounded-md"
                defaultValue={customer.number || ""}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Rolle :</label>
              <input
                type="text"
                className="block w-full p-2.5 bg-white border border-gray-300 rounded-md"
                defaultValue={customer.avVertag}
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContactModal;
