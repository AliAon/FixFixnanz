// File: app/components/CustomersTable.tsx
"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { FaEye, FaSortDown } from "react-icons/fa";
import AgentOverviewModal from "./AgentOverviewModel";

// Customer data interface
interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  number?: string;
  profileImage: string;
  active: boolean;
  email: string;
  avVertag: string;
  roleName: string;
  contractStart?: string;
  contractEnd?: string;
}

const CustomersTable = () => {
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [showAgentOverview, setShowAgentOverview] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sample data
  const customers: Customer[] = [
    {
      id: 1,
      firstName: "Florian",
      lastName: "Ehrlich",
      number: "",
      profileImage: "/images/agent-2.jpg",
      active: true,
      email: "F.Ehrlich@gr-consulting.de",
      avVertag: "Agentur - Finanzberater",
      roleName: "",
      contractStart: "01.03.2025",
      contractEnd: "01.02.2026",
    },
    {
      id: 2,
      firstName: "Kawa",
      lastName: "Almohammad",
      number: "+4915238843638",
      profileImage: "/images/agent-2.jpg",
      active: true,
      email: "almohammadkawa@gmail.com",
      avVertag: "Agentur - Finanzberater",
      roleName: "",
      contractStart: "",
      contractEnd: "",
    },
    {
      id: 3,
      firstName: "Turhan",
      lastName: "Özen",
      number: "+4917624376752",
      profileImage: "/images/agent-2.jpg",
      active: true,
      email: "turhan.ozen@hotmail.de",
      avVertag: "Agentur - Finanzberater",
      roleName: "",
      contractStart: "01.05.2024",
      contractEnd: "04.12.2024",
    },
  ];

  const handleAgentOverview = (customerId: number) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setShowAgentOverview(true);
    }
    setOpenDropdownId(null);
  };

  const handleLoginToUser = (customerId: number) => {
    console.log(`Login to User with customer ID: ${customerId}`);
    setOpenDropdownId(null);
  };

  const closeModal = () => {
    setShowAgentOverview(false);
    setSelectedCustomer(null);
  };

  return (
    <>
      <div className="overflow-x-auto" ref={dropdownRef}>
        <table className="min-w-full bg-white">
          <thead>
            <tr className="text-left text-primary border-b border-gray-200">
              <th className="py-3 px-4 font-bold">First Name</th>
              <th className="py-3 px-4 font-bold">Last Name</th>
              <th className="py-3 px-4 font-bold">Number</th>
              <th className="py-3 px-4 font-bold">Profile Image</th>
              <th className="py-3 px-4 font-bold">Active</th>
              <th className="py-3 px-4 font-bold">Email</th>
              <th className="py-3 px-4 font-bold">AV Vertag</th>
              <th className="py-3 px-4 font-bold">Role Name</th>
              <th className="py-3 px-4 font-bold">Contract Start</th>
              <th className="py-3 px-4 font-bold">Contract End</th>
              <th className="py-3 px-4 font-bold whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="py-3 px-4">{customer.firstName}</td>
                <td className="py-3 px-4">{customer.lastName}</td>
                <td className="py-3 px-4">{customer.number}</td>
                <td className="py-3 px-4">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                    <Image
                      src={customer.profileImage}
                      alt={`${customer.firstName} ${customer.lastName}`}
                      width={40}
                      height={40}
                      className="object-cover"
                      onError={(e) => {
                        // Fallback for image loading errors
                        (e.target as HTMLImageElement).src =
                          "/profile-placeholder.jpg";
                      }}
                    />
                  </div>
                </td>
                <td className="py-3 px-4">
                  {customer.active ? (
                    <span className="bg-[#198754] text-white font-bold text-xs px-2 py-1 rounded-md">
                      Active
                    </span>
                  ) : (
                    <span className="bg-gray-300 text-gray-800 text-xs px-2 py-1 rounded-full">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">{customer.email}</td>
                <td className="py-3 px-4">
                  <span className="bg-[#0DCAF0] text-white font-bold whitespace-nowrap text-xs px-2 py-1 rounded-md">
                    {customer.avVertag}
                  </span>
                </td>
                <td className="py-3 px-4">{customer.roleName}</td>
                <td className="py-3 px-4">{customer.contractStart}</td>
                <td className="py-3 px-4">{customer.contractEnd}</td>
                <td className="py-3 px-4 relative">
                  <div className="relative">
                    <button
                      className="bg-gray-800 duration-0 flex items-center gap-2 text-white px-3 py-1 rounded hover:bg-gray-700 text-sm whitespace-nowrap"
                      onClick={() =>
                        setOpenDropdownId(
                          openDropdownId === customer.id ? null : customer.id
                        )
                      }
                    >
                      Actions <FaSortDown />
                    </button>

                    {openDropdownId === customer.id && (
                      <div className="absolute right-0 mt-1 w-36 bg-white rounded shadow-lg z-10 border border-gray-200">
                        <div className="p-1">
                          <button
                            className="w-full bg-[#198754] gap-2 text-white text-xs px-2 py-2 text-left flex items-center rounded"
                            onClick={() => handleAgentOverview(customer.id)}
                          >
                            <FaEye size={16} />
                            Agent Overview
                          </button>
                        </div>
                        <div className="p-1">
                          <button
                            className="w-full bg-blue-500 text-white px-2 text-xs py-2 text-left flex items-center rounded hover:bg-blue-600"
                            onClick={() => handleLoginToUser(customer.id)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                              />
                            </svg>
                            Login to User
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AgentOverviewModal
        isOpen={showAgentOverview}
        onClose={closeModal}
        customer={selectedCustomer}
      />
    </>
  );
};

export default CustomersTable;
