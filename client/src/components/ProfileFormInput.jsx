import React from "react";

const ProfileFormInput = ({ type = "text", name, value, onChange, placeholder, disabled }) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
    autoComplete="off"
  />
);

export default ProfileFormInput;
