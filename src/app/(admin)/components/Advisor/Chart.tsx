// File: app/components/AgentOverviewModalChart.tsx
"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

// Cash Flow Chart Component using Chart.js
export const CashFlowChart = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Sample data - monthly cash flow for a year
    const months = [
      'März 2025', 'April 2025', 'Mai 2025', 'Juni 2025', 
      'Juli 2025', 'August 2025', 'September 2025', 'Oktober 2025',
      'November 2025', 'Dezember 2025', 'Januar 2026', 'Februar 2026', 'März 2026'
    ];
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Monthly Total Amounts',
          data: [500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500],
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              callback: function(value) {
                return value + ' €';
              }
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'start',
            labels: {
              boxWidth: 15,
              usePointStyle: true,
              pointStyle: 'rect'
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y + ' €';
                }
                return label;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <canvas ref={chartRef} />
    </div>
  );
};