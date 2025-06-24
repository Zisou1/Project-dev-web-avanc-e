import React from 'react';

const PasswordInput = ({ id, name, value, onChange, showPassword, setShowPassword }) => (
  <div className="relative">
    <input
      id={id}
      name={name}
      type={showPassword ? 'text' : 'password'}
      autoComplete="current-password"
      required
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-md border border-[#ffccb3] bg-[#fae9e3] placeholder:text-[#c94e38] focus:outline-none focus:ring-2 focus:ring-[#ff4d30]"
      placeholder="Mot de passe"
    />
    <button
      type="button"
      className="absolute inset-y-0 right-0 pr-3 flex items-center"
      onClick={() => setShowPassword(!showPassword)}
    >
      <svg
        className="h-5 w-5 text-[#c94e38] hover:text-[#e8432b]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {showPassword ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122l4.242 4.242M12 12l2.122 2.122m-2.122-2.122l2.122 2.122" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        )}
      </svg>
    </button>
  </div>
);

export default PasswordInput;