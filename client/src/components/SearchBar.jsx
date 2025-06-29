import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faTimes } from "@fortawesome/free-solid-svg-icons";

const SearchBar = ({ query, setQuery, placeholder = "Search..." }) => {
  const handleClear = () => setQuery("");

  return (
    <div className="relative group">
      {/* Main search container */}
      <div className="flex items-center w-full bg-white/95 backdrop-blur-md border-2 border-gray-200 rounded-2xl px-6 py-4 shadow-lg transition-all duration-300 group-hover:border-orange-300 group-focus-within:border-orange-500 group-focus-within:shadow-xl">
        {/* Search Icon */}
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="text-gray-400 mr-4 text-xl transition-colors duration-300 group-focus-within:text-orange-500"
        />
        
        {/* Input Field */}
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-lg text-gray-700 placeholder-gray-400"
        />
        
        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClear}
            className="ml-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 transform hover:scale-110"
            aria-label="Clear search"
          >
            <FontAwesomeIcon icon={faTimes} className="text-sm" />
          </button>
        )}
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 -z-10"></div>
    </div>
  );
};

export default SearchBar;
