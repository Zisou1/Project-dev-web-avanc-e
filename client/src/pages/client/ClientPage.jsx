import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from '../../components/SearchBar';
import FilterButton from '../../components/KitchenTypeFilter';
import RestaurantCard from '../../components/RestaurantCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import debounce from 'lodash/debounce';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight, 
  faFire, 
  faStar,
  faMapMarkerAlt,
  faUtensils,
  faSearch,
  faClock,
  faThumbsUp,
  faSort
} from '@fortawesome/free-solid-svg-icons';

const ALL_CATEGORIES = [
  'courses', 'halal', 'pizzas', 'fast food', 'sushis', 'desserts',
  'burger', 'cuisine saine', 'asiatique', 'thailandaise',
  'ailes de poulet', 'indienne', 'poke (poisson)'
];

const RESTAURANTS_PER_PAGE = 9;

const ClientPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [initialRestaurants, setInitialRestaurants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'rating', 'delivery_time'
  const [showFavorites, setShowFavorites] = useState(false);
  const navigate = useNavigate();

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
        let filtered = initialRestaurants.filter((rest) =>
          (!selectedCategory || rest.kitchen_type?.toLowerCase() === selectedCategory.toLowerCase()) &&
          (!searchTerm || rest.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        // Add random data for demo sorting
        filtered = filtered.map(restaurant => ({
          ...restaurant,
          rating: restaurant.rating || (Math.random() * 1.5 + 3.5).toFixed(1),
          delivery_time: restaurant.delivery_time || Math.floor(Math.random() * 20 + 15),
          is_favorite: restaurant.is_favorite || Math.random() > 0.8
        }));

        // Apply favorites filter
        if (showFavorites) {
          filtered = filtered.filter(rest => rest.is_favorite);
        }

        // Apply sorting
        filtered.sort((a, b) => {
          switch (sortBy) {
            case 'rating':
              return parseFloat(b.rating) - parseFloat(a.rating);
            case 'delivery_time':
              return a.delivery_time - b.delivery_time;
            default:
              return a.name.localeCompare(b.name);
          }
        });

        setRestaurants(filtered);
        setCurrentPage(1); // Reset to first page when filtering
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
  }, [selectedCategory, searchTerm, initialRestaurants, sortBy, showFavorites]);

  const handleFilterClick = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  const handleCardClick = (restaurantId) => {
    navigate(`/restaurantinclient/${restaurantId}`);
  };

  // Pagination logic
  const totalPages = Math.ceil(restaurants.length / RESTAURANTS_PER_PAGE);
  const startIndex = (currentPage - 1) * RESTAURANTS_PER_PAGE;
  const endIndex = startIndex + RESTAURANTS_PER_PAGE;
  const currentRestaurants = restaurants.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Floating action button handlers
  const handleLocationFilter = () => {
    // Implement geolocation filtering
    console.log('Filter by location');
  };

  const handleFavoritesFilter = () => {
    setShowFavorites(!showFavorites);
  };

  const handleSortChange = () => {
    const sortOptions = ['name', 'rating', 'delivery_time'];
    const currentIndex = sortOptions.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    setSortBy(sortOptions[nextIndex]);
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'rating':
        return 'Note';
      case 'delivery_time':
        return 'Temps de livraison';
      default:
        return 'Nom';
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Chargement des restaurants" />;
  }

  return (
    <div className="min-h-screen  ">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
            <FontAwesomeIcon icon={faUtensils} className="text-3xl md:text-4xl" />
            Découvrez nos Restaurants
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Explorez une sélection de restaurants délicieux près de chez vous
          </p>
          
          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <SearchBar
                query={searchTerm}
                setQuery={setSearchTerm}
                placeholder="🔍 Rechercher un restaurant..."
              />
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-white/30 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filter Buttons */}
      <div className="sticky top-16 sm:top-18 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <FontAwesomeIcon icon={faFire} className="text-orange-500 text-lg" />
            <h3 className="text-lg font-semibold text-gray-800">Catégories populaires</h3>
          </div>
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            {ALL_CATEGORIES.map((category) => (
              <FilterButton
                key={category}
                category={{ label: category, emoji: getEmoji(category) }}
                isSelected={selectedCategory === category}
                onClick={handleFilterClick}
                className={`flex-shrink-0 bg-white rounded-full px-4 py-3 shadow-md transition-all duration-300 border-2 ${
                  selectedCategory === category 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-500 scale-105 shadow-lg' 
                    : 'hover:bg-orange-50 hover:border-orange-300 text-gray-700 border-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Restaurants Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faStar} className="text-yellow-500 text-xl" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                All Restaurants
                {selectedCategory && (
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    - {selectedCategory}
                  </span>
                )}
              </h2>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-orange-500" />
                <span>{restaurants.length} restaurants trouvés</span>
              </div>
              
              {showFavorites && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faThumbsUp} className="text-pink-500" />
                  <span>Favoris uniquement</span>
                </div>
              )}
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <span>Page {currentPage} sur {totalPages}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Restaurants Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentRestaurants.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="bg-white rounded-xl p-8 shadow-md">
                <FontAwesomeIcon icon={faSearch} className="text-4xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun restaurant trouvé</h3>
                <p className="text-gray-500">
                  {searchTerm || selectedCategory 
                    ? "Essayez de modifier vos critères de recherche" 
                    : "Aucun restaurant disponible pour le moment"
                  }
                </p>
              </div>
            </div>
          ) : (
            currentRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:scale-[1.02] border border-gray-100"
                onClick={() => handleCardClick(restaurant.id)}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-8">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 shadow-md hover:shadow-lg'
              }`}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
              Précédent
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                const isActive = page === currentPage;
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 shadow-md hover:shadow-lg'
              }`}
            >
              Suivant
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        )}
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