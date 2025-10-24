"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  initializeCalendarSettings,
  fetchCalendarSettings,
  updateCalendarSettings,
} from "@/redux/slices/calendarSettingsSlice";
import { AppDispatch, RootState } from "@/redux/store";

// Define the weekly schedule item interface to match the API
interface WeeklyScheduleItem {
  weekday: string;
  start: string;
  end: string;
  is_available: boolean;
}

// Interface for calendar settings form data
interface CalendarSettingsForm {
  consultation_color: string;
  online_event_color: string;
  profile_booking_color: string;
  appointment_duration: number;
  reminder_email_minutes: number;
  google_calendar_id: string;
  weekly_schedule: WeeklyScheduleItem[];
}

const CalendarSettings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { settings, error } = useSelector(
    (state: RootState) => state.calendarSettings
  );

  // Initial default settings
  const defaultSettings: CalendarSettingsForm = {
    consultation_color: "#FF0000", // Red
    online_event_color: "#00FF00", // Green
    profile_booking_color: "#0000FF", // Blue
    appointment_duration: 30,
    reminder_email_minutes: 30,
    google_calendar_id: "",
    weekly_schedule: [
      { weekday: "Monday", start: "09:00", end: "17:00", is_available: true },
      { weekday: "Tuesday", start: "09:00", end: "17:00", is_available: true },
      {
        weekday: "Wednesday",
        start: "09:00",
        end: "17:00",
        is_available: true,
      },
      { weekday: "Thursday", start: "09:00", end: "17:00", is_available: true },
      { weekday: "Friday", start: "09:00", end: "17:00", is_available: true },
      {
        weekday: "Saturday",
        start: "09:00",
        end: "17:00",
        is_available: false,
      },
      { weekday: "Sunday", start: "09:00", end: "17:00", is_available: false },
    ],
  };

  // Form state
  const [formData, setFormData] =
    useState<CalendarSettingsForm>(defaultSettings);

  // Fetch calendar settings on mount only
  useEffect(() => {
    dispatch(fetchCalendarSettings());
  }, [dispatch]);

  // Populate form when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        consultation_color:
          settings.consultation_color || defaultSettings.consultation_color,
        online_event_color:
          settings.online_event_color || defaultSettings.online_event_color,
        profile_booking_color:
          settings.profile_booking_color ||
          defaultSettings.profile_booking_color,
        appointment_duration:
          settings.appointment_duration || defaultSettings.appointment_duration,
        reminder_email_minutes:
          settings.reminder_email_minutes ||
          defaultSettings.reminder_email_minutes,
        google_calendar_id: settings.google_calendar_id || "",
        weekly_schedule:
          settings.weekly_schedule && settings.weekly_schedule.length > 0
            ? settings.weekly_schedule
            : defaultSettings.weekly_schedule,
      });
    }
  }, [settings]);

  // Handle error messages
  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [error]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle numeric inputs
  const handleNumericChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const value = parseInt(e.target.value) || 0;
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Handle weekly schedule changes
  const handleScheduleChange = (
    weekday: string,
    field: keyof Omit<WeeklyScheduleItem, "weekday">,
    value: string | boolean
  ) => {
    const updatedSchedule = formData.weekly_schedule.map((item) =>
      item.weekday === weekday ? { ...item, [field]: value } : item
    );

    setFormData({
      ...formData,
      weekly_schedule: updatedSchedule,
    });
  };

  // Handle saving calendar settings
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const handleSaveSettings = () => {
    setIsSavingSettings(true);
    if (settings) {
      dispatch(updateCalendarSettings(formData))
        .unwrap()
        .then(() => {
          toast.success("Calendar settings updated successfully");
        })
        .catch((error) => {
          toast.error(`Failed to update calendar settings: ${error}`);
        })
        .finally(() => {
          setIsSavingSettings(false);
        });
    } else {
      dispatch(initializeCalendarSettings())
        .unwrap()
        .then(() => {
          toast.success("Calendar settings created successfully");
        })
        .catch((error) => {
          toast.error(`Failed to create calendar settings: ${error}`);
        })
        .finally(() => {
          setIsSavingSettings(false);
        });
    }
  };

  // Handle saving Google Calendar ID
  const [isSavingGoogleCalendar, setIsSavingGoogleCalendar] = useState(false);
  const handleSaveGoogleCalendar = () => {
    setIsSavingGoogleCalendar(true);
    const updatedSettings = {
      ...formData,
      google_calendar_id: formData.google_calendar_id,
    };
    dispatch(updateCalendarSettings(updatedSettings))
      .unwrap()
      .then(() => {
        toast.success("Google Calendar ID saved successfully");
      })
      .catch((error) => {
        toast.error(`Failed to save Google Calendar ID: ${error}`);
      })
      .finally(() => {
        setIsSavingGoogleCalendar(false);
      });
  };

  // Handle saving planning (weekly schedule)
  const [isSavingPlanning, setIsSavingPlanning] = useState(false);
  const handleSavePlanning = () => {
    setIsSavingPlanning(true);
    if (settings) {
      dispatch(updateCalendarSettings(formData))
        .unwrap()
        .then(() => {
          toast.success("Calendar planning updated successfully");
        })
        .catch((error) => {
          toast.error(`Failed to update calendar planning: ${error}`);
        })
        .finally(() => {
          setIsSavingPlanning(false);
        });
    } else {
      dispatch(initializeCalendarSettings())
        .unwrap()
        .then(() => {
          toast.success("Calendar planning created successfully");
        })
        .catch((error) => {
          toast.error(`Failed to create calendar planning: ${error}`);
        })
        .finally(() => {
          setIsSavingPlanning(false);
        });
    }
  };

  return (
    <div className="p-6 bg-white">
      <ToastContainer position="top-right" autoClose={3000} />

      <h1 className="text-3xl font-semibold text-gray-800 mb-12">
        Additional calendar settings
      </h1>

      <div className="border-t-[1.5px] border-b border-[#C7C8C9] py-6">
        <div className="grid xsm:grid-cols-1 sm:grid-cols-1 grid-cols-2 gap-6">
          {/* Left Column */}
          <div>
            <div className="mb-4 flex xsm:flex-col xsm:items-start xsm:gap-3 items-center">
              <label className="block text-base font-bold text-primary mr-2">
                Counseling interviews - color:
              </label>
              <div className="border border-gray-300 px-2 py-[1px] rounded-md">
                <input
                  type="color"
                  name="consultation_color"
                  className="h-5 w-44 cursor-pointer bg-white rounded"
                  value={formData.consultation_color}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="mb-4 flex xsm:flex-col xsm:items-start xsm:gap-3 items-center">
              <label className="block text-base font-bold text-primary mr-2">
                Profile Booking event - Color:
              </label>
              <div className="border border-gray-300 px-2 py-[1px] rounded-md">
                <input
                  type="color"
                  name="profile_booking_color"
                  className="h-5 w-44 cursor-pointer bg-white rounded"
                  value={formData.profile_booking_color}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="mb-4 flex xsm:flex-col xsm:items-start xsm:gap-3 items-center">
              <label className="block text-base font-bold text-primary mr-2">
                Termin duration: (in minutes)
              </label>
              <input
                type="text"
                className="h-8 w-24 px-3 py-1 border border-gray-300 rounded"
                value={formData.appointment_duration}
                onChange={(e) => handleNumericChange(e, "appointment_duration")}
              />
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="mb-4 flex xsm:flex-col xsm:items-start xsm:gap-3 items-center">
              <label className="block text-base font-bold text-primary mr-2">
                Online events color:
              </label>
              <div className="border border-gray-300 px-2 py-[1px] rounded-md">
                <input
                  type="color"
                  name="online_event_color"
                  className="h-5 w-44 cursor-pointer bg-white rounded"
                  value={formData.online_event_color}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="mb-4 flex xsm:flex-col xsm:items-start xsm:gap-3 items-center">
              <label className="block text-base font-bold text-primary mr-2">
                Reminder email: (Minutes)
              </label>
              <input
                type="text"
                className="h-8 w-24 px-3 py-1 border border-gray-300 rounded"
                value={formData.reminder_email_minutes}
                onChange={(e) =>
                  handleNumericChange(e, "reminder_email_minutes")
                }
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 bg-[#198754] hover:bg-[#157347] duration-150 border-none text-white rounded"
            onClick={handleSaveSettings}
            disabled={isSavingSettings}
          >
            {isSavingSettings ? "Saving..." : "Save settings"}
          </button>
        </div>
      </div>

      {/* Google Calendar Integration */}
      <div className="mt-6 mb-4">
        <div className="flex items-center mb-2">
          <h2 className="text-2xl font-medium text-gray-800">
            Google calendar integration
          </h2>
          <Link
            href=""
            className="ml-2 px-2 py-1 bg-[#0DCAF0] duration-200 hover:bg-[#31D2F2] text-white text-base rounded"
          >
            Help
          </Link>
        </div>

        <div className="flex items-center mb-4">
          <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center mr-2">
            <span className="text-xs text-white">i</span>
          </div>
          <p className="text-base text-[#DC3545]">
            <span>Make sure your </span>
            <b className="text-[#DC3545]">Google calendar public</b>
            <span> is.</span>
          </p>
        </div>

        <div className="flex items-center">
          <label className="block text-base font-bold text-primary mr-2">
            Google Calendar ID:
          </label>
          <input
            type="text"
            name="google_calendar_id"
            className="flex-1 px-3 py-2 border w-full max-w-md border-gray-300 rounded"
            value={formData.google_calendar_id}
            onChange={handleInputChange}
          />
          <button
            type="button"
            className="ml-2 px-4 py-2 bg-[#198754] hover:bg-[#157347] duration-0 border-none text-white rounded"
            onClick={handleSaveGoogleCalendar}
            disabled={isSavingGoogleCalendar}
          >
            {isSavingGoogleCalendar ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Weekly Scheduling */}
      <div className="mt-8 overflow-x-auto w-full">
        <h2 className="text-2xl font-medium text-gray-800 mb-1">
          Weekly scheduling
        </h2>
        <p className="text-base text-primary mb-4">Set your availability</p>

        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-gray-200">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 text-left text-base font-bold text-primary">
                  #
                </th>
                <th className="py-3 text-left text-base font-bold text-primary">
                  Weekday
                </th>
                <th className="py-3 text-left text-base font-bold text-primary">
                  From
                </th>
                <th className="py-3 text-left text-base font-bold text-primary">
                  Until
                </th>
                <th className="py-3 text-left text-base whitespace-nowrap font-bold text-primary">
                  Turn off day
                </th>
              </tr>
            </thead>
            <tbody>
              {formData.weekly_schedule.map((day, index) => (
                <tr key={day.weekday} className="">
                  <td className="py-3 text-base text-primary">{index + 1}</td>
                  <td className="py-3 text-base font-bold text-primary">
                    {day.weekday}
                  </td>
                  <td className="py-3 mr-4">
                    <input
                      type="time"
                      className="w-[200px] px-3 py-2 border border-gray-300 rounded"
                      value={day.start}
                      onChange={(e) =>
                        handleScheduleChange(
                          day.weekday,
                          "start",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td className="py-3">
                    <input
                      type="time"
                      className="w-[200px] px-3 py-2 border border-gray-300 rounded"
                      value={day.end}
                      onChange={(e) =>
                        handleScheduleChange(day.weekday, "end", e.target.value)
                      }
                    />
                  </td>
                  <td className="py-3 xsm:text-center text-left">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      checked={!day.is_available}
                      onChange={(e) =>
                        handleScheduleChange(
                          day.weekday,
                          "is_available",
                          !e.target.checked
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 bg-[#198754] hover:bg-[#157347] duration-150 border-none text-white rounded"
            onClick={handleSavePlanning}
            disabled={isSavingPlanning}
          >
            {isSavingPlanning ? "Saving..." : "Save planning"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarSettings;
