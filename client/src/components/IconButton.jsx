import React from 'react';

const IconButton = ({ onClick, children, className = '', ...rest }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center justify-center p-2 rounded-full bg-[#fff0f0] text-[#ff5c42] hover:bg-[#ffd6d6] border border-[#ffd6d6] shadow transition ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export default IconButton;
