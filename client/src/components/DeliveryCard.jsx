// components/DeliveryCard.jsx
import React from "react";

const DeliveryCard = ({ delivery }) => (
  <div className="bg-white rounded-xl shadow p-6 border border-gray-100 hover:shadow-2xl transition">
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center md:text-left items-center">
      <div>
        <div className="text-xs text-black font-semibold uppercase">ID COMMANDE</div>
        <div className="text-lg font-bold text-gray-800">{delivery.id}</div>
      </div>
      <div>
        <div className="text-xs text-black font-semibold uppercase">RÉCUPÉRATION</div>
        <div className="text-base text-gray-700">{delivery.pickup}</div>
      </div>
      <div>
        <div className="text-xs text-black font-semibold uppercase">LIVRAISON</div>
        <div className="text-base text-gray-700">{delivery.address}</div>
      </div>
      <div>
        <div className="text-xs text-black font-semibold uppercase">PRIME</div>
        <div className="text-base font-semibold text-green-600">{delivery.price}</div>
      </div>
      <div>
        <div className="text-xs text-black font-semibold uppercase">STATUT</div>
        <div className="text-base text-gray-700">{delivery.status}</div>
      </div>
    </div>
    <div className="flex justify-center mt-6">
      <button className="bg-[#FF5A5F] hover:bg-[#ff7a7f] text-white px-10 py-2 rounded-lg text-lg font-medium shadow-md w-full md:w-auto">
        Accepter
      </button>
    </div>
  </div>
);

export default DeliveryCard;