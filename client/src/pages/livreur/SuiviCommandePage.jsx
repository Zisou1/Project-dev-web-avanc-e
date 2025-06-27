import React, { useState } from 'react';
import { FaStore, FaUser, FaReceipt, FaClock, FaEuroSign, FaQuestionCircle } from 'react-icons/fa';
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
    <div className="min-h-screen flex flex-col items-center relative">
      {/* Delivery summary card - now above the bar and aligned left */}
      <div className="w-full flex justify-start pl-8 pt-4">
        <div className="bg-white rounded-xl shadow-xl px-6 py-4 flex items-center gap-4 border border-gray-100">
          <FaClock className="text-[#FE5336] text-xl" />
          <span className="font-semibold text-gray-700">Est. 20 min</span>
          <FaEuroSign className="text-[#FE5336] text-xl ml-4" />
          <span className="font-semibold text-gray-700">450 DA</span>
        </div>
      </div>
      <div className="w-full flex flex-col items-center pt-6">
        <ProgressBar status={orderStatus} accentColor="#FE5336" />
      </div>
      <form className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 justify-center mb-8 mt-8">
        <div className="flex flex-col gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 border border-[#FE5336]/10 hover:shadow-2xl transition-shadow duration-200 cursor-pointer">
            <span className="text-3xl text-[#FE5336] bg-[#FE5336]/10 rounded-full p-3"><FaStore /></span>
            <RestaurantInfo {...order.restaurant} />
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#FE5336]/10 hover:shadow-2xl transition-shadow duration-200 cursor-pointer">
            <ItemsList items={order.items} />
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 border border-[#FE5336]/10 hover:shadow-2xl transition-shadow duration-200 cursor-pointer">
            <span className="text-3xl text-[#FE5336] bg-[#FE5336]/10 rounded-full p-3"><FaUser /></span>
            <ClientInfo {...order.client} />
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 border border-[#FE5336]/10 hover:shadow-2xl transition-shadow duration-200 cursor-pointer">
            <span className="text-3xl text-[#FE5336] bg-[#FE5336]/10 rounded-full p-3"><FaReceipt /></span>
            <OrderNumberCard number={order.orderNumber} />
          </div>
        </div>
      </form>
      <div className="flex gap-8 mt-8 mb-12 flex-wrap justify-center">
        {orderStatus === 0 && (
          <button
            className="bg-[#FE5336] hover:bg-[#e04a2e] text-white px-12 py-4 rounded-full shadow-lg text-lg font-semibold transition-all duration-200 border-2 border-[#FE5336]/20 focus:ring-4 focus:ring-[#FE5336]/30"
            onClick={handleRecuperer}
          >
            Livraison récupérée
          </button>
        )}
        {orderStatus === 1 && (
          <button
            className="bg-[#FE5336] hover:bg-[#e04a2e] text-white px-12 py-4 rounded-full shadow-lg text-lg font-semibold transition-all duration-200 border-2 border-[#FE5336]/20 focus:ring-4 focus:ring-[#FE5336]/30"
            onClick={handleConfirm}
          >
            Livraison effectuée
          </button>
        )}
        <button
          className="bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 px-12 py-4 rounded-full shadow-lg text-lg font-semibold hover:scale-105 hover:from-gray-400 hover:to-gray-500 transition-all duration-200 border-2 border-gray-200 focus:ring-4 focus:ring-gray-200"
          onClick={handleCancel}
        >
          Annuler
        </button>
      </div>
      {/* Floating help button */}
      <button className="fixed bottom-8 right-8 bg-[#FE5336] text-white rounded-full p-4 shadow-xl hover:bg-[#e04a2e] transition-colors duration-200 z-30" title="Aide / Support">
        <FaQuestionCircle className="text-2xl" />
      </button>
    </div>
  );
};

export default SuiviCommandePage;