import React from 'react';

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

const restaurants = [
  {
    name: 'BB FOOD',
    rating: '4.4★',
    reviews: '(2,000+)',
    time: '35 min',
    image: 'https://source.unsplash.com/400x300/?burger', // Replace with your real images
  },
  {
    name: "O'CLASSIC CORNER",
    rating: '4.6★',
    reviews: '(4,000+)',
    time: '40 min',
    image: 'https://source.unsplash.com/400x300/?sandwich',
  },
  {
    name: 'Poopeye GRILL',
    rating: '4.4★',
    reviews: '(300+)',
    time: '30 min',
    image: 'https://source.unsplash.com/400x300/?grill',
  },
];

const recommended = [
  {
    name: 'Eleven Street Arnouville(by les reufs)',
    rating: '4.2★',
    reviews: '(1,500+)',
    time: '30 min',
    image: 'https://source.unsplash.com/400x300/?pizza',
  },
  {
    name: "Crep'Way",
    rating: '4.1★',
    reviews: '(500+)',
    time: '30 min',
    image: 'https://source.unsplash.com/400x300/?crepes',
  },
  {
    name: 'PIZZA FACTORY BY AFRICAN BRAISE',
    rating: '4.4★',
    reviews: '(190+)',
    time: '25 min',
    image: 'https://source.unsplash.com/400x300/?african-pizza',
  },
];

const ClientPage = () => {
  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div>
        <input
          type="text"
          placeholder="search"
          className="w-full border border-gray-300 rounded-full px-4 py-2"
        />
      </div>

      {/* Categories */}
      <div className="flex space-x-4 overflow-x-auto py-2">
        {categories.map((cat) => (
          <div key={cat.label} className="flex-shrink-0 text-center text-sm">
            <div className="text-2xl">{cat.emoji}</div>
            <div>{cat.label}</div>
          </div>
        ))}
      </div>

      {/* Top restaurants */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Top restaurants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {restaurants.map((rest) => (
            <div key={rest.name} className="rounded-lg overflow-hidden shadow">
              <img src={rest.image} alt={rest.name} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold">{rest.name}</h3>
                <p className="text-sm text-gray-500">
                  {rest.rating} <span>{rest.reviews}</span> • {rest.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Les incontournables du quartier</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {recommended.map((rest) => (
            <div key={rest.name} className="rounded-lg overflow-hidden shadow">
              <img src={rest.image} alt={rest.name} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold">{rest.name}</h3>
                <p className="text-sm text-gray-500">
                  {rest.rating} <span>{rest.reviews}</span> • {rest.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientPage;
