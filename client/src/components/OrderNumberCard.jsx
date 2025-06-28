import React from 'react';

const OrderNumberCard = ({ number }) => (
  <div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[280px] max-w-[350px] flex flex-col justify-center h-full">
    <div className="flex items-center justify-between w-full mb-2">
      <span className="font-bold text-lg">Numéro de commande</span>
      <span className="text-4xl font-bold text-gray-800">{number}</span>
    </div>
  </div>
);

export default OrderNumberCard;