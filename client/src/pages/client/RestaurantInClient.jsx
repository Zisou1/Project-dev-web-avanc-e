import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { menuService } from '../../services/menuService';

const RestaurantInClient = () => {
  const { id } = useParams(); // Get restaurant ID from URL
  const [restaurant, setRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [independentItems, setIndependentItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState({ title: '', subtitle: '' });

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

        // Fetch all items for this restaurant first
        let allRestaurantItems = [];
        try {
          const itemsResponse = await axios.get('http://localhost:3000/api/restaurants/item/getAll', {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` }
          });
          const allItems = itemsResponse.data.items || itemsResponse.data;
          allRestaurantItems = Array.isArray(allItems)
            ? allItems.filter(item => String(item.restaurant_id) === String(id))
            : [];
        } catch (itemError) {
          console.error('Error fetching items:', itemError);
          allRestaurantItems = [];
        }

        // Fetch menus for this restaurant
        let menusWithItems = [];
        const itemsInMenus = new Set();
        
        try {
          const menusResponse = await menuService.getRestaurantMenus(id);
          const restaurantMenus = menusResponse.menu || [];
          
          // For each menu, fetch its items
          menusWithItems = await Promise.all(
            restaurantMenus.map(async (menu) => {
              try {
                const menuItemsResponse = await menuService.menuItems.getMenuItems(menu.id);
                const items = menuItemsResponse.items || [];
                
                // Add item IDs to the set
                items.forEach(item => {
                  itemsInMenus.add(item.id);
                });
                
                return {
                  ...menu,
                  items
                };
              } catch (error) {
                console.error(`Error fetching items for menu ${menu.id}:`, error);
                return {
                  ...menu,
                  items: []
                };
              }
            })
          );
          
          setMenus(menusWithItems);
        } catch (menuError) {
          console.error('Error fetching menus:', menuError);
          setMenus([]);
        }

        // Filter out items that are already in menus to get independent items
        const independentItems = allRestaurantItems.filter(item => !itemsInMenus.has(item.id));
        setIndependentItems(independentItems);

      } catch (error) {
        setRestaurant(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRestaurantData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-red-300 rounded-full animate-ping mx-auto"></div>
          </div>
          <p className="text-xl text-gray-700 font-medium">Chargement du restaurant...</p>
          <p className="text-sm text-gray-500 mt-2">Préparation de votre expérience culinaire</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Restaurant introuvable</h2>
          <p className="text-gray-600 mb-6">Désolé, nous n'avons pas pu charger les informations de ce restaurant.</p>
          <button 
            onClick={() => window.history.back()} 
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // Proceed with rendering even if restaurant is not found
  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Restaurant Image */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-10 group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10"></div>
          <img
            src={restaurant.imageUrl || restaurant.image_url || '/images/restaurant-banner.jpg'}
            alt={restaurant.name || 'Restaurant Image'}
            className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
            onError={(e) => { e.target.src = '/images/restaurant-banner.jpg'; }}
          />
          
          {/* Restaurant Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-6 sm:p-8 text-white">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 drop-shadow-lg">
              {restaurant.name || 'Restaurant Not Found'}
            </h1>
            <div className="flex items-center space-x-4 text-white/90">
              <div className="flex items-center space-x-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">{restaurant.address || 'Address not available'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Description Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">À propos</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {restaurant.description || 'Découvrez notre cuisine exceptionnelle et notre service de qualité dans une atmosphère chaleureuse et accueillante.'}
            </p>
          </div>

          {/* Hours Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Horaires</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600 font-medium">Ouvert maintenant</span>
              </div>
              <p className="text-gray-600 text-sm">
                {restaurant.workingHours || restaurant.openingHours || '09:00 - 22:00'}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Section Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Notre Carte</h2>
                <p className="text-orange-100">Découvrez nos menus et spécialités culinaires</p>
              </div>
              <div className="hidden sm:block">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="p-6 sm:p-8">
            {menus.length > 0 || independentItems.length > 0 ? (
              <div className="space-y-12">
                {/* Display Menus with their items */}
                {menus.map((menu, menuIndex) => (
                  <div key={menu.id} className="space-y-6">
                    {/* Menu Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center space-x-4">
                        <img
                          src={menu.imageUrl || menu.image_url || '/images/placeholder-menu.jpg'}
                          alt={menu.name}
                          className="w-16 h-16 object-cover rounded-lg shadow-md"
                          onError={(e) => { e.target.src = '/images/placeholder-menu.jpg'; }}
                        />
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">{menu.name}</h3>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-lg font-semibold text-orange-600">
                                {menu.price} DZD
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                menu.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {menu.status ? 'Disponible' : 'Non disponible'}
                              </span>
                            </div>
                            {/* Buy Menu Button */}
                            {menu.status && menu.items && menu.items.length > 0 && (
                              <button
                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                                onClick={() => {
                                  // Add all menu items to cart
                                  menu.items.forEach(item => {
                                    addToCart(item);
                                  });
                                  setPopupMessage({
                                    title: 'Menu ajouté !',
                                    subtitle: `${menu.items.length} articles ajoutés au panier`
                                  });
                                  setShowPopup(true);
                                  setTimeout(() => setShowPopup(false), 3000);
                                }}
                                aria-label={`Acheter tout le menu ${menu.name}`}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 6H6L5 9z" />
                                </svg>
                                <span>Acheter menu</span>
                                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                  {menu.items.length} articles
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    {menu.items && menu.items.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {menu.items.map((item, itemIndex) => (
                          <div
                            key={item.id}
                            className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-orange-200 transition-all duration-300 hover:-translate-y-1"
                          >
                            {/* Item Image */}
                            <div className="relative h-48 bg-gray-50 overflow-hidden">
                              <img
                                src={item.imageUrl || item.image_url || item.image || '/images/placeholder-item.jpg'}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => { e.target.src = '/images/placeholder-item.jpg'; }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>

                            {/* Item Info */}
                            <div className="p-5">
                              <h4 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">
                                {item.name}
                              </h4>
                              
                              {/* Price */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                  <span className="text-xl font-bold text-orange-600">
                                    {item.price || 'N/A'}
                                  </span>
                                  <span className="text-sm text-gray-500 ml-1">DZD</span>
                                </div>
                                <div className="flex items-center text-yellow-400">
                                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                  </svg>
                                  <span className="text-xs text-gray-600 ml-1">4.5</span>
                                </div>
                              </div>

                              {/* Add to Cart Button */}
                              <button
                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 group-hover:shadow-lg transform hover:scale-105"
                                onClick={() => {
                                  addToCart(item);
                                  setPopupMessage({
                                    title: 'Article ajouté !',
                                    subtitle: 'Consultez votre panier pour finaliser'
                                  });
                                  setShowPopup(true);
                                  setTimeout(() => setShowPopup(false), 2000);
                                }}
                                aria-label={`Ajouter ${item.name} au panier`}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13v6a1 1 0 001 1h7a1 1 0 001-1v-6M7 13H5.4M17 13v6a1 1 0 01-1 1H9a1 1 0 01-1-1v-6" />
                                </svg>
                                <span>Ajouter au panier</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Aucun article dans ce menu pour le moment.</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Display Independent Items */}
                {independentItems.length > 0 && (
                  <div className="space-y-6">
                    {/* Independent Items Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">Articles Individuels</h3>
                          <p className="text-blue-700">Articles disponibles en dehors des menus</p>
                        </div>
                      </div>
                    </div>

                    {/* Independent Items Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {independentItems.map((item, index) => (
                        <div
                          key={item.id}
                          className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1"
                        >
                          {/* Item Image */}
                          <div className="relative h-48 bg-gray-50 overflow-hidden">
                            <img
                              src={item.imageUrl || item.image_url || item.image || '/images/placeholder-item.jpg'}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => { e.target.src = '/images/placeholder-item.jpg'; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>

                          {/* Item Info */}
                          <div className="p-5">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                              {item.name}
                            </h4>
                            
                            {/* Price */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <span className="text-xl font-bold text-blue-600">
                                  {item.price || 'N/A'}
                                </span>
                                <span className="text-sm text-gray-500 ml-1">DZD</span>
                              </div>
                              <div className="flex items-center text-yellow-400">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                </svg>
                                <span className="text-xs text-gray-600 ml-1">4.5</span>
                              </div>
                            </div>

                            {/* Add to Cart Button */}
                            <button
                              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 group-hover:shadow-lg transform hover:scale-105"
                              onClick={() => {
                                addToCart(item);
                                setPopupMessage({
                                  title: 'Article ajouté !',
                                  subtitle: 'Consultez votre panier pour finaliser'
                                });
                                setShowPopup(true);
                                setTimeout(() => setShowPopup(false), 2000);
                              }}
                              aria-label={`Ajouter ${item.name} au panier`}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13v6a1 1 0 001 1h7a1 1 0 001-1v-6M7 13H5.4M17 13v6a1 1 0 01-1 1H9a1 1 0 01-1-1v-6" />
                              </svg>
                              <span>Ajouter au panier</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Menu en préparation</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Aucun menu ou article n'est disponible pour ce restaurant pour le moment. 
                  Revenez bientôt pour découvrir nos délicieuses spécialités !
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Success Popup */}
        {showPopup && (
          <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white border border-green-200 rounded-2xl shadow-2xl p-6 flex items-center space-x-4 animate-bounce">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-800">{popupMessage.title}</p>
                <p className="text-sm text-gray-600">{popupMessage.subtitle}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantInClient;