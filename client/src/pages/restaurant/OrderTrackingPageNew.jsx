import { useState, useEffect } from "react";
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
import { orderService } from "../../services/orderService";

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Auto-refresh order status every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (orderId && !loading) {
        try {
          const data = await orderService.getById(orderId);
          setOrder(data.order);
        } catch (err) {
          console.error('Error refreshing order:', err);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [orderId, loading]);

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
    <div className="min-h-screen py-6 px-3 sm:px-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Modern Header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/restaurant/orders')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Retour
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Suivi de la commande #{order.id}
                </h1>
                <p className="text-gray-600">Suivez l'état de votre commande en temps réel</p>
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
        <OrderTrackingStepper status={order.status} className="mb-6" />

        {/* Restaurant Notice */}
        {order.status !== 'pending' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">ℹ</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">Information</h3>
                <p className="text-blue-700 text-sm">
                  {order.status === 'confirmed' 
                    ? "Votre commande a été confirmée. Elle est maintenant prise en charge par notre équipe de livraison."
                    : order.status === 'cancelled'
                      ? "Cette commande a été annulée."
                      : order.status === 'completed'
                        ? "Cette commande a été livrée avec succès."
                        : "Cette commande est en cours de traitement par notre équipe de livraison. Les mises à jour du statut se font automatiquement."
                  }
                </p>
              </div>
            </div>
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
                onClick={() => navigate('/restaurant/orders')}
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
