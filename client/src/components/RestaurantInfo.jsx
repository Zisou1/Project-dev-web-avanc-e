import React from 'react';

const RestaurantInfo = ({ name, address }) => (
  <div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[280px] max-w-[350px]">
    <div className="font-bold text-lg mb-2">Restaurant</div>
    <div>Nom : <span className="font-semibold">{name}</span></div>
    <div>Adresse : <span className="text-red-500">📍</span> {address}</div>
  </div>
);

export default RestaurantInfo;