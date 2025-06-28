import React from 'react';

const RestaurantCard = ({ restaurant, className, onClick }) => {
  return (
    <div className={className} onClick={onClick}>
      <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500 text-sm italic">
        {/* Placeholder image */}
        No image available
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800">{restaurant.name}</h3>
        <p className="text-sm text-gray-600 capitalize">{restaurant.kitchen_type}</p>
      </div>
    </div>
  );
};

export default RestaurantCard;