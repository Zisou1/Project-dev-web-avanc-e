import React from 'react';

const KitchenTypeFilter = ({ category, isSelected, onClick, className }) => {
  return (
    <button
      onClick={() => onClick(category.label)}
      className={`relative group ${className} ${
        isSelected 
          ? 'font-bold text-white transform scale-105' 
          : 'text-gray-700 hover:text-orange-600'
      }`}
    >
      <div className="flex flex-col items-center gap-2 p-2 min-w-[80px]">
        <div className={`text-2xl transition-transform duration-200 ${
          isSelected ? 'scale-110' : 'group-hover:scale-110'
        }`}>
          {category.emoji}
        </div>
        <div className="text-sm font-medium text-center leading-tight">
          {category.label}
        </div>
      </div>
      
      {/* Subtle glow effect for selected items */}
      {isSelected && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-red-500 opacity-20 blur-lg -z-10"></div>
      )}
    </button>
  );
};

export default KitchenTypeFilter;