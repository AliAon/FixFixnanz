// File: app/components/DatePicker.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWithinInterval,
} from "date-fns";

interface DatePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (range: { startDate: Date; endDate: Date }) => void;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

const DatePicker = ({ startDate, endDate, onChange }: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [nextMonth, setNextMonth] = useState(addMonths(currentMonth, 1));
  const [tempRange, setTempRange] = useState<DateRange>({ startDate, endDate });
  const [selectedPreset, setSelectedPreset] = useState<string | null>(
    "Last 7 days"
  );

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Format the displayed date range
  const formattedStartDate = format(startDate, "dd.MM.yyyy");
  const formattedEndDate = format(endDate, "dd.MM.yyyy");
  const displayValue = `${formattedStartDate} - ${formattedEndDate}`;

  // Preset date ranges
  const presets = [
    {
      label: "This Week",
      action: () => {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        const end = new Date(today);
        setTempRange({ startDate: start, endDate: end });
        setSelectedPreset("This Week");
      },
    },
    {
      label: "Last 7 days",
      action: () => {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - 6);
        setTempRange({ startDate: start, endDate: today });
        setSelectedPreset("Last 7 days");
      },
    },
    {
      label: "Last 30 days",
      action: () => {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - 29);
        setTempRange({ startDate: start, endDate: today });
        setSelectedPreset("Last 30 days");
      },
    },
    {
      label: "This month",
      action: () => {
        const today = new Date();
        const start = startOfMonth(today);
        setTempRange({ startDate: start, endDate: today });
        setSelectedPreset("This month");
      },
    },
    {
      label: "Last month",
      action: () => {
        const today = new Date();
        const lastMonth = subMonths(today, 1);
        const start = startOfMonth(lastMonth);
        const end = endOfMonth(lastMonth);
        setTempRange({ startDate: start, endDate: end });
        setSelectedPreset("Last month");
      },
    },
    {
      label: "This quarter",
      action: () => {
        const today = new Date();
        const quarterMonth = Math.floor(today.getMonth() / 3) * 3;
        const start = new Date(today.getFullYear(), quarterMonth, 1);
        setTempRange({ startDate: start, endDate: today });
        setSelectedPreset("This quarter");
      },
    },
    {
      label: "This year",
      action: () => {
        const today = new Date();
        const start = new Date(today.getFullYear(), 0, 1);
        setTempRange({ startDate: start, endDate: today });
        setSelectedPreset("This year");
      },
    },
    {
      label: "Custom range",
      action: () => {
        setSelectedPreset("Custom range");
      },
    },
  ];

  // Handle click outside to close the date picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    setNextMonth(subMonths(nextMonth, 1));
  };

  // Navigate to next month
  const nextMonthHandler = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    setNextMonth(addMonths(nextMonth, 1));
  };

  // Generate days for the calendar month
  const generateMonthDays = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday

    const endDate = new Date(monthEnd);
    const daysToAdd = 6 - endDate.getDay();
    endDate.setDate(endDate.getDate() + daysToAdd); // End on Saturday

    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  // Handle day selection
  const handleDayClick = (day: Date) => {
    if (!tempRange.startDate || (tempRange.startDate && tempRange.endDate)) {
      // Start a new selection
      setTempRange({ startDate: day, endDate: day });
    } else {
      // Complete the selection
      const newRange =
        day < tempRange.startDate
          ? { startDate: day, endDate: tempRange.startDate }
          : { startDate: tempRange.startDate, endDate: day };

      setTempRange(newRange);
    }
  };

  // Apply the selected date range
  const applyDateRange = () => {
    onChange(tempRange);
    setIsOpen(false);
  };

  // Clear the selection
  const clearSelection = () => {
    const today = new Date();
    setTempRange({
      startDate: today,
      endDate: today,
    });
    setSelectedPreset(null);
  };

  // Check if a day is within the selected range
  const isDayInRange = (day: Date) => {
    return (
      tempRange.startDate &&
      tempRange.endDate &&
      isWithinInterval(day, {
        start: tempRange.startDate,
        end: tempRange.endDate,
      })
    );
  };

  // Check if a day is the start or end of the selected range
  const isDayRangeStart = (day: Date) =>
    tempRange.startDate && isSameDay(day, tempRange.startDate);
  const isDayRangeEnd = (day: Date) =>
    tempRange.endDate && isSameDay(day, tempRange.endDate);

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        className="block w-full rounded-md border border-gray-300 py-2 px-3 text-base cursor-pointer focus:border-blue-500 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {displayValue}
      </div>

      {/* Date Picker Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 left-0 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="">
            <div className="flex sm:flex-col xsm:flex-col ">
              {/* Presets List - Now Horizontal */}
              <div className="w-full min-w-[150px] flex flex-col border-b border-gray-200">
                <div className="flex flex-col">
                  {presets.map((preset) => (
                    <div
                      key={preset.label}
                      className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                        selectedPreset === preset.label
                          ? "bg-blue-500 text-white"
                          : ""
                      }`}
                      onClick={() => {
                        preset.action();
                      }}
                    >
                      {preset.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar Columns */}
              <div className="flex flex-row xsm:flex-col xsm:min-w-full p-2 w-full min-w-[400px]">
                {/* Current Month Calendar */}
                <div className="mb-0 mr-4">
                  <div className="flex justify-between items-center mb-2">
                    <button
                      onClick={prevMonth}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      &lt;
                    </button>
                    <div>{format(currentMonth, "MMM yyyy")}</div>
                    <div className="w-6"></div> {/* Spacer for alignment */}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-gray-500 h-6 flex items-center justify-center"
                      >
                        {day}
                      </div>
                    ))}

                    {generateMonthDays(currentMonth).map((day, i) => {
                      const isCurrentMonth = isSameMonth(day, currentMonth);
                      const isSelected = isDayInRange(day);
                      const isRangeStart = isDayRangeStart(day);
                      const isRangeEnd = isDayRangeEnd(day);

                      return (
                        <div
                          key={i}
                          onClick={() => isCurrentMonth && handleDayClick(day)}
                          className={`
                          h-6 w-6 flex items-center justify-center text-sm rounded-full cursor-pointer
                          ${
                            isCurrentMonth
                              ? "hover:bg-gray-200"
                              : "text-gray-400"
                          }
                          ${isSelected ? "bg-blue-100" : ""}
                          ${
                            isRangeStart || isRangeEnd
                              ? "bg-blue-500 text-white"
                              : ""
                          }
                        `}
                        >
                          {format(day, "d")}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Next Month Calendar */}
                <div className="">
                  <div className="flex justify-between items-center mb-2">
                    <div className="w-6"></div> {/* Spacer for alignment */}
                    <div>{format(nextMonth, "MMM yyyy")}</div>
                    <button
                      onClick={nextMonthHandler}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      &gt;
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-gray-500 h-6 flex items-center justify-center"
                      >
                        {day}
                      </div>
                    ))}

                    {generateMonthDays(nextMonth).map((day, i) => {
                      const isCurrentMonth = isSameMonth(day, nextMonth);
                      const isSelected = isDayInRange(day);
                      const isRangeStart = isDayRangeStart(day);
                      const isRangeEnd = isDayRangeEnd(day);

                      return (
                        <div
                          key={i}
                          onClick={() => isCurrentMonth && handleDayClick(day)}
                          className={`
                          h-6 w-6 flex items-center justify-center text-sm rounded-full cursor-pointer
                          ${
                            isCurrentMonth
                              ? "hover:bg-gray-200"
                              : "text-gray-400"
                          }
                          ${isSelected ? "bg-blue-100" : ""}
                          ${
                            isRangeStart || isRangeEnd
                              ? "bg-blue-500 text-white"
                              : ""
                          }
                        `}
                        >
                          {format(day, "d")}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with Apply/Clear buttons */}
            <div className="border-t border-gray-200 p-2 flex justify-between">
              <div className="text-sm text-gray-600">
                {`${format(tempRange.startDate, "dd.MM.yyyy")} - ${format(
                  tempRange.endDate,
                  "dd.MM.yyyy"
                )}`}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={clearSelection}
                  className="px-2 py-1 text-sm rounded hover:bg-gray-100"
                >
                  Clear
                </button>
                <button
                  onClick={applyDateRange}
                  className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
