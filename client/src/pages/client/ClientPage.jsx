import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from '../../components/SearchBar';
import FilterButton from '../../components/FilterButton';
import RestaurantCard from '../../components/RestaurantCard';
import debounce from 'lodash/debounce';

const ALL_CATEGORIES = [
  'courses', 'halal', 'pizzas', 'fast food', 'sushis', 'desserts',
  'burger', 'cuisine saine', 'asiatique', 'thailandaise',
  'ailes de poulet', 'indienne', 'poke (poisson)'
];

const ClientPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [initialRestaurants, setInitialRestaurants] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:3000/api/restaurants/getAll', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` }
        });
        const data = response.data;
        const allRestaurants = data.restaurants || [];

        setRestaurants(allRestaurants);
        setInitialRestaurants(allRestaurants);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setRestaurants([]);
        setInitialRestaurants([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filterRestaurants = () => {
      setIsLoading(true);
      try {
        const filtered = initialRestaurants.filter((rest) =>
          (!selectedCategory || rest.kitchen_type?.toLowerCase() === selectedCategory.toLowerCase()) &&
          (!searchTerm || rest.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setRestaurants(filtered);
      } catch (error) {
        console.error('Erreur lors du filtrage local:', error);
        setRestaurants(initialRestaurants);
      } finally {
        setIsLoading(false);
      }
    };

    const debouncedFilter = debounce(filterRestaurants, 300);
    debouncedFilter();

    return () => debouncedFilter.cancel();
  }, [selectedCategory, searchTerm, initialRestaurants]);

  const handleFilterClick = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  const handleCardClick = (restaurantId) => {
    console.log(`Navigating to order page for restaurant ID: ${restaurantId}`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-2xl text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Search Bar */}
      <div className="w-full max-w-2xl mx-auto my-6">
        <SearchBar
          className="w-full bg-white rounded-full shadow-lg p-3 flex items-center border border-gray-200 focus-within:ring-2 focus-within:ring-orange-400"
          onChange={handleSearchChange}
        />
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 px-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {ALL_CATEGORIES.map((category) => (
            <FilterButton
              key={category}
              category={{ label: category, emoji: getEmoji(category) }}
              isSelected={selectedCategory === category}
              onClick={handleFilterClick}
              className="flex-shrink-0 bg-white rounded-full px-4 py-2 shadow-md hover:bg-orange-300 transition-all duration-200 text-gray-700"
            />
          ))}
        </div>
      </div>

      {/* Restaurants Section */}
      <div className="px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">Top Restaurants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">
              Aucun restaurant disponible, veuillez essayer ultérieurement!
            </div>
          ) : (
            restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:bg-orange-300 transition-all duration-300 cursor-pointer"
                onClick={() => handleCardClick(restaurant.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const getEmoji = (category) => {
  const emojiMap = {
    'courses': '🛒',
    'halal': '🕌',
    'pizzas': '🍕',
    'fast food': '🍟',
    'sushis': '🍣',
    'desserts': '🍰',
    'burger': '🍔',
    'cuisine saine': '🥗',
    'asiatique': '🍜',
    'thailandaise': '🌶️',
    'ailes de poulet': '🍗',
    'indienne': '🍛',
    'poke (poisson)': '🥙',
  };
  return emojiMap[category.toLowerCase()] || '🍽️';
};

export default ClientPage;
