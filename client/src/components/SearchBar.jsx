// src/components/SearchBar.jsx
import React from "react";

const SearchBar = () => {
  return (
    <div className="flex items-center w-full max-w-2xl bg-white border rounded-full px-4 py-2 shadow-sm">
      <span className="material-icons text-2xl text-gray-400 mr-2">filter_list</span>
      <span className="material-icons text-gray-400 mr-2">search</span>
      <input
        type="text"
        placeholder="search"
        className="w-full bg-transparent outline-none text-lg text-gray-700"
      />
    </div>
  );
};

export default SearchBar;
