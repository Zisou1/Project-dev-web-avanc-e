import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";
import OrderTrackingStepper from "../../components/OrderTrackingStepper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowLeft, 
  faStore,
  faUser,
  faClipboardList,
  faMapMarkerAlt,
  faTruck,
  faCheckCircle,
  faClock,
  faBoxOpen,
  faHandPaper
} from "@fortawesome/free-solid-svg-icons";
import { deliveryService } from "../../services/deliveryService";
import { orderService } from "../../services/orderService";

export default function SuivreCommande() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [delivery, setDelivery] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Status mapping for delivery tracking
  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': 'En attente de récupération',
      'confirmed': 'Confirmée',
      'waiting for pickup': 'En attente de récupération',
      'product pickedup': 'Produit récupéré',
      'confirmed by delivery': 'Confirmée par le livreur',
      'confirmed by client': 'Confirmée par le client',
      'cancelled': 'Annulée',
      'completed': 'Terminée',
      'in_progress': 'En cours de livraison',
      'delivered': 'Livré'
    };
    return statusMap[status] || status;
  };

  // Get available status transitions based on current status (delivery person restrictions)
  const getAvailableStatusTransitions = (currentStatus) => {
    const transitions = {
      // Delivery person can only pick up or cancel before pickup
      'waiting for pickup': ['product pickedup', 'cancelled'],
      // After pickup, delivery person can only confirm delivery (no cancel)
      'product pickedup': ['confirmed by delivery'],
      // Other statuses have no actions available for delivery person
      'pending': [],
      'confirmed': [],
      'confirmed by delivery': [],
      'confirmed by client': [],
      'completed': [],
      'cancelled': [],
      'in_progress': [],
    };
    return transitions[currentStatus] || [];
  };

  // Fetch delivery and order details
  useEffect(() => {
    const fetchDeliveryData = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      setError(null);
      try {
        console.log('🚚 Fetching delivery for user:', user.id);
        
        // Get current active delivery for the user
        const deliveryData = await deliveryService.getDeliveryByUser(user.id);
        console.log('🚚 Delivery data received:', deliveryData);
        
        if (deliveryData) {
          setDelivery(deliveryData);
          
          // The delivery data already includes the order object
          if (deliveryData.order) {
            console.log('📋 Order data from delivery:', deliveryData.order);
            setOrder(deliveryData.order);
          }
        } else {
          setError('Aucune livraison active trouvée');
        }
      } catch (err) {
        console.error('Error fetching delivery:', err);
        setError('Erreur lors du chargement des détails de livraison');
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryData();
  }, [user?.id]);

  // Auto-refresh delivery status every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (user?.id && !loading) {
        try {
          const deliveryData = await deliveryService.getDeliveryByUser(user.id);
          if (deliveryData) {
            setDelivery(deliveryData);
            // Update order data from delivery
            if (deliveryData.order) {
              setOrder(deliveryData.order);
            }
          }
        } catch (err) {
          console.error('Error refreshing delivery:', err);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id, loading]);

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    if (!order?.id && !delivery?.order?.id) return;
    
    setUpdating(true);
    try {
      const orderId = order?.id || delivery?.order?.id;
      console.log('🔄 Updating order status to:', newStatus, 'for order ID:', orderId);
      
      // For cancellation, pass the delivery user ID so backend can cancel the delivery
      const deliveryUserId = newStatus === 'cancelled' ? user.id : null;
      
      // Update the order status using orderService
      await orderService.updateOrderStatus(orderId, newStatus, deliveryUserId);
      
      // Refresh delivery data to get updated order information
      const updatedDelivery = await deliveryService.getDeliveryByUser(user.id);
      if (updatedDelivery) {
        setDelivery(updatedDelivery);
        // Update order data from delivery
        if (updatedDelivery.order) {
          setOrder(updatedDelivery.order);
        }
      }
      
      console.log('✅ Order status updated successfully to:', newStatus);
      
      // Navigate to orders page after successful cancellation
      if (newStatus === 'cancelled') {
        navigate('/livreur/orders');
        return;
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Erreur lors de la mise à jour du statut de la commande');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-2 sm:px-4 flex items-center justify-center">
        <div className="text-center text-[#ff5c5c] text-lg font-semibold animate-pulse">
          Chargement du suivi de livraison...
        </div>
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className="min-h-screen py-8 px-2 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => navigate('/client/orders')}
            className="mb-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Retour aux commandes
          </Button>
          {error && <ErrorMessage error={error} />}
          {!delivery && !error && (
            <div className="text-center text-gray-500">Aucune livraison active trouvée</div>
          )}
        </div>
      </div>
    );
  }

  const currentStatus = order?.status || delivery?.order?.status || 'pending';
  const availableTransitions = getAvailableStatusTransitions(currentStatus);

  console.log('🔍 Current Status Debug:', {
    orderStatus: order?.status,
    deliveryOrderStatus: delivery?.order?.status,
    deliveryStatus: delivery?.status,
    currentStatus,
    availableTransitions
  });

  return (
    <div className="min-h-screen py-6 px-3 sm:px-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Modern Header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/client/orders')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Retour
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Suivi de la livraison #{delivery.id}
                </h1>
                <p className="text-gray-600">Suivez l'état de votre livraison en temps réel</p>
              </div>
            </div>
          </div>
          
          {/* Current Status Badge */}
          <div className="flex items-center gap-3">
            <span className="text-gray-600 font-medium">Statut actuel:</span>
            <div className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-3 shadow-md ${
              currentStatus === 'cancelled' 
                ? 'bg-red-50 text-red-700 border-2 border-red-200'
                : currentStatus === 'completed' || currentStatus === 'delivered'
                  ? 'bg-green-50 text-green-700 border-2 border-green-200'
                  : 'bg-yellow-50 text-yellow-700 border-2 border-yellow-200'
            }`}>
              <div className={`w-4 h-4 rounded-full ${
                currentStatus === 'cancelled' 
                  ? 'bg-red-500'
                  : currentStatus === 'completed' || currentStatus === 'delivered'
                    ? 'bg-green-500'
                    : 'bg-yellow-400 animate-pulse'
              }`}></div>
              {getStatusDisplay(currentStatus)}
            </div>
          </div>
        </div>

        {/* Tracking Stepper */}
        <OrderTrackingStepper status={currentStatus} className="mb-6" />

        {/* Status Update Buttons */}
        {availableTransitions.length > 0 && (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions disponibles pour le livreur</h3>
            <div className="flex flex-wrap gap-3">
              {availableTransitions.map((status) => {
                // Custom button text and styling for delivery actions
                let buttonText = getStatusDisplay(status);
                let buttonIcon = faTruck;
                let buttonStyle = 'bg-[#ff5c5c] hover:bg-[#e54848] text-white';
                
                if (status === 'product pickedup') {
                  buttonText = 'Marquer comme récupéré';
                  buttonIcon = faBoxOpen;
                  buttonStyle = 'bg-blue-500 hover:bg-blue-600 text-white';
                } else if (status === 'confirmed by delivery') {
                  buttonText = 'Confirmer la livraison';
                  buttonIcon = faHandPaper;
                  buttonStyle = 'bg-green-500 hover:bg-green-600 text-white';
                } else if (status === 'cancelled') {
                  buttonText = 'Annuler';
                  buttonIcon = faClock;
                  buttonStyle = 'bg-red-500 hover:bg-red-600 text-white';
                } else if (status === 'completed' || status === 'confirmed by client') {
                  buttonIcon = faCheckCircle;
                  buttonStyle = 'bg-green-500 hover:bg-green-600 text-white';
                }

                return (
                  <Button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={updating}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${buttonStyle} ${
                      updating ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <FontAwesomeIcon icon={buttonIcon} className="mr-2" />
                    {updating ? 'Mise à jour...' : buttonText}
                  </Button>
                );
              })}
            </div>
            
            {/* Helpful information for delivery person */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faTruck} className="text-blue-600" />
                <h4 className="font-semibold text-blue-800">Instructions pour le livreur</h4>
              </div>
              <div className="mt-2 text-sm text-blue-700">
                {currentStatus === 'waiting for pickup' && (
                  <>
                    <p>• Rendez-vous au restaurant pour récupérer la commande</p>
                    <p>• Vous pouvez annuler la commande uniquement avant la récupération</p>
                  </>
                )}
                {currentStatus === 'product pickedup' && (
                  <>
                    <p>• Commande récupérée ! Dirigez-vous vers l'adresse de livraison</p>
                    <p>• Une fois arrivé chez le client, confirmez la livraison</p>
                    <p>• ⚠️ Vous ne pouvez plus annuler après avoir récupéré la commande</p>
                  </>
                )}
                {currentStatus === 'confirmed by delivery' && (
                  <p>• Livraison confirmée ! En attente de la confirmation du client pour finaliser la commande</p>
                )}
                {(currentStatus === 'pending' || currentStatus === 'confirmed') && (
                  <p>• En attente que le restaurant prépare la commande pour récupération</p>
                )}
                {(currentStatus === 'completed' || currentStatus === 'confirmed by client') && (
                  <p>• ✅ Commande terminée avec succès !</p>
                )}
                {currentStatus === 'cancelled' && (
                  <p>• ❌ Cette commande a été annulée</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delivery Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Restaurant info */}
          {(order?.restaurant || delivery?.order?.restaurant) && (
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
                  <span className="text-gray-800">{order?.restaurant?.name || delivery?.order?.restaurant?.name || 'Restaurant inconnu'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 mt-1" />
                  <div>
                    <span className="font-medium text-gray-600">Adresse: </span>
                    <span className="text-gray-800">{order?.restaurant?.address || delivery?.order?.restaurant?.address || 'Adresse non disponible'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Client info */}
          {(order?.user || delivery?.order?.user || delivery?.user) && (
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
                  <span className="text-gray-800">{order?.user?.name || delivery?.order?.user?.name || delivery?.user?.name || 'Client inconnu'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 mt-1" />
                  <div>
                    <span className="font-medium text-gray-600">Adresse de livraison: </span>
                    <span className="text-gray-800">{order?.adress || order?.address || delivery?.order?.adress || delivery?.order?.address || delivery?.address || 'Non spécifiée'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Items and Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order items */}
          {(order?.items || delivery?.order?.items) && (
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#ff5c5c] rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faClipboardList} className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Articles à livrer</h3>
                </div>
              </div>
              
              <div className="space-y-3">
                {(order?.items || delivery?.order?.items || []).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#ff5c5c] rounded-full"></div>
                      <span className="font-medium text-gray-800">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{item.price} DA</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#ff5c5c] rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faTruck} className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Livraison</h3>
              </div>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-gray-800 mb-2">#{delivery.id}</div>
              <div className="text-sm text-gray-500">Livraison #{delivery.id}</div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Statut:</span>
                <span className="font-medium text-gray-800">{getStatusDisplay(currentStatus)}</span>
              </div>
              {(order || delivery?.order) && (
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Total:</span>
                  <span className="text-2xl font-bold text-[#ff5c5c]">{order?.total_price || delivery?.order?.total_price || delivery?.total_price} DA</span>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <Button
                onClick={() => navigate('/client/orders')}
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