import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import SearchBar from "../../components/SearchBar";
import DataTable from "../../components/DataTable";
import ErrorMessage from "../../components/ErrorMessage";
import ConfirmationModal from "../../components/ConfirmationModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faClock, faTruck, faCheckCircle, faEye } from "@fortawesome/free-solid-svg-icons";
import FilterButton from "../../components/FilterButton";
import { orderService } from "../../services/orderService";
import { restaurantService } from "../../services/restaurantService";
import { useNavigate } from "react-router-dom";

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [filters, setFilters] = useState({});
  const [restaurant, setRestaurant] = useState(null);

  // Status mapping function
  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': 'En attente de validation',
      'confirmed': 'Confirmée',
      'preparing': 'En préparation',
      'waiting for pickup': 'En attente de récupération',
      'product pickedup': 'Produit récupéré',
      'confirmed by delivery': 'Confirmée par le livreur',
      'confirmed by client': 'Confirmée par le client',
      'delivering': 'En livraison',
      'cancelled': 'Annulée',
      'completed': 'Terminée'
    };
    return statusMap[status] || status;
  };

  // Status style function
  const getStatusStyle = (status) => {
    const statusStyles = {
      'pending': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'confirmed': 'bg-blue-100 text-blue-800 border border-blue-200',
      'preparing': 'bg-orange-100 text-orange-800 border border-orange-200',
      'waiting for pickup': 'bg-orange-100 text-orange-800 border border-orange-200',
      'product pickedup': 'bg-purple-100 text-purple-800 border border-purple-200',
      'confirmed by delivery': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      'delivering': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      'confirmed by client': 'bg-teal-100 text-teal-800 border border-teal-200',
      'completed': 'bg-green-100 text-green-800 border border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border border-red-200'
    };
    return statusStyles[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  // Get tracking info based on status
  function getTrackingInfo(status) {
    const statusOrder = [
      'pending', 
      'confirmed', 
      'preparing',
      'waiting for pickup', 
      'product pickedup', 
      'confirmed by delivery',
      'delivering',
      'confirmed by client', 
      'completed'
    ];
    
    let currentIndex = statusOrder.indexOf(status);
    
    // Handle legacy 'delivering' status by mapping it to the appropriate position
    if (status === 'delivering') {
      currentIndex = statusOrder.indexOf('confirmed by delivery');
    }
    
    const progress = status === 'cancelled' ? 0 : Math.max(0, ((currentIndex + 1) / statusOrder.length) * 100);
    
    return (
      <div className="flex items-center gap-2">
        <div className="w-24 bg-gray-200 rounded-full h-3 shadow-inner">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              status === 'cancelled' 
                ? 'bg-red-500' 
                : status === 'completed'
                  ? 'bg-green-500'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="text-xs font-medium text-gray-600 min-w-[35px]">{Math.round(progress)}%</span>
      </div>
    );
  }

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
        setOrders(data.orders || []);
        
        if (data.error) {
          setError(data.error);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Erreur lors du chargement des commandes');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [restaurant]);

  // Filter fields for the filter component
  const filterFields = [
    {
      key: 'status',
      label: 'Statut',
      type: 'select',
      options: [
        { value: 'pending', label: 'En attente' },
        { value: 'confirmed', label: 'Confirmée' },
        { value: 'preparing', label: 'En préparation' },
        { value: 'waiting for pickup', label: 'En attente de récupération' },
        { value: 'product pickedup', label: 'Produit récupéré' },
        { value: 'confirmed by delivery', label: 'Confirmée par le livreur' },
        { value: 'delivering', label: 'En livraison' },
        { value: 'completed', label: 'Terminée' },
        { value: 'cancelled', label: 'Annulée' }
      ]
    },
    {
      key: 'customerName',
      label: 'Nom du client',
      type: 'text'
    },
    {
      key: 'minAmount',
      label: 'Montant minimum',
      type: 'number'
    },
    {
      key: 'maxAmount',
      label: 'Montant maximum',
      type: 'number'
    }
  ];

  // Filter orders based on search term and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.id.toString().includes(searchTerm.toLowerCase()) ||
      (order.user?.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesName = !filters.customerName || 
      (order.user?.name && order.user.name.toLowerCase().includes(filters.customerName.toLowerCase()));
    
    const matchesStatus = !filters.status || order.status === filters.status;
    
    const minAmount = filters.minAmount ? parseFloat(filters.minAmount) : null;
    const maxAmount = filters.maxAmount ? parseFloat(filters.maxAmount) : null;
    const matchesAmount = (minAmount === null || order.total_price >= minAmount) &&
                         (maxAmount === null || order.total_price <= maxAmount);
    
    return matchesSearch && matchesName && matchesStatus && matchesAmount;
  });

  // Format orders for display
  const formattedOrders = filteredOrders.map(order => ({
    ...order,
    createdAt: order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : 'N/A',
    formattedAmount: `${order.total_price} DA`,
    displayStatus: getStatusDisplay(order.status),
    customerName: order.user?.name || 'Client inconnu',
    orderDetails: order.items?.map(item => item.name).join(', ') || 'Détails non disponibles',
    tracking: getTrackingInfo(order.status)
  }));

  // Order status change handlers
  const handleOrderAction = async (orderId, action) => {
    try {
      let response;
      let newStatus;
      
      switch (action) {
        case 'accept':
          response = await orderService.acceptOrder(orderId);
          newStatus = response.order?.status || 'confirmed';
          break;
        case 'refuse':
          response = await orderService.refuseOrder(orderId);
          newStatus = response.order?.status || 'cancelled';
          break;
        case 'ready_pickup':
          response = await orderService.updateOrderStatus(orderId, 'waiting for pickup');
          newStatus = 'waiting for pickup';
          break;
        case 'picked_up':
          response = await orderService.updateOrderStatus(orderId, 'product pickedup');
          newStatus = 'product pickedup';
          break;
        case 'confirm_delivery':
          response = await orderService.updateOrderStatus(orderId, 'confirmed by delivery');
          newStatus = 'confirmed by delivery';
          break;
        case 'complete':
          response = await orderService.updateOrderStatus(orderId, 'completed');
          newStatus = 'completed';
          break;
        default:
          throw new Error('Action inconnue');
      }

      // Update orders list
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );

      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Erreur lors de l'action sur la commande`);
      setShowModal(false);
    }
  };

  const showConfirmationModal = (order, action) => {
    const actionTexts = {
      accept: { verb: 'accepter', button: 'Accepter', class: 'bg-green-500 hover:bg-green-600', icon: faCheck, color: 'text-green-500' },
      refuse: { verb: 'refuser', button: 'Refuser', class: 'bg-red-500 hover:bg-red-600', icon: faTimes, color: 'text-red-500' },
      ready_pickup: { verb: 'marquer prête pour récupération', button: 'Prêt pour récupération', class: 'bg-orange-500 hover:bg-orange-600', icon: faClock, color: 'text-orange-500' },
      picked_up: { verb: 'marquer comme récupérée', button: 'Produit récupéré', class: 'bg-purple-500 hover:bg-purple-600', icon: faTruck, color: 'text-purple-500' },
      confirm_delivery: { verb: 'confirmer la livraison', button: 'Confirmer livraison', class: 'bg-indigo-500 hover:bg-indigo-600', icon: faCheckCircle, color: 'text-indigo-500' },
      complete: { verb: 'marquer comme terminée', button: 'Terminer', class: 'bg-green-500 hover:bg-green-600', icon: faCheckCircle, color: 'text-green-500' }
    };
    
    const actionConfig = actionTexts[action];
    
    setModalConfig({
      title: `Confirmer l'action`,
      message: `Voulez-vous vraiment ${actionConfig.verb} la commande #${order.id} ?`,
      confirmText: actionConfig.button,
      cancelText: 'Annuler',
      onConfirm: () => handleOrderAction(order.id, action),
      onCancel: () => setShowModal(false),
      confirmClass: actionConfig.class,
      icon: actionConfig.icon,
      iconColor: actionConfig.color
    });
    setShowModal(true);
  };

  // Table columns config
  const columns = [
    { key: "id", label: "ID commande" },
    { key: "customerName", label: "Client" },
    { key: "orderDetails", label: "Détail de commandes" },
    { key: "formattedAmount", label: "Montant de la commande" },
    { key: "displayStatus", label: "Statut de la commande" },
    { key: "tracking", label: "Suivi" }
  ];

  // Order Actions Component
  function OrderActions({ order }) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          onClick={() => navigate(`/restaurant/orders/${order.id}/tracking`)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1"
        >
          <FontAwesomeIcon icon={faEye} className="text-xs" />
          Suivi
        </Button>
        
        {order.status === "pending" && (
          <>
            <Button
              onClick={() => showConfirmationModal(order, 'accept')}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm"
            >
              Accepter
            </Button>
            <Button
              onClick={() => showConfirmationModal(order, 'refuse')}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm"
            >
              Refuser
            </Button>
          </>
        )}

        {(order.status === "confirmed" || order.status === "preparing") && (
          <Button
            onClick={() => showConfirmationModal(order, 'ready_pickup')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded text-sm"
          >
            Prêt
          </Button>
        )}

        {order.status === "waiting for pickup" && (
          <Button
            onClick={() => showConfirmationModal(order, 'picked_up')}
            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded text-sm"
          >
            Récupéré
          </Button>
        )}

        {order.status === "product pickedup" && (
          <Button
            onClick={() => showConfirmationModal(order, 'confirm_delivery')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded text-sm"
          >
            Livraison
          </Button>
        )}

        {(order.status === "confirmed by delivery" || order.status === "delivering") && (
          <Button
            onClick={() => showConfirmationModal(order, 'complete')}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm"
          >
            Terminer
          </Button>
        )}
      </div>
    );
  }

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
    <div className="min-h-screen py-6 px-3 sm:px-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Modern Header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des commandes</h1>
              <p className="text-gray-600">Gérez toutes vos commandes actives en temps réel</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-500">Restaurant</div>
                <div className="font-semibold text-[#ff5c5c]">{restaurant?.name}</div>
              </div>
              <Button
                onClick={() => navigate('/restaurant/orders/history')}
                className="bg-[#ff5c5c] hover:bg-[#ff4444] text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
              >
                📊 Historique
              </Button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-gray-200">
          <div className="flex items-center gap-4 w-full">
            <FilterButton 
              fields={filterFields} 
              onApply={setFilters} 
              iconColor="#ff5c5c" 
              buttonClassName="bg-gradient-to-r from-[#ff5c5c] to-[#ff7e7e] hover:from-[#ff4444] hover:to-[#ff6666] text-white font-medium px-6 py-3 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 border-0"
            />
            <div className="flex-1">
              <SearchBar 
                query={searchTerm} 
                setQuery={setSearchTerm} 
                placeholder="🔍 Rechercher par client ou ID commande..." 
                className="border-2 border-gray-200 focus:border-[#ff5c5c] rounded-xl py-3 px-4 text-gray-700 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-200">
            <div className="text-center text-[#ff5c5c] text-lg font-semibold animate-pulse flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-3 border-[#ff5c5c] border-t-transparent rounded-full animate-spin"></div>
              Chargement des commandes...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-red-200">
            <ErrorMessage error={error} />
          </div>
        )}

        {/* Orders Content */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Stats Bar */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#ff5c5c]">{formattedOrders.length}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {formattedOrders.filter(o => o.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">En attente</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formattedOrders.filter(o => ['confirmed', 'preparing', 'waiting for pickup'].includes(o.status)).length}
                  </div>
                  <div className="text-sm text-gray-600">En cours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formattedOrders.filter(o => ['product pickedup', 'confirmed by delivery', 'delivering'].includes(o.status)).length}
                  </div>
                  <div className="text-sm text-gray-600">En livraison</div>
                </div>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block p-6">
              {formattedOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune commande trouvée</h3>
                  <p className="text-gray-500">Aucune commande ne correspond à vos critères de recherche.</p>
                </div>
              ) : (
                <DataTable 
                  columns={columns} 
                  data={formattedOrders} 
                  actions={tableActions} 
                  className="rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white"
                  rowClassName="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100"
                  headerClassName="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-semibold text-sm uppercase tracking-wide"
                />
              )}
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden p-4">
              {formattedOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune commande</h3>
                  <p className="text-gray-500 text-sm">Aucune commande trouvée.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formattedOrders.map(order => (
                    <div key={order.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all duration-200">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900">Commande #{order.id}</h3>
                          <p className="text-sm text-gray-600">{order.customerName}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                          {order.displayStatus}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-3 mb-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Articles: </span>
                          <span className="text-sm text-gray-800">{order.orderDetails}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Montant:</span>
                          <span className="font-bold text-[#ff5c5c]">{order.formattedAmount}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 block mb-2">Progression:</span>
                          {order.tracking}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-gray-200">
                        <OrderActions order={order} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <ConfirmationModal
          title={modalConfig.title}
          message={modalConfig.message}
          confirmText={modalConfig.confirmText}
          cancelText={modalConfig.cancelText}
          onConfirm={modalConfig.onConfirm}
          onCancel={modalConfig.onCancel}
          confirmClass={modalConfig.confirmClass}
          icon={modalConfig.icon}
          iconColor={modalConfig.iconColor}
        />
      )}
    </div>
  );
}
