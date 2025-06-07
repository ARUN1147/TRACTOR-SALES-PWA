import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import Charts from './Charts';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [paymentAlerts, setPaymentAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsResponse, alertsResponse] = await Promise.all([
        dashboardAPI.getAnalytics(),
        dashboardAPI.getPaymentAlerts()
      ]);

      setAnalytics(analyticsResponse.data);
      setPaymentAlerts(alertsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const getAlertColor = (alertType) => {
    switch (alertType) {
      case 'overdue':
        return 'bg-red-100 border-red-500 text-red-700';
      case 'urgent':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'reminder':
        return 'bg-blue-100 border-blue-500 text-blue-700';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">₹</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ₹{analytics?.sales?.revenue?.toLocaleString() || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">#</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
               <dl>
                 <dt className="text-sm font-medium text-gray-500 truncate">
                   Total Sales
                 </dt>
                 <dd className="text-lg font-medium text-gray-900">
                   {analytics?.sales?.total || 0}
                 </dd>
               </dl>
             </div>
           </div>
         </div>
       </div>

       <div className="bg-white overflow-hidden shadow rounded-lg">
         <div className="p-5">
           <div className="flex items-center">
             <div className="flex-shrink-0">
               <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                 <span className="text-white text-sm font-bold">🚜</span>
               </div>
             </div>
             <div className="ml-5 w-0 flex-1">
               <dl>
                 <dt className="text-sm font-medium text-gray-500 truncate">
                   Available Vehicles
                 </dt>
                 <dd className="text-lg font-medium text-gray-900">
                   {analytics?.inventory?.newVehicles || 0}
                 </dd>
               </dl>
             </div>
           </div>
         </div>
       </div>

       <div className="bg-white overflow-hidden shadow rounded-lg">
         <div className="p-5">
           <div className="flex items-center">
             <div className="flex-shrink-0">
               <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                 <span className="text-white text-sm font-bold">⚠</span>
               </div>
             </div>
             <div className="ml-5 w-0 flex-1">
               <dl>
                 <dt className="text-sm font-medium text-gray-500 truncate">
                   Payment Alerts
                 </dt>
                 <dd className="text-lg font-medium text-gray-900">
                   {paymentAlerts.length}
                 </dd>
               </dl>
             </div>
           </div>
         </div>
       </div>
     </div>

     {/* Charts */}
     {analytics && <Charts analytics={analytics} />}

     {/* Payment Alerts */}
     <div className="bg-white shadow rounded-lg">
       <div className="px-4 py-5 sm:px-6">
         <h3 className="text-lg leading-6 font-medium text-gray-900">
           Payment Alerts
         </h3>
         <p className="mt-1 max-w-2xl text-sm text-gray-500">
           Customers with pending payments
         </p>
       </div>
       <div className="border-t border-gray-200">
         {paymentAlerts.length === 0 ? (
           <div className="p-6 text-center text-gray-500">
             No payment alerts at this time
           </div>
         ) : (
           <ul className="divide-y divide-gray-200">
             {paymentAlerts.map((alert) => (
               <li key={alert._id} className="px-4 py-4 sm:px-6">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center">
                     <div className={`px-2 py-1 text-xs font-medium rounded-full ${getAlertColor(alert.alertType)}`}>
                       {alert.alertType.toUpperCase()}
                     </div>
                     <div className="ml-4">
                       <p className="text-sm font-medium text-gray-900">
                         {alert.customer.name}
                       </p>
                       <p className="text-sm text-gray-500">
                         {alert.customer.phone} • {alert.daysSinceSale} days since sale
                       </p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-medium text-gray-900">
                       ₹{alert.totalAmount.toLocaleString()}
                     </p>
                     <p className="text-sm text-gray-500">
                       {alert.vehicle.model}
                     </p>
                   </div>
                 </div>
               </li>
             ))}
           </ul>
         )}
       </div>
     </div>
   </div>
 );
};

export default AdminDashboard;
              