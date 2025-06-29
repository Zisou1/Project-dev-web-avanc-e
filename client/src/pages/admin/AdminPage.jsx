import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faStore, 
  faBox, 
  faDollarSign, 
  faChartLine, 
  faArrowUp, 
  faArrowDown,
  faUserCheck,
  faCalendarDay
} from '@fortawesome/free-solid-svg-icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, analyticsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAnalytics(timeRange)
      ]);
      
      setStats(dashboardStats);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  // Chart configurations
  const ordersChartData = {
    labels: analytics?.dailyStats?.map(stat => {
      const date = new Date(stat.date);
      return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
    }) || [],
    datasets: [
      {
        label: 'Commandes',
        data: analytics?.dailyStats?.map(stat => stat.orders) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Revenus (DA)',
        data: analytics?.dailyStats?.map(stat => stat.revenue) || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      }
    ]
  };

  const userGrowthData = {
    labels: analytics?.userGrowth?.map(stat => {
      const date = new Date(stat.date);
      return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
    }) || [],
    datasets: [
      {
        label: 'Nouveaux utilisateurs',
        data: analytics?.userGrowth?.map(stat => stat.newUsers) || [],
        backgroundColor: 'rgba(139, 69, 19, 0.8)',
        borderColor: 'rgb(139, 69, 19)',
        borderWidth: 1,
      }
    ]
  };

  const userDistributionData = {
    labels: ['Clients', 'Restaurateurs', 'Livreurs'],
    datasets: [
      {
        data: [stats?.customers || 0, stats?.restaurateurs || 0, stats?.livreurs || 0],
        backgroundColor: [
          '#3B82F6', // Blue
          '#10B981', // Green
          '#F59E0B'  // Yellow
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
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
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Tableau de bord Administrateur
          </h1>
          <p className="text-gray-600">
            Vue d'ensemble de la plateforme Yumzo
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {[7, 30, 90].map(days => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === days
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {days} jours
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.totalUsers || 0}</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <FontAwesomeIcon icon={faUserCheck} className="mr-1" />
                  <span>{stats?.activeUsers || 0} actifs</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Restaurants</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.totalRestaurants || 0}</p>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <FontAwesomeIcon icon={faArrowUp} className="mr-1" />
                  <span>Actifs</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FontAwesomeIcon icon={faStore} className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Commandes</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.totalOrders || 0}</p>
                <div className="flex items-center mt-2 text-sm text-orange-600">
                  <FontAwesomeIcon icon={faCalendarDay} className="mr-1" />
                  <span>{stats?.todayOrders || 0} aujourd'hui</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <FontAwesomeIcon icon={faBox} className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Revenus Total</p>
                <p className="text-2xl font-bold text-gray-800">{(stats?.totalRevenue || 0).toFixed(2)} DA</p>
                <div className="flex items-center mt-2 text-sm text-purple-600">
                  <FontAwesomeIcon icon={faChartLine} className="mr-1" />
                  <span>Croissance</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FontAwesomeIcon icon={faDollarSign} className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* User Type Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Clients</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.customers || 0}</p>
              </div>
              <div className="text-sm text-gray-500">
                {stats?.totalUsers > 0 ? ((stats?.customers / stats?.totalUsers) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Restaurateurs</p>
                <p className="text-2xl font-bold text-green-600">{stats?.restaurateurs || 0}</p>
              </div>
              <div className="text-sm text-gray-500">
                {stats?.totalUsers > 0 ? ((stats?.restaurateurs / stats?.totalUsers) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Livreurs</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.livreurs || 0}</p>
              </div>
              <div className="text-sm text-gray-500">
                {stats?.totalUsers > 0 ? ((stats?.livreurs / stats?.totalUsers) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition Utilisateurs</h3>
            <div className="h-48">
              <Doughnut
                data={userDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 10,
                        usePointStyle: true,
                        font: {
                          size: 11
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Orders and Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Évolution Commandes & Revenus</h3>
            <div className="h-80">
              <Line data={ordersChartData} options={chartOptions} />
            </div>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Croissance Utilisateurs</h3>
            <div className="h-80">
              <Bar 
                data={userGrowthData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
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
                        display: false,
                      },
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Popular Restaurants */}
        {analytics?.popularRestaurants && analytics.popularRestaurants.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Restaurants Populaires</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Restaurant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commandes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenus
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Panier Moyen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.popularRestaurants.slice(0, 5).map((restaurant, index) => (
                    <tr key={restaurant.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            #{index + 1} {restaurant.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {restaurant.orders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {restaurant.revenue.toFixed(2)} DA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {restaurant.avgOrderValue.toFixed(2)} DA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => window.location.href = '/admin/users'}
              className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-xl mb-2" />
              <p className="text-sm font-medium text-blue-800">Gérer Utilisateurs</p>
            </button>
            
            <button 
              onClick={() => window.location.href = '/admin/restaurants'}
              className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
            >
              <FontAwesomeIcon icon={faStore} className="text-green-600 text-xl mb-2" />
              <p className="text-sm font-medium text-green-800">Gérer Restaurants</p>
            </button>
            
            <button 
              onClick={() => window.location.href = '/admin/orders'}
              className="p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors"
            >
              <FontAwesomeIcon icon={faBox} className="text-orange-600 text-xl mb-2" />
              <p className="text-sm font-medium text-orange-800">Voir Commandes</p>
            </button>
            
            <button 
              onClick={() => window.location.href = '/admin/analytics'}
              className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
            >
              <FontAwesomeIcon icon={faChartLine} className="text-purple-600 text-xl mb-2" />
              <p className="text-sm font-medium text-purple-800">Analyses Détaillées</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage