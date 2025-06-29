import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faStore, faUser, faMapMarkerAlt, faClipboardList } from '@fortawesome/free-solid-svg-icons';
import Button from './Button';
import OrderTrackingStepper from './OrderTrackingStepper';

const OrderDetailsModal = ({ isOpen, onClose, order, onAccept, onRefuse, loading }) => {
  if (!isOpen || !order) return null;

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

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#ff5c5c] to-[#ff7e7e] text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Détails de la commande #{order.id}</h2>
              <p className="text-white/90">Examinez les détails et prenez une décision</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status and Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Statut actuel</h3>
              <div className={`px-4 py-2 rounded-lg font-medium ${
                order.status === 'cancelled' 
                  ? 'bg-red-100 text-red-700'
                  : order.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
              }`}>
                {getStatusDisplay(order.status)}
              </div>
            </div>
            
            {/* Order Tracking Stepper */}
            <OrderTrackingStepper status={order.status} />
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Restaurant info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#ff5c5c] rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faStore} className="text-white" />
                </div>
                <h4 className="font-semibold text-gray-800">Restaurant</h4>
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
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#ff5c5c] rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faUser} className="text-white" />
                </div>
                <h4 className="font-semibold text-gray-800">Client</h4>
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

          {/* Order Items */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#ff5c5c] rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faClipboardList} className="text-white" />
              </div>
              <h4 className="font-semibold text-gray-800">Articles commandés</h4>
            </div>
            
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
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
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">Total:</span>
                <span className="text-2xl font-bold text-[#ff5c5c]">{order.total_price} DA</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {order.status === 'pending' && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={() => onAccept(order.id)}
                disabled={loading}
                className={`flex-1 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                <FontAwesomeIcon icon={faCheck} />
                {loading ? 'Traitement...' : 'Accepter la commande'}
              </Button>
              <Button
                onClick={() => onRefuse(order.id)}
                disabled={loading}
                className={`flex-1 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                <FontAwesomeIcon icon={faTimes} />
                {loading ? 'Traitement...' : 'Refuser la commande'}
              </Button>
            </div>
          )}

          {order.status !== 'pending' && (
            <div className="pt-4 border-t border-gray-200">
              <div className="text-center text-gray-600">
                {order.status === 'cancelled' 
                  ? 'Cette commande a été annulée.'
                  : order.status === 'completed'
                    ? 'Cette commande a été terminée avec succès.'
                    : 'Cette commande est en cours de traitement. Vous pouvez suivre son évolution.'
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
