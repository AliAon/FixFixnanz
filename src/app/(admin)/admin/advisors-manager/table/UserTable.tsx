import React, { useState } from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import { User } from "@/types/TUser";

interface UserTableProps {
  users: User[];
  onApprovalToggle: (userId: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onApprovalToggle }) => {
  const [userList, setUserList] = useState<User[]>(users);

  // Handle user deletion
  const handleDeleteUser = (userId: string) => {
    const updatedUsers = userList.filter((user) => user.id !== userId);
    setUserList(updatedUsers);
  };
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <TableHeader />
      <tbody className="bg-white divide-y divide-gray-200">
        {users.map((user) => (
          <TableRow
            key={user.id}
            user={user}
            onApprovalToggle={onApprovalToggle}
            onDelete={handleDeleteUser}
          />
        ))}
      </tbody>
    </table>
  );
};

export default UserTable;
