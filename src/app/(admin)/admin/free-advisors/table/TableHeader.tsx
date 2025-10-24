import React from "react";

const TableHeader: React.FC = () => {
  const headers = [
    "First Name",
    "Last Name",
    "Number",
    "Profile Image",
    "Active",
    "Email",
    "Role Name",
    "Contract",
    "Last Login",
    "Register At",
    "Approval Status",
    "Email Verify",
    "Actions",
  ];

  return (
    <thead className="bg-gray-50">
      <tr>
        {headers.map((header, index) => (
          <th
            key={index}
            scope="col"
            className="px-4 py-3 text-left text-sm font-bold text-primary  whitespace-nowrap  tracking-wider"
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;
