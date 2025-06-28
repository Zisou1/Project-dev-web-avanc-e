import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import SearchBar from "../../components/SearchBar";
import DataTable from "../../components/DataTable";
import ErrorMessage from "../../components/ErrorMessage";
import FilterButton from "../../components/FilterButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEye, 
  faClockRotateLeft,
  faCalendarAlt,
  faChartLine
} from "@fortawesome/free-solid-svg-icons";
import { orderService } from "../../services/orderService";
import { restaurantService } from "../../services/restaurantService";

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [restaurant, setRestaurant] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0
  });

  // Status mapping function
  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': 'En attente de validation',
      'confirmed': 'Confirmée',
      'waiting for pickup': 'En attente de récupération',
      'product pickedup': 'Produit récupéré',
      'confirmed by delivery': 'Confirmée par le livreur',
      'confirmed by client': 'Confirmée par le client',
      'cancelled': 'Annulée',
      'completed': 'Terminée'
    };
    return statusMap[status] || status;
  };

  // Status style function
  const getStatusStyle = (status) => {
    const statusStyles = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800', 
      'waiting for pickup': 'bg-orange-100 text-orange-800',
      'product pickedup': 'bg-purple-100 text-purple-800',
      'confirmed by delivery': 'bg-indigo-100 text-indigo-800',
      'confirmed by client': 'bg-teal-100 text-teal-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return statusStyles[status] || 'bg-gray-100 text-gray-800';
  };

  // Get restaurant data
  useEffect(() => {
    const fetchRestaurant = async () => {
      if (user && user.role === 'restaurant') {
        try {
          const restaurantData = await restaurantService.getRestaurantByUserId(user.id);
          setRestaurant(restaurantData);
        } catch (err) {
          console.error('Error fetching restaurant:', err);
        }
      }
    };
    fetchRestaurant();
  }, [user]);

  // Fetch orders when restaurant is loaded
  useEffect(() => {
    const fetchOrders = async () => {
      if (!restaurant?.id) return;
      
      setLoading(true);
      setError(null);
      try {
        const data = await orderService.getRestaurantOrders(restaurant.id);
        const allOrders = data.orders || [];
        
        // Filter to show only completed and cancelled orders for history
        const historyOrders = allOrders.filter(order => 
          ['completed', 'cancelled'].includes(order.status)
        );
        
        setOrders(historyOrders);
        
        // Calculate stats
        const stats = {
          total: historyOrders.length,
          completed: historyOrders.filter(o => o.status === 'completed').length,
          cancelled: historyOrders.filter(o => o.status === 'cancelled').length,
          totalRevenue: historyOrders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + (o.total_price || 0), 0)
        };
        setStats(stats);
        
        // Show service unavailable message if present
        if (data.error) {
          setError(data.error);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Erreur lors du chargement de l\'historique des commandes');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [restaurant]);

  // Filter fields config
  const filterFields = [
    { key: "customerName", label: "Nom du client", type: "text", placeholder: "Nom du client..." },
    { key: "status", label: "Statut", type: "select", 
      options: [
        { value: "", label: "Tous les statuts" },
        { value: "completed", label: "Livrée" },
        { value: "cancelled", label: "Annulée" }
      ]
    },
    { key: "totalAmount", label: "Montant", type: "range", placeholderMin: "Min DA", placeholderMax: "Max DA" },
    { key: "date", label: "Date", type: "date" },
  ];

  // Filtering logic
  const filteredOrders = orders.filter((order) => {
    const customerName = order.user?.name || 'Client inconnu';
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toString().includes(searchTerm);
    
    const matchesName = !filters.customerName || customerName.toLowerCase().includes(filters.customerName.toLowerCase());
    const matchesStatus = !filters.status || order.status === filters.status;
    
    const minAmount = filters.totalAmount_min ? parseFloat(filters.totalAmount_min) : null;
    const maxAmount = filters.totalAmount_max ? parseFloat(filters.totalAmount_max) : null;
    const matchesAmount = (minAmount === null || order.total_price >= minAmount) &&
                         (maxAmount === null || order.total_price <= maxAmount);
    
    const matchesDate = !filters.date || (order.createdAt && 
      new Date(order.createdAt).toDateString() === new Date(filters.date).toDateString());
    
    return matchesSearch && matchesName && matchesStatus && matchesAmount && matchesDate;
  });

  // Format orders for display
  const formattedOrders = filteredOrders.map(order => ({
    ...order,
    createdAt: order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : 'N/A',
    formattedAmount: `${order.total_price} DA`,
    displayStatus: getStatusDisplay(order.status),
    customerName: order.user?.name || 'Client inconnu',
    orderDetails: order.items?.map(item => item.name).join(', ') || 'Détails non disponibles'
  }));

  // Table columns config
  const columns = [
    { key: "id", label: "ID commande" },
    { key: "createdAt", label: "Date" },
    { key: "customerName", label: "Client" },
    { key: "orderDetails", label: "Articles" },
    { key: "formattedAmount", label: "Montant" },
    { key: "displayStatus", label: "Statut" },
  ];

  // Order Actions Component
  function OrderActions({ order }) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={() => navigate(`/restaurant/orders/history/${order.id}/detail`)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
        >
          <FontAwesomeIcon icon={faEye} className="mr-1" />
          Voir
        </Button>
        {order.status === 'completed' && (
          <Button
            onClick={() => navigate(`/restaurant/orders/${order.id}/tracking`)}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
          >
            Suivi
          </Button>
        )}
      </div>
    );
  }

  // Table actions
  const tableActions = (order) => <OrderActions order={order} />;

  if (!restaurant) {
    return (
      <div className="min-h-screen py-8 px-2 sm:px-4 flex items-center justify-center">
        <div className="text-center text-gray-500">
          Chargement des données du restaurant...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-2 sm:px-4 relative text-[0.97rem]">
      <div className="full-width mx-auto bg-white rounded-2xl p-6 sm:p-10 border border-[#ffe3e3]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-extrabold text-[#ff5c5c] tracking-tight mb-0 flex items-center gap-2">
            <FontAwesomeIcon icon={faClockRotateLeft} className="text-[#ff5c5c]" />
            <span className="inline-block bg-[#ffedea] rounded-full px-3 py-1 text-[#ff5c5c] text-base font-semibold shadow-sm">
              Historique des commandes
            </span>
          </h2>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faChartLine} className="text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-blue-600">Total commandes</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faEye} className="text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-green-600">Livrées</div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                <div className="text-sm text-red-600">Annulées</div>
              </div>
            </div>
          </div>

          <div className="bg-[#ffedea] border border-[#ffb3a7] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#ff5c5c] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">DA</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#ff5c5c]">{stats.totalRevenue}</div>
                <div className="text-sm text-[#ff5c5c]">Chiffre d'affaires</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center gap-2 mb-5 w-full relative">
          <FilterButton 
            fields={filterFields} 
            onApply={setFilters} 
            iconColor="#ff5c5c" 
            buttonClassName="bg-[#ff5c5c] hover:bg-[#ff7e7e] text-white font-bold px-4 py-2 rounded-full shadow transition border-2 border-[#ffb3a7] focus:ring-2 focus:ring-[#ffb3a7] focus:outline-none"
          />
          <div className="flex-1">
            <SearchBar query={searchTerm} setQuery={setSearchTerm} placeholder="Rechercher par client ou ID commande..." />
          </div>
        </div>

        <hr className="border-[#ffd6d6] mb-2" />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-6 text-[#ff5c5c] text-lg font-semibold animate-pulse">
            Chargement de l'historique...
          </div>
        )}

        {/* Error State */}
        {error && <ErrorMessage error={error} />}

        {/* Desktop Table */}
        <div className="hidden sm:block">
          <DataTable 
            columns={columns} 
            data={formattedOrders} 
            actions={tableActions} 
            className="rounded-xl overflow-hidden shadow border border-[#ffe3e3] bg-white"
            rowClassName="hover:bg-[#fff0f0] transition cursor-pointer"
            headerClassName="bg-[#ffedea] text-[#ff5c5c] text-base font-bold"
          />
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden mt-4">
          {formattedOrders.length === 0 && !loading ? (
            <div className="text-center text-gray-500 py-6">Aucune commande dans l'historique.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {formattedOrders.map(order => (
                <div key={order.id} className="bg-white rounded-xl shadow border border-[#ffe3e3] p-4 flex flex-col gap-3">
                  {/* Header with ID, Customer and Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-[#f0f0f0] text-gray-600 px-2 py-1 rounded text-xs font-medium">
                          ID: {order.id}
                        </span>
                        <span className="bg-[#f0f0f0] text-gray-600 px-2 py-1 rounded text-xs font-medium">
                          {order.createdAt}
                        </span>
                      </div>
                      <div className="font-bold text-[#ff5c5c] text-lg leading-tight break-words">
                        {order.customerName}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {tableActions(order)}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="text-gray-700 text-sm leading-relaxed">
                    <span className="font-medium text-gray-800">Articles: </span>
                    {order.orderDetails}
                  </div>

                  {/* Amount and Status */}
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium text-sm">Montant:</span>
                      <span className="bg-[#ffedea] text-[#ff5c5c] px-3 py-1 rounded-full text-sm font-bold">
                        {order.formattedAmount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium text-sm">Statut:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(order.status)}`}>
                        {getStatusDisplay(order.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
