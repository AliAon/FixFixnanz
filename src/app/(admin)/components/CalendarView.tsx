// File: app/components/SalesCalendar.tsx
"use client";

import React, { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  getDay,
} from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";

interface Event {
  id: number;
  date: Date;
  person: string;
  amount: number;
}

const SalesCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Sample events data
  const events: Event[] = [
    { id: 1, date: new Date(2025, 2, 1), person: "Florian", amount: 500.0 },
    { id: 2, date: new Date(2025, 2, 1), person: "Marvin", amount: 1500.0 },
    { id: 3, date: new Date(2025, 2, 1), person: "Wolfgang", amount: 1500.0 },
    { id: 4, date: new Date(2025, 2, 22), person: "Marvin", amount: 1500.0 },
  ];

  const prevMonth = (): void => {
    setCurrentMonth((prevState) => subMonths(prevState, 1));
  };

  const nextMonth = (): void => {
    setCurrentMonth((prevState) => addMonths(prevState, 1));
  };

  const goToToday = (): void => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const onDateClick = (day: Date): void => {
    setSelectedDate(day);
  };

  const renderHeader = (): React.ReactElement => {
    return (
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-800">
          {format(currentMonth, "MMMM yyyy", { locale: de })}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            type="button"
          >
            today
          </button>
          <div className="flex">
            <Link
              href=""
              onClick={prevMonth}
              className="px-4 py-2 bg-gray-700 text-white rounded-l hover:bg-gray-800 transition-colors"
              type="button"
            >
              &lt;
            </Link>
            <Link
              href=""
              onClick={nextMonth}
              className="px-4 py-2 bg-gray-700 rounded-r text-white  hover:bg-gray-800 transition-colors"
              type="button"
            >
              &gt;
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const renderDays = (): React.ReactElement => {
    // Create array of weekday abbreviations
    const weekdays = [
      { en: "Mo", de: "Mo" },
      { en: "Tu", de: "Di" },
      { en: "We", de: "Mi" },
      { en: "Th", de: "Do" },
      { en: "Fr", de: "Fr" },
      { en: "Sa", de: "Sa" },
      { en: "Su", de: "So" },
    ];

    return (
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekdays.map((day, index) => (
          <div key={index} className="text-center py-2 font-bold text-blue-500">
            <a href="#" className="hover:underline">
              {day.de}
            </a>
          </div>
        ))}
      </div>
    );
  };

  const renderCells = (): React.ReactElement => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = new Date(monthStart);

    // Adjust the start date to begin with the appropriate day based on the day of the week
    // For Monday start, we adjust differently
    const startDay = getDay(startDate);
    if (startDay === 0) {
      // If it's Sunday, go back 6 days
      startDate.setDate(startDate.getDate() - 6);
    } else {
      // Otherwise, go back (day - 1) days
      startDate.setDate(startDate.getDate() - (startDay - 1));
    }

    const endDate = new Date(monthEnd);
    // Ensure we have complete weeks
    const dayOfWeek = getDay(endDate);
    if (dayOfWeek !== 0) {
      // If not Sunday
      endDate.setDate(endDate.getDate() + (7 - dayOfWeek));
    }

    const dateFormat = "d";
    const rows: React.ReactElement[] = [];
    let days: React.ReactElement[] = [];
    let formattedDate = "";

    const daysInMonth = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    // Loop through each day
    daysInMonth.forEach((day, i) => {
      formattedDate = format(day, dateFormat);

      // Get events for this day
      const dayEvents = events.filter((event) => isSameDay(day, event.date));

      // Create element for this day
      const dayElement = (
        <div
          key={day.toString()}
          className={`border-t border-l ${i % 7 === 6 ? "border-r" : ""} ${
            Math.floor(i / 7) === Math.floor(daysInMonth.length / 7) - 1
              ? "border-b"
              : ""
          } min-h-[120px] relative ${
            !isSameMonth(day, monthStart)
              ? "bg-gray-100"
              : isSameDay(day, selectedDate)
              ? "bg-yellow-50"
              : ""
          }`}
          onClick={() => onDateClick(day)}
        >
          <div className="text-right p-1">
            <a href="#" className="text-blue-500 hover:underline">
              {formattedDate}
            </a>
          </div>

          {/* Event items for this day */}
          <div className="overflow-y-auto max-h-[90px]">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className="bg-blue-500 text-white p-1 mb-1 mx-1 text-sm"
              >
                <div>{event.person}</div>
                <div>€{event.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      );

      days.push(dayElement);

      // If we've reached the end of a week, start a new row
      if ((i + 1) % 7 === 0) {
        rows.push(
          <div key={day.toString()} className="grid grid-cols-7">
            {days}
          </div>
        );
        days = [];
      }
    });

    return (
      <div className="bg-white border-l border-r border-gray-200">{rows}</div>
    );
  };

  return (
    <div className="w-full">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default SalesCalendar;
