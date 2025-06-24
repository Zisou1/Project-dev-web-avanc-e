import React from 'react';

const SearchBar = () => {
  return (
    <div>
      <input
        type="text"
        placeholder="search"
        className="w-full border border-gray-300 rounded-full px-4 py-2"
      />
    </div>
  );
};

export default SearchBar;