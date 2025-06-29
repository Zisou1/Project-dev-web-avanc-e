import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import Toast from '../../components/Toast';
import { formatDate } from '../../utils/dateUtils';

const CommandeDisponible = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const { user } = useAuth();

  useEffect(() => {
    fetchAvailableOrders();
  }, []);

  const fetchAvailableOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all orders with confirmed status
      const response = await orderService.getAvailableOrders();
      
      if (response.error) {
        setError(response.error);
        setOrders([]);
      } else {
        setOrders(response.orders || []);
      }
    } catch (err) {
      console.error('Error fetching available orders:', err);
      setError('Erreur lors du chargement des commandes disponibles');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    if (!user || !user.id) {
      setError('Utilisateur non connecté');
      return;
    }

    try {
      setProcessingOrder(orderId);
      setError(null);
      
      // Accept order for delivery - this will create a delivery and update order status
      await orderService.acceptOrderForDelivery(orderId, user.id);
      
      // Show success toast
      setToast({
        show: true,
        message: 'Commande acceptée avec succès! Elle a été ajoutée à vos livraisons.',
        type: 'success'
      });
      
      // Refresh the orders list to remove the accepted order
      await fetchAvailableOrders();
    } catch (err) {
      console.error('Error accepting order:', err);
      
      if (err.message === 'Cette commande a déjà été acceptée par un autre livreur') {
        setToast({
          show: true,
          message: err.message,
          type: 'error'
        });
        // Refresh the list to remove the order that was already taken
        await fetchAvailableOrders();
      } else {
        setToast({
          show: true,
          message: 'Erreur lors de l\'acceptation de la commande',
          type: 'error'
        });
      }
    } finally {
      setProcessingOrder(null);
    }
  };

  const calculateTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Commandes Disponibles</h1>
        <p className="text-gray-600">Commandes confirmées en attente de livraison</p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">
          {orders.length} commande{orders.length !== 1 ? 's' : ''} disponible{orders.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={fetchAvailableOrders}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Actualiser
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Aucune commande disponible
          </h3>
          <p className="text-gray-500">
            Il n'y a actuellement aucune commande confirmée en attente de livraison.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    Commande #{order.id}
                  </h3>
                  <p className="text-gray-600">
                    {order.created_at && formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Confirmée
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Informations client:</h4>
                <p className="text-gray-600">ID Client: {order.user_id}</p>
                {order.delivery_address && (
                  <p className="text-gray-600">Adresse: {order.delivery_address}</p>
                )}
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Restaurant:</h4>
                <p className="text-gray-600">ID Restaurant: {order.restaurant_id}</p>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Articles:</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          {item.name} x{item.quantity}
                        </span>
                        <span className="font-medium">
                          {(item.price * item.quantity).toFixed(2)} €
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    Total: {order.total_amount ? order.total_amount.toFixed(2) : calculateTotal(order.items).toFixed(2)} €
                  </p>
                </div>
                <button
                  onClick={() => handleAcceptOrder(order.id)}
                  disabled={processingOrder === order.id}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    processingOrder === order.id
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                >
                  {processingOrder === order.id ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Traitement...</span>
                    </div>
                  ) : (
                    'Accepter la commande'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default CommandeDisponible;
