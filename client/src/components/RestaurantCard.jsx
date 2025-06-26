import React from 'react';

const RestaurantCard = ({ restaurant, className, onClick }) => {
  return (
    <div className={className} onClick={onClick}>
      <img src={restaurant.image} alt={restaurant.name} className="w-full h-40 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800">{restaurant.name}</h3>
        <p className="text-sm text-gray-600">{restaurant.rating} • {restaurant.time}</p>
      </div>
    </div>
  );
};

export default RestaurantCard;