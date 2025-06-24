import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from '../../components/SearchBar';
import FilterButton from '../../components/FilterButton';
import RestaurantCard from '../../components/RestaurantCard';

const categories = [
  { label: 'Courses', emoji: '🛒' },
  { label: 'Halal', emoji: '🦐' },
  { label: 'Pizzas', emoji: '🍕' },
  { label: 'Fast food', emoji: '🍟' },
  { label: 'Sushis', emoji: '🍣' },
  { label: 'Desserts', emoji: '🍪' },
  { label: 'Burgers', emoji: '🍔' },
  { label: 'Cuisine saine', emoji: '🥗' },
  { label: 'Asiatique', emoji: '🍜' },
  { label: 'Thailandaise', emoji: '🌶️' },
  { label: 'Ailes de poulet', emoji: '🍗' },
  { label: 'Indienne', emoji: '🍛' },
  { label: 'Poke (poisson)', emoji: '🥙' },
];

const ClientPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get(`https://api.yumzo.com/api/restaurants?category=${selectedCategory}`);
        setRestaurants(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des restaurants:', error);
        setRestaurants([
          { id: 1, name: 'BB FOOD', rating: '4.4★', reviews: '(2,000+)', time: '35 min', image: 'https://source.unsplash.com/400x300/?burger', category: 'Fast food' },
          { id: 2, name: "O'CLASSIC CORNER", rating: '4.6★', reviews: '(4,000+)', time: '40 min', image: 'https://source.unsplash.com/400x300/?sandwich', category: 'Burgers' },
          { id: 3, name: 'Poopeye GRILL', rating: '4.4★', reviews: '(300+)', time: '30 min', image: 'https://source.unsplash.com/400x300/?grill', category: 'Grill' },
          { id: 4, name: 'Eleven Street Arnouville', rating: '4.2★', reviews: '(1,500+)', time: '30 min', image: 'https://source.unsplash.com/400x300/?pizza', category: 'Pizzas' },
          { id: 5, name: "Crep'Way", rating: '4.1★', reviews: '(500+)', time: '30 min', image: 'https://source.unsplash.com/400x300/?crepes', category: 'Desserts' },
          { id: 6, name: 'PIZZA FACTORY', rating: '4.4★', reviews: '(190+)', time: '25 min', image: 'https://source.unsplash.com/400x300/?african-pizza', category: 'Pizzas' },
        ].filter(rest => !selectedCategory || rest.category === selectedCategory));
      }
    };
    fetchRestaurants();
  }, [selectedCategory]);

  const handleFilterClick = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  return (
    <div className="space-y-6 p-4">
      <SearchBar />
      <div className="flex space-x-4 overflow-x-auto py-2">
        {categories.map((cat) => (
          <FilterButton
            key={cat.label}
            category={cat}
            isSelected={selectedCategory === cat.label}
            onClick={handleFilterClick}
          />
        ))}
      </div>
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Top restaurants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientPage;