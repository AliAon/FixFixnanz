"use client";
import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

interface Berater {
  name: string;
  image: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  berater: Berater;
  werbekonto: string;
  kampagne: string;
  pipelineName: string;
  stageName: string;
  leadsCount: number;
}

// Sample data
const campaigns: Campaign[] = [
  {
    id: "120210671777100103",
    name: "Neue Kampagne für Anfragen - Apotheker",
    status: "Active",
    berater: {
      name: "Turhan Özen",
      image: "/images/agent-2.jpg",
    },
    werbekonto: "Name: Neue Kampagne für Anfragen - Apotheker",
    kampagne: "Apotheken Anfragen",
    pipelineName: "Standart",
    stageName: "Leads",
    leadsCount: 75,
  },
  {
    id: "120212266880130232",
    name: "Neue Kampagne für BKV Anfragen",
    status: "Active",
    berater: {
      name: "Eric Willfang",
      image: "/images/agent-2.jpg",
    },
    werbekonto: "Name: Neue Kampagne für BKV Anfragen",
    kampagne: "BKV - Anfragen - November 2024",
    pipelineName: "Standart",
    stageName: "Leads",
    leadsCount: 161,
  },
];

export default function CampaignPage() {
  const [showLeadsModal, setShowLeadsModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateField, setSelectedDateField] = useState<
    "from" | "to" | null
  >(null);

  const handleLeadsClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowLeadsModal(true);
  };

  const handleDetailsClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowDetailsModal(true);
  };

  const handleDatePickerOpen = (field: "from" | "to") => {
    setSelectedDateField(field);
    setShowDatePicker(true);
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const formattedDate = newDate.toISOString().split("T")[0]; // YYYY-MM-DD

    if (selectedDateField === "from") {
      setFromDate(formattedDate);
    } else if (selectedDateField === "to") {
      setToDate(formattedDate);
    }

    setShowDatePicker(false);
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const monthName = currentDate.toLocaleString("default", { month: "long" });

    const days = [];

    // Previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${daysInPrevMonth - i}`} className="text-gray-300">
          {daysInPrevMonth - i}
        </div>
      );
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const isCurrentDate =
        new Date().getDate() === i &&
        new Date().getMonth() === month &&
        new Date().getFullYear() === year;

      days.push(
        <div
          key={i}
          className={`cursor-pointer hover:bg-gray-200 rounded-full ${
            isCurrentDate ? "bg-blue-50 rounded-full" : ""
          }`}
          onClick={() => handleDateClick(i)}
        >
          {i}
        </div>
      );
    }

    // Next month days
    const totalCells = 42; // 6 rows of 7 days
    const remainingCells = totalCells - days.length;

    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div key={`next-${i}`} className="text-gray-300">
          {i}
        </div>
      );
    }

    return (
      <div className="p-4 ">
        <div className="flex justify-between items-center mb-4">
          <Link href="" onClick={handlePrevMonth} className="text-primary">
            <IoIosArrowBack size={20} />
          </Link>
          <div className="flex items-center space-x-2">
            <select
              value={monthName}
              onChange={(e) => {
                const newMonth = new Date(currentDate).setMonth(
                  [
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
                  ].indexOf(e.target.value)
                );
                setCurrentDate(new Date(newMonth));
              }}
              className="text-lg font-light"
            >
              <option>January</option>
              <option>February</option>
              <option>March</option>
              <option>April</option>
              <option>May</option>
              <option>June</option>
              <option>July</option>
              <option>August</option>
              <option>September</option>
              <option>October</option>
              <option>November</option>
              <option>December</option>
            </select>
            <select
              value={year}
              onChange={(e) => {
                const newYear = new Date(currentDate).setFullYear(
                  parseInt(e.target.value)
                );
                setCurrentDate(new Date(newYear));
              }}
              className="text-lg font-light"
            >
              {Array.from({ length: 10 }, (_, i) => year - 5 + i).map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>
          <Link
            href=""
            onClick={handleNextMonth}
            className="text-primary font-light"
          >
            <IoIosArrowForward size={20} />
          </Link>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center">
          <div className="font-semibold text-xs text-[#757575]">Sun</div>
          <div className="font-semibold text-xs text-[#757575]">Mon</div>
          <div className="font-semibold text-xs text-[#757575]">Tue</div>
          <div className="font-semibold text-xs text-[#757575]">Wed</div>
          <div className="font-semibold text-xs text-[#757575]">Thu</div>
          <div className="font-semibold text-xs text-[#757575]">Fri</div>
          <div className="font-semibold text-xs text-[#757575]">Sat</div>
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen p-0 w-full">
      <Head>
        <title>Campaign Management</title>
        <meta name="description" content="Campaign Management Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Active advertising campaigns
          </h1>

          <div className="overflow-x-auto w-full">
            <table className="min-w-full table-fixed">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left font-bold text-indigo-900">
                    Image
                  </th>
                  <th className="py-3 px-4 text-left font-bold text-indigo-900">
                    Berater
                  </th>
                  <th className="py-3 px-4 text-left font-bold text-indigo-900">
                    Werbekonto
                  </th>
                  <th className="py-3 px-4 text-left font-bold text-indigo-900">
                    Kampagne
                  </th>
                  <th className="py-3 px-4 text-left font-bold text-indigo-900">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left font-bold text-indigo-900">
                    Pipeline Name
                  </th>
                  <th className="py-3 px-4 text-left font-bold text-indigo-900">
                    Stage Name
                  </th>
                  <th className="py-3 px-4 text-left font-bold text-indigo-900">
                    Leads
                  </th>
                  <th className="py-3 px-4 text-left font-bold text-indigo-900">
                    Leads View
                  </th>
                  <th className="py-3 px-4 text-left font-bold text-indigo-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={campaign.berater.image}
                          alt={campaign.berater.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-800">
                      {campaign.berater.name}
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-blue-500 text-sm">
                          {campaign.name}
                        </div>
                        <div className="text-indigo-900 whitespace-nowrap text-sm">
                          <b>ID:</b> {campaign.id}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm">{campaign.kampagne}</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-[#198754] text-white text-xs font-bold rounded-md">
                        {campaign.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      {campaign.pipelineName}
                    </td>
                    <td className="py-4 px-4 text-sm">{campaign.stageName}</td>
                    <td className="py-4 px-4 text-sm font-semibold text-gray-800">
                      {campaign.leadsCount}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        className="px-2 py-1 duration-200 bg-[#0D6EFD] hover:bg-[#0B5ED7] text-white rounded-md font-medium"
                        onClick={() => handleLeadsClick(campaign)}
                      >
                        Leads
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        className="p-2 bg-[#002D51] text-white text-sm rounded-md font-medium flex items-center justify-center"
                        onClick={() => handleDetailsClick(campaign)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Leads Modal */}
      {showLeadsModal && selectedCampaign && (
        <div className="fixed inset-0 z-20 overflow-y-auto">
          <div
            className="flex items-center justify-center min-h-screen pt-4 px-4 pb-12 text-center sm:block sm:p-0"
            onClick={() => setShowLeadsModal(false)}
          >
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-900 opacity-40"></div>
            </div>

            <div
              onClick={(e) => e.stopPropagation()}
              className="inline-block align-bottom bg-white rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-4xl"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="text-xl font-semibold text-indigo-900">
                    {selectedCampaign.berater.name} - Leads
                  </h3>
                  <Link
                    href=""
                    onClick={() => setShowLeadsModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <span className="text-2xl">&times;</span>
                  </Link>
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-bold text-primary mb-1">
                        From Date
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={fromDate}
                          placeholder="yyyy-mm-dd"
                          onClick={() => handleDatePickerOpen("from")}
                          readOnly
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-primary mb-1">
                        To Date
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={toDate}
                          placeholder="yyyy-mm-dd"
                          onClick={() => handleDatePickerOpen("to")}
                          readOnly
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="self-end">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Filter
                      </button>
                    </div>
                  </div>

                  {showDatePicker && (
                    <div className="absolute z-[1000] bg-white border border-gray-300 rounded-md shadow-lg">
                      {renderCalendar()}
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="border-b-2 border-primary">
                          <th className="px-6 py-3 text-left text-base font-bold text-primary">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-base font-bold text-primary">
                            Phone
                          </th>
                          <th className="px-6 py-3 text-left text-base font-bold text-primary">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-base font-bold text-primary">
                            Platform
                          </th>
                          <th className="px-6 py-3 text-left text-base font-bold text-primary">
                            Created DateTime
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        <tr>
                          <td colSpan={5} className="px-4 py-4">
                            <div className="bg-[#FFF3CD] p-4 text-amber-800 rounded">
                              No data available.
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowLeadsModal(false)}
                  className="mt-3 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-500 text-base font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetailsModal && selectedCampaign && (
        <div className="fixed inset-0 z-40 overflow-y-auto">
          <div
            className="flex items-center justify-center min-h-screen pt-4 px-4 pb-0 text-center sm:block sm:p-0"
            onClick={() => setShowDetailsModal(false)}
          >
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-900 opacity-40"></div>
            </div>

            <div
              onClick={(e) => e.stopPropagation()}
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-4xl"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="text-xl font-semibold text-indigo-900">
                    Campaign Details
                  </h3>
                  <Link
                    href=""
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <span className="text-2xl">&times;</span>
                  </Link>
                </div>

                <div className="mt-4">
                  {/* Campaign details content would go here */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Campaign Name
                      </h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedCampaign.name}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Campaign ID
                      </h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedCampaign.id}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Status
                      </h4>
                      <p className="mt-1">
                        <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-md">
                          {selectedCampaign.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Manager
                      </h4>
                      <div className="mt-1 flex items-center">
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={selectedCampaign.berater.image}
                            alt={selectedCampaign.berater.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-sm text-gray-900">
                          {selectedCampaign.berater.name}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Pipeline
                      </h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedCampaign.pipelineName}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Total Leads
                      </h4>
                      <p className="mt-1 text-sm font-bold text-gray-900">
                        {selectedCampaign.leadsCount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="mt-3  inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-500 text-base font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
