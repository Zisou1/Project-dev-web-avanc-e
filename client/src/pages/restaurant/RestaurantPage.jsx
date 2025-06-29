import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { restaurantService } from '../../services/restaurantService'
import { orderService } from '../../services/orderService'
import { itemService } from '../../services/itemService'
import InfoCard from '../../components/InfoCard'
import DataTable from '../../components/DataTable'

function RestaurantPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [restaurant, setRestaurant] = useState(null)
  const [stats, setStats] = useState({
    todayOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    dailyRevenue: 0,
    activeArticles: 0,
    activeMenus: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      await fetchRestaurantData()
    }
    
    if (user?.id) {
      fetchData()
    }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRestaurantData = async () => {
    try {
      setLoading(true)
      if (!user?.id) {
        console.log('❌ No user ID found')
        return
      }

      console.log('👤 Fetching data for user:', user.id)

      // Get restaurant data
      console.log('🏪 Fetching restaurant data...')
      const restaurantData = await restaurantService.getRestaurantByUserId(user.id)
      console.log('🏪 Restaurant data:', restaurantData)
      
      if (!restaurantData) {
        setError('Restaurant non trouvé')
        return
      }
      setRestaurant(restaurantData)

      // Get orders for this restaurant
      console.log('📋 Fetching orders for restaurant:', restaurantData.id)
      let orders = []
      try {
        const ordersData = await orderService.getOrdersByRestaurant(restaurantData.id)
        console.log('📋 Orders data received:', ordersData)
        console.log('📋 Orders array:', ordersData.orders)
        console.log('📋 Orders array length:', ordersData.orders?.length)
        orders = ordersData.orders || []
        if (orders.length === 0) {
          console.log('📋 No orders found for restaurant', restaurantData.id)
        }
      } catch (ordersErr) {
        console.error('⚠️ Error fetching orders:', ordersErr)
        console.error('⚠️ Error details:', {
          message: ordersErr.message,
          response: ordersErr.response?.data,
          status: ordersErr.response?.status
        })
        // Continue with empty orders array
      }
        
      // Get items for this restaurant
      console.log('📦 Fetching items for restaurant:', restaurantData.id)
      let items = []
      try {
        const itemsData = await itemService.getRestaurantItems(restaurantData.id)
        console.log('📦 Items data:', itemsData)
        items = itemsData.items || []
      } catch (itemsErr) {
        console.error('⚠️ Error fetching items (continuing with empty items):', itemsErr)
        // Continue with empty items array
      }

        // Calculate statistics
        const today = new Date()
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        
        console.log('📊 Calculating stats with:', {
          totalOrders: orders.length,
          sampleOrder: orders[0],
          todayStart: todayStart.toISOString()
        })
        
        const todayOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt || order.created_at)
          return orderDate >= todayStart
        })
        
        const pendingOrders = orders.filter(order => 
          order.status === 'pending' || order.status === 'confirmed'
        )
        
        const completedOrders = orders.filter(order => 
          order.status === 'completed' || order.status === 'delivered'
        )
        
        const dailyRevenue = todayOrders.reduce((sum, order) => 
          sum + (order.total_price || order.totalPrice || order.total || 0), 0
        )

        console.log('📊 Calculated stats:', {
          todayOrders: todayOrders.length,
          pendingOrders: pendingOrders.length,
          completedOrders: completedOrders.length,
          dailyRevenue
        })

        setStats({
          todayOrders: todayOrders.length,
          pendingOrders: pendingOrders.length,
          completedOrders: completedOrders.length,
          dailyRevenue: dailyRevenue,
          activeArticles: items.filter(item => item.status === 'available' || item.status === true).length,
          activeMenus: 0 // You can implement menu counting later
        })

        // Set recent orders (last 5)
        const sortedOrders = orders
          .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))
          .slice(0, 5)
          .map(order => ({
            id: order.id,
            customer: order.user?.name || order.user?.username || order.customer_name || 'Client inconnu',
            amount: order.total_price || order.totalPrice || order.total || 0,
            time: new Date(order.createdAt || order.created_at).toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            status: order.status,
            createdAt: order.createdAt || order.created_at
          }))
        
        console.log('📋 Recent orders processed:', sortedOrders)
        
        setRecentOrders(sortedOrders)

    } catch (err) {
      console.error('Erreur lors du chargement des données:', err)
      setError('Erreur lors du chargement des données: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'text-orange-600'
      case 'preparing': return 'text-blue-600'
      case 'ready': return 'text-green-600'
      case 'completed': return 'text-gray-600'
      case 'delivered': return 'text-green-700'
      default: return 'text-gray-500'
    }
  }

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'En attente'
      case 'preparing': return 'En préparation'
      case 'ready': return 'Prêt'
      case 'completed': return 'Terminé'
      case 'delivered': return 'Livré'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto p-6 sm:p-8">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erreur de chargement</h2>
          <p className="text-red-600 text-sm mb-4 break-words">{error}</p>
          <div className="space-y-2">
            <button 
              onClick={fetchRestaurantData}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Réessayer
            </button>
            <p className="text-xs text-gray-500">
              Si le problème persiste, vérifiez votre connexion ou contactez le support.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* Restaurant Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 break-words">
              Restaurant: {restaurant?.name || 'Mon Restaurant'}
            </h1>
            <div className="flex items-start text-gray-600">
              <span className="text-red-500 mr-2 mt-0.5">📍</span>
              <span className="text-sm sm:text-base break-words">
                {restaurant?.address || 'Adresse non définie'}
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-6 w-full lg:w-auto">
            <InfoCard 
              label="Articles actifs" 
              value={stats.activeArticles} 
              valueClass="text-blue-600"
            />
            <InfoCard 
              label="Menus actifs" 
              value={stats.activeMenus} 
              valueClass="text-green-600"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Commandes du jour
            </h3>
            <span className="text-xl sm:text-2xl">📊</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{stats.todayOrders}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Commandes en attente
            </h3>
            <span className="text-xl sm:text-2xl">⏳</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2 animate-pulse">{stats.pendingOrders}</div>
          <button 
            onClick={() => navigate('/restaurant/orders')}
            className="bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-red-600 transition-colors w-full sm:w-auto"
          >
            Voir les commandes
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Commandes terminées
            </h3>
            <span className="text-xl sm:text-2xl">✅</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">{stats.completedOrders}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Revenus du jour
            </h3>
            <span className="text-xl sm:text-2xl">💰</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">{stats.dailyRevenue} DA</div>
        </div>
      </div>

      {/* Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 order-2 xl:order-1">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Commandes récentes</h3>
            <button 
              onClick={() => navigate('/restaurant/orders')}
              className="text-red-500 hover:text-red-600 font-semibold text-sm self-start sm:self-auto"
            >
              Voir tout
            </button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-2 sm:gap-0">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 text-sm sm:text-base">{order.customer}</div>
                    <div className="text-xs sm:text-sm text-gray-500">{order.time}</div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                    <div className="font-bold text-blue-600 text-sm sm:text-base">{order.amount} DA</div>
                    <div className={`text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full whitespace-nowrap ${getStatusColor(order.status)} bg-gray-100`}>
                      {getStatusText(order.status)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucune commande récente
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 order-1 xl:order-2">
          <div className="mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Actions rapides</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button 
              onClick={() => navigate('/restaurant/items/add')}
              className="flex flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-200 hover:shadow-md"
            >
              <span className="text-2xl sm:text-3xl mb-2">➕</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 text-center">Ajouter un article</span>
            </button>
            <button 
              onClick={() => navigate('/restaurant/orders')}
              className="flex flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl hover:from-red-100 hover:to-red-200 transition-all duration-200 hover:shadow-md"
            >
              <span className="text-2xl sm:text-3xl mb-2">📋</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 text-center">Voir commandes</span>
            </button>
            <button 
              onClick={() => navigate('/restaurant/menus')}
              className="flex flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-200 hover:shadow-md"
            >
              <span className="text-2xl sm:text-3xl mb-2">📖</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 text-center">Gérer les menus</span>
            </button>
            <button 
              onClick={() => navigate('/restaurant/stats')}
              className="flex flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-200 hover:shadow-md"
            >
              <span className="text-2xl sm:text-3xl mb-2">📊</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 text-center">Statistiques</span>
            </button>
          </div>
        </div>
        
   
      </div>

      {/* Recent Orders Table - Hidden on mobile for better UX */}
      {recentOrders.length > 0 && (
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">5 dernières commandes</h3>
          <div className="overflow-x-auto">
            <DataTable
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'customer', label: 'Client' },
                { key: 'amount', label: 'Montant (DA)' },
                { key: 'time', label: 'Heure' },
                { key: 'status', label: 'Statut' }
              ]}
              data={recentOrders.slice(0, 5).map(order => ({
                ...order,
                status: getStatusText(order.status)
              }))}
              actions={(row) => (
                <button
                  onClick={() => navigate(`/restaurant/orders/${row.id}/tracking`)}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Voir
                </button>
              )}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default RestaurantPage