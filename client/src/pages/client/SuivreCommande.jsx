import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ProgressBar from '../../components/ProgressBar';
import RestaurantInfo from '../../components/RestaurantInfo';
import ItemsList from '../../components/ItemsList';
import OrderNumberCard from '../../components/OrderNumberCard';
import LivreurInfo from '../../components/LivreurInfo';

function SuivreCommande() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderData = async () => {
      setIsLoading(true);
      try {
        // Remplacer l'URL par l'endpoint réel de suivi de commande
        const response = await axios.get(`http://localhost:3000/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
        });
        const data = response.data;
        setOrder({
          orderId: data._id || id,
          restaurantName: data.restaurant?.name || '',
          address: data.restaurant?.address || '',
          status: data.status || 'Préparation',
          estimatedDeliveryTime: data.estimatedDeliveryTime || '',
          trackingDetails: data.trackingDetails || '',
          items: data.items?.map(item => ({ name: item.name, qty: item.quantity })) || [],
          livreur: {
            name: data.livreur?.name || '',
            phone: data.livreur?.phone || '',
          },
        });
      } catch (error) {
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-2xl text-gray-600">
        Loading...
      </div>
    );
  }

  const progressStatus = order && order.status === 'Livraison effectuée' ? 2 : order && order.status === 'En cours de livraison' ? 1 : 0;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="flex flex-col items-center">
          <ProgressBar status={progressStatus} />
        </div>
        {/* Cards Grid 2x2 centrée */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 place-items-center">
          <OrderNumberCard number={order?.orderId} />
          <RestaurantInfo name={order?.restaurantName} address={order?.address} />
          <LivreurInfo name={order?.livreur?.name} phone={order?.livreur?.phone} />
          <ItemsList items={order?.items || []} />
        </div>
      </div>
    </div>
  );
}

export default SuivreCommande;