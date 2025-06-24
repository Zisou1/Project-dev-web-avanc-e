import React from 'react';

const Input = ({ id, name, type, autoComplete, value, onChange, placeholder, required }) => (
  <div>
    <input
      id={id}
      name={name}
      type={type}
      autoComplete={autoComplete}
      required={required}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-md border border-[#ffccb3] bg-[#fae9e3] placeholder:text-[#c94e38] focus:outline-none focus:ring-2 focus:ring-[#ff4d30]"
      placeholder={placeholder}
    />
  </div>
);

export default Input;