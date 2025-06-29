import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faUsers, 
  faStore, 
  faBox, 
  faDollarSign,
  faCalendarDay,
  faArrowUp,
  faArrowDown
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

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState(30);
  const [previousAnalytics, setPreviousAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [currentData, previousData] = await Promise.all([
        adminService.getAnalytics(timeRange),
        adminService.getAnalytics(timeRange * 2) // Get double the range for comparison
      ]);
      
      setAnalytics(currentData);
      setPreviousAnalytics(previousData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return faArrowUp;
    if (growth < 0) return faArrowDown;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des analyses...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Erreur de chargement</h2>
          <p className="text-gray-600">Impossible de charger les données d'analyse.</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const ordersChartData = {
    labels: analytics.dailyStats?.map(stat => {
      const date = new Date(stat.date);
      return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
    }) || [],
    datasets: [
      {
        label: 'Commandes',
        data: analytics.dailyStats?.map(stat => stat.orders) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Revenus (DA)',
        data: analytics.dailyStats?.map(stat => stat.revenue) || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      }
    ]
  };

  const userGrowthData = {
    labels: analytics.userGrowth?.map(stat => {
      const date = new Date(stat.date);
      return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
    }) || [],
    datasets: [
      {
        label: 'Clients',
        data: analytics.userGrowth?.map(stat => stat.customers) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Restaurants',
        data: analytics.userGrowth?.map(stat => stat.restaurants) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
      {
        label: 'Livreurs',
        data: analytics.userGrowth?.map(stat => stat.deliveries) || [],
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
      }
    ]
  };

  const orderStatusData = {
    labels: ['Terminées', 'En cours', 'En attente', 'Annulées'],
    datasets: [
      {
        data: [
          analytics.revenueAnalytics?.completedOrders || 0,
          (analytics.revenueAnalytics?.statusDistribution?.preparing || 0) + 
          (analytics.revenueAnalytics?.statusDistribution?.ready || 0) + 
          (analytics.revenueAnalytics?.statusDistribution?.delivering || 0),
          analytics.revenueAnalytics?.pendingOrders || 0,
          analytics.revenueAnalytics?.cancelledOrders || 0
        ],
        backgroundColor: [
          '#10B981', // Green
          '#F59E0B', // Yellow
          '#3B82F6', // Blue
          '#EF4444'  // Red
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
            Analyses et Indicateurs KPI
          </h1>
          <p className="text-gray-600">
            Tableau de bord analytique de la plateforme Yumzo
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {[7, 30, 90, 365].map(days => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === days
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {days === 365 ? '1 an' : `${days} jours`}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Utilisateurs Actifs</p>
                <p className="text-2xl font-bold text-gray-800">{analytics.totalUsers}</p>
                <div className="flex items-center mt-2 text-sm">
                  <FontAwesomeIcon 
                    icon={getGrowthIcon(5)} 
                    className="text-green-600 mr-1" 
                  />
                  <span className="text-green-600">+5% ce mois</span>
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
                <p className="text-sm font-medium text-gray-600 mb-1">Commandes Totales</p>
                <p className="text-2xl font-bold text-gray-800">{analytics.totalOrders}</p>
                <div className="flex items-center mt-2 text-sm">
                  <FontAwesomeIcon 
                    icon={faCalendarDay} 
                    className="text-orange-600 mr-1" 
                  />
                  <span className="text-orange-600">
                    {analytics.dailyStats?.reduce((sum, day) => sum + day.orders, 0) || 0} sur {timeRange} jours
                  </span>
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
                <p className="text-sm font-medium text-gray-600 mb-1">Revenus Totaux</p>
                <p className="text-2xl font-bold text-gray-800">{analytics.totalRevenue?.toFixed(2)} DA</p>
                <div className="flex items-center mt-2 text-sm">
                  <FontAwesomeIcon 
                    icon={faArrowUp} 
                    className="text-green-600 mr-1" 
                  />
                  <span className="text-green-600">
                    {analytics.revenueAnalytics?.avgOrderValue?.toFixed(2)} DA/commande
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FontAwesomeIcon icon={faDollarSign} className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Taux de Conversion</p>
                <p className="text-2xl font-bold text-gray-800">
                  {analytics.revenueAnalytics?.completedOrders && analytics.totalOrders
                    ? ((analytics.revenueAnalytics.completedOrders / analytics.totalOrders) * 100).toFixed(1)
                    : 0
                  }%
                </p>
                <div className="flex items-center mt-2 text-sm">
                  <span className="text-purple-600">
                    {analytics.revenueAnalytics?.completedOrders || 0} commandes terminées
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FontAwesomeIcon icon={faChartLine} className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Orders and Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Évolution Commandes & Revenus</h3>
            <div className="h-80">
              <Line data={ordersChartData} options={chartOptions} />
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition des Commandes</h3>
            <div className="h-80">
              <Doughnut
                data={orderStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Croissance des Utilisateurs par Type</h3>
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

        {/* Popular Restaurants */}
        {analytics.popularRestaurants && analytics.popularRestaurants.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 10 Restaurants</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rang
                    </th>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.popularRestaurants.map((restaurant, index) => (
                    <tr key={restaurant.id} className={index < 3 ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {restaurant.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faBox} className="text-gray-400 mr-2" />
                          {restaurant.orders}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faDollarSign} className="text-green-600 mr-2" />
                          {restaurant.revenue.toFixed(2)} DA
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {restaurant.avgOrderValue.toFixed(2)} DA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${Math.min((restaurant.orders / analytics.popularRestaurants[0].orders) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {((restaurant.orders / analytics.popularRestaurants[0].orders) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Résumé des Performances</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Commandes terminées:</span>
                <span className="font-medium">{analytics.revenueAnalytics?.completedOrders || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Commandes annulées:</span>
                <span className="font-medium text-red-600">{analytics.revenueAnalytics?.cancelledOrders || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taux de succès:</span>
                <span className="font-medium text-green-600">
                  {analytics.totalOrders > 0 
                    ? ((analytics.revenueAnalytics?.completedOrders / analytics.totalOrders) * 100).toFixed(1)
                    : 0
                  }%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Revenus</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Revenus totaux:</span>
                <span className="font-medium">{analytics.totalRevenue?.toFixed(2)} DA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Revenus moyens/jour:</span>
                <span className="font-medium">
                  {analytics.dailyStats?.length > 0 
                    ? (analytics.totalRevenue / analytics.dailyStats.length).toFixed(2)
                    : 0
                  } DA
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Panier moyen:</span>
                <span className="font-medium text-blue-600">
                  {analytics.revenueAnalytics?.avgOrderValue?.toFixed(2) || 0} DA
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Utilisateurs</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total utilisateurs:</span>
                <span className="font-medium">{analytics.totalUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Restaurants:</span>
                <span className="font-medium text-green-600">{analytics.totalRestaurants}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nouveaux (période):</span>
                <span className="font-medium text-blue-600">
                  {analytics.userGrowth?.reduce((sum, day) => sum + day.newUsers, 0) || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
