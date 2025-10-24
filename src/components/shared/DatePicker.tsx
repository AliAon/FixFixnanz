"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar, ChevronDown } from "lucide-react";

interface DatepickerProps {
  selectedDate: Date | null | undefined;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  className?: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function Datepicker({
  selectedDate,
  onChange,
  minDate,
  maxDate,
  placeholder = "Select date",
  className = "",
}: DatepickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [showYearSelector, setShowYearSelector] = useState(false);
  const datepickerRef = useRef<HTMLDivElement>(null);

  // Generate a range of years (20 years before and after the current year)
  const generateYearRange = (): number[] => {
    const currentYear = new Date().getFullYear(); // Use actual current year
    const years: number[] = [];
    
    // Start from 1950 (or earlier if needed)
    const startYear = 1950;
    
    // End at current year (no future years for birth dates)
    for (let i = startYear; i <= currentYear; i++) {
      years.push(i);
    }
    return years;
  };

  const formatDate = (date: Date): string => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const generateDays = (): (Date | null)[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const firstDayIndex = firstDay.getDay();

    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const prevLastDay = new Date(year, month, 0);
    const prevDaysInMonth = prevLastDay.getDate();

    const days: (Date | null)[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevDaysInMonth - i));
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    const nextDays = 42 - days.length;
    for (let i = 1; i <= nextDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const changeYear = (year: number) => {
    setCurrentMonth(
      new Date(year, currentMonth.getMonth(), 1)
    );
    setShowYearSelector(false);
  };

  const isSelectedDate = (date: Date): boolean => {
    return (
      selectedDate !== null &&
      selectedDate !== undefined &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const isDisabled = (date: Date): boolean => {
    // Create normalized dates for comparison (year, month, day only)
    const normalizeDate = (d: Date): Date => {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };
    
    const normalizedDate = normalizeDate(date);
    
    if (minDate) {
      const normalizedMinDate = normalizeDate(minDate);
      if (normalizedDate < normalizedMinDate) {
        return true;
      }
    }
  
    if (maxDate) {
      const normalizedMaxDate = normalizeDate(maxDate);
      if (normalizedDate > normalizedMaxDate) {
        return true;
      }
    }
  
    return false;
  };

  const handleSelectDate = (date: Date) => {
    if (!isDisabled(date)) {
      // Create a new Date object to ensure we don't pass references
      const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      onChange(selectedDate);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datepickerRef.current &&
        !datepickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowYearSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={datepickerRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full px-4 py-[6px] border border-gray-300 rounded-md outline-none"
          placeholder={placeholder}
          readOnly
          value={selectedDate ? formatDate(selectedDate) : ""}
          onClick={() => setIsOpen(!isOpen)}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <Calendar className="h-5 w-5 text-gray-500" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-full bg-white rounded-md shadow-lg z-10 border border-gray-200 min-w-[200px] max-w-[250px]">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                className="p-1 rounded-full bg-[#002B4E] text-white focus:outline-none"
                onClick={prevMonth}
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
              
              <div className="flex items-center space-x-1">
                <div className="font-semibold">
                  {MONTHS[currentMonth.getMonth()]}
                </div>
                <button 
                type="button"
                  className="flex bg-transparent p-0 text-black border-0 animate-none outline-none items-center font-semibold focus:outline-none"
                  onClick={() => setShowYearSelector(!showYearSelector)}
                >
                  <span>{currentMonth.getFullYear()}</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
              </div>
              
              <button
                type="button"
                className="p-1 rounded-full bg-[#002B4E] text-white focus:outline-none"
                onClick={nextMonth}
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </button>
            </div>

            {showYearSelector ? (
              <div className="max-h-48 overflow-y-auto grid grid-cols-4 gap-1 mb-2">
                {generateYearRange().map((year) => (
                  <button
                    key={year}
                    type="button"
                    className={`
                      p-1 text-xs rounded-md hover:bg-[#002B4E] hover:text-white
                      ${year === currentMonth.getFullYear() ? "bg-[#002B4E] text-white" : ""}
                    `}
                    onClick={() => changeYear(year)}
                  >
                    {year}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="text-xs font-medium text-center text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}

                {generateDays().map((date, index) => {
                  if (!date) return <div key={index} className="p-2"></div>;

                  const isSelected = isSelectedDate(date);
                  const isTodayDate = isToday(date);
                  const isCurrentMonthDate = isCurrentMonth(date);
                  const isDisabledDate = isDisabled(date);

                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={isDisabledDate}
                      className={`
                        w-full p-1 flex items-center justify-center text-xs hover:text-white rounded-md duration-75 text-black hover:bg-[#002B4E]
                        ${!isCurrentMonthDate ? "text-gray-400" : "text-gray-700"}
                        ${isTodayDate && !isSelected ? "" : "text-black"}
                        ${
                          isSelected
                            ? "bg-[#002B4E] text-white"
                            : "bg-white text-secondary"
                        }
                        ${
                          isDisabledDate
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }
                      `}
                      onClick={() => handleSelectDate(date)}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-2 border-t border-gray-200">
            <button
              type="button"
              className="w-full px-3 py-1.5 text-sm bg-[#002B4E] text-white rounded-md focus:outline-none"
              onClick={() => {
                onChange(new Date());
                setIsOpen(false);
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}