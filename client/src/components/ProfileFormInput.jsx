const ProfileFormInput = ({ type, name, value, onChange, placeholder, disabled }) => (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-6 py-4 rounded-xl border border-gray-400 text-lg placeholder-gray-400 focus:outline-none"
    />
  );
  
  export default ProfileFormInput;