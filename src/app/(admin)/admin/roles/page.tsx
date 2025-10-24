"use client";

import React, { useState } from "react";
import Link from "next/link";

const initialRoles = [
  { id: 1, creator: "Saif saif", name: "Admin", active: true },
  { id: 2, creator: "Admin Fixfinanz", name: "Co-Admin", active: true },
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
  { id: 11, creator: "Admin Fixfinanz", name: "Kunden", active: true },
];

export default function RolesPage() {
  const [roles, setRoles] = useState(initialRoles);

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      setRoles(roles.filter((role) => role.id !== id));
    }
  };

  return (
    <div className="px-4 py-4">
      <h1 className="text-[30px] font-semibold text-[#37375C] mb-4">Roles</h1>

      <Link
        href="/admin/roles/create"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md mb-8"
      >
        Create Role
      </Link>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-primary">
              <th className="text-left py-3 px-4">Creator</th>
              <th className="text-left py-3 px-4">Role ID</th>
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Active</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-b border-gray-300">
                <td className="py-2 px-4">{role.creator}</td>
                <td className="py-2 px-4">{role.id}</td>
                <td className="py-2 px-4">{role.name}</td>
                <td className="py-2 px-4">{role.active ? "Yes" : "No"}</td>
                <td className="py-2 px-4 flex space-x-2">
                  <Link
                    href=""
                    className="bg-[#0DCAF0] hover:bg-[#31D2F2] text-balck px-2 py-1 border-none text-sm rounded"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/roles/edit/${role.id}`}
                    className="bg-[#FFC107] hover:bg-[#FFCA2C] text-balck px-2 py-1 border-none text-sm rounded"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(role.id)}
                    className="bg-[#DC3545] hover:bg-[#BB2D3B] text-white px-2 py-1 border-none text-sm rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
