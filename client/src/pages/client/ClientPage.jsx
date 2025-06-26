import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from '../../components/SearchBar';
import FilterButton from '../../components/FilterButton';
import RestaurantCard from '../../components/RestaurantCard';
import debounce from 'lodash/debounce'; // Ensure lodash is installed: npm install lodash

const ClientPage = () => {
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]); // Start with empty array
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  const [isLoading, setIsLoading] = useState(true);
  const [initialRestaurants, setInitialRestaurants] = useState([]); // Store initial API data

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:3000/api/restaurants/getAll', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
        });
        const data = response.data;
        console.log('Initial API Response:', data); // Log initial data
        setCategories(data.categories || []);
        setRestaurants(data.restaurants || []);
        setInitialRestaurants(data.restaurants || []);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setCategories(['Courses', 'Halal', 'Pizzas', 'Fast food', 'Sushis', 'Desserts', 'Burgers', 'Cuisine saine', 'Asiatique', 'Thailandaise', 'Ailes de poulet', 'Indienne', 'Poke (poisson)']);
        setRestaurants([]); // No mock data, empty until API is filled
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
        // Use initialRestaurants for filtering to preserve the full list
        const filtered = initialRestaurants.filter((rest) =>
          (!selectedCategory || rest.type_de_cuisine === selectedCategory) &&
          (!searchTerm || rest.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        console.log('Filtered Restaurants:', filtered); // Debug log
        setRestaurants(filtered);
      } catch (error) {
        console.error('Erreur lors du filtrage local:', error);
        setRestaurants(initialRestaurants); // Fallback to all restaurants on error
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the filtering to avoid excessive re-renders
    const debouncedFilter = debounce(filterRestaurants, 300);
    debouncedFilter();

    // Cleanup debounce on unmount
    return () => debouncedFilter.cancel();
  }, [selectedCategory, searchTerm, initialRestaurants]);

  const handleFilterClick = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  const handleCardClick = (restaurantId) => {
    console.log(`Navigating to order page for restaurant ID: ${restaurantId}`);
    // Add your navigation logic here (e.g., with React Router)
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen text-2xl text-gray-600">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="w-full max-w-2xl mx-auto mb-6">
          <SearchBar className="w-full bg-white rounded-full shadow-lg p-3 flex items-center border border-gray-200 focus-within:ring-2 focus-within:ring-orange-400" onChange={handleSearchChange} />
        </div>

        {/* Filter Buttons */}
        <div className="mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
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
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">Top Restaurants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">No restaurants available. Check back when data is loaded!</div>
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

// Fonction pour mapper les catégories aux emojis
const getEmoji = (category) => {
  const emojiMap = {
    'Courses': '🛒',
    'Halal': '🦐',
    'Pizzas': '🍕',
    'Fast food': '🍟',
    'Sushis': '🍣',
    'Desserts': '🍪',
    'Burgers': '🍔',
    'Cuisine saine': '🥗',
    'Asiatique': '🍜',
    'Thailandaise': '🌶️',
    'Ailes de poulet': '🍗',
    'Indienne': '🍛',
    'Poke (poisson)': '🥙',
  };
  return emojiMap[category] || '🍽️';
};

export default ClientPage;