// File: app/components/SalesTable.tsx
"use client";

import {
  format,
  eachDayOfInterval,
  isMonday,
  isTuesday,
  isWednesday,
  isThursday,
  isFriday,
} from "date-fns";

interface SalesTableProps {
  startDate: Date;
  endDate: Date;
}

// Helper to get the weekday name for a specific date
const getWeekdayName = (date: Date): string => {
  const dayFunctions = [
    { check: isMonday, name: "Monday" },
    { check: isTuesday, name: "Tuesday" },
    { check: isWednesday, name: "Wednesday" },
    { check: isThursday, name: "Thursday" },
    { check: isFriday, name: "Friday" },
  ];

  for (const { check, name } of dayFunctions) {
    if (check(date)) return name;
  }

  return "";
};

// Generate weekdays from date range
const getWeekdays = (startDate: Date, endDate: Date) => {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.filter(
    (day) =>
      isMonday(day) ||
      isTuesday(day) ||
      isWednesday(day) ||
      isThursday(day) ||
      isFriday(day)
  );
};

// Mock data for the table
const salesData = {
  "Cold calls": {
    goal: 55,
    Monday: 78,
    Tuesday: 64,
    Wednesday: 74,
    Thursday: 64,
    Friday: 83,
    total: 363,
  },
  "Sales calls": {
    goal: 26,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    total: 0,
  },
  "Qualification calls": {
    goal: 24,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    total: 0,
  },
  "Sales volume": {
    goal: "3rd",
    Monday: "0.00 €",
    Tuesday: "0.00 €",
    Wednesday: "0.00 €",
    Thursday: "0.00 €",
    Friday: "0.00 €",
    total: "0.00 €",
  },
};

const SalesTable = ({ startDate, endDate }: SalesTableProps) => {
  const weekdays = getWeekdays(startDate, endDate);

  // Get values based on table row and weekday
  const getCellValue = (rowKey: string, dayName: string) => {
    const data = salesData[rowKey as keyof typeof salesData];
    return data[dayName as keyof typeof data];
  };

  // Get cell color based on value
  const getCellColor = (rowKey: string, value: number | string) => {
    if (rowKey === "Cold calls" && typeof value === "number" && value > 0) {
      return "bg-[#198754] text-white";
    } else if (
      (rowKey === "Sales calls" || rowKey === "Qualification calls") &&
      value === 0
    ) {
      return "bg-[#DC3545] text-white";
    } else if (rowKey === "Sales volume" && value === "0.00 €") {
      return "bg-[#DC3545] text-white";
    }
    return "";
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-2 py-3 text-white text-left text-md font-bold">
              <div className="bg-[#111D45] px-3 py-2 rounded-lg text-center w-full max-w-[200px]">
                Type
              </div>
            </th>
            <th className="px-2 py-3  text-white text-left text-md font-bold">
              <div className="bg-[#111D45] px-3 py-2 rounded-lg text-center w-full max-w-[200px]">
                Goals
              </div>
            </th>
            {weekdays.map((day) => (
              <th
                key={format(day, "yyyy-MM-dd")}
                className="px-2 py-3  text-white text-left text-md font-bold"
              >
                <div className="bg-[#111D45] px-3 py-2 rounded-lg text-center w-full max-w-[200px]">
                  {getWeekdayName(day)}
                </div>
              </th>
            ))}
            <th className="px-2 py-3  text-white text-left text-md font-bold">
              <div className="bg-[#111D45] px-3 py-2 rounded-lg text-center w-full max-w-[200px]">
                Overall
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Object.keys(salesData).map((rowKey) => (
            <tr key={rowKey}>
              <td className="px-3 py-3 whitespace-nowrap  text-white">
                <div className="bg-[#111D45] px-3 py-2 rounded-lg text-center w-full max-w-[200px]">
                  {rowKey}
                </div>
              </td>
              <td className="px-3 py-3 text-center whitespace-nowrap">
                {salesData[rowKey as keyof typeof salesData].goal}
              </td>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
                (day) => {
                  const value = getCellValue(rowKey, day);
                  const bgColorClass = getCellColor(rowKey, value);

                  return (
                    <td
                      key={`${rowKey}-${day}`}
                      className={`px-3 py-3 whitespace-nowrap text-center`}
                    >
                      <div
                        className={`${bgColorClass} px-3 py-2 rounded-lg text-center w-full `}
                      >
                        {value}
                      </div>
                    </td>
                  );
                }
              )}
              <td className="px-3 py-3 text-md font-bold whitespace-nowrap">
                {salesData[rowKey as keyof typeof salesData].total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;
