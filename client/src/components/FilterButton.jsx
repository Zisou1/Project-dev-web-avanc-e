import React from 'react';

const FilterButton = ({ category, isSelected, onClick }) => {
  return (
    <button
      onClick={() => onClick(category.label)}
      className={`flex-shrink-0 text-center text-sm ${isSelected ? 'font-bold text-blue-500' : ''}`}
    >
      <div className="text-2xl">{category.emoji}</div>
      <div>{category.label}</div>
    </button>
  );
};

export default FilterButton;