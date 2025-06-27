import React from 'react';
import { FaHashtag } from 'react-icons/fa';

const OrderNumberCard = ({ number }) => (
  <div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[180px] max-w-[200px] flex flex-col items-center justify-center">
    <div className="flex items-center gap-2 font-bold text-lg mb-2 text-black">
      <FaHashtag className="text-xl" />
      Numéro de commande
    </div>
    <div className="text-4xl font-bold text-gray-800 tracking-widest bg-[#FE5336]/10 px-6 py-2 rounded-xl mt-2">
      {number}
    </div>
  </div>
);

export default OrderNumberCard;