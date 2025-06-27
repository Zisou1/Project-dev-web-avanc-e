import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logimg from '../../assets/loginimg.png';
import rest from '../../assets/rest.png';
import livr from '../../assets/livr.png';
import Logo from '../../components/Logo';
import Input from '../../components/input';
import PasswordInput from '../../components/PasswordInput';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';

const roleData = {
  customer: {
    label: 'Client',
    color: 'bg-blue-100',
    icon: '👤',
  },
  delivery: {
    label: 'Livreur',
    color: 'bg-green-100',
    icon: '🚚',
  },
  restaurant: {
    label: 'Restaureur',
    color: 'bg-orange-100',
    icon: '🏠',
  },
};

const RegisterPage = () => {
  const [role, setRole] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', // Owner name (user)
    restaurantName: '', // Restaurant name (for restaurant role)
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: '',
    cuisineType: '' // Cuisine type for restaurant
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [animating, setAnimating] = useState(false);

  const { register, loading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRoleSelect = (selectedRole) => {
    setAnimating(true);
    setTimeout(() => {
      setRole(selectedRole);
      setFormData((prev) => ({ ...prev, role: selectedRole }));
      setShowForm(true);
      setAnimating(false);
    }, 400); // Animation duration
  };

  const handleBack = () => {
    setAnimating(true);
    setTimeout(() => {
      setShowForm(false);
      setRole('');
      setAnimating(false);
    }, 400);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Clear errors when user starts typing
    if (error) {
      clearError();
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name || formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!passwordRegex.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation (optional)
    if (formData.phone && !/^\+?[1-9][\d]{0,15}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const { name, restaurantName, email, password, phone, role } = formData;
      const registrationData = { name, email, password, phone, role };
      if (role === 'restaurant') {
        registrationData.kitchen_type = formData.cuisineType;
        registrationData.restaurantName = restaurantName;
      }
      await register(registrationData);
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-2 sm:px-0">
      <div
        className="w-full max-w-4xl h-full md:min-h-[700px] max-h-screen flex-1 bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
        style={{ maxHeight: '100dvh' }}
      >
        {/* Left Side - Illustration */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-[#ff4d30] p-4 md:p-6 py-6 md:py-6 min-h-[180px] md:min-h-0">
          {role === 'restaurant' && (
            <img src={rest} alt="restaurant" className="w-28 h-28 md:w-56 md:h-70 animate-fade-in object-contain" />
          )}
          {role === 'delivery' && (
            <img src={livr} alt="livreur" className="w-28 h-28 md:w-56 md:h-56 animate-fade-in object-contain" />
          )}
          {role === 'customer' && (
            <img src={logimg} alt="client" className="w-28 h-28 md:w-56 md:h-56 animate-fade-in object-contain" />
          )}
          {!role && (
            <img src={logimg} alt="yumzo" className="w-28 h-28 md:w-56 md:h-56 animate-fade-in object-contain" />
          )}
        </div>
        {/* Right Side - Form */}
        <div
          className={`w-full md:w-1/2 flex flex-col justify-center px-2 py-4 md:px-8 md:py-8 bg-[#ffe0db] transition-all duration-500 overflow-y-auto max-h-screen ${animating ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}
          style={{ maxHeight: '100dvh' }}
        >
          <div className="flex flex-col items-center mb-4 md:mb-6">
            <Logo />
          </div>
          {!showForm ? (
            <div className="flex flex-col gap-4 md:gap-6 animate-fade-in">
              <h2 className="text-base md:text-xl font-semibold text-center mb-2">Choisissez votre type de compte</h2>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6">
                {Object.entries(roleData).map(([key, { label, color, icon }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleRoleSelect(key)}
                    className={`flex flex-col items-center px-3 py-2 md:px-6 md:py-4 rounded-2xl shadow-md text-sm md:text-lg font-semibold transition transform hover:scale-105 hover:shadow-xl focus:outline-none ${color}`}
                  >
                    <span className="text-2xl md:text-4xl mb-2">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form className="space-y-2 md:space-y-4 animate-slide-in" onSubmit={handleSubmit}>
              <ErrorMessage error={error} />
              {role === 'restaurant' && (
                <div>
                  <Input
                    id="restaurantName"
                    name="restaurantName"
                    type="text"
                    autoComplete="off"
                    required
                    value={formData.restaurantName}
                    onChange={handleChange}
                    placeholder="Nom du restaurant"
                  />
                  {validationErrors.restaurantName && <div className="text-red-500 text-xs">{validationErrors.restaurantName}</div>}
                </div>
              )}
              <div>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={role === 'restaurant' ? 'Nom du propriétaire' : role === 'delivery' ? 'livreur Name' : 'client Name'}
                />
                {validationErrors.name && <div className="text-red-500 text-xs">{validationErrors.name}</div>}
              </div>
              <div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={role === 'restaurant' ? 'restaurant Email' : role === 'delivery' ? 'livreur Email' : 'client Email'}
                />
                {validationErrors.email && <div className="text-red-500 text-xs">{validationErrors.email}</div>}
              </div>
              <div>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Numéro de téléphone"
                />
                {validationErrors.phone && <div className="text-red-500 text-xs">{validationErrors.phone}</div>}
              </div>
              {/* Extra field for restaurant */}
              {role === 'restaurant' && (
                <div>
                  <select
                    id="cuisineType"
                    name="cuisineType"
                    className="w-full px-4 py-3 rounded-md border border-[#ffccb3] bg-[#fae9e3] text-[#c94e38] focus:outline-none focus:ring-2 focus:ring-[#ff4d30]"
                    value={formData.cuisineType || ''}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Type de cuisine</option>
                    <option value="italian">Italienne</option>
                    <option value="asian">Asiatique</option>
                    <option value="maroc">Marocaine</option>
                    <option value="burger">Burger</option>
                    <option value="pizza">Pizza</option>
                    <option value="autre">Autre</option>
                  </select>
                  {validationErrors.cuisineType && <div className="text-red-500 text-xs">{validationErrors.cuisineType}</div>}
                </div>
              )}
              <div>
                <PasswordInput
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  placeholder="Mot de passe"
                />
                {validationErrors.password && <div className="text-red-500 text-xs">{validationErrors.password}</div>}
              </div>
              <div>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  showPassword={showConfirmPassword}
                  setShowPassword={setShowConfirmPassword}
                  placeholder="Confirmé mot de passe"
                />
                {validationErrors.confirmPassword && <div className="text-red-500 text-xs">{validationErrors.confirmPassword}</div>}
              </div>
              <Button loading={loading} type="submit" className="rounded-full text-sm md:text-lg shadow-md bg-[#ff4d30] hover:bg-[#ff7043] transition-all duration-300">suivant</Button>
              <button type="button" className="w-full mt-2 text-xs md:text-sm text-gray-500 hover:text-gray-700" onClick={handleBack}>Retour</button>
              <p className="mt-4 text-center text-xs md:text-sm text-black">
                Vous avez déja un compte ?{' '}
                <Link to="/Login" className="text-[#ff4d30] font-medium hover:text-[#ff7043]">Sign In</Link>
              </p>
            </form>
          )}
        </div>
      </div>
      {/* Animations & Responsive Tweaks */}
      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s; }
        .animate-slide-in { animation: slideIn 0.5s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          /* Remove min-height for card on mobile */
          .min-h-\[700px\] { min-height: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;