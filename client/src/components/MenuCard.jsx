import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTrash, 
  faUtensils, 
  faEllipsisV,
  faEye,
  faTags
} from '@fortawesome/free-solid-svg-icons';

const MenuCard = ({ menu, onEdit, onDelete, onManageItems }) => {
  const [showActions, setShowActions] = useState(false);

  const handleImageError = (e) => {
    e.target.src = '/images/placeholder-menu.jpg';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Menu Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        <img
          src={menu.imageUrl || '/images/placeholder-menu.jpg'}
          alt={menu.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
        />
        
        {/* Actions Dropdown */}
        <div className="absolute top-3 right-3">
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-gray-900 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
            >
              <FontAwesomeIcon icon={faEllipsisV} className="text-sm" />
            </button>
            
            {showActions && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowActions(false)}
                />
                <div className="absolute right-0 top-10 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20 min-w-[160px]">
                  <button
                    onClick={() => {
                      onEdit();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                  >
                    <FontAwesomeIcon icon={faEdit} className="text-sm" />
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      onManageItems();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-green-50 hover:text-green-600 flex items-center gap-2 transition-colors"
                  >
                    <FontAwesomeIcon icon={faUtensils} className="text-sm" />
                    Gérer les articles
                  </button>
                  <button
                    onClick={() => {
                      onDelete();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-sm" />
                    Supprimer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute bottom-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            menu.status 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {menu.status ? 'Disponible' : 'Indisponible'}
          </span>
        </div>
      </div>

      {/* Menu Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800 line-clamp-1 flex-1 mr-2">
            {menu.name}
          </h3>
          <div className="flex items-center gap-1 text-[#ff5c5c] font-bold">
            <span className="text-lg">{menu.price}</span>
            <span className="text-sm">DA</span>
          </div>
        </div>

        {/* Menu Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <FontAwesomeIcon icon={faUtensils} className="text-xs" />
            <span>Menu #{menu.id}</span>
          </div>
          <div className="flex items-center gap-1">
            <FontAwesomeIcon icon={faTags} className="text-xs" />
            <span>Restauration</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onManageItems}
            className="flex-1 bg-gradient-to-r from-[#ff5c5c] to-[#ff7e7e] hover:from-[#ff4444] hover:to-[#ff6666] text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <FontAwesomeIcon icon={faEye} className="text-xs" />
            Voir Articles
          </button>
          <button
            onClick={onEdit}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors duration-200"
            title="Modifier le menu"
          >
            <FontAwesomeIcon icon={faEdit} className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
