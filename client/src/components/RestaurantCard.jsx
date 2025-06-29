import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faUtensils, faClock } from '@fortawesome/free-solid-svg-icons';

const RestaurantCard = ({ restaurant, className, onClick }) => {
  // Construct the image URL - handle both relative and absolute URLs
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/images/placeholder-restaurant.jpg';
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    
    // If it's a relative path, construct the full URL
    return `http://localhost:3005${imageUrl}`;
  };

  return (
    <div className={`group relative ${className}`} onClick={onClick}>
      {/* Image Container */}
      <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
        <img
          src={getImageUrl(restaurant.imageUrl)}
          alt={restaurant.name || 'Restaurant'}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
          onError={(e) => { 
            e.target.src = '/images/placeholder-restaurant.jpg'; 
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Hover Action */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button className="bg-white/90 text-gray-800 px-4 py-2 rounded-full font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            Voir le menu
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        {/* Restaurant Name & Type */}
        <div className="mb-3">
          <h3 className="font-bold text-xl text-gray-800 mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors duration-200">
            {restaurant.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FontAwesomeIcon icon={faUtensils} className="text-orange-500" />
            <span className="capitalize font-medium">{restaurant.kitchen_type}</span>
          </div>
        </div>

        {/* Address */}
        {restaurant.address && (
          <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-orange-500 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{restaurant.address}</span>
          </div>
        )}

        {/* Opening Hours */}
        {(restaurant.timeStart && restaurant.timeEnd) && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <FontAwesomeIcon icon={faClock} className="text-orange-500" />
            <span>{restaurant.timeStart} - {restaurant.timeEnd}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-3 border-t border-gray-100">
          <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg">
            Commander maintenant
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;