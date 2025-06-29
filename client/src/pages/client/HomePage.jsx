import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import Toast from '../../components/Toast';
import homeImg from '../../assets/Home.png';
import yassir from '../../assets/Yassir.png';
import wonder from '../../assets/WonderFoods.png';
import bubble from '../../assets/WiiiiiiiiiiW.png';
import hicham from '../../assets/HichemCook.png';
import elpadre from '../../assets/Elpadre.png';

const reviews = [
  {
    name: 'Sophie',
    date: 'il y a 4 jours',
    text: "Pretty good overall! I liked the vibe and the way everything was handled. There’s still a bit of room for improvement, but still had a mostly positive experience. Thanks!",
  },
  {
    name: 'James Liu',
    date: 'il y a 3 jours',
    text: "Super facile et rapide ! Le service a dépassé mes attentes — tout était intuitif, et la nourriture est incroyablement pratique. J’en ai déjà parlé à mes amis 😍 !"
  },
  {
    name: 'Emily Rose',
    date: 'il y a 2 jours',
    text: "Really happy with the experience! The team was super friendly and responsive. My order arrived a bit slow at one point, but overall great service.",
  },
];

const partners = [yassir, wonder, bubble, hicham, elpadre];

function HomePage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [restaurants, setRestaurants] = useState([]);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [currentRestaurantIndex, setCurrentRestaurantIndex] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  
  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const response = await axios.get('http://localhost:3000/api/restaurants/getAll', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` }
        });
        if (Array.isArray(response.data.restaurants)) {
          setRestaurants(response.data.restaurants);
        } else if (Array.isArray(response.data)) {
          setRestaurants(response.data);
        } else {
          setError('Format de réponse inattendu');
        }
      } catch (err) {
        setError('Erreur lors du chargement des restaurants');
      }
    }
    
    async function fetchItems() {
      try {
        const response = await axios.get('http://localhost:3000/api/restaurants/item/getAll', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` }
        });
        if (Array.isArray(response.data.items)) {
          setItems(response.data.items);
        } else if (Array.isArray(response.data)) {
          setItems(response.data);
        }
      } catch (err) {
        console.log('Erreur lors du chargement des items', err);
      }
    }
    
    fetchRestaurants();
    fetchItems();
  }, []);

  // Auto-rotate carousels
  useEffect(() => {
    const restaurantInterval = setInterval(() => {
      if (restaurants.length > 3) {
        setCurrentRestaurantIndex((prev) => (prev + 1) % (restaurants.length - 2));
      }
    }, 4000);

    const itemInterval = setInterval(() => {
      if (items.length > 3) {
        setCurrentItemIndex((prev) => (prev + 1) % (items.length - 2));
      }
    }, 4500);

    return () => {
      clearInterval(restaurantInterval);
      clearInterval(itemInterval);
    };
  }, [restaurants.length, items.length]);

  const nextRestaurants = () => {
    if (restaurants.length > 3) {
      setCurrentRestaurantIndex((prev) => (prev + 1) % (restaurants.length - 2));
    }
  };

  const prevRestaurants = () => {
    if (restaurants.length > 3) {
      setCurrentRestaurantIndex((prev) => (prev - 1 + (restaurants.length - 2)) % (restaurants.length - 2));
    }
  };

  const nextItems = () => {
    if (items.length > 3) {
      setCurrentItemIndex((prev) => (prev + 1) % (items.length - 2));
    }
  };

  const prevItems = () => {
    if (items.length > 3) {
      setCurrentItemIndex((prev) => (prev - 1 + (items.length - 2)) % (items.length - 2));
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  return (
    <div className="font-sans bg-gray-50">
      {/* Enhanced Hero Section */}
      <div
        className="relative w-screen left-1/2 right-1/2 -translate-x-1/2 gradient-primary min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3)), url(${homeImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-300 opacity-10 rounded-full animate-bounce"></div>
          <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-300 opacity-5 rounded-full animate-float"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-pink-300 opacity-5 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="animate-fade-in-up">
            <h1 className="text-white text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Commandez vos <br />
              <span className="gradient-text-animated text-transparent bg-clip-text animate-glow">plats préférés</span><br />
              en quelques clics
            </h1>
            <p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              <i className="fas fa-shipping-fast mr-2 text-yellow-300"></i>
              Livraison rapide • Restaurants de qualité • Expérience fluide
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => navigate('/client')}
                className="btn-primary text-white px-8 py-4 rounded-full font-semibold text-lg transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center"
              >
                <i className="fas fa-utensils mr-2"></i>
                Commander maintenant
              </button>
              <button 
                onClick={() => navigate('/client')}
                className="glass border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/20 transform hover:scale-105 transition-all duration-300 flex items-center backdrop-blur-md"
              >
                <i className="fas fa-search mr-2"></i>
                Explorer les restaurants
              </button>
            </div>
            
            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto">
              <div className="text-center glass-dark p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-300 animate-pulse-slow">500+</div>
                <div className="text-white/80 text-sm">Restaurants</div>
              </div>
              <div className="text-center glass-dark p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-300 animate-pulse-slow" style={{animationDelay: '0.5s'}}>50k+</div>
                <div className="text-white/80 text-sm">Commandes</div>
              </div>
              <div className="text-center glass-dark p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-300 animate-pulse-slow" style={{animationDelay: '1s'}}>4.8★</div>
                <div className="text-white/80 text-sm">Note moyenne</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="glass-dark p-3 rounded-full">
            <i className="fas fa-chevron-down text-white text-xl animate-pulse"></i>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Pourquoi choisir notre service ?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Une expérience de livraison exceptionnelle avec des fonctionnalités pensées pour vous</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 card-hover bg-white group">
              <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-bolt text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Livraison rapide</h3>
              <p className="text-gray-600 leading-relaxed">Recevez vos plats en 30 minutes maximum grâce à notre réseau optimisé</p>
            </div>
            
            <div className="text-center p-8 rounded-xl hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 card-hover bg-white group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-shield-alt text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Qualité garantie</h3>
              <p className="text-gray-600 leading-relaxed">Restaurants sélectionnés pour leur excellence et leur savoir-faire</p>
            </div>
            
            <div className="text-center p-8 rounded-xl hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 card-hover bg-white group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-mobile-alt text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">App intuitive</h3>
              <p className="text-gray-600 leading-relaxed">Interface simple et navigation fluide pour une expérience optimale</p>
            </div>
          </div>
        </div>
      </section>

      {/* Restaurants Carousel */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              <i className="fas fa-store mr-3 text-red-500"></i>
              Restaurants populaires
            </h2>
            <div className="flex gap-2">
              <button
                onClick={prevRestaurants}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
                disabled={restaurants.length <= 3}
              >
                <i className="fas fa-chevron-left text-gray-600"></i>
              </button>
              <button
                onClick={nextRestaurants}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
                disabled={restaurants.length <= 3}
              >
                <i className="fas fa-chevron-right text-gray-600"></i>
              </button>
            </div>
          </div>
          
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentRestaurantIndex * (100 / 3)}%)`,
              }}
            >
              {restaurants.length === 0 ? (
                <div className="w-full text-center py-12">
                  <i className="fas fa-store text-4xl text-gray-400 mb-4"></i>
                  <p className="text-gray-500">Chargement des restaurants...</p>
                </div>
              ) : (
                restaurants.map((restaurant, idx) => (
                  <div key={restaurant.id || idx} className="w-1/3 flex-shrink-0 px-3">
                    <div 
                      onClick={() => navigate(`/restaurantinclient/${restaurant.id}`)}
                      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer card-hover group"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={restaurant.image || '/images/restaurant-default.jpg'}
                          alt={restaurant.name}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        <div className="absolute top-3 right-3 glass text-white px-3 py-1 rounded-full text-xs font-semibold">
                          <i className="fas fa-utensils mr-1"></i>
                          {restaurant.cuisine || 'Restaurant'}
                        </div>
                        <div className="absolute bottom-3 left-3 glass text-white px-2 py-1 rounded-full text-xs">
                          <i className="fas fa-star mr-1 text-yellow-400"></i>
                          4.8
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-red-500 transition-colors">{restaurant.name}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{restaurant.cuisine || 'Cuisine variée et délicieuse'}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 flex items-center bg-gray-50 px-2 py-1 rounded-full">
                            <i className="fas fa-clock mr-1 text-green-500"></i>
                            {restaurant.startTime || '09:00'} - {restaurant.endTime || '22:00'}
                          </span>
                          <span className="text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
                            <i className="fas fa-check-circle mr-1"></i>
                            Ouvert
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Items Carousel */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              <i className="fas fa-utensils mr-3 text-red-500"></i>
              Plats tendance
            </h2>
            <div className="flex gap-2">
              <button
                onClick={prevItems}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
                disabled={items.length <= 3}
              >
                <i className="fas fa-chevron-left text-gray-600"></i>
              </button>
              <button
                onClick={nextItems}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
                disabled={items.length <= 3}
              >
                <i className="fas fa-chevron-right text-gray-600"></i>
              </button>
            </div>
          </div>
          
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentItemIndex * (100 / 3)}%)`,
              }}
            >
              {items.length === 0 ? (
                <div className="w-full text-center py-12">
                  <i className="fas fa-utensils text-4xl text-gray-400 mb-4"></i>
                  <p className="text-gray-500">Chargement des plats...</p>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div key={item._id || idx} className="w-1/3 flex-shrink-0 px-3">
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 card-hover group">
                      <div className="relative overflow-hidden">
                        <img
                          src={item.image || '/images/pizza.jpg'}
                          alt={item.name}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                          <i className="fas fa-fire mr-1"></i>
                          Populaire
                        </div>
                        <div className="absolute top-3 right-3 glass text-white px-2 py-1 rounded-full text-xs">
                          <i className="fas fa-heart mr-1 text-red-400"></i>
                          4.9
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-red-500 transition-colors">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description || 'Délicieux plat préparé avec soin et amour'}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                            {item.price || '15.99'}€
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart({
                                id: item._id,
                                name: item.name,
                                price: item.price || 15.99,
                                image: item.image,
                                description: item.description,
                                restaurant_id: item.restaurant_id
                              });
                              showToast(`${item.name} ajouté au panier !`, 'success');
                            }}
                            className="btn-primary text-white px-5 py-2 rounded-full text-sm font-medium transform hover:scale-105 transition-all duration-300 shadow-lg"
                          >
                            <i className="fas fa-plus mr-1"></i>
                            Ajouter
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              <i className="fas fa-comments mr-3 text-red-500"></i>
              Les avis de nos utilisateurs
            </h2>
            <p className="text-gray-600">Découvrez ce que nos clients pensent de notre service</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((rev, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 card-hover group border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <i className="fas fa-user text-white text-lg"></i>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-lg">{rev.name}</div>
                    <div className="text-xs text-gray-500">{rev.date}</div>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i key={star} className="fas fa-star text-yellow-400 text-base mr-1"></i>
                  ))}
                </div>
                <p className="italic text-gray-600 leading-relaxed text-sm">"{rev.text}"</p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                    <i className="fas fa-check-circle mr-1 text-green-500"></i>
                    Commande vérifiée
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              <i className="fas fa-handshake mr-3 text-red-500"></i>
              Nos partenaires de confiance
            </h2>
            <p className="text-gray-600">Nous travaillons avec les meilleurs pour vous offrir une expérience exceptionnelle</p>
          </div>
          
          <div className="flex justify-center items-center gap-12 flex-wrap">
            {partners.map((src, idx) => (
              <div key={idx} className="grayscale hover:grayscale-0 transition-all duration-500 transform hover:scale-125 filter drop-shadow-lg hover:drop-shadow-xl">
                <img src={src} alt="partenaire" className="h-16 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}

export default HomePage;