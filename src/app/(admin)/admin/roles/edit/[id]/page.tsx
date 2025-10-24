"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// Sample data for roles
const rolesData = [
  { id: 1, creator: "Saif saif", name: "Admin", active: true },
  { id: 2, creator: "Admin Fixfinanz", name: "Kunden", active: true },
  {
    id: 3,
    creator: "Admin Fixfinanz",
    name: "Free - Finanzberater",
    active: true,
  },
  {
    id: 4,
    creator: "Admin Fixfinanz",
    name: "Premium - Finanzberater",
    active: true,
  },
  {
    id: 5,
    creator: "Admin Fixfinanz",
    name: "Agentur - Finanzberater",
    active: true,
  },
  { id: 6, creator: "Admin Fixfinanz", name: "Manager", active: true },
  { id: 11, creator: "Admin Fixfinanz", name: "Co-Admin", active: true },
];

export default function EditRole() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [formData, setFormData] = useState({
    roleId: "",
    name: "",
    active: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      const roleId = parseInt(id);
      const role = rolesData.find((r) => r.id === roleId);

      if (role) {
        setFormData({
          roleId: role.id.toString(),
          name: role.name,
          active: role.active,
        });
        setIsLoading(false);
      } else {
        setNotFound(true);
        setIsLoading(false);
      }
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Here you would normally update via your API
    console.log("Form submitted for update:", formData);

    alert("Role updated successfully!");
    router.push("/admin/roles");
  };

  if (isLoading) {
    return <div className="px-4 py-4">Loading...</div>;
  }

  if (notFound) {
    return (
      <div className="px-4 py-4">
        <h1 className="text-2xl font-bold mb-4">Role not found</h1>
        <Link href="/admin/roles" className="text-blue-500 hover:underline">
          Back to Roles
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <h1 className="text-[30px] font-semibold text-[#37375C] mb-8">
        Edit Role
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
            className="w-full px-4 py-[6px] rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
            readOnly
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

        <div className="mb-4">
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
            Update
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
