import React from "react";

const TableHeader: React.FC = () => {
  const headers = [
    { label: "User", width: "w-64" }, // Name + Profile Image combined
    { label: "Contact", width: "w-48" }, // Email + Phone combined
    { label: "Role", width: "w-32" }, // Role only
    { label: "Status", width: "w-40" }, // Active + Approval + Email Verification combined
    { label: "Activity", width: "w-36" }, // Last Login + Register Date combined
    { label: "Contract", width: "w-24" }, // Contract status only
    { label: "Actions", width: "w-32" }, // Actions
  ];

  return (
    <thead className="bg-gray-50">
      <tr>
        {headers.map((header, index) => (
          <th
            key={index}
            scope="col"
            className={`${header.width} px-4 py-3 text-left text-sm font-bold text-primary whitespace-nowrap tracking-wider`}
          >
            {header.label}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;