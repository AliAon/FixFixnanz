"use client";

import { useState } from "react";
import Header from "./table/Header";
import UserTable from "./table/UserTable";
import { User, sampleUsers } from "@/types/TUser";

export default function AdvisorManagerPage() {
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(sampleUsers);
  const [activeFilter] = useState<boolean | null>(null);

  const handleApprovalToggle = (userId: string) => {
    const newUsers = users.map((user) =>
      user.id === userId ? { ...user, approved: !user.approved } : user
    );
    setUsers(newUsers);
    applyFilters(newUsers, activeFilter);
  };

  const applyFilters = (userList: User[], active: boolean | null) => {
    if (active === null) {
      setFilteredUsers(userList);
    } else {
      setFilteredUsers(userList.filter((user) => user.active === active));
    }
  };

  return (
    <div className="w-full h-full ">
      <div className="bg-white shadow rounded-lg overflow-x-hidden w-full px-4">
        <Header />
        <div className="overflow-x-auto hidden min-w-full">
          <UserTable
            users={filteredUsers}
            onApprovalToggle={handleApprovalToggle}
          />
        </div>
      </div>
    </div>
  );
}
