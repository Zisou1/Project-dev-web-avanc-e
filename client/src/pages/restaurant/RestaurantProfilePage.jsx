import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { restaurantService } from '../../services/restaurantService';
import { authService } from '../../services/authService';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationModal from '../../components/ConfirmationModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEdit, 
  faTrash, 
  faSave, 
  faTimes, 
  faStore,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faClock,
  faUtensils,
  faImage,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/baseApi';

const RestaurantProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [restaurant, setRestaurant] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    // User fields
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Restaurant fields
    restaurantName: '',
    kitchen_type: '',
    description: '',
    address: '',
    timeStart: '',
    timeEnd: '',
    image: null
  });
  
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch user and restaurant data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        console.log('No user in context, skipping data fetch');
        return;
      }
      
      console.log('Fetching data for user:', user);
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch user data
        console.log('Fetching user data for ID:', user.id);
        const userResponse = await api.get(`/auth/user/getUser/${user.id}`);
        const userData = userResponse.data.user;
        console.log('User data received:', userData);
        setUserProfile(userData);
        
        // Fetch restaurant data
        console.log('Fetching restaurant data for user ID:', user.id);
        const restaurantData = await restaurantService.getRestaurantByUserId(user.id);
        console.log('Restaurant data received:', restaurantData);
        setRestaurant(restaurantData);
        
        // Set form data
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          password: '',
          confirmPassword: '',
          restaurantName: restaurantData?.name || '',
          kitchen_type: restaurantData?.kitchen_type || '',
          description: restaurantData?.description || '',
          address: restaurantData?.address || '',
          timeStart: restaurantData?.timeStart || '',
          timeEnd: restaurantData?.timeEnd || '',
          image: null
        });
        
        console.log('Restaurant image URL:', restaurantData?.imageUrl);
        setImagePreview(restaurantData?.imageUrl || null);
        
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Erreur lors du chargement des données du profil');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!restaurant || !userProfile) return;
    
    // Debug: Check if user ID is available
    console.log('User object:', user);
    console.log('User ID:', user?.id);
    
    if (!user?.id) {
      setError('ID utilisateur manquant. Veuillez vous reconnecter.');
      return;
    }
    
    setUpdating(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate password if provided
      if (formData.password && formData.password !== formData.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      
      // Update user data
      const userUpdateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };
      
      if (formData.password) {
        userUpdateData.password = formData.password;
      }
      
      console.log('Updating user with ID:', user.id);
      console.log('User update data:', userUpdateData);
      
      await authService.updateUser(user.id, userUpdateData);
      
      // Update restaurant data
      const restaurantFormData = new FormData();
      restaurantFormData.append('name', formData.restaurantName);
      restaurantFormData.append('kitchen_type', formData.kitchen_type);
      restaurantFormData.append('description', formData.description);
      restaurantFormData.append('address', formData.address);
      
      // Only append time values if they are not empty
      if (formData.timeStart && formData.timeStart.trim() !== '') {
        // Normalize time to HH:MM format (remove seconds if present)
        const timeStart = formData.timeStart.substring(0, 5);
        restaurantFormData.append('timeStart', timeStart);
      }
      if (formData.timeEnd && formData.timeEnd.trim() !== '') {
        // Normalize time to HH:MM format (remove seconds if present)
        const timeEnd = formData.timeEnd.substring(0, 5);
        restaurantFormData.append('timeEnd', timeEnd);
      }
      
      if (formData.image) {
        restaurantFormData.append('image', formData.image);
      }
      
      console.log('Restaurant form data:');
      console.log('- name:', formData.restaurantName);
      console.log('- kitchen_type:', formData.kitchen_type);
      console.log('- description:', formData.description);
      console.log('- address:', formData.address);
      console.log('- timeStart:', formData.timeStart, '(will send:', formData.timeStart && formData.timeStart.trim() !== '' ? formData.timeStart.substring(0, 5) : 'no', ')');
      console.log('- timeEnd:', formData.timeEnd, '(will send:', formData.timeEnd && formData.timeEnd.trim() !== '' ? formData.timeEnd.substring(0, 5) : 'no', ')');
      console.log('- image:', formData.image);
      
      console.log('Updating restaurant with ID:', restaurant.id);
      
      await api.put(`/restaurants/update/${restaurant.id}`, restaurantFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Refresh data
      const userResponse = await api.get(`/auth/user/getUser/${user.id}`);
      setUserProfile(userResponse.data.user);
      
      const restaurantData = await restaurantService.getRestaurantByUserId(user.id);
      setRestaurant(restaurantData);
      
      // Update form data with new values
      setFormData(prev => ({
        ...prev,
        name: userResponse.data.user.name || '',
        email: userResponse.data.user.email || '',
        phone: userResponse.data.user.phone || '',
        restaurantName: restaurantData?.name || '',
        kitchen_type: restaurantData?.kitchen_type || '',
        description: restaurantData?.description || '',
        address: restaurantData?.address || '',
        timeStart: restaurantData?.timeStart || '',
        timeEnd: restaurantData?.timeEnd || '',
        password: '',
        confirmPassword: '',
        image: null
      }));
      
      console.log('Updated restaurant image URL:', restaurantData?.imageUrl);
      setImagePreview(restaurantData?.imageUrl || null);
      
      setIsEditing(false);
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
      
      setSuccess('Profil mis à jour avec succès !');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!restaurant || !userProfile) return;
    
    try {
      // Delete restaurant first
      await api.delete(`/restaurants/delete/${restaurant.id}`);
      
      // Delete user account
      await api.delete(`/auth/user/delete/${user.id}`);
      
      // Logout and redirect
      await logout();
      navigate('/');
      
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Erreur lors de la suppression du compte');
    }
    
    setShowDeleteModal(false);
  };

  const cancelEdit = () => {
    if (userProfile && restaurant) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        password: '',
        confirmPassword: '',
        restaurantName: restaurant.name || '',
        kitchen_type: restaurant.kitchen_type || '',
        description: restaurant.description || '',
        address: restaurant.address || '',
        timeStart: restaurant.timeStart || '',
        timeEnd: restaurant.timeEnd || '',
        image: null
      });
      setImagePreview(restaurant.imageUrl || null);
    }
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <LoadingSpinner />
        <span className="ml-3 text-gray-600">Chargement du profil...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Utilisateur non connecté</h2>
          <p className="text-gray-500">Veuillez vous connecter pour accéder à votre profil</p>
        </div>
      </div>
    );
  }

  if (!restaurant || !userProfile) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Profil non trouvé</h2>
          <p className="text-gray-500">Impossible de charger les données du profil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#ff5c5c] to-[#ff7e7e] rounded-xl flex items-center justify-center shadow-lg">
                <FontAwesomeIcon icon={faUser} className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Mon Profil</h1>
                <p className="text-gray-600">Gérez vos informations personnelles et restaurant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-[#ff5c5c] hover:bg-[#ff4444] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    Modifier
                  </Button>
                  <Button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Supprimer
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleSubmit}
                    disabled={updating}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faSave} />
                    {updating ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                  <Button
                    onClick={cancelEdit}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    Annuler
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage error={error} />
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 backdrop-blur-sm">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-green-800 font-medium">{success}</p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="flex-shrink-0 text-green-400 hover:text-green-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Informations Utilisateur</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5c5c] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-gray-400" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5c5c] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faPhone} className="mr-2 text-gray-400" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5c5c] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {isEditing && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nouveau mot de passe (optionnel)
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5c5c] focus:border-transparent pr-12"
                          placeholder="Laisser vide pour conserver l'actuel"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                      </div>
                    </div>

                    {formData.password && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirmer le mot de passe
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5c5c] focus:border-transparent"
                          placeholder="Confirmer le nouveau mot de passe"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Restaurant Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faStore} className="text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Informations Restaurant</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du restaurant
                  </label>
                  <input
                    type="text"
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5c5c] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faUtensils} className="mr-2 text-gray-400" />
                    Type de cuisine
                  </label>
                  <input
                    type="text"
                    name="kitchen_type"
                    value={formData.kitchen_type}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5c5c] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-400" />
                    Adresse
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5c5c] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FontAwesomeIcon icon={faClock} className="mr-2 text-gray-400" />
                      Ouverture
                    </label>
                    <input
                      type="time"
                      name="timeStart"
                      value={formData.timeStart}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5c5c] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FontAwesomeIcon icon={faClock} className="mr-2 text-gray-400" />
                      Fermeture
                    </label>
                    <input
                      type="time"
                      name="timeEnd"
                      value={formData.timeEnd}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5c5c] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5c5c] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Décrivez votre restaurant..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Restaurant Image */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faImage} className="text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Image du Restaurant</h2>
            </div>

            <div className="flex items-center gap-6">
              {imagePreview ? (
                <div className="w-32 h-32 rounded-lg overflow-hidden shadow-md border border-gray-200">
                  <img
                    src={imagePreview}
                    alt="Restaurant"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Image failed to load:', imagePreview);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <FontAwesomeIcon icon={faImage} className="text-gray-400 text-3xl mb-2" />
                    <p className="text-xs text-gray-500">Aucune image</p>
                  </div>
                </div>
              )}
              
              {isEditing && (
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5c5c] focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Formats acceptés: JPG, PNG, GIF (max 5MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Supprimer le compte"
          message="Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action supprimera toutes vos données (restaurant, menus, articles) et ne peut pas être annulée."
          confirmText="Supprimer définitivement"
          cancelText="Annuler"
          confirmButtonClass="bg-red-500 hover:bg-red-600"
          icon={faTrash}
          iconColor="text-red-500"
        />
      </div>
    </div>
  );
};

export default RestaurantProfilePage;
