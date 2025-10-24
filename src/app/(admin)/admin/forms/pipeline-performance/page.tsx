"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaUsers, FaCalendarDay, FaCalendarWeek, FaCalendar } from 'react-icons/fa';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PipelineMetrics {
  total_users_created: number;
  today_users_created: number;
  last_7_days_users_created: number;
  last_30_days_users_created: number;
}

const PipelinePerformancePage: React.FC = () => {
  const [metrics, setMetrics] = useState<PipelineMetrics>({
    total_users_created: 3,
    today_users_created: 0,
    last_7_days_users_created: 0,
    last_30_days_users_created: 0,
  });

  const [selectedPipeline, setSelectedPipeline] = useState("Dynamic Form");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock data for the chart - will be replaced with API data
  const chartData = {
    labels: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday'],
    datasets: [
      {
        label: 'Users Created',
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  // Function to fetch metrics from API (to be implemented later)
  const fetchMetrics = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.get('/pipeline-performance/metrics');
      setMetrics({
        total_users_created: 100,
        today_users_created: 10,
        last_7_days_users_created: 50,
        last_30_days_users_created: 100,
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  // Initialize chart
  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // Destroy existing chart if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        // Create new chart
        chartInstance.current = new ChartJS(ctx, {
          type: 'line',
          data: chartData,
          options: chartOptions,
        });
      }
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Download functions
  const downloadChartAsPNG = () => {
    if (chartRef.current) {
      const link = document.createElement('a');
      link.download = 'pipeline-performance-chart.png';
      link.href = chartRef.current.toDataURL();
      link.click();
    }
    setIsDropdownOpen(false);
  };

  const downloadChartAsSVG = () => {
    // SVG download functionality - would need additional library or custom implementation
    console.log('SVG download not implemented yet');
    setIsDropdownOpen(false);
  };

  const downloadDataAsCSV = () => {
    const csvContent = [
      ['Day', 'Users Created'],
      ...chartData.labels.map((label, index) => [label, chartData.datasets[0].data[index]])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.download = 'pipeline-performance-data.csv';
    link.href = URL.createObjectURL(blob);
    link.click();
    setIsDropdownOpen(false);
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    subtitle: string;
    icon: React.ReactNode;
    bgColor: string;
  }> = ({ title, value, subtitle, icon, bgColor }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value} Kontakte</p>
      <p className="text-gray-500 text-sm">{subtitle}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/admin/forms" className="text-gray-600 hover:text-gray-800">
            <FaArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Pipeline Performance</h1>
        </div>
        
        {/* Pipeline Selector */}
        <div className="flex items-center space-x-3">
          <span className="text-gray-600 font-medium">Pipeline :</span>
          <div className="relative">
            <select
              value={selectedPipeline}
              onChange={(e) => setSelectedPipeline(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Dynamic Form">Dynamic Form</option>
              {/* Add more pipeline options as needed */}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today"
          value={metrics.today_users_created}
          subtitle="Today's total contract"
          icon={<FaCalendarDay className="text-blue-600 text-xl" />}
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Last 7 Days"
          value={metrics.last_7_days_users_created}
          subtitle="Previous 7 days contract"
          icon={<FaCalendarWeek className="text-green-600 text-xl" />}
          bgColor="bg-green-100"
        />
        <StatCard
          title="Last 30 Days"
          value={metrics.last_30_days_users_created}
          subtitle="Previous 30 days contracts"
          icon={<FaCalendar className="text-yellow-600 text-xl" />}
          bgColor="bg-yellow-100"
        />
        <StatCard
          title="Total"
          value={metrics.total_users_created}
          subtitle="All Connected Contracts"
          icon={<FaUsers className="text-purple-600 text-xl" />}
          bgColor="bg-purple-100"
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Last 7 Days User Contracts Progress</h2>
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className=" text-gray-400 bg-transparent border-0 p-0 focus:ring-0 hover:text-gray-600 focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z"></path>
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div 
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10"
              >
                <div className="py-1">
                  <button
                    onClick={downloadChartAsSVG}
                    className="bg-transparent border-0 flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Download SVG
                  </button>
                  <button
                    onClick={downloadChartAsPNG}
                    className="bg-transparent border-0 flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Download PNG
                  </button>
                  <button
                    onClick={downloadDataAsCSV}
                    className="bg-transparent border-0 flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Download CSV
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Chart Container */}
        <div className="h-64 relative">
          <canvas ref={chartRef} className="w-full h-full"></canvas>
        </div>
      </div>
    </div>
  );
};

export default PipelinePerformancePage; 