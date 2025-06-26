import React from 'react';

const OrderNumberCard = ({ number }) => (
  <div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[180px] max-w-[200px] flex flex-col items-center justify-center">
    <div className="font-bold text-lg mb-2">Numéro de commande</div>
    <div className="text-4xl font-bold text-gray-800">{number}</div>
  </div>
);

export default OrderNumberCard;