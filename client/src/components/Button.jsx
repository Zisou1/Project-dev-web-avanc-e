import React from 'react';

const Button = ({ loading, children, onClick, type = 'submit', variant = 'primary', ...rest }) => {
  const getButtonClasses = () => {
    const baseClasses = "w-full py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
    
    switch (variant) {
      case 'secondary':
        return `${baseClasses} bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-500`;
      case 'primary':
      default:
        return `${baseClasses} bg-[#FF4D4F] hover:bg-[#E63946] text-white focus:ring-[#FF4D4F]`;
    }
  };

  return (
    <button
      type={type}
      disabled={loading}
      onClick={onClick}
      {...rest}
      className={getButtonClasses()}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Chargement...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;