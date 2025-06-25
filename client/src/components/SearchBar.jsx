// src/components/SearchBar.jsx
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const SearchBar = () => {
  const [query, setQuery] = useState("");

  const handleClear = () => setQuery("");

  return (
    <div className="flex items-center w-full max-w-4xl bg-white border rounded-full px-5 py-2 shadow-md">
      {/* Search Icon */}
      <FontAwesomeIcon
        icon={faMagnifyingGlass}
        className="text-gray-500 mr-3 text-lg"
      />

      {/* Input Field */}
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 bg-transparent outline-none text-lg text-gray-700"
      />

      {/* Clear Icon */}
      {query && (
        <span
          className="material-icons text-gray-400 text-sm cursor-pointer hover:text-red-400 transition"
          onClick={handleClear}
        >
          close
        </span>
      )}
    </div>
  );
};

export default SearchBar;
