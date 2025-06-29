import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";
import ConfirmationModal from "../../components/ConfirmationModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowLeft, 
  faCheck, 
  faTimes, 
  faClock, 
  faTruck, 
  faCheckCircle,
  faStore,
  faUser,
  faClipboardList
} from "@fortawesome/free-solid-svg-icons";
import { orderService } from "../../services/orderService";

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  // Status mapping
  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': 'En attente de validation',
      'confirmed': 'Confirmée',
      'waiting for pickup': 'En attente de récupération',
      'preparing': 'En préparation',
      'delivering': 'En livraison',
      'completed': 'Livrée',
      'cancelled': 'Annulée'
    };
    return statusMap[status] || status;
  };

  const getStatusStyle = (status) => {
    const statusStyles = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
      'waiting for pickup': 'bg-orange-100 text-orange-800 border-orange-200', 
      'preparing': 'bg-purple-100 text-purple-800 border-purple-200',
      'delivering': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return statusStyles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      
      setLoading(true);
      setError(null);
      try {
        const data = await orderService.getById(orderId);
        setOrder(data.order);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Erreur lors du chargement des détails de la commande');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleOrderAction = async (action) => {
    try {
      let response;
      switch (action) {
        case 'accept':
          response = await orderService.acceptOrder(orderId);
          break;
        case 'refuse':
          response = await orderService.refuseOrder(orderId);
          break;
        case 'preparing':
          response = await orderService.markOrderPreparing(orderId);
          break;
        case 'ready':
          response = await orderService.markOrderReady(orderId);
          break;
        case 'completed':
          response = await orderService.markOrderCompleted(orderId);
          break;
        default:
          throw new Error('Action inconnue');
      }

      // Update order status locally
      setOrder(prevOrder => ({
        ...prevOrder,
        status: response.order.status
      }));

      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Erreur lors de l'action sur la commande`);
      setShowModal(false);
    }
  };

  const showConfirmationModal = (action) => {
    const actionTexts = {
      accept: { verb: 'accepter', button: 'Accepter', class: 'bg-green-500 hover:bg-green-600', icon: faCheck, color: 'text-green-500' },
      refuse: { verb: 'refuser', button: 'Refuser', class: 'bg-red-500 hover:bg-red-600', icon: faTimes, color: 'text-red-500' },
      preparing: { verb: 'marquer en préparation', button: 'En préparation', class: 'bg-purple-500 hover:bg-purple-600', icon: faClock, color: 'text-purple-500' },
      ready: { verb: 'marquer comme prête', button: 'Prête à livrer', class: 'bg-indigo-500 hover:bg-indigo-600', icon: faTruck, color: 'text-indigo-500' },
      completed: { verb: 'marquer comme livrée', button: 'Livrée', class: 'bg-green-500 hover:bg-green-600', icon: faCheckCircle, color: 'text-green-500' }
    };
    
    const actionConfig = actionTexts[action];
    
    setModalConfig({
      title: `Confirmer l'action`,
      message: `Voulez-vous vraiment ${actionConfig.verb} la commande #${order.id} ?`,
      confirmText: actionConfig.button,
      cancelText: 'Annuler',
      onConfirm: () => handleOrderAction(action),
      confirmButtonClass: actionConfig.class,
      icon: actionConfig.icon,
      iconColor: actionConfig.color
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-2 sm:px-4 flex items-center justify-center">
        <div className="text-center text-[#ff5c5c] text-lg font-semibold animate-pulse">
          Chargement des détails de la commande...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen py-8 px-2 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => navigate('/restaurant/orders')}
            className="mb-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Retour aux commandes
          </Button>
          {error && <ErrorMessage error={error} />}
          {!order && !error && (
            <div className="text-center text-gray-500">Commande non trouvée</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-2 sm:px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            onClick={() => navigate('/restaurant/orders')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Retour
          </Button>
          <h1 className="text-2xl font-bold text-[#ff5c5c]">
            Détails de la commande #{order.id}
          </h1>
        </div>

        {/* Status and Order Number */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Statut de la commande</div>
              <span className={`px-4 py-2 rounded-full text-lg font-semibold border ${getStatusStyle(order.status)}`}>
                {getStatusDisplay(order.status)}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Numéro de commande</div>
              <div className="text-3xl font-bold text-gray-800">{order.id}</div>
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Restaurant info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#ff5c5c] rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faStore} className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Restaurant</h3>
                <p className="text-sm text-gray-500">Informations du restaurant</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-600">Nom: </span>
                <span className="text-gray-800">{order.restaurant?.name || 'Restaurant inconnu'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Adresse: </span>
                <span className="text-gray-800">{order.restaurant?.address || 'Adresse non disponible'}</span>
              </div>
            </div>
          </div>

          {/* Client info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#ff5c5c] rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Client</h3>
                <p className="text-sm text-gray-500">Informations du client</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-600">Nom: </span>
                <span className="text-gray-800">{order.user?.name || 'Client inconnu'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Adresse de livraison: </span>
                <span className="text-gray-800">{order.adress || order.address || 'Non spécifiée'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order items */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#ff5c5c] rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faClipboardList} className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Les articles à livrer</h3>
              <p className="text-sm text-gray-500">Détails de la commande</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#ff5c5c] rounded-full"></div>
                  <span className="font-medium text-gray-800">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-800">{item.price} DA</span>
              </div>
            )) || (
              <div className="text-center text-gray-500 py-4">
                Détails des articles non disponibles
              </div>
            )}
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-800">Total:</span>
              <span className="text-2xl font-bold text-[#ff5c5c]">{order.total_price} DA</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
          <div className="flex flex-wrap gap-3">
            {order.status === "pending" && (
              <>
                <Button
                  onClick={() => showConfirmationModal('accept')}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
                >
                  <FontAwesomeIcon icon={faCheck} />
                  Accepter la commande
                </Button>
                <Button
                  onClick={() => showConfirmationModal('refuse')}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Refuser la commande
                </Button>
              </>
            )}

            {order.status === "confirmed" && (
              <Button
                onClick={() => showConfirmationModal('preparing')}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
              >
                <FontAwesomeIcon icon={faClock} />
                Marquer en préparation
              </Button>
            )}

            {order.status === "waiting for pickup" && (
              <Button
                onClick={() => showConfirmationModal('preparing')}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
              >
                <FontAwesomeIcon icon={faClock} />
                Marquer en préparation
              </Button>
            )}

            {order.status === "preparing" && (
              <Button
                onClick={() => showConfirmationModal('ready')}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
              >
                <FontAwesomeIcon icon={faTruck} />
                Marquer comme prête à livrer
              </Button>
            )}

            {order.status === "delivering" && (
              <Button
                onClick={() => showConfirmationModal('completed')}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
              >
                <FontAwesomeIcon icon={faCheckCircle} />
                Marquer comme livrée
              </Button>
            )}

            {(order.status === "completed" || order.status === "cancelled") && (
              <div className="text-gray-500 py-3">
                Aucune action disponible pour cette commande.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        confirmButtonClass={modalConfig.confirmButtonClass}
        icon={modalConfig.icon}
        iconColor={modalConfig.iconColor}
      />
    </div>
  );
}
