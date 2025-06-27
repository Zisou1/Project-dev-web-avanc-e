import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const RestaurantInClient = () => {
  const { id } = useParams(); // Get restaurant ID from URL
  const [restaurant, setRestaurant] = useState(null);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      setIsLoading(true);
      try {
        // Fetch restaurant details
        const restaurantResponse = await axios.get(`http://localhost:3000/api/restaurants/getRestaurent/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` }
        });
        const restaurantData = restaurantResponse.data.restaurant || restaurantResponse.data;
        setRestaurant(restaurantData);

        // Fetch all items and filter by restaurantId
        try {
          const itemsResponse = await axios.get('http://localhost:3000/api/restaurants/item/getAll', {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` }
          });
          const allItems = itemsResponse.data.items || itemsResponse.data;
          console.log('Tous les items récupérés:', allItems); // DEBUG
          console.log('Premier item récupéré:', Array.isArray(allItems) && allItems.length > 0 ? allItems[0] : 'Aucun item'); // DEBUG
          // Filtrer les items par restaurantId
          const filteredItems = Array.isArray(allItems)
            ? allItems.filter(item => String(item.restaurant_id) === String(id))
            : [];
          console.log('Items filtrés pour restaurant_Id', id, ':', filteredItems); // DEBUG
          setFeaturedItems(filteredItems);
        } catch (itemError) {
          setFeaturedItems([]); // Pas d'items, mais ce n'est pas bloquant
        }
      } catch (error) {
        setRestaurant(null); // Affiche le message d'erreur si le restaurant n'est pas trouvé
      } finally {
        setIsLoading(false);
      }
    };
    fetchRestaurantData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-2xl text-gray-600">
        Loading...
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen text-2xl text-red-600">
        Restaurant introuvable ou erreur lors du chargement.
      </div>
    );
  }

  // Proceed with rendering even if restaurant is not found
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Image du restaurant */}
      <div className="rounded-3xl overflow-hidden shadow-xl mb-8">
        <img
          src={restaurant.image_url || '/images/restaurant-banner.jpg'}
          alt={restaurant.name || 'Restaurant Image'}
          className="w-full h-64 object-cover"
          onError={(e) => { e.target.src = '/images/restaurant-banner.jpg'; }} // Fallback image on error
        />
      </div>

      {/* Infos resto */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">
          {restaurant.name || 'Restaurant Not Found'}
        </h1>
        <p className="text-gray-500 italic mt-1">Appuyez pour consulter les horaires, les informations, etc.</p>
        <p className="text-gray-700 font-medium mt-1">
          {restaurant.address || 'Address not available'}
        </p>
        <p className="text-gray-700 mt-4 leading-relaxed">
          {restaurant.description || 'No description available.'}
        </p>
        {/* Working hours */}
        <p className="text-gray-700 mt-2">
          <span className="font-semibold">Heures d'ouverture:</span> {restaurant.workingHours || restaurant.openingHours || 'Non spécifié'}
        </p>
      </div>

      {/* Articles en vedette */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Articles en vedette</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {featuredItems.length > 0 ? (
          featuredItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden shadow relative group hover:shadow-lg transition"
            >
              <img
                src={item.image_url || item.image || '/images/placeholder-item.jpg'}
                alt={item.name}
                className="w-full h-32 object-contain p-3"
                onError={(e) => { e.target.src = '/images/placeholder-item.jpg'; }} // Fallback image on error
              />
              <div className="px-4 pb-4">
                <h3 className="text-sm font-semibold text-gray-800">{item.name}</h3>
                <p className="text-xs text-gray-600">
                  {item.price || 'N/A'}
                </p>
              </div>
              <button
                className="absolute bottom-3 right-3 w-8 h-8 bg-orange-500 text-white text-xl rounded-full flex items-center justify-center shadow hover:bg-orange-600 transition"
                onClick={() => console.log(`Added ${item.name} to cart`)}
                aria-label={`Ajouter ${item.name}`}
              >
                +
              </button>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">Aucun article en vedette disponible pour ce restaurant.</p>
        )}
      </div>
    </div>
  );
};

export default RestaurantInClient;