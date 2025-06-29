import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../services/analyticsService';
import { restaurantService } from '../../services/restaurantService';
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
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [analytics, setAnalytics] = useState({
    orders: [],
    menus: [],
    items: []
  });
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState(30); // days
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [useCustomRange, setUseCustomRange] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get restaurant info
      const restaurantData = await restaurantService.getRestaurantByUserId(user.id);
      setRestaurant(restaurantData);

      if (restaurantData?.id) {
        // Prepare time range filter
        let filter;
        if (useCustomRange) {
          // Only use custom range if both dates are provided
          if (customDateRange.startDate && customDateRange.endDate) {
            filter = { start: customDateRange.startDate, end: customDateRange.endDate };
          } else {
            // If custom range is selected but dates not provided, use default
            filter = 30;
          }
        } else {
          filter = timeRange;
        }
        
        // Get analytics data with filtering
        const analyticsData = await analyticsService.getAnalytics(restaurantData.id, filter);
        setAnalytics(analyticsData);

        // Calculate statistics using the filtered data
        const orderStats = analyticsService.calculateOrderStats(analyticsData.orders);
        setStats(orderStats);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, timeRange, customDateRange, useCustomRange]);

  useEffect(() => {
    if (user?.id) {
      fetchAnalytics();
    }
  }, [user?.id, fetchAnalytics]);

  const handleCustomDateChange = (field, value) => {
    setCustomDateRange(prev => ({ ...prev, [field]: value }));
  };

  const toggleCustomRange = () => {
    setUseCustomRange(!useCustomRange);
    if (!useCustomRange) {
      // When enabling custom range, set default dates (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      setCustomDateRange({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
    } else {
      // When disabling custom range, reset to empty
      setCustomDateRange({ startDate: '', endDate: '' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Restaurant non trouvé</h2>
          <p className="text-gray-600">Aucun restaurant associé à votre compte.</p>
        </div>
      </div>
    );
  }

  // Prepare chart data with error handling
  let ordersOverTime = [];
  let popularItems = [];
  let statusDistribution = {};
  let monthlyComparison = [];

  try {
    // Since analytics.orders is already filtered, process them directly for charts
    // For ordersOverTime, we need to pass the filter info to ensure consistent date ranges
    let chartTimeRange;
    if (useCustomRange && customDateRange.startDate && customDateRange.endDate) {
      chartTimeRange = { start: customDateRange.startDate, end: customDateRange.endDate };
    } else {
      chartTimeRange = timeRange;
    }
    
    ordersOverTime = analyticsService.getOrdersByDay(analytics.orders, chartTimeRange);
    popularItems = analyticsService.getPopularItems(analytics.orders, analytics.items);
    statusDistribution = analyticsService.getOrderStatusDistribution(analytics.orders);
    monthlyComparison = analyticsService.getMonthlyComparison(analytics.orders);
    
    // Debug logging
    console.log('Analytics Debug:', {
      totalOrders: analytics.orders.length,
      ordersOverTime: ordersOverTime,
      ordersOverTimeRevenue: ordersOverTime.map(d => ({ date: d.date, revenue: d.revenue, orders: d.orders })),
      timeRange,
      useCustomRange,
      customDateRange,
      firstOrder: analytics.orders[0],
      lastOrder: analytics.orders[analytics.orders.length - 1],
      statusDistribution,
      todayDate: new Date().toISOString().split('T')[0],
      todayOrders: analytics.orders.filter(order => {
        const createdAt = order.createdAt || order.created_at;
        if (!createdAt) return false;
        const orderDate = new Date(createdAt);
        const today = new Date().toISOString().split('T')[0];
        const orderDateStr = orderDate.toISOString().split('T')[0];
        return orderDateStr === today;
      }).length,
      totalRevenue: stats?.totalRevenue,
      maxDailyRevenue: Math.max(...ordersOverTime.map(d => d.revenue || 0)),
      allOrders: analytics.orders.map(order => ({
        id: order.id,
        status: order.status,
        total_price: order.total_price,
        date: (order.createdAt || order.created_at || order.timestamp),
        dateStr: new Date(order.createdAt || order.created_at || order.timestamp).toISOString().split('T')[0]
      }))
    });
  } catch (error) {
    console.error('Error preparing chart data:', error);
    // Set default empty data
    ordersOverTime = [];
    popularItems = [];
    statusDistribution = { pending: 0, preparing: 0, confirmed: 0, ready: 0, delivering: 0, delivered: 0, completed: 0, cancelled: 0 };
    monthlyComparison = [];
  }

  // Charts configuration
  const lineChartData = {
    labels: ordersOverTime.length > 0 ? ordersOverTime.map(data => {
      try {
        return format(parseISO(data.date), 'dd MMM', { locale: fr });
      } catch {
        return data.date;
      }
    }) : [],
    datasets: [
      {
        label: 'Commandes',
        data: ordersOverTime.length > 0 ? ordersOverTime.map(data => data.orders) : [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Revenus (€)',
        data: ordersOverTime.length > 0 ? ordersOverTime.map(data => data.revenue) : [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      }
    ]
  };

  const barChartData = {
    labels: popularItems.length > 0 ? popularItems.map(item => item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name) : [],
    datasets: [
      {
        label: 'Quantité vendue',
        data: popularItems.length > 0 ? popularItems.map(item => item.count) : [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      }
    ]
  };

  const doughnutData = {
    labels: ['Livrées/Confirmées', 'En livraison', 'En attente', 'Annulées'],
    datasets: [
      {
        data: [
          statusDistribution.delivered + statusDistribution.completed + statusDistribution.confirmed,
          statusDistribution.preparing + statusDistribution.ready + statusDistribution.delivering,
          statusDistribution.pending,
          statusDistribution.cancelled
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

  const monthlyChartData = {
    labels: monthlyComparison.length > 0 ? monthlyComparison.map(data => data.month) : [],
    datasets: [
      {
        label: 'Commandes',
        data: monthlyComparison.length > 0 ? monthlyComparison.map(data => data.orders) : [],
        backgroundColor: 'rgba(139, 69, 19, 0.8)',
        borderColor: 'rgb(139, 69, 19)',
        borderWidth: 1,
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
        display: true,
        color: '#374151',
        font: {
          size: 16,
          weight: 'bold'
        }
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
            Tableau de bord - {restaurant.name}
          </h1>
          <p className="text-gray-600">
            Analyse des performances et statistiques de votre restaurant
          </p>
        </div>

        {/* Always show the interface, even with 0 data */}
        <>
          {/* Time Range Selector */}
          <div className="mb-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={toggleCustomRange}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      useCustomRange
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Période personnalisée
                  </button>
                  {!useCustomRange && [7, 30, 90, 'all'].map(days => (
                    <button
                      key={days}
                      onClick={() => setTimeRange(days)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        timeRange === days
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {days === 'all' ? 'Tout le temps' : `${days} jours`}
                    </button>
                  ))}
                </div>
                <div className={`text-sm px-3 py-2 rounded-lg ${
                  analytics.orders.length === 0 
                    ? 'text-orange-600 bg-orange-100' 
                    : 'text-gray-600 bg-gray-100'
                }`}>
                  <strong>{analytics.orders.length}</strong> commande{analytics.orders.length !== 1 ? 's' : ''} trouvée{analytics.orders.length !== 1 ? 's' : ''}
                  {useCustomRange && customDateRange.startDate && customDateRange.endDate && (
                    <span className="ml-2">
                      ({customDateRange.startDate} - {customDateRange.endDate})
                    </span>
                  )}
                  {!useCustomRange && timeRange !== 'all' && (
                    <span className="ml-2">
                      ({timeRange} derniers jours)
                    </span>
                  )}
                  {!useCustomRange && timeRange === 'all' && (
                    <span className="ml-2">(toutes périodes)</span>
                  )}
                  {analytics.orders.length === 0 && (
                    <span className="ml-2 text-sm">- Aucune donnée pour cette période</span>
                  )}
                </div>
              </div>
                
                {useCustomRange && (
                  <div className="flex space-x-4 items-center bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-600">Du :</label>
                      <input
                        type="date"
                        value={customDateRange.startDate}
                        onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-600">Au :</label>
                      <input
                        type="date"
                        value={customDateRange.endDate}
                        onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="text-sm text-gray-500">
                      {customDateRange.startDate && customDateRange.endDate ? (
                        <span className="text-green-600">✓ Période sélectionnée</span>
                      ) : (
                        <span className="text-orange-600">⚠ Sélectionnez les deux dates</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Commandes</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalOrders || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Revenus Total</p>
                  <p className="text-2xl font-bold text-gray-800">{(stats.totalRevenue || 0).toFixed(2)} €</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Revenus Mensuel</p>
                  <p className="text-2xl font-bold text-gray-800">{(stats.monthlyRevenue || 0).toFixed(2)} €</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Valeur Moyenne</p>
                  <p className="text-2xl font-bold text-gray-800">{(stats.averageOrderValue || 0).toFixed(2)} €</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Articles</p>
                  <p className="text-2xl font-bold text-gray-800">{analytics.items?.length || 0}</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Orders Over Time */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Évolution des Commandes</h3>
            <div className="h-80">
              {ordersOverTime.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-sm">Aucune donnée à afficher pour cette période</p>
                  </div>
                </div>
              ) : (
                <Line
                  data={lineChartData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        display: false
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition des Commandes</h3>
            <div className="h-80 flex items-center justify-center">
              {analytics.orders.length === 0 ? (
                <div className="text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <p className="text-sm">Aucune commande à analyser</p>
                </div>
              ) : (
                <Doughnut
                  data={doughnutData}
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
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Items */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Articles Populaires</h3>
            <div className="h-80">
              {popularItems.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-sm">Aucun article vendu pour cette période</p>
                  </div>
                </div>
              ) : (
                <Bar
                  data={barChartData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        display: false
                      }
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
              )}
            </div>
          </div>

          {/* Monthly Comparison */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Comparaison Mensuelle</h3>
            <div className="h-80">
              {monthlyComparison.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Données mensuelles insuffisantes</p>
                  </div>
                </div>
              ) : (
                <Bar
                  data={monthlyChartData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        display: false
                      }
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
              )}
            </div>
          </div>
        </div>
        </>
      </div>
    </div>
  );
};

export default AnalyticsPage;