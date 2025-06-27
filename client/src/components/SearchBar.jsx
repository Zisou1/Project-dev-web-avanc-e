import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const SearchBar = ({ value, onChange, placeholder }) => {
  const [query, setQuery] = useState(value || "");

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (onChange) onChange(e.target.value);
  };

  const handleClear = () => {
    setQuery("");
    if (onChange) onChange("");
  };

  return (
    <div className="flex items-center w-full max-w-4xl bg-white border rounded-full px-5 py-2 shadow-md">
      <FontAwesomeIcon
        icon={faMagnifyingGlass}
        className="text-gray-500 mr-3 text-lg"
      />
      <input
        type="text"
        placeholder={placeholder || "Search..."}
        value={query}
        onChange={handleChange}
        className="flex-1 bg-transparent outline-none text-lg text-gray-700"
      />
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