import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faImage, faUtensils, faDollarSign, faCheck } from '@fortawesome/free-solid-svg-icons';
import Button from './Button';
import ErrorMessage from './ErrorMessage';

const EditMenuModal = ({ isOpen, onClose, onSubmit, menu }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    status: true,
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Update form data when menu changes
  useEffect(() => {
    if (menu) {
      setFormData({
        name: menu.name || '',
        price: menu.price || '',
        status: menu.status || false,
        image: null
      });
      setImagePreview(menu.imageUrl || null);
    }
  }, [menu]);

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      setFormData(prev => ({ ...prev, image: file }));
      
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Le nom du menu est requis');
      setLoading(false);
      return;
    }

    if (!formData.price || isNaN(formData.price) || Number(formData.price) < 0) {
      setError('Le prix doit être un nombre positif');
      setLoading(false);
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        name: '',
        price: '',
        status: true,
        image: null
      });
      setImagePreview(null);
    } catch (err) {
      setError(err.message || 'Erreur lors de la modification du menu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen || !menu) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#ff5c5c] to-[#ff7e7e] rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faUtensils} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Modifier le Menu</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Upload */}
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faImage} className="text-[#ff5c5c]" />
                Image du Menu
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#ff5c5c] transition-colors relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="edit-menu-image-upload"
                />
                {imagePreview ? (
                  <div className="relative pointer-events-none">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-40 mx-auto rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData(prev => ({ ...prev, image: null }));
                        setImagePreview(menu.imageUrl || null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors pointer-events-auto z-20"
                    >
                      ↻
                    </button>
                  </div>
                ) : (
                  <div className="pointer-events-none">
                    <FontAwesomeIcon icon={faImage} className="text-4xl text-gray-400 mb-3" />
                    <p className="text-gray-600 mb-2">Cliquez pour changer l'image</p>
                    <p className="text-xs text-gray-500">PNG, JPG jusqu'à 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Menu Name */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faUtensils} className="text-[#ff5c5c]" />
                Nom du Menu
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Menu Famille, Menu Duo..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5c5c] focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faDollarSign} className="text-[#ff5c5c]" />
                Prix (DA)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5c5c] focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status}
                  onChange={handleChange}
                  className="w-5 h-5 text-[#ff5c5c] border-gray-300 rounded focus:ring-[#ff5c5c] transition-colors"
                />
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="text-[#ff5c5c]" />
                  Menu disponible
                </span>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4">
              <ErrorMessage error={error} />
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={handleClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#ff5c5c] to-[#ff7e7e] hover:from-[#ff4444] hover:to-[#ff6666] text-white px-8 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Modification...' : 'Modifier le Menu'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMenuModal;
