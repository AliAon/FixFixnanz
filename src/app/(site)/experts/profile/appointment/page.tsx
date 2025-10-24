"use client";
import Button from "@/components/shared/Button";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicAdvisorProfile } from "@/redux/slices/advisorsSlice";
import {
  createPublicAppointment,
  selectAppointmentsLoading,
  selectAppointmentsError,
  selectAppointmentsSuccess,
} from "@/redux/slices/appointmentsSlice";
import { fetchCustomersProfileData } from "@/redux/slices/customersSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { FaLink } from "react-icons/fa";
import { FaFacebook, FaInstagram, FaTiktok, FaLinkedin } from "react-icons/fa6";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchUserCalendarSettings } from "@/redux/slices/calendarSettingsSlice";

// Step indicator component for the booking process
const StepIndicator = ({
  currentStep,
  setCurrentStep,
  selectedDate,
  selectedTime,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  selectedDate: string | null;
  selectedTime: string | null;
}) => {
  return (
    <div className="flex justify-center items-center max-w-3xl mx-auto mb-8">
      <div className="flex flex-col items-center">
        <div
          className={`flex items-center cursor-pointer w-[200px] ${
            currentStep === 1 ? "text-[#27AD5F]" : "text-gray-600"
          }`}
          onClick={() => setCurrentStep(1)}
        >
          <div
            className={`rounded-full h-12 w-12 flex items-center justify-center text-white ${
              currentStep === 1 ? "bg-[#27AD5F]" : "bg-gray-500"
            }`}
          >
            <span>1</span>
          </div>
          <span className="ml-2">information</span>
        </div>
        <div
          className={`h-[1px] w-full mt-2 ${
            currentStep === 1 ? "bg-[#27AD5F]" : "bg-transparent"
          }`}
        ></div>
      </div>

      <div className="flex flex-col items-center">
        <div
          className={`flex cursor-pointer items-center w-[200px] ${
            selectedDate && selectedTime ? "opacity-100" : " opacity-50"
          } ${currentStep === 2 ? "text-[#27AD5F]" : "text-gray-600"}`}
          onClick={() => {
            if (selectedDate && selectedTime) {
              setCurrentStep(2);
            }
          }}
        >
          <div
            className={`rounded-full h-12 w-12 flex items-center justify-center text-white ${
              currentStep === 2 ? "bg-[#27AD5F]" : "bg-gray-500"
            }`}
          >
            <span>2</span>
          </div>
          <span className="ml-2">confirmation</span>
        </div>
        {/* Border line underneath second tab */}
        <div
          className={`h-[1px] w-full mt-2 ${
            currentStep === 2 ? "bg-[#27AD5F]" : "bg-transparent"
          }`}
        ></div>
      </div>
    </div>
  );
};

// Updated interfaces to work with appointment data only

interface BookedSlot {
  start_time: string;
  end_time: string;
  status: string;
  appointment_id: string;
}

interface WeeklySchedule {
  weekday: string;
  start: string;
  end: string;
  is_available: boolean; // Only true if there are appointments for this day
  booked_slots: BookedSlot[];
}

interface AppointmentData {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  customer_id: string;
  title?: string;
  description?: string;
  type?: string;
}

interface DetailedAdvisorProfile {
  last_name: string;
  first_name: string;
  avatar_url: string;
  user_profile: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
    phone: string;
    user_address: {
      id: string;
      lat: number;
      lng: number;
      city: string;
      state: string;
      address: string;
      country: string;
      user_id: string;
      created_at: string;
      is_deleted: boolean;
      updated_at: string;
      postal_code: string;
    };
  };
  advisor_data: {
    id: string;
    user_id: string;
    broker: boolean;
    about: string | null;
    service_title: string | null;
    service_details: string | null;
    service_price: string | null;
    is_visible: boolean;
    freelancer: boolean;
    total_views: number;
    created_at: string;
    updated_at: string;
  };
  // Weekly schedule based only on appointment data
  weekly_schedule: WeeklySchedule[];

  // All appointments for this advisor
  appointments: AppointmentData[];

  // Only dates that have appointments
  available_dates: string[];

  ratings: {
    average_rating: number;
    total_reviews: number;
    recent_reviews: Array<{
      id: string;
      user_id: string;
      source: string;
      rating_by: string;
      message: string;
      stars: number;
      created_at: string;
      updated_at: string;
      is_deleted: boolean;
    }>;
  };

  // Additional fields from backend
  category_name: string;
  category_image?: string;
}
export type CalendarSettings = {
  id: string;
  user_id: string;
  consultation_color: string;
  online_event_color: string;
  profile_booking_color: string;
  appointment_duration: number;
  reminder_email_minutes: number;
  google_calendar_id: string;
  weekly_schedule: Array<{
    end: string | null;
    start: string | null;
    weekday: string;
    is_available: boolean;
  }>;
  created_at: string;
  updated_at: string;
  is_deleted?: boolean;
} | null;
const AgentProfile = ({
  advisorData,
}: {
  advisorData: DetailedAdvisorProfile | null;
}) => {
  if (!advisorData) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="bg-gray-300 h-72 w-full rounded-lg mb-4"></div>
          <div className="bg-gray-300 h-6 w-24 rounded mb-4"></div>
          <div className="bg-gray-300 h-8 w-48 rounded mb-2"></div>
          <div className="bg-gray-300 h-6 w-32 rounded mb-4"></div>
        </div>
      </div>
    );
  }
  // here we changed the fetching of the name to display it correctly
  const fullName =
    `${advisorData?.first_name || ""} ${advisorData?.last_name || ""}`.trim() ||
    "Unknown Advisor";
  const serviceTitle =
    advisorData.advisor_data?.service_title || "Service Provider";
  const averageRating = advisorData.ratings?.average_rating || 0;
  const totalReviews = advisorData.ratings?.total_reviews || 0;
  const avatarUrl =
    advisorData.avatar_url || "/images/agent-2.jpg";
  console.debug("advisorData", advisorData);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt={fullName}
          className="w-full max-w-72 h-72 object-cover rounded-lg"
        />
      </div>
      <div className="inline-block bg-blue-900 text-white text-sm px-3 py-1 rounded mb-4">
        {serviceTitle}
      </div>
      <h2 className="text-4xl font-bold text-gray-800 mb-2">{fullName}</h2>
      <div className="flex items-center mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-xl ${
              star <= averageRating ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ★
          </span>
        ))}
        <span className="ml-2 text-gray-700">{totalReviews} reviews</span>
      </div>
      <div className="mb-4">
        <FaLink className="inline mr-2 text-gray-700" />
      </div>
      <div className="flex space-x-4 mt-4">
        <a href="#" className="text-3xl text-blue-600">
          <FaFacebook />
        </a>
        <a href="#" className="text-3xl text-gray-700">
          <FaTiktok />
        </a>
        <a href="#" className="text-3xl text-blue-600">
          <FaLinkedin />
        </a>
        <a href="#" className="text-3xl text-pink-600">
          <FaInstagram />
        </a>
      </div>
    </div>
  );
};

const Calendar = ({
  selectedDate,
  setSelectedDate,
  userCalendarSettings,
  availableDates, // Array of available dates from appointments
}: {
  selectedDate: string | null;
  setSelectedDate: (date: string) => void;
  userCalendarSettings: CalendarSettings | null;
  availableDates: string[]; // Array of dates like ["2025-09-25", "2025-09-26"]
}) => {
  // ------------------------------------------------------------------
  // 🟢 State and Month Calculations
  // ------------------------------------------------------------------
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get current month and year
  // current month/year shown in header
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // first day of month, used to align the grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);

  // convert JS Sunday-first index to Monday-first for our UI
  let firstDayWeekday = firstDayOfMonth.getDay() - 1;
  if (firstDayWeekday < 0) firstDayWeekday = 6;

  // number of days in this month
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // data to fill previous/next month placeholders in the grid
  const daysFromPrevMonth = firstDayWeekday;
  const prevMonth = new Date(currentYear, currentMonth, 0);
  const daysInPrevMonth = prevMonth.getDate();

  // Get month name
  const monthNames = [
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
  // ------------------------------------------------------------------
  // 🟢 Navigation between months
  // ------------------------------------------------------------------
  // Navigate to previous month
  const goToPrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // ✅ NEW: Check if date is in the past

  // 🔸 Disable any date before today
  const isPastDate = (year: number, month: number, day: number): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    const dateToCheck = new Date(year, month, day);
    dateToCheck.setHours(0, 0, 0, 0); // Reset time to start of day

    return dateToCheck < today;
  };
  // 🔸 When user clicks a date cell, ignore past dates or other-month cells
  const handleDateSelect = (year: number, month: number, day: number) => {
    // ✅ Don't allow selection of past dates or dates from other months
    if (month !== currentMonth || isPastDate(year, month, day)) {
      return;
    }

    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(formattedDate);
  };
  // 🔸 Check if this day has *free* advisor slots (for green/orange dot)
  //     • Uses advisorSchedule and compares booked_slots to total 30-min slots.
  //     • If every slot is booked → returns false (shows orange dot).
  // Check if date has available time slots (not all booked)
  const hasAvailableSlots = (
    year: number,
    month: number,
    day: number
  ): boolean => {
    if (!userCalendarSettings?.weekly_schedule) return false;

    const date = new Date(year, month, day);
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayOfWeek = days[date.getDay()];

    const scheduleForDay = userCalendarSettings.weekly_schedule.find(
      (schedule) => schedule.weekday === dayOfWeek
    );

    if (
      !scheduleForDay ||
      !scheduleForDay.is_available ||
      !scheduleForDay.start ||
      !scheduleForDay.end
    ) {
      return false;
    }

    // If the day has working hours set, it has available slots
    return true;
  };

  // Check if a date is selected

  // 🔸 Checks if this cell is the currently selected date
  const isDateSelected = (year: number, month: number, day: number) => {
    if (!selectedDate) return false;

    const dateParts = selectedDate.split("-");
    return (
      parseInt(dateParts[0]) === year &&
      parseInt(dateParts[1]) === month + 1 &&
      parseInt(dateParts[2]) === day
    );
  };

  // Check for appointments (for the dot only)
  // 🔸 Does this date have *any* appointment (for the small dot indicator)
  const hasAppointmentsForDate = (
    year: number,
    month: number,
    day: number
  ): boolean => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return availableDates.includes(formattedDate);
  };

  // ------------------------------------------------------------------
  // 🟢 Build the full calendar grid
  //     • Adds placeholder cells for previous/next months
  //     • Marks each day with flags used for styling
  // ------------------------------------------------------------------

  // Build calendar grid
  const buildCalendarDays = () => {
    const calendarDays = [];
    let dayCount = 1;
    let nextMonthDay = 1;

    const totalDaysToShow = daysFromPrevMonth + daysInMonth;
    const rowsNeeded = Math.ceil(totalDaysToShow / 7);

    for (let i = 0; i < rowsNeeded; i++) {
      const week = [];

      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayWeekday) {
          const prevMonthDay = daysInPrevMonth - daysFromPrevMonth + j + 1;
          const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

          week.push({
            day: prevMonthDay,
            month: currentMonth - 1,
            year: prevYear,
            isCurrentMonth: false,
            isSelected: false,
            isAvailable: false,
            hasAvailableSlots: false,
            isPast: true,
            hasAppointments: false,
            display: prevMonthDay,
          });
        } else if (dayCount <= daysInMonth) {
          const isSelected = isDateSelected(
            currentYear,
            currentMonth,
            dayCount
          );
          const hasAppointments = hasAppointmentsForDate(
            currentYear,
            currentMonth,
            dayCount
          );
          const hasSlots = hasAvailableSlots(
            currentYear,
            currentMonth,
            dayCount
          );
          const isPast = isPastDate(currentYear, currentMonth, dayCount);

          week.push({
            day: dayCount,
            month: currentMonth,
            year: currentYear,
            isCurrentMonth: true,
            isSelected,
            isAvailable: !isPast,
            hasAppointments,
            hasAvailableSlots: hasSlots,
            isPast,
            display: dayCount,
          });
          dayCount++;
        } else {
          const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

          week.push({
            day: nextMonthDay,
            month: currentMonth + 1,
            year: nextYear,
            isCurrentMonth: false,
            isSelected: false,
            isAvailable: false,
            hasAvailableSlots: false,
            isPast: false,
            hasAppointments: false,
            display: nextMonthDay,
          });
          nextMonthDay++;
        }
      }

      calendarDays.push(week);
    }

    return calendarDays;
  };

  const calendarDays = buildCalendarDays();

  // ------------------------------------------------------------------
  // 🟢 Render
  //     • Top header with navigation
  //     • Table of days with conditional Tailwind classes
  //     • Colored dot legend below
  //     • Disabled grey showing the past dates of the month
  //     • showing green dots on the dates which have appointments
  //
  // ------------------------------------------------------------------
  return (
    <div className="mb-6">
      <div className="bg-[#002D51] text-white p-4 flex justify-between items-center rounded-t-lg">
        <a href="#" onClick={goToPrevMonth} className="text-2xl">
          <IoIosArrowBack />
        </a>
        <span className="text-2xl font-bold">
          {monthNames[currentMonth]} {currentYear}
        </span>
        <a href="#" onClick={goToNextMonth} className="text-2xl">
          <IoIosArrowForward />
        </a>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {days.map((day, index) => (
              <th
                key={index}
                className="p-3 xsm:p-1 text-center text-[#366991]"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendarDays.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((day, dayIndex) => (
                <td
                  key={dayIndex}
                  className={`p-3 xsm:p-1 text-center relative
                    ${
                      !day.isCurrentMonth
                        ? "text-gray-300 cursor-not-allowed"
                        : day.isPast
                          ? "text-gray-400 cursor-not-allowed bg-gray-100"
                          : day.isSelected
                            ? "bg-[#002D51] text-white rounded-lg cursor-pointer"
                            : day.hasAppointments
                              ? day.hasAvailableSlots
                                ? "cursor-pointer hover:bg-green-100 text-green-600 font-semibold"
                                : "cursor-pointer hover:bg-orange-100 text-orange-600"
                              : "cursor-pointer hover:bg-gray-100 text-gray-700"
                    }`}
                  onClick={() => handleDateSelect(day.year, day.month, day.day)}
                >
                  {day.display}

                  {day.isCurrentMonth && day.hasAppointments && !day.isPast && (
                    <div
                      className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${
                        day.hasAvailableSlots ? "bg-green-500" : "bg-orange-500"
                      }`}
                    ></div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="p-3 text-xs text-gray-600 bg-gray-50 rounded-b-lg">
        <div className="flex items-center gap-4 justify-center">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Appointed slots</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span>Past dates</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Time slots selection component
// Time slots selection component
const TimeSlots = ({
  selectedTime,
  setSelectedTime,
  selectedDate,
  userCalendarSettings,
  advisorSchedule,
  appointments,
}: {
  selectedTime: string | null;
  setSelectedTime: (time: string) => void;
  selectedDate: string | null;
  userCalendarSettings: CalendarSettings;
  advisorSchedule: Array<{
    end: string;
    start: string;
    weekday: string;
    is_available: boolean;
    booked_slots: Array<{
      start_time: string;
      end_time: string;
      status: string;
      appointment_id: string;
    }>;
  }>;
  availableDates: string[];
  appointments: Array<{
    start_time: string;
    end_time: string;
    date: string;
    status: string;
  }>;
}) => {

  // Helper: Convert "HH:MM" to minutes since midnight
  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  // Helper: Convert minutes to "HH:MM" format
  const toTimeString = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  // Get the day of week for the selected date
  const getDayOfWeek = (dateString: string): string => {
    const date = new Date(dateString);
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  };

  // Generate time slots dynamically based on working hours
  const generateTimeSlots = (): string[] => {
    if (!selectedDate || !userCalendarSettings?.weekly_schedule) return [];

    const dayOfWeek = getDayOfWeek(selectedDate);
    const scheduleForDay = userCalendarSettings.weekly_schedule.find(
      (s) => s.weekday === dayOfWeek
    );

    if (!scheduleForDay || !scheduleForDay.is_available) return [];
    if (!scheduleForDay.start || !scheduleForDay.end) return [];

    const startMinutes = toMinutes(scheduleForDay.start);
    const endMinutes = toMinutes(scheduleForDay.end);
    const slotDuration = 30;

    const slots: string[] = [];

    if (endMinutes > startMinutes) {
      // Normal same-day schedule
      for (
        let current = startMinutes;
        current < endMinutes;
        current += slotDuration
      ) {
        const slotStart = toTimeString(current);
        const slotEnd = toTimeString(current + slotDuration);
        slots.push(`${slotStart} - ${slotEnd}`);
      }
    } else {
      // Overnight schedule (crosses midnight)
      // First: from start → 24:00
      for (
        let current = startMinutes;
        current < 1440;
        current += slotDuration
      ) {
        const slotStart = toTimeString(current);
        const slotEnd = toTimeString(current + slotDuration);
        slots.push(`${slotStart} - ${slotEnd}`);
      }
      // Then: from 00:00 → end
      for (let current = 0; current < endMinutes; current += slotDuration) {
        const slotStart = toTimeString(current);
        const slotEnd = toTimeString(current + slotDuration);
        slots.push(`${slotStart} - ${slotEnd}`);
      }
    }

    return slots;
  };

  const isSlotWithinAppointment = (timeSlot: string): boolean => {
    if (!selectedDate) return false;
    const todaysAppointments = appointments.filter(
      (a) => a.date === selectedDate && a.status !== "cancelled"
    );
    if (!todaysAppointments.length) return false;

    const [slotStart] = timeSlot.split(" - ");
    const slotMinutes = toMinutes(slotStart);

    return todaysAppointments.some((app) => {
      const appStart = toMinutes(app.start_time);
      const appEnd = toMinutes(app.end_time);
      return slotMinutes >= appStart && slotMinutes < appEnd;
    });
  };
  // 🆕 Check if slot is within calendar settings working hours
  const isTimeSlotBooked = (timeSlot: string): boolean => {
    if (!selectedDate) return false;
    const dayOfWeek = getDayOfWeek(selectedDate);
    const slotStart = timeSlot.split(" - ")[0];

    return advisorSchedule
      .filter((s) => s.weekday === dayOfWeek && s.is_available)
      .some((s) =>
        s.booked_slots.some(
          (b) => b.start_time === slotStart && b.status !== "cancelled"
        )
      );
  };

  // Check if slot overlaps any real appointment

  // Determine if slot should be clickable
  const isTimeSlotAvailable = (timeSlot: string): boolean => {
    if (!selectedDate) return false;

    // Check if slot is booked or within an appointment
    if (isTimeSlotBooked(timeSlot) || isSlotWithinAppointment(timeSlot)) {
      return false;
    }

    return true;
  };
  // Check if slot overlaps any real appointment

  // Check if selected date matches any advisor weekday that is available
  const isAppointmentDate = (dateString: string): boolean => {
    if (!userCalendarSettings?.weekly_schedule) return false;
    const dayOfWeek = getDayOfWeek(dateString);
    return userCalendarSettings.weekly_schedule.some(
      (s) => s.weekday === dayOfWeek && s.is_available
    );
  };

  // Get availability message for the selected date
  const getAvailabilityMessage = (): string => {
    if (!selectedDate) return "Please select a date first";
    if (!userCalendarSettings?.weekly_schedule) return "Loading schedule...";

    const dayOfWeek = getDayOfWeek(selectedDate);
    const scheduleForDay = userCalendarSettings.weekly_schedule.find(
      (s) => s.weekday === dayOfWeek
    );

    // Check if day is available
    if (
      !scheduleForDay ||
      !scheduleForDay.is_available ||
      !scheduleForDay.start ||
      !scheduleForDay.end
    ) {
      return `${dayOfWeek}: Not available`;
    }

    const todaysAppointments = appointments.filter(
      (a) => a.date === selectedDate && a.status !== "cancelled"
    );

    const workHours = `${scheduleForDay.start.slice(0, 5)}–${scheduleForDay.end.slice(0, 5)}`;

    if (todaysAppointments.length === 0) {
      return `${dayOfWeek}: Available ${workHours}`;
    }

    const ranges = todaysAppointments
      .map((a) => `${a.start_time.slice(0, 5)}–${a.end_time.slice(0, 5)}`)
      .join(", ");

    return `${dayOfWeek}: ${todaysAppointments.length} appointment${
      todaysAppointments.length > 1 ? "s" : ""
    } booked (${ranges}) | Available ${workHours}`;
  };

  // Generate slots dynamically
  const visibleSlots = generateTimeSlots();

  return (
    <div>
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 font-medium">
          {getAvailabilityMessage()}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 xs:grid-cols-1 max-h-96 overflow-y-auto">
        {visibleSlots.map((time, index) => {
          const isBooked = isTimeSlotBooked(time);
          const isInAppt = isSlotWithinAppointment(time);
          const isAvailable = isTimeSlotAvailable(time);

          const disabled =
            !selectedDate || isBooked || isInAppt || !isAvailable;

          // Determine button styling based on state
          let buttonStyle = "";
          let displayText = time;

          if (disabled) {
            if (isBooked || isInAppt) {
              // Booked slots - red
              buttonStyle =
                "border-red-300 text-red-400 bg-red-50 cursor-not-allowed";
              displayText = time;
            } else {
              // Other disabled states
              buttonStyle =
                "border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed";
            }
          } else {
            // Available slots
            if (selectedTime === time) {
              buttonStyle = "border-[#002D51] bg-[#002D51] text-white";
            } else {
              buttonStyle =
                "border-[#212529] text-[#212529] bg-transparent hover:bg-[#002D51] hover:text-white cursor-pointer";
            }
          }

          return (
            <button
              key={index}
              type="button"
              disabled={disabled}
              className={`border-[1.2px] rounded px-4 text-center font-bold py-2 transition-colors duration-200 ${buttonStyle}`}
              onClick={() => selectedDate && !disabled && setSelectedTime(time)}
            >
              {displayText}
              {(isBooked || isInAppt) && (
                <span className="block text-xs mt-1">Booked</span>
              )}
            </button>
          );
        })}
      </div>
      {selectedDate &&
        isAppointmentDate(selectedDate) &&
        visibleSlots.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700 text-center">
              No time slots available for the selected date. Please choose a
              different date.
            </p>
          </div>
        )}
    </div>
  );
};

interface FormData {
  firstName: string;
  surname: string;
  email: string;
  phone: string;
  message: string;
}

// Contact form component for the confirmation step
const ContactForm = ({
  formData,
  setFormData,
  selectedDate,
  selectedTime,
  setCurrentStep,
  advisorId,
  detailedProfile,
}: {
  formData: FormData;
  setFormData: (data: FormData) => void;
  selectedDate: string | null;
  selectedTime: string | null;
  setCurrentStep: (step: number) => void;
  advisorId: string | null;
  detailedProfile: DetailedAdvisorProfile | null;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector(selectAppointmentsLoading);
  const error = useSelector(selectAppointmentsError);
  const success = useSelector(selectAppointmentsSuccess);

  // Handle Redux state changes for error/success notifications
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      toast.success(success);
    }
  }, [success]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Parse time slot to get start and end times
  const parseTimeSlot = (timeSlot: string) => {
    const [startTime, endTime] = timeSlot.split(" - ");
    return { startTime, endTime };
  };

  // Convert date and time to ISO format
  const formatDateTime = (date: string, time: string) => {
    const [hours, minutes] = time.split(":");
    const dateObj = new Date(date);
    dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return dateObj.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    if (!selectedTime) {
      toast.error("Please select a time slot");
      return;
    }

    if (!formData.firstName.trim()) {
      toast.error("First name is required");
      return;
    }

    if (!formData.surname.trim()) {
      toast.error("Surname is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    // Phone number validation (basic)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      const { startTime, endTime } = parseTimeSlot(selectedTime);

      // Get customer ID from localStorage user data
      let customerId = "";
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        customerId = userData.id || "";
      } catch (error) {
        console.warn("Could not get user ID from localStorage:", error);
      }

      // Get advisor's user_id from the current advisor data
      const advisorUserId = detailedProfile?.advisor_data?.user_id || advisorId;

      const appointmentData = {
        first_name: formData.firstName,
        last_name: formData.surname,
        email: formData.email,
        phone: formData.phone,
        customer_id: customerId, // Use the logged-in user's ID
        advisor_id: advisorUserId, // Pass the advisor's user_id
        meeting_id: "", // Will be generated by backend
        type: "video_consultation",
        date: formatDateTime(selectedDate, startTime),
        start_time: startTime,
        end_time: endTime,
        title: `Consultation with ${formData.firstName} ${formData.surname}`,
        description: formData.message || "Consultation appointment",
        source: "Zoom",
        link: "", // Will be generated by backend
        address1: "",
        address2: "",
        state: "",
        city: "",
        country: "",
        zip: "",
        longitude: "",
        latitude: "",
      };

      const result = await dispatch(createPublicAppointment(appointmentData));

      if (createPublicAppointment.fulfilled.match(result)) {
        // Reset form
        setFormData({
          firstName: "",
          surname: "",
          email: "",
          phone: "",
          message: "",
        });
        // Optionally redirect or reset the form
        setTimeout(() => {
          window.location.href = "/experts";
        }, 2000);
      } else {
        throw new Error(result.payload as string);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to book appointment"
      );
    }
  };
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "00.00.0000";

    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}.${String(
      date.getMonth() + 1
    ).padStart(2, "0")}.${date.getFullYear()}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h4 className="font-medium mb-1 text-gray-700">Date</h4>
          <p>{formatDate(selectedDate)}</p>
        </div>
        <div>
          <h4 className="font-medium mb-1 text-gray-700">Appointment time</h4>
          <p>{selectedTime || "00.00 - 00.00"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 xsm:grid-cols-1 gap-8">
        <div>
          <label htmlFor="firstName" className="block mb-1 text-gray-700">
            First name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-3"
            placeholder="Raja"
            required
          />
        </div>
        <div>
          <label htmlFor="surname" className="block mb-1 text-gray-700">
            Surname<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="surname"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-3"
            placeholder="Ziafat"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <label htmlFor="email" className="block mb-1 text-gray-700">
            Email address<span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-3"
            placeholder="rajaziafatofficial@gmail.com"
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="block mb-1 text-gray-700">
            Telephone number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-3"
            placeholder="+493033258341"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block mb-1 text-gray-700">
          Your message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={6}
          className="w-full border border-gray-300 rounded p-3"
          placeholder="Indicate what is important to you"
        ></textarea>
      </div>

      <div className="flex justify-start gap-6 pt-4">
        <Button
          onClick={() => setCurrentStep(1)}
          text="Back"
          className="px-6 py-2 border-blue-500 bg-white text-primary hover:text-white duration-100"
        />

        <button
          type="submit"
          disabled={isLoading}
          className={`px-6 py-1 bg-[#157347] text-white rounded ${
            isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#0d4527]"
          }`}
        >
          {isLoading ? "Booking..." : "To confirm"}
        </button>
      </div>
    </form>
  );
};

// Component that uses useSearchParams - needs to be wrapped in Suspense
const BookingAppointmentContent = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    email: "",
    phone: "",
    message: "",
  });

  const searchParams = useSearchParams();
  const advisorId = searchParams.get("id");
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();
  const { currentAdvisor } = useSelector((state: RootState) => state.advisors);
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useSelector((state: RootState) => state.auth);
  const { userCalendarSettings } = useSelector(
    (state: RootState) => state.calendarSettings
  );
  const { customerProfileData, isLoading: isLoadingProfile } = useSelector(
    (state: RootState) => state.customers
  );

  // Cast to the detailed profile type since the API returns this structure
  const detailedProfile = currentAdvisor as unknown as DetailedAdvisorProfile;

  // Now we use the real schedule data from backend (no more hardcoded fallback needed)
  const advisorSchedule = detailedProfile?.weekly_schedule || [];
  useEffect(() => {
    if (advisorId) {
      dispatch(fetchUserCalendarSettings(advisorId));
    }
  }, [advisorId, dispatch]);

  // Check authentication status and redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please log in to book an appointment");
      return;
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch latest user profile data when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log("Fetching latest user profile data for appointment form...");
      dispatch(
        fetchCustomersProfileData({
          id: user.id,
        })
      );
    }
  }, [isAuthenticated, user?.id, dispatch]);

  // Pre-populate form with latest fetched user data
  useEffect(() => {
    if (isAuthenticated && customerProfileData) {
      console.log(
        "Populating appointment form with latest profile data:",
        customerProfileData
      );
      setFormData({
        firstName: customerProfileData.first_name || "",
        surname: customerProfileData.last_name || "",
        email: customerProfileData.email || "",
        phone: customerProfileData.phone || "",
        message: "",
      });
    } else if (isAuthenticated && user) {
      // Fallback to auth user data if profile data is not available yet
      console.log("Using fallback auth user data for appointment form:", user);
      setFormData({
        firstName: user.first_name || "",
        surname: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        message: "",
      });
    }
  }, [isAuthenticated, customerProfileData, user]);

  useEffect(() => {
    if (advisorId) {
      dispatch(fetchPublicAdvisorProfile(advisorId));
    }
  }, [advisorId, dispatch]);

  // Check if a time slot is already booked for a specific date
  const isTimeSlotBooked = (
    selectedDate: string,
    timeSlot: string
  ): boolean => {
    const dayOfWeek = getDayOfWeek(selectedDate);
    const scheduleForDay = advisorSchedule.find(
      (schedule) => schedule.weekday === dayOfWeek
    );

    if (!scheduleForDay?.booked_slots) return false;

    const slotStartTime = timeSlot.split(" - ")[0];

    return scheduleForDay.booked_slots.some((bookedSlot) => {
      return (
        bookedSlot.start_time === slotStartTime &&
        bookedSlot.status !== "cancelled"
      );
    });
  };

  const handleNextStep = () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    if (!selectedTime) {
      toast.error("Please select a time slot");
      return;
    }

    // Check if the selected date is available
    //const dayOfWeek = getDayOfWeek(selectedDate);
    /*const scheduleForDay = advisorSchedule.find(
      (schedule) => schedule.weekday === dayOfWeek
    );*/

    // if (!scheduleForDay) {
    //   toast.error(
    //     "Selected date is not available. Please choose a different date."
    //   );
    //   return;
    // }

    // Check if the time slot is already booked
    if (isTimeSlotBooked(selectedDate, selectedTime)) {
      toast.error(
        "Selected time slot is already booked. Please choose a different time."
      );
      return;
    }

    setCurrentStep(2);
  };

  // Helper function to get day of week
  const getDayOfWeek = (dateString: string): string => {
    const date = new Date(dateString);
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="max-w-[1350px] mx-auto mt-36 py-8 px-4 bg-gray-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1350px] mx-auto mt-36 py-8 px-4 bg-gray-50">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <StepIndicator
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
      />

      <div className="flex sm:flex-col xsm:flex-col gap-6">
        <div className="w-full max-w-[300px] sm:max-w-full xsm:max-w-full">
          <AgentProfile advisorData={detailedProfile} />
        </div>

        <div className="w-full bg-white rounded-lg shadow-sm p-8">
          {currentStep === 1 ? (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-8">
                Choose an appointment
              </h2>
              <div className="grid xsm:grid-cols-1 sm:grid-cols-1 md:grid-cols-1 grid-cols-2 gap-8">
                {/* here in this calendar we showed the all appointments some user
                has in order to show the new suer that came to book and also we
                disabled all the past dates and then also we disabled all the
                time slots that are already booked and showed all slots free in those days which have no appointments*/}

                <div className="shadow-lg rounded-lg">
                  <Calendar
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    userCalendarSettings={userCalendarSettings as CalendarSettings} // ✅ Use this
                    availableDates={detailedProfile?.available_dates || []}
                  />
                </div>
                {/* here we disabled those slots which are booked and also we showed
                all the slots enabled on the days which have no appointments we
                also sow those slots enable on appointments day which have no
                booking */}
                <div className="shadow-lg rounded-lg">
                  <TimeSlots
                    selectedTime={selectedTime}
                    setSelectedTime={setSelectedTime}
                    selectedDate={selectedDate}
                    userCalendarSettings={userCalendarSettings as CalendarSettings} // ✅ Use this
                    advisorSchedule={advisorSchedule}
                    availableDates={detailedProfile?.available_dates || []}
                    appointments={detailedProfile?.appointments || []}
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-start">
                <Button
                  onClick={handleNextStep}
                  className="px-8 py-3 bg-[#002D51] hover:bg-[#002D51] rounded"
                  text="Next step"
                />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-8">
                Booking confirmation
              </h2>
              {isLoadingProfile && isAuthenticated && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">
                      Loading your profile information...
                    </span>
                  </div>
                </div>
              )}
              <ContactForm
                formData={formData}
                setFormData={setFormData}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                setCurrentStep={setCurrentStep}
                advisorId={advisorId}
                detailedProfile={detailedProfile}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Main booking appointment page component wrapped with Suspense
const BookingAppointment = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingAppointmentContent />
    </Suspense>
  );
};

export default BookingAppointment;
