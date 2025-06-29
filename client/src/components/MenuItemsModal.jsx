import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faUtensils, 
  faPlus, 
  faTrash, 
  faSearch,
  faBoxOpen,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import api from '../services/baseApi';

const MenuItemsModal = ({ isOpen, onClose, menu, restaurantId }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddItems, setShowAddItems] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [adding, setAdding] = useState({});
  const [removing, setRemoving] = useState({});

  const fetchMenuItems = useCallback(async () => {
    if (!menu?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/restaurants/menuItem/getItemMenu/${menu.id}`);
      const items = response.data.items || [];
      
      // Add full image URLs
      const itemsWithFullUrls = items.map(item => ({
        ...item,
        imageUrl: item.imageUrl && !item.imageUrl.startsWith('http') 
          ? `http://localhost:3000${item.imageUrl}`
          : item.imageUrl
      }));
      
      setMenuItems(itemsWithFullUrls);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Erreur lors du chargement des articles du menu');
    } finally {
      setLoading(false);
    }
  }, [menu?.id]);

  const fetchAvailableItems = useCallback(async () => {
    if (!restaurantId) return;
    
    try {
      const response = await api.get(`/restaurants/item/getRestaurentItem/${restaurantId}`);
      const items = response.data.item || [];
      
      // Add full image URLs
      const itemsWithFullUrls = items.map(item => ({
        ...item,
        imageUrl: item.imageUrl && !item.imageUrl.startsWith('http') 
          ? `http://localhost:3000${item.imageUrl}`
          : item.imageUrl
      }));
      
      setAvailableItems(itemsWithFullUrls);
    } catch (err) {
      console.error('Error fetching available items:', err);
    }
  }, [restaurantId]);

  // Fetch menu items and available restaurant items
  useEffect(() => {
    if (isOpen && menu?.id && restaurantId) {
      fetchMenuItems();
      fetchAvailableItems();
    }
  }, [isOpen, menu?.id, restaurantId, fetchMenuItems, fetchAvailableItems]);

  const addItemToMenu = async (itemId) => {
    setAdding(prev => ({ ...prev, [itemId]: true }));
    try {
      await api.post('/restaurants/menuItem/add', {
        menu_id: menu.id,
        item_id: itemId
      });
      
      // Refresh menu items
      await fetchMenuItems();
    } catch (err) {
      console.error('Error adding item to menu:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout de l\'article');
    } finally {
      setAdding(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const removeItemFromMenu = async (itemId) => {
    setRemoving(prev => ({ ...prev, [itemId]: true }));
    try {
      await api.delete(`/restaurants/menuItem/delete/${menu.id}/${itemId}`);
      
      // Refresh menu items
      await fetchMenuItems();
    } catch (err) {
      console.error('Error removing item from menu:', err);
      setError(err.response?.data?.message || 'Erreur lors de la suppression de l\'article');
    } finally {
      setRemoving(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleImageError = (e) => {
    e.target.src = '/images/placeholder-item.jpg';
  };

  // Filter available items based on search and exclude already added items
  const filteredAvailableItems = availableItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const notInMenu = !menuItems.some(menuItem => menuItem.id === item.id);
    return matchesSearch && notInMenu;
  });

  if (!isOpen || !menu) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#ff5c5c] to-[#ff7e7e] rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faUtensils} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Articles du Menu</h2>
              <p className="text-gray-600 text-sm">{menu.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowAddItems(!showAddItems)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              {showAddItems ? 'Masquer' : 'Ajouter'}
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Error Message */}
          {error && (
            <div className="p-4">
              <ErrorMessage error={error} />
            </div>
          )}

          {/* Add Items Section */}
          {showAddItems && (
            <div className="border-b border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Articles Disponibles</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher un article..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5c5c] focus:border-transparent w-64"
                  />
                  <FontAwesomeIcon 
                    icon={faSearch} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                {filteredAvailableItems.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    {searchTerm ? 'Aucun article trouvé' : 'Tous les articles sont déjà dans ce menu'}
                  </div>
                ) : (
                  filteredAvailableItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl || '/images/placeholder-item.jpg'}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={handleImageError}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 text-sm truncate">{item.name}</h4>
                          <p className="text-xs text-gray-600">{item.price} DA</p>
                        </div>
                        <Button
                          onClick={() => addItemToMenu(item.id)}
                          disabled={adding[item.id]}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {adding[item.id] ? (
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
                          ) : (
                            <FontAwesomeIcon icon={faPlus} className="text-xs" />
                          )}
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Menu Items Section */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faBoxOpen} className="text-[#ff5c5c]" />
              Articles dans le Menu ({menuItems.length})
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
                <span className="ml-3 text-gray-600">Chargement des articles...</span>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faBoxOpen} className="text-gray-400 text-xl" />
                </div>
                <h4 className="text-lg font-semibold text-gray-600 mb-2">Aucun article dans ce menu</h4>
                <p className="text-gray-500 mb-4">Commencez par ajouter des articles à votre menu</p>
                <Button
                  onClick={() => setShowAddItems(true)}
                  className="bg-[#ff5c5c] hover:bg-[#ff4444] text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Ajouter des Articles
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-w-16 aspect-h-9 relative">
                      <img
                        src={item.imageUrl || '/images/placeholder-item.jpg'}
                        alt={item.name}
                        className="w-full h-32 object-cover"
                        onError={handleImageError}
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.status 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status ? 'Disponible' : 'Indisponible'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-800 mb-1 truncate">{item.name}</h4>
                      {item.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-[#ff5c5c]">{item.price} DA</span>
                        <Button
                          onClick={() => removeItemFromMenu(item.id)}
                          disabled={removing[item.id]}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {removing[item.id] ? (
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
                          ) : (
                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                          )}
                          Retirer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemsModal;
