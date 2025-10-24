"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/redux/api/axiosConfig";

export default function EditCategory() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
  });

  const [fileName, setFileName] = useState("No file chosen");
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);
    }
  };
  
  useEffect(() => {
    if (id) {
      const fetchCategory = async () => {
        try {
          const response = await api.get(`/categories/${id}`);
          const category = response.data;
  
          setFormData({
            name: category.name,
            description: category.description || "",
            image: category.image || "",
          });
  
          setFileName(category.image?.split("/").pop() || "No file chosen");
          setIsLoading(false);
        } catch (error) {
          console.error("Failed to fetch category:", error);
          setNotFound(true);
          setIsLoading(false);
        }
      };
  
      fetchCategory();
    }
  }, [id]);
  

  // useEffect(() => {
  //   if (id) {
  //     // In a real app, you'd fetch this from an API
  //     const categoryId = parseInt(id);
  //     const category = categoriesData.find((cat) => cat.id === categoryId);

  //     if (category) {
  //       setFormData({
  //         name: category.title,
  //         description: category.description || "",
  //         image: category.image,
  //       });
  //       setFileName(category.image.split("/").pop() || "No file chosen");
  //       setIsLoading(false);
  //     } else {
  //       setNotFound(true);
  //       setIsLoading(false);
  //     }
  //   }
  // }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     const file = e.target.files[0];
  //     setFileName(file.name);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      
      if (selectedFile) {
        formDataToSend.append("image", selectedFile);
      }
  
      await api.put(`/categories/${id}`, formDataToSend);
  
      alert("Category updated successfully!");
      router.push("/admin/categories");
    } catch (error) {
      console.error("Failed to update category:", error);
      alert("Failed to update category.");
    }
  };
  
  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (notFound) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Category not found</h1>
        <Link
          href="/admin/categories"
          className="text-blue-500 hover:underline"
        >
          Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <div className=" px-4 py-8 ">
      <h1 className="text-[30px] font-semibold text-[#37375C] mb-8">
        Edit Category
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label
            htmlFor="name"
            className="block text-[16px]  text-primary mb-2"
          >
            Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-[6px] rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="image"
            className="block text-[16px] text-primary mb-2"
          >
            Image:
          </label>
          <div className="flex">
            <label className="inline-block bg-gray-200 px-4 py-[6px] rounded-l-lg cursor-pointer hover:bg-gray-300 transition">
              Choose File
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </label>
            <span className="flex-1 border border-l-0 rounded-r-lg px-4 py-[6px] bg-white">
              {fileName}
            </span>
          </div>
          {formData.image && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-1">Current image:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formData.image}
                alt={formData.name}
                className="h-40 w-auto object-contain border rounded-lg"
              />
            </div>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor="description"
            className="block text-[16px]  text-primary mb-2"
          >
            Description:
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[40px]"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Update
          </button>

          <Link
            href="/admin/categories"
            className="bg-gray-500 text-white p-2 rounded-lg font-medium hover:bg-gray-600 transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
