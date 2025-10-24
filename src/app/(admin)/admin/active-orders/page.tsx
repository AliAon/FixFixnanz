"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFutureAppointments } from "@/redux/slices/appointmentsSlice";
import { RootState, AppDispatch } from "@/redux/store";

const ActiveOrdersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const appointments = useSelector((state: RootState) => state.appointments.appointments);
  const isLoading = useSelector((state: RootState) => state.appointments.isLoading);

  useEffect(() => {
    dispatch(fetchFutureAppointments());
  }, [dispatch]);

  return (
    <div className="my-8 px-[20px]">
      <h1 className="text-[32px] font-medium text-[#32325d]">Future dates</h1>
      <div className="w-full overflow-x-auto mt-6">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-2 text-left font-bold">#</th>
              <th className="py-3 px-2 text-left font-bold">Customer name</th>
              <th className="py-3 px-2 text-left font-bold">title</th>
              <th className="py-3 px-2 text-left font-bold">Date:</th>
              <th className="py-3 px-2 text-left font-bold">Beginning - End</th>
              <th className="py-3 px-2 text-left font-bold">Length of time</th>
              <th className="py-3 px-2 text-left font-bold">Type</th>
              <th className="py-3 px-2 text-left font-bold">action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">No appointment was found.</td>
              </tr>
            ) : (
              appointments.map((appt, idx) => {
                // Calculate length of time in minutes
                let length = "-";
                if (appt.start_time && appt.end_time) {
                  const [sh, sm] = appt.start_time.split(":").map(Number);
                  const [eh, em] = appt.end_time.split(":").map(Number);
                  const mins = (eh * 60 + em) - (sh * 60 + sm);
                  length = mins > 0 ? `${mins} minutes` : "-";
                }
                // Format date
                const date = appt.date ? new Date(appt.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "-";
                return (
                  <tr key={appt.id || idx} className="border-b border-gray-100">
                    <td className="py-3 px-2">{idx + 1}</td>
                    <td className="py-3 px-2">
                      {typeof appt.customer_id === "object"
                        ? appt.customer_id.first_name
                        : appt.customer_id || "-"}
                    </td>
                    <td className="py-3 px-2">{appt.title || "-"}</td>
                    <td className="py-3 px-2">{date}</td>
                    <td className="py-3 px-2">{appt.start_time && appt.end_time ? `${appt.start_time} - ${appt.end_time}` : "-"}</td>
                    <td className="py-3 px-2 font-bold">{length}</td>
                    <td className="py-3 px-2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold">
                        {appt.pipelines?.type || appt.status || "-"}
                      </span>
                    </td>
                    <td className="py-3 px-2">{/* action buttons can go here */}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActiveOrdersPage;
