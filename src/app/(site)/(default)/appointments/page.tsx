"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  fetchAllAppointments,
  fetchCompletedAppointments,
  fetchFutureAppointments,
  clearAppointments,
  Appointment,
} from "@/redux/slices/appointmentsSlice";

const AppointmentsPage = () => {
  const [activeTab, setActiveTab] = useState<"all" | "completed" | "future">(
    "all"
  );
  const [isSwitchingTab, setIsSwitchingTab] = useState(false);
  const currentTabRef = useRef<"all" | "completed" | "future">("all");
  const isSwitchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const dispatch = useDispatch<AppDispatch>();
  const { appointments, isLoading, error } = useSelector(
    (state: RootState) => state.appointments
  );

  // Helper function to calculate appointment duration
  const calculateDuration = (startTime: string, endTime: string): string => {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins >= 60) {
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;
      return minutes > 0 ? `${hours} hour ${minutes} minutes` : `${hours} hour 0 minutes`;
    }
    return `${diffMins} minutes`;
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper function to format time
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 > 12 ? hour24 - 12 : hour24 === 0 ? 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Helper function to get customer name
  const getCustomerName = (appointment: Appointment): string => {
    if (typeof appointment.customer_id === 'object' && appointment.customer_id !== null) {
      const firstName = appointment.customer_id.first_name || '';
      const lastName = appointment.customer_id.last_name || '';
      return `${firstName} ${lastName}`.trim() || 'Unknown Customer';
    }
    return 'Unknown Customer';
  };

  // Helper function to get appointment type badge
  const getTypeBadge = (type: string): React.JSX.Element => {
    const typeConfig = {
      'video': { label: 'video', className: 'bg-yellow-400 text-black' },
      'telephone': { label: 'telephone call', className: 'bg-blue-500 text-white' },
      'office': { label: 'office visit', className: 'bg-green-500 text-white' },
      'online': { label: 'online', className: 'bg-purple-500 text-white' },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || { 
      label: type || 'unknown', 
      className: 'bg-gray-500 text-white' 
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // Fetch appointments based on active tab
  const fetchAppointments = useCallback(async (tab: "all" | "completed" | "future") => {
    try {
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();
      
      switch (tab) {
        case "all":
          await dispatch(fetchAllAppointments());
          break;
        case "completed":
          await dispatch(fetchCompletedAppointments({}));
          break;
        case "future":
          await dispatch(fetchFutureAppointments());
          break;
      }
      
      // Only process the result if the user is still on the same tab
      if (currentTabRef.current !== tab) {
        console.log(`Ignoring ${tab} results - user switched to ${currentTabRef.current}`);
        return;
      }
      
      // Clear switching state when request completes
      isSwitchingRef.current = false;
      setIsSwitchingTab(false);
      
    } catch (error) {
      // Don't log error if it was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        console.log(`${tab} request was cancelled`);
        return;
      }
      console.error(`Error fetching ${tab} appointments:`, error);
      isSwitchingRef.current = false;
      setIsSwitchingTab(false);
    }
  }, [dispatch]);

  // Handle tab change
  const handleTabChange = (tab: "all" | "completed" | "future") => {
    // IMMEDIATELY hide old data by setting switching ref first (synchronous)
    isSwitchingRef.current = true;
    setIsSwitchingTab(true);
    
    // Then update tab and clear data
    setActiveTab(tab);
    currentTabRef.current = tab;
    dispatch(clearAppointments());
    
    // Start fetching new data
    fetchAppointments(tab);
  };

  // Initial mount effect
  useEffect(() => {
    currentTabRef.current = "all"; // Initialize with default tab
    isSwitchingRef.current = false;
    fetchAppointments("all");
  }, [fetchAppointments]); // Run on mount and when fetchAppointments changes

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-lg font-roboto font-semibold mb-4">Appointments</h2>
      <div className="border-b flex px-6 my-8">
        <button
          className={`py-2 px-4 relative ${
            activeTab === "all"
              ? "border border-b-0 border-gray-300 transition-none border-b-white bg-white rounded-none text-black font-medium -mb-px"
              : "border-0 border-gray-300 transition-none bg-transparent text-blue-600 rounded-none hover:text-black"
          } font-roboto`}
          onClick={() => handleTabChange("all")}
        >
          All dates
        </button>
        <button
          className={`py-2 px-4 relative ${
            activeTab === "completed"
              ? "border border-b-0 border-gray-300 transition-none border-b-white bg-white rounded-none text-black font-medium -mb-px"
              : "border-0 border-gray-300 transition-none bg-transparent text-blue-600 rounded-none hover:text-black"
          } font-roboto`}
          onClick={() => handleTabChange("completed")}
        >
          Completed appointments
        </button>
        <button
          className={`py-2 px-4 relative ${
            activeTab === "future"
              ? "border border-b-0 border-gray-300 transition-none border-b-white bg-white rounded-none text-black font-medium -mb-px"
              : "border-0 border-gray-300 transition-none bg-transparent text-blue-600 rounded-none hover:text-black"
          } font-roboto`}
          onClick={() => handleTabChange("future")}
        >
          Future dates
        </button>
      </div>
      
      {/* Loading State */}
      {(isLoading || isSwitchingTab || isSwitchingRef.current) && (
        <div className="mt-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">
            {(isSwitchingTab || isSwitchingRef.current) ? "" : "Loading appointments..."}
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !isSwitchingTab && !isSwitchingRef.current && (
        <div className="mt-8 text-center text-red-600">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Appointments Table */}
      {!isLoading && !error && !isSwitchingTab && !isSwitchingRef.current && appointments && appointments.length > 0 && (
        <div className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-roboto font-medium text-gray-700">#</th>
                  <th className="text-left py-3 px-2 font-roboto font-medium text-gray-700">Customer name</th>
                  <th className="text-left py-3 px-2 font-roboto font-medium text-gray-700">title</th>
                  <th className="text-left py-3 px-2 font-roboto font-medium text-gray-700">Date:</th>
                  <th className="text-left py-3 px-2 font-roboto font-medium text-gray-700">Beginning - End</th>
                  <th className="text-left py-3 px-2 font-roboto font-medium text-gray-700">Length of time</th>
                  <th className="text-left py-3 px-2 font-roboto font-medium text-gray-700">Type</th>
                  <th className="text-left py-3 px-2 font-roboto font-medium text-gray-700">action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment, index) => (
                  <tr key={appointment.id || index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 text-blue-600 font-roboto">{index + 1}</td>
                    <td className="py-3 px-2 font-roboto text-gray-700">
                      {getCustomerName(appointment)}
                    </td>
                    <td className="py-3 px-2 font-roboto text-gray-700">
                      {appointment.title || 'Appointment confirmation'}
                    </td>
                    <td className="py-3 px-2 font-roboto text-gray-600">
                      {formatDate(appointment.date)}
                    </td>
                    <td className="py-3 px-2 font-roboto text-gray-700">
                      {appointment.end_time 
                        ? `${formatTime(appointment.start_time)} - ${formatTime(appointment.end_time)}`
                        : formatTime(appointment.start_time)
                      }
                    </td>
                    <td className="py-3 px-2 font-roboto text-gray-700">
                      {appointment.end_time 
                        ? calculateDuration(appointment.start_time, appointment.end_time)
                        : 'Not specified'
                      }
                    </td>
                    <td className="py-3 px-2">
                      {getTypeBadge(appointment.type || 'unknown')}
                    </td>
                    <td className="py-3 px-2">
                      {appointment.meeting_link || appointment.link ? (
                        <a
                          href={appointment.meeting_link || appointment.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-roboto text-sm transition-colors inline-block text-center"
                        >
                          Join
                        </a>
                      ) : (
                        <button 
                          disabled
                          className="bg-gray-400 text-white px-4 py-2 rounded font-roboto text-sm cursor-not-allowed"
                        >
                          Join
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Appointments Message */}
      {!isLoading && !error && !isSwitchingTab && !isSwitchingRef.current && (!appointments || appointments.length === 0) && (
        <div className="mt-8 text-center text-gray-600">
          {activeTab === "all" && <p>No appointments found.</p>}
          {activeTab === "completed" && <p>No completed appointments.</p>}
          {activeTab === "future" && <p>No future appointments.</p>}
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
