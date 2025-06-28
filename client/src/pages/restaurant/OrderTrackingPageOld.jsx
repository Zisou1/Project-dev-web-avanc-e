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
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Handle order status changes
  const handleOrderAction = async (orderId, action) => {
    setUpdatingStatus(true);
    try {
      let response;
      let newStatus;
      
      console.log(`Attempting to ${action} order ${orderId}`);
      
      switch (action) {
        case 'accept':
          response = await orderService.acceptOrder(orderId);
          newStatus = 'confirmed';
          break;
        case 'refuse':
          response = await orderService.refuseOrder(orderId);
          newStatus = 'cancelled';
          break;
        case 'start_preparing':
          response = await orderService.updateOrderStatus(orderId, 'preparing');
          newStatus = 'preparing';
          break;
        case 'start_delivery':
          response = await orderService.updateOrderStatus(orderId, 'delivering');
          newStatus = 'delivering';
          break;
        case 'complete':
          response = await orderService.updateOrderStatus(orderId, 'completed');
          newStatus = 'completed';
          break;
        default:
          throw new Error('Action inconnue');
      }

      console.log('API Response:', response);
      
      // Update order status locally - handle different response formats
      const updatedStatus = response?.order?.status || response?.status || newStatus;
      
      setOrder(prevOrder => ({
        ...prevOrder,
        status: updatedStatus
      }));

      setShowModal(false);
      
      // Show success message
      console.log(`Order ${orderId} status updated to: ${updatedStatus}`);
      
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.response?.data?.message || err.message || `Erreur lors de l'action sur la commande`);
      setShowModal(false);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const showConfirmationModal = (action) => {
    const actionTexts = {
      accept: { verb: 'accepter', button: 'Accepter', class: 'bg-green-500 hover:bg-green-600', icon: faCheck, color: 'text-green-500' },
      refuse: { verb: 'refuser', button: 'Refuser', class: 'bg-red-500 hover:bg-red-600', icon: faTimes, color: 'text-red-500' },
      start_preparing: { verb: 'commencer la préparation', button: 'Commencer préparation', class: 'bg-orange-500 hover:bg-orange-600', icon: faClock, color: 'text-orange-500' },
      start_delivery: { verb: 'commencer la livraison', button: 'Commencer livraison', class: 'bg-blue-500 hover:bg-blue-600', icon: faTruck, color: 'text-blue-500' },
      complete: { verb: 'marquer comme terminée', button: 'Terminer', class: 'bg-green-500 hover:bg-green-600', icon: faCheckCircle, color: 'text-green-500' }
    };
    
    const actionConfig = actionTexts[action];
    
    setModalConfig({
      title: `Confirmer l'action`,
      message: `Voulez-vous vraiment ${actionConfig.verb} la commande #${order.id} ?`,
      confirmText: actionConfig.button,
      cancelText: 'Annuler',
      onConfirm: () => handleOrderAction(order.id, action),
      confirmClass: actionConfig.class,
      icon: actionConfig.icon,
      iconColor: actionConfig.color
    });
    setShowModal(true);
  };

  // Status mapping
  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': 'En attente de validation',
      'confirmed': 'Confirmée',
      'preparing': 'En préparation',
      'delivering': 'En livraison',
      'cancelled': 'Annulée',
      'completed': 'Terminée'
    };
    return statusMap[status] || status;
  };

  // Define the order of statuses (backend statuses only)
  const statusOrder = [
    'pending',
    'confirmed', 
    'preparing',
    'delivering',
    'completed'
  ];

  // Get tracking steps based on status
  const getTrackingSteps = (status) => {
    // If cancelled, show special cancelled state
    if (status === 'cancelled') {
      return [
        {
          id: 1,
          title: "Commande annulée",
          description: "La commande a été annulée",
          statuses: ['cancelled'],
          completed: true,
          cancelled: true
        }
      ];
    }

    const currentStatusIndex = statusOrder.indexOf(status);
    
    const steps = [
      {
        id: 1,
        title: "Commande en attente",
        description: "La commande est en attente de validation",
        statuses: ['pending'],
        completed: currentStatusIndex >= 0
      },
      {
        id: 2,
        title: "Commande confirmée",
        description: "La commande a été confirmée par le restaurant",
        statuses: ['confirmed'],
        completed: currentStatusIndex >= 1
      },
      {
        id: 3,
        title: "En préparation",
        description: "La commande est en cours de préparation",
        statuses: ['preparing'],
        completed: currentStatusIndex >= 2
      },
      {
        id: 4,
        title: "En livraison",
        description: "La commande est en cours de livraison",
        statuses: ['delivering'],
        completed: currentStatusIndex >= 3
      },
      {
        id: 5,
        title: "Commande terminée",
        description: "La commande a été livrée avec succès",
        statuses: ['completed'],
        completed: currentStatusIndex >= 4
      }
    ];

    return steps;
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

  const trackingSteps = getTrackingSteps(order.status);

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

        {/* Tracking Steps */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {order.status === 'cancelled' 
              ? 'État de la commande' 
              : order.status === 'completed' 
                ? 'Livraison terminée'
                : 'État de la livraison'
            }
          </h2>
          
          <div className="relative px-6">
            {/* Horizontal Progress line */}
            <div className="absolute top-6 left-12 right-12 h-0.5 bg-gray-200"></div>
            <div 
              className={`absolute top-6 left-12 h-0.5 transition-all duration-500 ${
                order.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ 
                width: trackingSteps.length > 1 
                  ? `calc(${(trackingSteps.filter(step => step.completed).length - 1) * 100 / (trackingSteps.length - 1)}% - 24px)` 
                  : '0%'
              }}
            ></div>
            
            {/* Current position indicator on line */}
            {order.status !== 'cancelled' && (
              <div 
                className="absolute top-5 w-2 h-2 bg-yellow-400 rounded-full shadow-lg transition-all duration-500 animate-pulse"
                style={{ 
                  left: trackingSteps.length > 1 
                    ? `calc(12px + ${(trackingSteps.filter(step => step.completed).length) * 100 / (trackingSteps.length - 1)}% - 4px)` 
                    : '44px'
                }}
              ></div>
            )}

            {/* Steps - Horizontal Layout */}
            <div className="flex justify-between items-start overflow-x-auto pb-4">
              {trackingSteps.map((step) => {
                const isCurrentStep = step.statuses.includes(order.status);
                return (
                  <div key={step.id} className="flex flex-col items-center text-center flex-shrink-0" style={{ minWidth: trackingSteps.length > 4 ? '120px' : `${100 / trackingSteps.length}%` }}>
                    {/* Step circle */}
                    <div className={`relative z-10 w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-lg transition-all duration-300 mb-4 ${
                      step.cancelled
                        ? 'bg-red-500 border-red-500 text-white shadow-lg'
                        : step.completed 
                          ? 'bg-blue-500 border-blue-500 text-white' 
                          : isCurrentStep
                            ? 'bg-yellow-400 border-yellow-400 text-white shadow-lg animate-pulse'
                            : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {step.completed ? (
                        <FontAwesomeIcon icon={faCheck} />
                      ) : isCurrentStep ? (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      ) : (
                        step.id
                      )}
                    </div>

                    {/* Step content */}
                    <div className="max-w-32 px-2">
                      <h3 className={`text-sm font-semibold mb-2 ${
                        step.cancelled
                          ? 'text-red-600'
                          : step.completed 
                            ? 'text-blue-600' 
                            : isCurrentStep
                              ? 'text-yellow-600 font-bold'
                              : 'text-gray-500'
                      }`}>
                        {step.title}
                      </h3>
                      <p className="text-xs text-gray-600 leading-tight">{step.description}</p>
                      {step.completed && !step.cancelled && (
                        <p className="text-xs text-blue-600 font-medium mt-2">✓ Terminé</p>
                      )}
                      {step.cancelled && (
                        <p className="text-xs text-red-600 font-medium mt-2">✗ Annulé</p>
                      )}
                      {isCurrentStep && !step.completed && !step.cancelled && (
                        <p className="text-xs text-yellow-600 font-medium mt-2">● En cours</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons directly below tracking line */}
          {order.status !== 'cancelled' && order.status !== 'completed' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap justify-center gap-3">
                {/* Status-specific action buttons */}
                {order.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => showConfirmationModal('accept')}
                      disabled={updatingStatus}
                      className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 ${
                        updatingStatus 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                      {updatingStatus ? 'Traitement...' : 'Accepter la commande'}
                    </Button>
                    <Button
                      onClick={() => showConfirmationModal('refuse')}
                      disabled={updatingStatus}
                      className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 ${
                        updatingStatus 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                      {updatingStatus ? 'Traitement...' : 'Refuser la commande'}
                    </Button>
                  </>
                )}

                {order.status === 'confirmed' && (
                  <Button
                    onClick={() => showConfirmationModal('start_preparing')}
                    disabled={updatingStatus}
                    className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 ${
                      updatingStatus 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    <FontAwesomeIcon icon={faClock} />
                    {updatingStatus ? 'Traitement...' : 'Commencer la préparation'}
                  </Button>
                )}

                {order.status === 'preparing' && (
                  <Button
                    onClick={() => showConfirmationModal('start_delivery')}
                    disabled={updatingStatus}
                    className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 ${
                      updatingStatus 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    <FontAwesomeIcon icon={faTruck} />
                    {updatingStatus ? 'Traitement...' : 'Commencer la livraison'}
                  </Button>
                )}

                {order.status === 'delivering' && (
                  <Button
                    onClick={() => showConfirmationModal('complete')}
                    disabled={updatingStatus}
                    className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 ${
                      updatingStatus 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                    {updatingStatus ? 'Traitement...' : 'Marquer comme terminé'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

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

            {/* Action buttons based on status */}
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

      {/* Confirmation Modal */}
      {showModal && (
        <ConfirmationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmText={modalConfig.confirmText}
          cancelText={modalConfig.cancelText}
          onConfirm={modalConfig.onConfirm}
          confirmButtonClass={modalConfig.confirmClass}
          icon={modalConfig.icon}
          iconColor={modalConfig.iconColor}
        />
      )}
    </div>
  );
}
