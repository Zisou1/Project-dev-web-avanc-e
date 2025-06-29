import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faEdit, 
  faTrash, 
  faEye, 
  faPlus,
  faStore,
  faMapMarkerAlt,
  faClock,
  faUtensils,
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import ConfirmationModal from '../../components/ConfirmationModal';
import Toast from '../../components/Toast';
import Pagination from '../../components/Pagination';

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [kitchenFilter, setKitchenFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    kitchen_type: '',
    timeStart: '',
    timeEnd: '',
    isActive: true
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const restaurantsData = await adminService.getAllRestaurants();
      setRestaurants(restaurantsData);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      showToast('Erreur lors du chargement des restaurants', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const resetEditForm = () => {
    setEditFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      kitchen_type: '',
      timeStart: '',
      timeEnd: '',
      isActive: true
    });
  };

  const handleViewRestaurant = async (restaurant) => {
    try {
      const restaurantDetails = await adminService.getRestaurantById(restaurant.id);
      setSelectedRestaurant(restaurantDetails);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      showToast('Erreur lors du chargement des détails du restaurant', 'error');
    }
  };

  const handleEditRestaurant = async (restaurant) => {
    try {
      const restaurantDetails = await adminService.getRestaurantById(restaurant.id);
      setSelectedRestaurant(restaurantDetails);
      setEditFormData({
        name: restaurantDetails.name || '',
        email: restaurantDetails.email || '',
        phone: restaurantDetails.phone || '',
        address: restaurantDetails.address || '',
        kitchen_type: restaurantDetails.kitchen_type || '',
        timeStart: restaurantDetails.timeStart || '',
        timeEnd: restaurantDetails.timeEnd || '',
        isActive: restaurantDetails.isActive !== false
      });
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      showToast('Erreur lors du chargement des détails du restaurant', 'error');
    }
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateRestaurant(selectedRestaurant.id, editFormData);
      showToast('Restaurant modifié avec succès', 'success');
      setShowEditModal(false);
      fetchRestaurants();
      resetEditForm();
    } catch (error) {
      console.error('Error updating restaurant:', error);
      showToast('Erreur lors de la modification du restaurant', 'error');
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleConfirmAction = (action, restaurant) => {
    setSelectedRestaurant(restaurant);
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const executeAction = async () => {
    try {
      switch (confirmAction.type) {
        case 'delete':
          await adminService.deleteRestaurant(selectedRestaurant.id);
          showToast('Restaurant supprimé avec succès', 'success');
          fetchRestaurants();
          break;
        case 'toggle-status':
          // This would need to be implemented in the backend
          showToast('Fonctionnalité à implémenter', 'info');
          break;
      }
    } catch (error) {
      console.error('Error executing action:', error);
      showToast('Erreur lors de l\'action', 'error');
    } finally {
      setShowConfirmModal(false);
      setSelectedRestaurant(null);
      setConfirmAction(null);
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKitchen = kitchenFilter === 'all' || restaurant.kitchen_type === kitchenFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && restaurant.isActive !== false) ||
                         (statusFilter === 'inactive' && restaurant.isActive === false);
    
    return matchesSearch && matchesKitchen && matchesStatus;
  });

  // Pagination logic
  const totalFilteredItems = filteredRestaurants.length;
  const paginationStartIndex = (currentPage - 1) * itemsPerPage;
  const paginationEndIndex = paginationStartIndex + itemsPerPage;
  const currentRestaurants = filteredRestaurants.slice(paginationStartIndex, paginationEndIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, kitchenFilter, statusFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getKitchenTypes = () => {
    const types = [...new Set(restaurants.map(r => r.kitchen_type).filter(Boolean))];
    return types;
  };

  const getKitchenBadgeColor = (kitchenType) => {
    const colors = {
      'fast-food': 'bg-red-100 text-red-800',
      'traditional': 'bg-green-100 text-green-800',
      'asian': 'bg-yellow-100 text-yellow-800',
      'italian': 'bg-blue-100 text-blue-800',
      'arabic': 'bg-purple-100 text-purple-800',
      'french': 'bg-pink-100 text-pink-800'
    };
    return colors[kitchenType] || 'bg-gray-100 text-gray-800';
  };

  const getKitchenLabel = (kitchenType) => {
    const labels = {
      'fast-food': 'Fast Food',
      'traditional': 'Traditionnel',
      'asian': 'Asiatique',
      'italian': 'Italien',
      'arabic': 'Arabe',
      'french': 'Français'
    };
    return labels[kitchenType] || kitchenType;
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.slice(0, 5); // Format HH:MM
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Gestion des Restaurants
          </h1>
          <p className="text-gray-600">
            Gérez tous les restaurants de la plateforme
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                type="text"
                placeholder="Rechercher par nom ou adresse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Kitchen Type Filter */}
            <select
              value={kitchenFilter}
              onChange={(e) => setKitchenFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les types</option>
              {getKitchenTypes().map(type => (
                <option key={type} value={type}>
                  {getKitchenLabel(type)}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>

            {/* Items per page */}
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 par page</option>
              <option value={10}>10 par page</option>
              <option value={25}>25 par page</option>
              <option value={50}>50 par page</option>
            </select>

            {/* Results count */}
            <div className="flex items-center justify-center bg-gray-100 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-600">
                {totalFilteredItems} restaurant{totalFilteredItems !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Restaurants Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type de cuisine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adresse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horaires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRestaurants.map((restaurant) => (
                  <tr key={restaurant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {restaurant.image ? (
                            <img 
                              className="h-12 w-12 rounded-lg object-cover"
                              src={restaurant.image}
                              alt={restaurant.name}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-300 flex items-center justify-center">
                              <FontAwesomeIcon icon={faStore} className="text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {restaurant.name || 'Sans nom'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {restaurant.description && restaurant.description.length > 50
                              ? restaurant.description.substring(0, 50) + '...'
                              : restaurant.description || 'Aucune description'
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {restaurant.kitchen_type ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getKitchenBadgeColor(restaurant.kitchen_type)}`}>
                          <FontAwesomeIcon icon={faUtensils} className="mr-1" />
                          {getKitchenLabel(restaurant.kitchen_type)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Non spécifié</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 mr-2" />
                        <span className="truncate max-w-xs">
                          {restaurant.address || 'Adresse non renseignée'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FontAwesomeIcon icon={faClock} className="text-gray-400 mr-2" />
                        <span>
                          {formatTime(restaurant.timeStart)} - {formatTime(restaurant.timeEnd)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {restaurant.isActive !== false ? (
                          <>
                            <FontAwesomeIcon icon={faCheck} className="text-green-600 mr-2" />
                            <span className="text-sm text-green-600">Actif</span>
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faTimes} className="text-red-600 mr-2" />
                            <span className="text-sm text-red-600">Inactif</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewRestaurant(restaurant)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Voir détails"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        
                        <button
                          onClick={() => handleEditRestaurant(restaurant)}
                          className="text-yellow-600 hover:text-yellow-900 p-1"
                          title="Modifier"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        
                        <button
                          onClick={() => handleConfirmAction(
                            { 
                              type: 'delete', 
                              title: 'Supprimer restaurant', 
                              message: `Êtes-vous sûr de vouloir supprimer définitivement le restaurant "${restaurant.name}" ? Cette action est irréversible.` 
                            },
                            restaurant
                          )}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Supprimer"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalFilteredItems === 0 && (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faStore} className="text-gray-400 text-4xl mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun restaurant trouvé</h3>
              <p className="text-gray-500">
                {searchTerm || kitchenFilter !== 'all' || statusFilter !== 'all'
                  ? 'Aucun restaurant ne correspond à vos critères de recherche.'
                  : 'Aucun restaurant n\'est encore inscrit sur la plateforme.'
                }
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalFilteredItems > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalFilteredItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          )}
        </div>

        {/* Quick Stats */}
        {restaurants.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faStore} className="text-blue-600 text-2xl mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total restaurants</p>
                  <p className="text-2xl font-bold text-gray-800">{restaurants.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCheck} className="text-green-600 text-2xl mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Restaurants actifs</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {restaurants.filter(r => r.isActive !== false).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUtensils} className="text-purple-600 text-2xl mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Types de cuisine</p>
                  <p className="text-2xl font-bold text-gray-800">{getKitchenTypes().length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faTimes} className="text-red-600 text-2xl mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Restaurants inactifs</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {restaurants.filter(r => r.isActive === false).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={executeAction}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        confirmText={confirmAction?.type === 'delete' ? 'Supprimer' : 'Confirmer'}
        cancelText="Annuler"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
      />

      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}

      {/* View Restaurant Modal */}
      {showViewModal && selectedRestaurant && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto border w-full max-w-4xl shadow-2xl rounded-lg bg-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Détails du Restaurant
                </h3>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedRestaurant(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du restaurant</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRestaurant.name || 'Non renseigné'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRestaurant.email || 'Non renseigné'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRestaurant.phone || 'Non renseigné'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de cuisine</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getKitchenBadgeColor(selectedRestaurant.kitchen_type)}`}>
                        {getKitchenLabel(selectedRestaurant.kitchen_type)}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRestaurant.address || 'Non renseignée'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horaires d'ouverture</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {formatTime(selectedRestaurant.timeStart)} - {formatTime(selectedRestaurant.timeEnd)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedRestaurant.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <FontAwesomeIcon 
                          icon={selectedRestaurant.isActive !== false ? faCheck : faTimes} 
                          className="mr-1" 
                        />
                        {selectedRestaurant.isActive !== false ? 'Actif' : 'Inactif'}
                      </span>
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de création</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {selectedRestaurant.createdAt ? new Date(selectedRestaurant.createdAt).toLocaleDateString('fr-FR') : 'Non disponible'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Restaurant Modal */}
      {showEditModal && selectedRestaurant && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto border w-full max-w-4xl shadow-2xl rounded-lg bg-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Modifier le Restaurant
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedRestaurant(null);
                    resetEditForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleEditFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du restaurant *</label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de cuisine *</label>
                    <select
                      name="kitchen_type"
                      value={editFormData.kitchen_type}
                      onChange={handleEditInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Sélectionner un type</option>
                      <option value="fast-food">Fast Food</option>
                      <option value="traditional">Traditionnel</option>
                      <option value="asian">Asiatique</option>
                      <option value="italian">Italien</option>
                      <option value="arabic">Arabe</option>
                      <option value="french">Français</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                    <input
                      type="text"
                      name="address"
                      value={editFormData.address}
                      onChange={handleEditInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heure d'ouverture</label>
                    <input
                      type="time"
                      name="timeStart"
                      value={editFormData.timeStart}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heure de fermeture</label>
                    <input
                      type="time"
                      name="timeEnd"
                      value={editFormData.timeEnd}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={editFormData.isActive}
                        onChange={handleEditInputChange}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Restaurant actif</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedRestaurant(null);
                      resetEditForm();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <span>Modifier</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantsPage;
