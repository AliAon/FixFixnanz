"use client";

import { useState } from "react";
import DatePicker from "../../components/DatePicker";
import SalesTable from "../../components/SalesTable";
import { format, subDays } from "date-fns";
import Link from "next/link";

export default function UserReportPage() {
  const endDate = new Date();
  const startDate = subDays(endDate, 7);

  const [dateRange, setDateRange] = useState({
    startDate: startDate,
    endDate: endDate,
  });

  const [selectedUser, setSelectedUser] = useState("All users");

  const headerDateRange = `${format(
    dateRange.startDate,
    "MM/dd/yyyy"
  )} - ${format(dateRange.endDate, "MM/dd/yyyy")}`;

  const goToPreviousWeek = () => {
    const newStartDate = subDays(dateRange.startDate, 7);
    const newEndDate = subDays(dateRange.endDate, 7);
    setDateRange({ startDate: newStartDate, endDate: newEndDate });
  };

  const goToNextWeek = () => {
    const newStartDate = new Date(dateRange.startDate);
    newStartDate.setDate(newStartDate.getDate() + 7);
    const newEndDate = new Date(dateRange.endDate);
    newEndDate.setDate(newEndDate.getDate() + 7);
    setDateRange({ startDate: newStartDate, endDate: newEndDate });
  };

  return (
    <div className=" px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={goToPreviousWeek}
          className="border border-gray-300 bg-white hover:bg-primary duration-150 text-primary hover:text-white rounded-md px-4 py-2 "
        >
          Last week
        </button>

        <h2 className="text-lg font-medium">{headerDateRange}</h2>

        <button
          onClick={goToNextWeek}
          className="bg-gray-800 text-white rounded-md px-4 py-2 hover:bg-gray-700"
        >
          Next week
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-1 xsm:grid-cols-1 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            user
          </label>
          <div className="relative">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none"
            >
              <option>All users</option>
              <option>User 1</option>
              <option>User 2</option>
              <option>User 3</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date filter
          </label>
          <DatePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={setDateRange}
          />
        </div>

        <div className="flex items-end">
          <Link href="/admin/user-day-target" className="bg-blue-600 duration-150 text-white rounded-md px-4 py-[6px] hover:bg-blue-700 flex items-center">
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Set target
          </Link>
        </div>
      </div>

      {/* Sales data table */}
      <SalesTable startDate={dateRange.startDate} endDate={dateRange.endDate} />
    </div>
  );
}
