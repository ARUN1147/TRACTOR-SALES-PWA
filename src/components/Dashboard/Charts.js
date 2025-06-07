import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Charts = ({ analytics }) => {
  // Sales by Location (Pie Chart)
  const locationData = {
    labels: analytics.sales.byLocation.map(item => item._id),
    datasets: [
      {
        data: analytics.sales.byLocation.map(item => item.count),
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Sales by Month (Line Chart)
  const monthData = {
    labels: analytics.sales.byMonth.map(item => item._id),
    datasets: [
      {
        label: 'Sales Count',
        data: analytics.sales.byMonth.map(item => item.count),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Revenue (₹)',
        data: analytics.sales.byMonth.map(item => item.revenue / 1000), // Convert to thousands
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  // Payment Status (Bar Chart)
  const paymentStatusData = {
    labels: analytics.sales.paymentStatus.map(item => 
      item._id.charAt(0).toUpperCase() + item._id.slice(1)
    ),
    datasets: [
      {
        label: 'Number of Sales',
        data: analytics.sales.paymentStatus.map(item => item.count),
        backgroundColor: [
          '#f59e0b', // pending
          '#10b981', // completed
          '#ef4444', // overdue
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Sales Count',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Revenue (K₹)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Sales by Location */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Sales by Location
        </h3>
        <div className="h-64">
          <Pie data={locationData} options={chartOptions} />
        </div>
      </div>

      {/* Payment Status */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Payment Status
        </h3>
        <div className="h-64">
          <Bar data={paymentStatusData} options={chartOptions} />
        </div>
      </div>

      {/* Sales Trend */}
      <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Sales Trend
        </h3>
        <div className="h-64">
          <Line data={monthData} options={lineChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Charts;