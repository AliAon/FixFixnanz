// File: app/components/GraphOverview.tsx
"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Chart, registerables } from "chart.js";
import Datepicker from "@/components/shared/DatePicker";

// Register all Chart.js components
Chart.register(...registerables);

const GraphOverview: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  const monthlyRevenue = useMemo(
    () => [
      { month: "März 2025", amount: 5000 },
      { month: "April 2025", amount: 2000 },
      { month: "Mai 2025", amount: 600 },
      { month: "Juni 2025", amount: 600 },
      { month: "Juli 2025", amount: 600 },
      { month: "August 2025", amount: 600 },
      { month: "September 2025", amount: 600 },
      { month: "Oktober 2025", amount: 600 },
      { month: "November 2025", amount: 600 },
      { month: "Dezember 2025", amount: 600 },
      { month: "Januar 2026", amount: 600 },
      { month: "Februar 2026", amount: 600 },
      { month: "März 2026", amount: 600 },
    ],
    []
  );

  // Sample customer data
  const customers = [
    {
      id: 1,
      image: "/images/avatars/florian.jpg",
      name: "Florian Ehrlich",
      date: "23.01.2025",
      totalAmount: 6000,
      paid: 0,
      due: 6000,
    },
    {
      id: 2,
      image: "/images/avatars/kawa.jpg",
      name: "Kawa Almohammad",
      date: "",
      totalAmount: 0,
      paid: 0,
      due: 0,
    },
    {
      id: 3,
      image: "/images/avatars/turhan.jpg",
      name: "Turhan Özen",
      date: "13.09.2024",
      totalAmount: 4800,
      paid: 0,
      due: 4800,
    },
    {
      id: 4,
      image: "/images/avatars/erik.jpg",
      name: "Erik Würiehausen",
      date: "",
      totalAmount: 0,
      paid: 0,
      due: 0,
    },
    {
      id: 5,
      image: "/images/avatars/joachim.jpg",
      name: "Joachim Löwel",
      date: "15.09.2024",
      totalAmount: 1500,
      paid: 0,
      due: 1500,
    },
    {
      id: 6,
      image: "/images/avatars/silvana.jpg",
      name: "Silvana Breu",
      date: "17.09.2024",
      totalAmount: 4000,
      paid: 2700,
      due: 1300,
    },
    {
      id: 7,
      image: "/images/avatars/andy.jpg",
      name: "Andy Böhm",
      date: "04.11.2024",
      totalAmount: 6500,
      paid: 0,
      due: 6500,
    },
    {
      id: 8,
      image: "/images/avatars/antonio.jpg",
      name: "Antonio Tufekovic",
      date: "",
      totalAmount: 0,
      paid: 0,
      due: 0,
    },
    {
      id: 9,
      image: "/images/avatars/eric.jpg",
      name: "Eric Wilfang",
      date: "",
      totalAmount: 0,
      paid: 0,
      due: 0,
    },
    {
      id: 10,
      image: "/images/avatars/paulo.jpg",
      name: "Paulo Pimenta",
      date: "",
      totalAmount: 0,
      paid: 0,
      due: 0,
    },
    {
      id: 11,
      image: "/images/avatars/dennis.jpg",
      name: "Dennis Schwedler",
      date: "",
      totalAmount: 0,
      paid: 0,
      due: 0,
    },
    {
      id: 12,
      image: "/images/avatars/wolfgang.jpg",
      name: "Wolfgang Iller",
      date: "22.01.2025",
      totalAmount: 6500,
      paid: 0,
      due: 6500,
    },
  ];

  useEffect(() => {
    // Initialize chart when component mounts
    const canvas = chartRef.current;
    if (!canvas) return;

    // Make sure we clear any existing Chart instances
    Chart.getChart(canvas)?.destroy();

    const ctx = canvas.getContext("2d");

    if (ctx) {
      const newChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: monthlyRevenue.map((item) => item.month),
          datasets: [
            {
              label: "Monthly Total Amounts",
              data: monthlyRevenue.map((item) => item.amount),
              backgroundColor: "#7FA8C5",
              borderColor: "#7FA8C5",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: "rgba(200, 200, 200, 0.3)",
              },
              ticks: {
                callback: function (value) {
                  return value + "€";
                },
              },
              max: 8000,
            },
            x: {
              grid: {
                display: false,
              },
              ticks: {
                maxRotation: 45,
                minRotation: 45,
              },
            },
          },
          plugins: {
            legend: {
              position: "top",
              align: "center",
              labels: {
                boxWidth: 15,
                usePointStyle: true,
                pointStyle: "rect",
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return context.dataset.label + ": " + context.parsed.y + "€";
                },
              },
            },
          },
        },
      });

      // Return cleanup function
      return () => {
        newChartInstance.destroy();
      };
    }
  }, [monthlyRevenue]);

  // Handle filter button click
  const handleFilter = () => {
    console.log("Filtering data between:", startDate, "and", endDate);
    // You would add filtering logic here
  };

  return (
    <div className="flex gap-8 sm:flex-col xsm:flex-col">
      {/* Cashflow Section */}
      <div className="bg-white p-2 rounded-lg shadow-sm w-full max-w-md sm:max-w-full xsm:max-w-full">
        <div className="flex justify-between sm:flex-wrap xsm:flex-wrap items-center mb-4">
          <h3 className="text-3xl font-semibold text-[#32325D] xsm:mb-3 mr-7">
            Cashflow
          </h3>
          <div className="flex space-x-2 xsm:flex-wrap xsm:gap-2">
            {/* Replace input fields with Datepicker component */}
            <div className="w-36">
              <Datepicker
                selectedDate={startDate}
                onChange={setStartDate}
                placeholder="Start Date"
              />
            </div>
            <div className="w-36">
              <Datepicker
                selectedDate={endDate}
                onChange={setEndDate}
                placeholder="End Date"
                minDate={startDate} // Ensure end date is after start date
              />
            </div>
            <button
              className="bg-[#0DCAF0] duration-0 border-0 text-white px-4 py-2 rounded-md text-sm"
              onClick={handleFilter}
            >
              Filter
            </button>
          </div>
        </div>

        {/* Chart.js Canvas */}
        <div className="h-72 mt-2">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <div className=" pb-0">
          <h3 className="text-2xl font-semibold text-center text-primary">
            Agentur Kunden - Übersicht
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b-2 border-primary">
                <th className="py-4 px-4 text-left">Image</th>
                <th className="py-4 px-4 text-left">Full Name</th>
                <th className="py-4 px-4 text-left">Date</th>
                <th className="py-4 px-4 text-left">TotalAmount</th>
                <th className="py-4 px-4 text-left">Paid</th>
                <th className="py-4 px-4 text-left">Due</th>
                <th className="py-4 px-4 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                      {/* This would normally be an Image component with src={customer.image} */}
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        {customer.name.charAt(0)}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">{customer.name}</td>
                  <td className="py-3 px-4">{customer.date}</td>
                  <td className="py-3 px-4">
                    {customer.totalAmount > 0
                      ? `${customer.totalAmount}€`
                      : "0€"}
                  </td>
                  <td className="py-3 px-4">
                    {customer.paid > 0 ? `${customer.paid}€` : "0€"}
                  </td>
                  <td className="py-3 px-4">
                    {customer.due > 0 ? `${customer.due}€` : "0€"}
                  </td>
                  <td className="py-3 px-4">
                    {customer.totalAmount > 0 && (
                      <button className="bg-cyan-500 text-white px-3 py-1 rounded-md text-sm flex items-center">
                        <span className="mr-1">↓</span> Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GraphOverview;
