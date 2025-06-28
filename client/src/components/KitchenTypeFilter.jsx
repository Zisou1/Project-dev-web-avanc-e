import React from 'react';

const KitchenTypeFilter = ({ category, isSelected, onClick, className }) => {
  return (
    <button
      onClick={() => onClick(category.label)}
      className={`${className} ${isSelected ? 'font-bold text-orange-600' : 'text-gray-700'}`}
    >
      <div className="text-xl">{category.emoji}</div>
      <div className="text-sm">{category.label}</div>
    </button>
  );
};

export default KitchenTypeFilter;