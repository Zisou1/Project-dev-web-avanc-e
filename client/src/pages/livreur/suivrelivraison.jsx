import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";
import OrderTrackingStepper from "../../components/OrderTrackingStepper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowLeft, 
  faStore,
  faUser,
  faClipboardList,
  faMapMarkerAlt
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { deliveryService } from "../../services/deliveryService";
import { orderService } from "../../services/orderService";

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [delivery, setDelivery] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [toast, setToast] = useState("");
  const [deliveryId, setDeliveryId] = useState(null); // Add delivery ID state

  // Fetch delivery and order data
  useEffect(() => {
    const fetchDeliveryData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.id) {
          setError("Utilisateur non connecté");
          return;
        }

        // If orderId is provided in params, use it to get the specific order
        if (orderId) {
          try {
            const orderData = await orderService.getById(orderId);
            setOrder(orderData.order || orderData);
            
            // Also try to get the delivery info if it exists
            try {
              const deliveryData = await deliveryService.getDeliveryByUser(user.id);
              if (deliveryData.order_id === parseInt(orderId)) {
                setDelivery(deliveryData);
                setDeliveryId(deliveryData.id || deliveryData.delivery_id);
                console.log('Delivery ID captured:', deliveryData.id || deliveryData.delivery_id);
              }
            } catch (deliveryErr) {
              console.log('No active delivery found for this order');
            }
            
          } catch (orderErr) {
            console.error('Error fetching specific order:', orderErr);
            setError("Commande non trouvée");
            return;
          }
        } else {
          // Get the current active delivery assigned to this user
          try {
            const deliveryData = await deliveryService.getDeliveryByUser(user.id);
            
            if (!deliveryData) {
              setError("Aucune livraison active assignée");
              return;
            }
            
            console.log('Delivery data received:', deliveryData);
            setDelivery(deliveryData);
            setDeliveryId(deliveryData.id || deliveryData.delivery_id);
            
            // If the delivery has an order attached, use it
            if (deliveryData.order) {
              setOrder(deliveryData.order);
              console.log('Order from delivery:', deliveryData.order);
            } 
            // If order is null but we have order_id, fetch the order separately
            else if (deliveryData.order_id) {
              console.log('Order is null, fetching order by ID:', deliveryData.order_id);
              try {
                const orderData = await orderService.getById(deliveryData.order_id);
                const fetchedOrder = orderData.order || orderData;
                setOrder(fetchedOrder);
                console.log('Fetched order separately:', fetchedOrder);
              } catch (orderErr) {
                console.error('Error fetching order by ID:', orderErr);
                setError("Erreur lors du chargement des détails de la commande");
                return;
              }
            } else {
              setError("Aucun ID de commande trouvé dans la livraison");
              return;
            }
            
          } catch (deliveryErr) {
            console.error('No active delivery found for user:', deliveryErr);
            setError("Aucune livraison active assignée");
            return;
          }
        }

      } catch (err) {
        console.error('Error fetching delivery data:', err);
        if (err.response?.status === 404) {
          setError("Aucune livraison assignée ou commande introuvable");
        } else {
          setError("Erreur lors du chargement des données de livraison");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryData();
  }, [user, orderId]);

  // Status mapping
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

  // Handler for status update
  const handleStatusUpdate = async (nextStatus, toastMsg) => {
    if (!order) return;
    
    setLoadingAction(true);
    setToast("");
    
    try {
      // Update order status
      await orderService.updateOrderStatus(order.id, nextStatus);
      
      // Update local state
      setOrder(prev => ({ ...prev, status: nextStatus }));
      setToast(toastMsg);
      setTimeout(() => setToast(""), 3000);
      
    } catch (error) {
      console.error('Error updating status:', error);
      setToast("Erreur lors de la mise à jour du statut");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setLoadingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-2 sm:px-4 flex items-center justify-center">
        <div className="text-center text-[#ff5c5c] text-lg font-semibold animate-pulse">
          Chargement du suivi de commande...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen py-8 px-2 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => navigate('/livreur')}
            className="mb-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Retour
          </Button>
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              <p className="font-medium">{error}</p>
              <p className="text-sm mt-1">
                {error === "Aucune livraison assignée" 
                  ? "Vous n'avez actuellement aucune livraison en cours. Les nouvelles livraisons apparaîtront ici automatiquement."
                  : "Veuillez réessayer plus tard ou contacter le support technique."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-3 sm:px-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Modern Header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/livreur')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Retour
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Suivi de la commande #{order.id}
                </h1>
                <p className="text-gray-600">Suivez l'état de la livraison en temps réel</p>
              </div>
            </div>
          </div>
          
          {/* Current Status Badge */}
          <div className="flex items-center gap-3">
            <span className="text-gray-600 font-medium">Statut actuel:</span>
            <div className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-3 shadow-md ${
              order.status === 'cancelled' 
                ? 'bg-red-50 text-red-700 border-2 border-red-200'
                : order.status === 'completed'
                  ? 'bg-green-50 text-green-700 border-2 border-green-200'
                  : 'bg-yellow-50 text-yellow-700 border-2 border-yellow-200'
            }`}>
              <div className={`w-4 h-4 rounded-full ${
                order.status === 'cancelled' 
                  ? 'bg-red-500'
                  : order.status === 'completed'
                    ? 'bg-green-500'
                    : 'bg-yellow-400 animate-pulse'
              }`}></div>
              {getStatusDisplay(order.status)}
            </div>
          </div>
        </div>

        {/* Tracking Stepper */}
        <OrderTrackingStepper status={order.status} restaurant={order.restaurant} className="mb-6" />

        {/* Dynamic action buttons for delivery agent (UI only) */}
        {user?.role === 'livreur' || user?.role === 'delivery' ? (
          <div className="mb-6 flex gap-4">
            {order.status === 'waiting for pickup' && (
              <Button
                onClick={() => handleStatusUpdate('product pickedup', 'Commande récupérée !')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                disabled={loadingAction}
              >
                {loadingAction ? (
                  <span className="flex items-center gap-2"><span className="loader"></span>Traitement...</span>
                ) : (
                  'Commande récupérée'
                )}
              </Button>
            )}
            {order.status === 'product pickedup' && (
              <Button
                onClick={() => handleStatusUpdate('confirmed by delivery', 'Livraison lancée !')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
                disabled={loadingAction}
              >
                {loadingAction ? (
                  <span className="flex items-center gap-2"><span className="loader"></span>Traitement...</span>
                ) : (
                  'Confirmée la livraison'
                )}
              </Button>
            )}
            {order.status === 'confirmed by delivery' && (
              <span className="text-green-700 font-semibold">Livraison en cours...</span>
            )}
          </div>
        ) : null}
        {/* Toast/confirmation */}
        {toast && (
          <div className="fixed top-20 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
            {toast}
          </div>
        )}

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Restaurant info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#ff5c5c] rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faStore} className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Restaurant</h3>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-600">Nom: </span>
                <span className="text-gray-800">{order.restaurant?.name || 'Restaurant inconnu'}</span>
              </div>
              <div className="flex items-start gap-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 mt-1" />
                <div>
                  <span className="font-medium text-gray-600">Adresse: </span>
                  <span className="text-gray-800">{order.restaurant?.address || 'Adresse non disponible'}</span>
                </div>
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
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-600">Nom: </span>
                <span className="text-gray-800">{order.user?.name || 'Client inconnu'}</span>
              </div>
              <div className="flex items-start gap-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 mt-1" />
                <div>
                  <span className="font-medium text-gray-600">Adresse de livraison: </span>
                  <span className="text-gray-800">{order.adress || order.address || 'Non spécifiée'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items and Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order items */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#ff5c5c] rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faClipboardList} className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Les articles à livrer</h3>
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
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#ff5c5c] rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faClipboardList} className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Numéro de commande</h3>
              </div>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-gray-800 mb-2">{order.id}</div>
              <div className="text-sm text-gray-500">Commande #{order.id}</div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Statut:</span>
                <span className="font-medium text-gray-800">{getStatusDisplay(order.status)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">Total:</span>
                <span className="text-2xl font-bold text-[#ff5c5c]">{order.total_price} DA</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                onClick={() => navigate('/livreur')}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium"
              >
                Retour aux commandes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}