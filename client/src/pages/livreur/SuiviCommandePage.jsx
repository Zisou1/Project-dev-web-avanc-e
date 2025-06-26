import React, { useState } from 'react';
import ProgressBar from '../../components/ProgressBar';
import RestaurantInfo from '../../components/RestaurantInfo';
import ClientInfo from '../../components/ClientInfo';
import ItemsList from '../../components/ItemsList';
import OrderNumberCard from '../../components/OrderNumberCard';
import ActionButtons from '../../components/ActionButtons';

const SuiviCommandePage = () => {
  const [orderStatus, setOrderStatus] = useState(0); // 0: à récupérer, 1: en cours, 2: livrée
  const order = {
    restaurant: {
      name: 'Le Petit Délice',
      address: '12 rue des olives, Alger',
    },
    client: {
      name: 'Derbal ramy',
      address: 'Nador tipaza',
    },
    items: [
      { name: 'Tacos Poulet', qty: 1 },
      { name: 'Frites classiques' },
      { name: 'Brownie au chocolat' },
    ],
    orderNumber: 233,
  };

  const handleRecuperer = () => setOrderStatus(1);
  const handleConfirm = () => setOrderStatus(2);
  const handleCancel = () => setOrderStatus(0);

  return (
    <div className="bg-white min-h-screen flex flex-col items-center">
      <ProgressBar status={orderStatus} />
      <form className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 justify-center mb-8">
        <div className="flex flex-col gap-8">
          <RestaurantInfo {...order.restaurant} />
          <ItemsList items={order.items} />
        </div>
        <div className="flex flex-col gap-8">
          <ClientInfo {...order.client} />
          <OrderNumberCard number={order.orderNumber} />
        </div>
      </form>
      <div className="flex gap-8 mt-8 mb-12">
        {orderStatus === 0 && (
          <button
            className="bg-[#FF5C39] text-white px-12 py-4 rounded-full shadow-md text-lg font-semibold hover:bg-[#ff3c1a] transition"
            onClick={handleRecuperer}
          >
            Livraison récupérée
          </button>
        )}
        {orderStatus === 1 && (
          <button
            className="bg-[#FF5C39] text-white px-12 py-4 rounded-full shadow-md text-lg font-semibold hover:bg-[#ff3c1a] transition"
            onClick={handleConfirm}
          >
            Livraison effectuée
          </button>
        )}
        <button
          className="bg-[#FF5C39] text-white px-12 py-4 rounded-full shadow-md text-lg font-semibold hover:bg-[#ff3c1a] transition"
          onClick={handleCancel}
        >
          Annuler
        </button>
      </div>
    </div>
  );
};

export default SuiviCommandePage;