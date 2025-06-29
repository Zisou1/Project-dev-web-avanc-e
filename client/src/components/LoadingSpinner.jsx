import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faSpinner } from '@fortawesome/free-solid-svg-icons';

const LoadingSpinner = ({ message = "Chargement...", fullScreen = true }) => {
  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          {/* Animated food icons */}
          <div className="relative mb-8">
            <div className="flex items-center justify-center space-x-4">
              <FontAwesomeIcon 
                icon={faUtensils} 
                className="text-4xl text-orange-500 animate-bounce" 
                style={{ animationDelay: '0ms' }}
              />
              <FontAwesomeIcon 
                icon={faUtensils} 
                className="text-4xl text-red-500 animate-bounce" 
                style={{ animationDelay: '200ms' }}
              />
              <FontAwesomeIcon 
                icon={faUtensils} 
                className="text-4xl text-orange-600 animate-bounce" 
                style={{ animationDelay: '400ms' }}
              />
            </div>
            
            {/* Loading circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          </div>
          
          {/* Loading text */}
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{message}</h3>
          <p className="text-gray-600 animate-pulse">Préparation de votre expérience culinaire...</p>
          
          {/* Decorative dots */}
          <div className="flex justify-center space-x-2 mt-4">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
            <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <FontAwesomeIcon 
          icon={faSpinner} 
          className="text-3xl text-orange-500 animate-spin mb-3" 
        />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
