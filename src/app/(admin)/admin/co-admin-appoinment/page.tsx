"use client";
import React, { useState } from "react";
import { NextPage } from "next";
import Link from "next/link";

interface Appointment {
  id: number;
  sl: number;
  fullName: string;
  title: string;
  type: string;
  startTime: string;
  createdAt: string;
  meetingLink: string;
}

const CoAdminAppointmentPage: NextPage = () => {
  const [activeTab, setActiveTab] = useState("upcoming");

  const upcomingAppointments: Appointment[] = [
    {
      id: 1484,
      sl: 1,
      fullName: "Detlef Bohlen",
      title: "Einführungscall- Digitale-Neukunden Detlef Bohlen",
      type: "Video",
      startTime: "17.03.2025 08:00",
      createdAt: "18.02.2025",
      meetingLink: "#",
    },
    {
      id: 1664,
      sl: 2,
      fullName: "Stefan Weitershagen",
      title: "Einführungscall- Digitale-Neukunden Stefan Weitershagen",
      type: "Video",
      startTime: "27.03.2025 09:00",
      createdAt: "26.02.2025",
      meetingLink: "#",
    },
  ];

  const allAppointments: Appointment[] = [
    {
      id: 1484,
      sl: 1,
      fullName: "Detlef Bohlen",
      title: "Einführungscall- Digitale-Neukunden Detlef Bohlen",
      type: "Video",
      startTime: "17.03.2025 08:00",
      createdAt: "18.02.2025",
      meetingLink: "#",
    },
    {
      id: 1664,
      sl: 2,
      fullName: "Stefan Weitershagen",
      title: "Einführungscall- Digitale-Neukunden Stefan Weitershagen",
      type: "Video",
      startTime: "27.03.2025 09:00",
      createdAt: "26.02.2025",
      meetingLink: "#",
    },
    {
      id: 1789,
      sl: 3,
      fullName: "Andreas Kosche",
      title: "Follow-up Call- Digitale-Neukunden Andreas Kosche",
      type: "Video",
      startTime: "12.01.2025 10:30",
      createdAt: "01.01.2025",
      meetingLink: "#",
    },
    {
      id: 1892,
      sl: 4,
      fullName: "Martin Zenner",
      title: "Strategy Session- Digitale-Neukunden Martin Zenner",
      type: "Video",
      startTime: "05.02.2025 14:00",
      createdAt: "22.01.2025",
      meetingLink: "#",
    },
  ];

  const appointments =
    activeTab === "upcoming" ? upcomingAppointments : allAppointments;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Hubspot Appointment
      </h1>

      {/* Tabs */}
      <div className="border-b border-gray-300 mb-6">
        <div className="flex">
          <Link
            href=""
            className={`py-2 px-3 font-medium text-sm ${
              activeTab === "upcoming"
                ? "border-b-0 border rounded-md border-gray-300 text-blue-500"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("upcoming")}
          >
            Demnächst Termin
          </Link>
          <Link
            href=""
            className={`py-2 px-3 font-medium text-sm ${
              activeTab === "all"
                ? "border-b-0 border rounded-md border-gray-300 text-blue-500"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("all")}
          >
            Alle Termin
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-white border-b border-gray-300">
              <th className="py-3 px-4 text-left font-bold text-primary">SL</th>
              <th className="py-3 px-4 text-left font-bold text-primary">ID</th>
              <th className="py-3 px-4 text-left font-bold text-primary">
                Full Name
              </th>
              <th className="py-3 px-4 text-left font-bold text-primary">
                Title
              </th>
              <th className="py-3 px-4 text-left font-bold text-primary">
                Type
              </th>
              <th className="py-3 px-4 text-left font-bold text-primary">
                Start Time
              </th>
              <th className="py-3 px-4 text-left font-bold text-primary">
                Created At
              </th>
              <th className="py-3 px-4 text-left font-bold text-primary">
                Meeting Link
              </th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="border-b border-gray-200">
                <td className="py-4 px-4 text-primary">{appointment.sl}</td>
                <td className="py-4 px-4 text-primary">{appointment.id}</td>
                <td className="py-4 px-4 text-primary font-bold">
                  {appointment.fullName}
                </td>
                <td className="py-4 px-4 text-primary">{appointment.title}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <span className="mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-camera-video-fill"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fillRule="evenodd"
                          d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"
                        />
                      </svg>
                    </span>
                    {appointment.type}
                  </div>
                </td>
                <td className="py-4 px-4 text-primary">
                  {appointment.startTime}
                </td>
                <td className="py-4 px-4 text-primary">
                  {appointment.createdAt}
                </td>
                <td className="py-4 px-4">
                  <button className="bg-[#002D51] text-white py-2 px-4 rounded flex items-center">
                    <span className="mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-camera-video-fill"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fillRule="evenodd"
                          d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"
                        />
                      </svg>
                    </span>
                    Join
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoAdminAppointmentPage;
