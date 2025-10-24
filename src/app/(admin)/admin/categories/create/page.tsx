"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { NextPage } from "next";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { createCategory } from "@/redux/slices/categoriesSlice";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";

const CreateCategory: NextPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null as File | null,
  });

  const [fileName, setFileName] = useState("No file chosen");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setFormData({
        ...formData,
        image: file,
      });
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    // Validate form data
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      toast.error("Category name is required");
      return;
    }
  
    // Check if image is selected
    if (!formData.image) {
      toast.error("Please select an image");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      // Create FormData instance
      const formDataToSend = new FormData();
      formDataToSend.append('name', trimmedName);
      formDataToSend.append('image', formData.image as File);
      if (formData.description) {
        formDataToSend.append('description', formData.description.trim());
      }

      // Dispatch create category action
      await dispatch(createCategory(formDataToSend)).unwrap();
  
      toast.success("Category created successfully!");
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        image: null,
      });
      setFileName("No file chosen");
  
      // Navigate to categories list after successful creation
      router.push("/admin/categories");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-2">
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
      <h1 className="text-[30px] font-semibold text-[#37375C] mb-5">
        Create Category
      </h1>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="mb-4">
          <label htmlFor="name" className="block text-[16px] text-primary mb-2 font-medium">
            Name: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            placeholder="Enter category name"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="image" className="block text-[16px] text-primary mb-2 font-medium">
            Image: <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <label className="inline-block bg-gray-200 px-4 py-2 rounded-l-lg cursor-pointer hover:bg-gray-300 transition">
              Choose File
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
                required={!formData.image}
              />
            </label>
            <span className="flex-1 border border-l-0 rounded-r-lg px-4 py-2 bg-white">
              {fileName}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Maximum file size: 5MB. Supported formats: JPG, PNG, GIF</p>
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-[16px] text-primary mb-2 font-medium">
            Description:
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            placeholder="Enter category description (optional)"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !formData.name.trim() || !formData.image}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </div>
          ) : (
            "Create Category"
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateCategory;
