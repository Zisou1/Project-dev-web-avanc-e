import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faEdit, 
  faTrash, 
  faEye, 
  faTruck,
  faMapMarkerAlt,
  faClock,
  faDollarSign,
  faUser,
  faStore,
  faCheckCircle,
  faTimesCircle,
  faHourglassHalf,
  faRoute,
  faPhone,
  faPlus,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import ConfirmationModal from '../../components/ConfirmationModal';
import Toast from '../../components/Toast';
import Pagination from '../../components/Pagination';

const DeliveryPage = () => {
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('persons');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'livreur'
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [users, orders] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllOrders()
      ]);
      
      // Filter delivery persons
      const deliveryUsers = users.filter(user => 
        user.role === 'delivery' || user.role === 'livreur'
      );
      setDeliveryPersons(deliveryUsers);

      // Filter orders that involve delivery
      const deliveryOrders = orders.filter(order => 
        order.status === 'delivering' || 
        order.status === 'ready' || 
        order.status === 'delivered'
      );
      setDeliveries(deliveryOrders);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const resetCreateForm = () => {
    setCreateFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      role: 'livreur'
    });
  };

  const resetEditForm = () => {
    setEditFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      isActive: true
    });
  };

  const handleCreateDeliveryPerson = () => {
    resetCreateForm();
    setShowCreateModal(true);
  };

  const handleCreateFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.createUser(createFormData);
      showToast('Livreur créé avec succès', 'success');
      setShowCreateModal(false);
      fetchData();
      resetCreateForm();
    } catch (error) {
      console.error('Error creating delivery person:', error);
      showToast('Erreur lors de la création du livreur', 'error');
    }
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleViewDeliveryPerson = async (person) => {
    setSelectedDelivery(person);
    setShowViewModal(true);
  };

  const handleEditDeliveryPerson = async (person) => {
    setSelectedDelivery(person);
    setEditFormData({
      name: person.name || '',
      email: person.email || '',
      phone: person.phone || '',
      address: person.address || '',
      isActive: person.isActive !== false
    });
    setShowEditModal(true);
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateUser(selectedDelivery.id, editFormData);
      showToast('Livreur modifié avec succès', 'success');
      setShowEditModal(false);
      fetchData();
      resetEditForm();
    } catch (error) {
      console.error('Error updating delivery person:', error);
      showToast('Erreur lors de la modification du livreur', 'error');
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleConfirmAction = (action, item) => {
    setSelectedDelivery(item);
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const executeAction = async () => {
    try {
      switch (confirmAction.type) {
        case 'delete-delivery':
          await adminService.deleteUser(selectedDelivery.id);
          showToast('Livreur supprimé avec succès', 'success');
          break;
      }
      fetchData();
    } catch (error) {
      console.error('Error executing action:', error);
      showToast('Erreur lors de l\'action', 'error');
    } finally {
      setShowConfirmModal(false);
      setSelectedDelivery(null);
      setConfirmAction(null);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      ready: faHourglassHalf,
      delivering: faTruck,
      delivered: faCheckCircle,
      cancelled: faTimesCircle
    };
    return icons[status] || faTruck;
  };

  const getStatusColor = (status) => {
    const colors = {
      ready: 'text-yellow-600 bg-yellow-100',
      delivering: 'text-blue-600 bg-blue-100',
      delivered: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status) => {
    const labels = {
      ready: 'Prête pour livraison',
      delivering: 'En livraison',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return labels[status] || status;
  };

  const filteredDeliveryPersons = deliveryPersons.filter(person => {
    const matchesSearch = person.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && person.isActive) ||
                         (statusFilter === 'inactive' && !person.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.id?.toString().includes(searchTerm) ||
                         delivery.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.restaurant_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const currentData = activeTab === 'persons' ? filteredDeliveryPersons : filteredDeliveries;
  const totalFilteredItems = currentData.length;
  const paginationStartIndex = (currentPage - 1) * itemsPerPage;
  const paginationEndIndex = paginationStartIndex + itemsPerPage;
  const currentItems = currentData.slice(paginationStartIndex, paginationEndIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, activeTab]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getDeliveryStats = () => {
    const stats = {
      totalDeliveryPersons: deliveryPersons.length,
      activeDeliveryPersons: deliveryPersons.filter(p => p.isActive).length,
      totalDeliveries: deliveries.length,
      pendingDeliveries: deliveries.filter(d => d.status === 'ready').length,
      activeDeliveries: deliveries.filter(d => d.status === 'delivering').length,
      completedDeliveries: deliveries.filter(d => d.status === 'delivered').length
    };
    return stats;
  };

  const stats = getDeliveryStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données de livraison...</p>
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
            Gestion des Livraisons
          </h1>
          <p className="text-gray-600">
            Gérez les livreurs et suivez les livraisons en temps réel
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faUser} className="text-blue-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Livreurs</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalDeliveryPersons}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Livreurs Actifs</p>
                <p className="text-2xl font-bold text-gray-800">{stats.activeDeliveryPersons}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faTruck} className="text-orange-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Livraisons</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalDeliveries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faHourglassHalf} className="text-yellow-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-bold text-gray-800">{stats.pendingDeliveries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faRoute} className="text-blue-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">En Cours</p>
                <p className="text-2xl font-bold text-gray-800">{stats.activeDeliveries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Terminées</p>
                <p className="text-2xl font-bold text-gray-800">{stats.completedDeliveries}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('persons')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'persons'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              Livreurs ({deliveryPersons.length})
            </button>
            <button
              onClick={() => setActiveTab('deliveries')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'deliveries'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FontAwesomeIcon icon={faTruck} className="mr-2" />
              Livraisons ({deliveries.length})
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
              {/* Search */}
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  placeholder={
                    activeTab === 'persons' 
                      ? "Rechercher par nom, email ou téléphone..." 
                      : "Rechercher par ID ou client..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {activeTab === 'persons' ? (
                  <>
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actifs</option>
                    <option value="inactive">Inactifs</option>
                  </>
                ) : (
                  <>
                    <option value="all">Tous les statuts</option>
                    <option value="ready">Prêtes</option>
                    <option value="delivering">En livraison</option>
                    <option value="delivered">Livrées</option>
                  </>
                )}
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
                  {activeTab === 'persons' 
                    ? `${totalFilteredItems} livreur${totalFilteredItems !== 1 ? 's' : ''}`
                    : `${totalFilteredItems} livraison${totalFilteredItems !== 1 ? 's' : ''}`
                  }
                </span>
              </div>
            </div>

            {/* Create Button - Only show for delivery persons tab */}
            {activeTab === 'persons' && (
              <div className="ml-4">
                <button
                  onClick={handleCreateDeliveryPerson}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Nouveau Livreur</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'persons' ? (
          /* Delivery Persons Table */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Livreur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'inscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernière connexion
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((person) => (
                    <tr key={person.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FontAwesomeIcon icon={faTruck} className="text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {person.name || 'Sans nom'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {person.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{person.email}</div>
                        {person.phone && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <FontAwesomeIcon icon={faPhone} className="mr-1" />
                            {person.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          person.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {person.isActive ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {person.createdAt ? new Date(person.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {person.lastLoginAt ? new Date(person.lastLoginAt).toLocaleDateString('fr-FR') : 'Jamais'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewDeliveryPerson(person)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Voir détails"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          
                          <button
                            onClick={() => handleEditDeliveryPerson(person)}
                            className="text-yellow-600 hover:text-yellow-900 p-1"
                            title="Modifier"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          
                          <button
                            onClick={() => handleConfirmAction(
                              { 
                                type: 'delete-delivery', 
                                title: 'Supprimer livreur', 
                                message: `Êtes-vous sûr de vouloir supprimer définitivement ${person.name} ? Cette action est irréversible.` 
                              },
                              person
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

            {currentItems.length === 0 && (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faUser} className="text-gray-400 text-4xl mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun livreur trouvé</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Aucun livreur ne correspond à vos critères de recherche.'
                    : 'Aucun livreur n\'est encore inscrit sur la plateforme.'
                  }
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Deliveries Table */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commande
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Restaurant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Adresse
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{delivery.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {delivery.createdAt 
                            ? new Date(delivery.createdAt).toLocaleDateString('fr-FR')
                            : 'N/A'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faUser} className="text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {delivery.customer_name || delivery.user?.name || 'Client inconnu'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faStore} className="text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {delivery.restaurant_name || delivery.restaurant?.name || 'Restaurant inconnu'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                          <FontAwesomeIcon 
                            icon={getStatusIcon(delivery.status)} 
                            className="mr-1" 
                          />
                          {getStatusLabel(delivery.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900 max-w-xs">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 mr-2 flex-shrink-0" />
                          <span className="truncate">
                            {delivery.delivery_address || 'Adresse non renseignée'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {(delivery.total_price || delivery.totalPrice || delivery.total || 0).toFixed(2)} DA
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => console.log('View delivery:', delivery.id)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Voir détails"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {currentItems.length === 0 && (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faTruck} className="text-gray-400 text-4xl mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune livraison trouvée</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Aucune livraison ne correspond à vos critères de recherche.'
                    : 'Aucune livraison n\'est en cours sur la plateforme.'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalFilteredItems > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalFilteredItems / itemsPerPage)}
              onPageChange={handlePageChange}
              totalItems={totalFilteredItems}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
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
        confirmText={confirmAction?.type?.includes('delete') ? 'Supprimer' : 'Confirmer'}
        cancelText="Annuler"
        confirmButtonClass={
          confirmAction?.type?.includes('delete') 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-green-500 hover:bg-green-600'
        }
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={executeAction}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        confirmText={confirmAction?.type === 'delete-delivery' ? 'Supprimer' : 'Confirmer'}
        cancelText="Annuler"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
      />

      {/* Create Delivery Person Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto border w-full max-w-2xl shadow-2xl rounded-lg bg-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Créer un Nouveau Livreur
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                    <input
                      type="text"
                      name="name"
                      value={createFormData.name}
                      onChange={handleCreateInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={createFormData.email}
                      onChange={handleCreateInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                    <input
                      type="password"
                      name="password"
                      value={createFormData.password}
                      onChange={handleCreateInputChange}
                      required
                      minLength="6"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={createFormData.phone}
                      onChange={handleCreateInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <input
                      type="text"
                      name="address"
                      value={createFormData.address}
                      onChange={handleCreateInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetCreateForm();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <span>Créer</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Delivery Person Modal */}
      {showViewModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto border w-full max-w-2xl shadow-2xl rounded-lg bg-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Détails du Livreur
                </h3>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedDelivery(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedDelivery.name || 'Non renseigné'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedDelivery.email || 'Non renseigné'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedDelivery.phone || 'Non renseigné'}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedDelivery.address || 'Non renseignée'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedDelivery.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <FontAwesomeIcon 
                          icon={selectedDelivery.isActive !== false ? faCheckCircle : faTimesCircle} 
                          className="mr-1" 
                        />
                        {selectedDelivery.isActive !== false ? 'Actif' : 'Suspendu'}
                      </span>
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de création</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {selectedDelivery.createdAt ? new Date(selectedDelivery.createdAt).toLocaleDateString('fr-FR') : 'Non disponible'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dernière connexion</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {selectedDelivery.lastLoginAt ? new Date(selectedDelivery.lastLoginAt).toLocaleDateString('fr-FR') : 'Jamais'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Delivery Person Modal */}
      {showEditModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto border w-full max-w-2xl shadow-2xl rounded-lg bg-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Modifier le Livreur
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedDelivery(null);
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <input
                      type="text"
                      name="address"
                      value={editFormData.address}
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
                      <span className="ml-2 text-sm font-medium text-gray-700">Livreur actif</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedDelivery(null);
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

      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}
    </div>
  );
};

export default DeliveryPage;
