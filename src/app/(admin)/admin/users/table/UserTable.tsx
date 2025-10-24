"use client";

import React from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import { User } from "@/types/TUser";

interface UserTableProps {
  users: User[];
  onApprovalToggle: (userId: string) => void;
  onDelete?: (userId: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onApprovalToggle,
  onDelete = () => {} // Default empty function if not provided
}) => {
  // Handle case when no users are available
  if (users.length === 0) {
    return (
      <div className="text-center py-8 w-full">
        <p className="text-gray-500">No users found</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto custom-scrollbar-x">
      <table className="min-w-full divide-y divide-gray-200">
        <TableHeader />
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <TableRow
              key={user.id}
              user={user}
              onApprovalToggle={onApprovalToggle}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;