import React from 'react';

const RestaurantCard = ({ restaurant }) => {
  return (
    <div className="rounded-lg overflow-hidden shadow">
      <img src={restaurant.image} alt={restaurant.name} className="w-full h-40 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold">{restaurant.name}</h3>
        <p className="text-sm text-gray-500">
          {restaurant.rating} <span>{restaurant.reviews}</span> • {restaurant.time}
        </p>
      </div>
    </div>
  );
};

export default RestaurantCard;