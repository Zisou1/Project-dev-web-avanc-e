import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { restaurantService } from '../../services/restaurantService';
import Button from '../../components/Button';
import SearchBar from '../../components/SearchBar';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import MenuCard from '../../components/MenuCard';
import AddMenuModal from '../../components/AddMenuModal';
import EditMenuModal from '../../components/EditMenuModal';
import MenuItemsModal from '../../components/MenuItemsModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUtensils, faTrash } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/baseApi';

const MenuPage = () => {
  const { user } = useAuth();
  
  // State management
  const [menus, setMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Selected items
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [menuToDelete, setMenuToDelete] = useState(null);

  const fetchMenus = useCallback(async () => {
    if (!restaurant?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/restaurants/menu/getRestaurentMenu/${restaurant.id}`);
      const menusData = response.data.menu || [];
      
      // Add full image URLs to menus
      const menusWithFullUrls = menusData.map(menu => ({
        ...menu,
        imageUrl: menu.imageUrl && !menu.imageUrl.startsWith('http') 
          ? `http://localhost:3000${menu.imageUrl}`
          : menu.imageUrl
      }));
      
      setMenus(menusWithFullUrls);
    } catch (err) {
      console.error('Error fetching menus:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des menus');
    } finally {
      setLoading(false);
    }
  }, [restaurant?.id]);

  // Get restaurant data
  useEffect(() => {
    const fetchRestaurant = async () => {
      if (user && user.role === 'restaurant') {
        try {
          const restaurantData = await restaurantService.getRestaurantByUserId(user.id);
          setRestaurant(restaurantData);
        } catch (err) {
          console.error('Error fetching restaurant:', err);
          setError('Erreur lors du chargement des données du restaurant');
        }
      }
    };
    fetchRestaurant();
  }, [user]);

  // Fetch menus when restaurant is loaded
  useEffect(() => {
    if (restaurant?.id) {
      fetchMenus();
    }
  }, [restaurant, fetchMenus]);

  // Filter menus based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMenus(menus);
    } else {
      const filtered = menus.filter(menu => 
        menu.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMenus(filtered);
    }
  }, [menus, searchTerm]);

  const handleAddMenu = async (menuData) => {
    try {
      const formData = new FormData();
      formData.append('name', menuData.name);
      formData.append('price', menuData.price);
      formData.append('status', menuData.status);
      formData.append('restaurant_id', restaurant.id);
      if (menuData.image) {
        formData.append('image', menuData.image);
      }

      // Create the menu first
      const response = await api.post('/restaurants/menu/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Add selected items to the menu if any
      if (menuData.selectedItems && menuData.selectedItems.length > 0 && response.data.menu) {
        const menuId = response.data.menu.id;
        const itemPromises = menuData.selectedItems.map(item =>
          api.post('/restaurants/menuItem/add', {
            menu_id: menuId,
            item_id: item.id
          })
        );
        await Promise.all(itemPromises);
      }

      setShowAddModal(false);
      fetchMenus(); // Refresh the list
    } catch (err) {
      console.error('Error adding menu:', err);
      throw new Error(err.response?.data?.message || 'Erreur lors de l\'ajout du menu');
    }
  };

  const handleEditMenu = async (menuData) => {
    try {
      const formData = new FormData();
      formData.append('name', menuData.name);
      formData.append('price', menuData.price);
      formData.append('status', menuData.status);
      formData.append('restaurant_id', restaurant.id);
      if (menuData.image) {
        formData.append('image', menuData.image);
      } else {
        // Keep existing image if no new image is uploaded
        formData.append('imageUrl', selectedMenu.imageUrl || '');
      }

      await api.put(`/restaurants/menu/update/${selectedMenu.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowEditModal(false);
      setSelectedMenu(null);
      fetchMenus(); // Refresh the list
    } catch (err) {
      console.error('Error updating menu:', err);
      throw new Error(err.response?.data?.message || 'Erreur lors de la modification du menu');
    }
  };

  const handleDeleteMenu = async () => {
    if (!menuToDelete) return;
    
    try {
      await api.delete(`/restaurants/menu/delete/${menuToDelete.id}`);
      setShowDeleteModal(false);
      setMenuToDelete(null);
      fetchMenus(); // Refresh the list
    } catch (err) {
      console.error('Error deleting menu:', err);
      setError(err.response?.data?.message || 'Erreur lors de la suppression du menu');
    }
  };

  const openEditModal = (menu) => {
    setSelectedMenu(menu);
    setShowEditModal(true);
  };

  const openItemsModal = (menu) => {
    setSelectedMenu(menu);
    setShowItemsModal(true);
  };

  const openDeleteModal = (menu) => {
    setMenuToDelete(menu);
    setShowDeleteModal(true);
  };

  if (!restaurant) {
    return (
      <div className="min-h-screen py-8 px-2 sm:px-4 flex items-center justify-center">
        <LoadingSpinner />
        <span className="ml-3 text-gray-600">Chargement des données du restaurant...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-2 sm:px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#ff5c5c] to-[#ff7e7e] rounded-lg flex items-center justify-center shadow-md">
                <FontAwesomeIcon icon={faUtensils} className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Gestion des Menus</h1>
                <p className="text-gray-600">Créez et gérez les menus de votre restaurant</p>
              </div>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-[#ff5c5c] to-[#ff7e7e] hover:from-[#ff4444] hover:to-[#ff6666] text-white font-medium px-6 py-3 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              Ajouter un Menu
            </Button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <SearchBar
                query={searchTerm}
                setQuery={setSearchTerm}
                placeholder="🔍 Rechercher un menu..."
                className="border-2 border-gray-200 focus:border-[#ff5c5c] rounded-xl py-3 px-4 text-gray-700 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-200">
            <div className="flex items-center justify-center">
              <LoadingSpinner />
              <span className="ml-3 text-gray-600 text-lg">Chargement des menus...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6">
            <ErrorMessage error={error} />
          </div>
        )}

        {/* Menus Grid */}
        {!loading && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            {filteredMenus.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faUtensils} className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {searchTerm ? 'Aucun menu trouvé' : 'Aucun menu créé'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? 'Essayez avec d\'autres mots-clés'
                    : 'Commencez par créer votre premier menu'
                  }
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#ff5c5c] hover:bg-[#ff4444] text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-200"
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Créer un Menu
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMenus.map((menu) => (
                  <MenuCard
                    key={menu.id}
                    menu={menu}
                    onEdit={() => openEditModal(menu)}
                    onDelete={() => openDeleteModal(menu)}
                    onManageItems={() => openItemsModal(menu)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <AddMenuModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddMenu}
          restaurantId={restaurant?.id}
        />

        <EditMenuModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMenu(null);
          }}
          onSubmit={handleEditMenu}
          menu={selectedMenu}
        />

        <MenuItemsModal
          isOpen={showItemsModal}
          onClose={() => {
            setShowItemsModal(false);
            setSelectedMenu(null);
          }}
          menu={selectedMenu}
          restaurantId={restaurant?.id}
        />

        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setMenuToDelete(null);
          }}
          onConfirm={handleDeleteMenu}
          title="Supprimer le menu"
          message={`Êtes-vous sûr de vouloir supprimer le menu "${menuToDelete?.name}" ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          confirmButtonClass="bg-red-500 hover:bg-red-600"
          icon={faTrash}
          iconColor="text-red-500"
        />
      </div>
    </div>
  );
};

export default MenuPage;
