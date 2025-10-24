"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateRole() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    roleId: "",
    name: "",
    active: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Here you would normally submit to your API
    console.log("Form submitted:", formData);

    alert("Role created successfully!");
    router.push("/admin/roles");
  };

  return (
    <div className="px-4 py-4">
      <h1 className="text-[30px] font-semibold text-[#37375C] mb-4">
        Create Role
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="roleId"
            className="block text-[16px] text-primary mb-2"
          >
            Role ID:
          </label>
          <input
            type="text"
            id="roleId"
            name="roleId"
            value={formData.roleId}
            onChange={handleInputChange}
            className="w-full px-4 py-[6px] rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="name" className="block text-[16px] text-primary mb-2">
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
          <label className="flex items-center text-[16px] text-primary">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleInputChange}
              className="h-5 w-5 text-blue-600 mr-2"
            />
            Active
          </label>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Create
          </button>

          <Link
            href="/admin/roles"
            className="bg-gray-500 text-white p-2 rounded-lg font-medium hover:bg-gray-600 transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
