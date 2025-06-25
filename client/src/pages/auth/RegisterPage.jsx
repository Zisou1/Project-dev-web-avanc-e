import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import rest from '../../assets/rest.png';
import Logo from '../../components/logo';
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
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: '',
    ownerName: '' // Added ownerName for restaurant
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
      // Remove unused variable warning
      const registrationData = { ...formData };
      delete registrationData.confirmPassword;
      await register(registrationData);
      // Navigation will be handled by useEffect above
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-4xl min-h-[700px] bg-white rounded-3xl shadow-2xl flex overflow-hidden">
        {/* Left Side - Illustration */}
        <div className="w-1/2 flex flex-col items-center justify-center bg-[#ff4d30] p-6">
          {role === 'restaurant' && (
            <img src={rest} alt="restaurant" className="w-56 h-70 animate-fade-in object-contain" />
          )}
          {role === 'delivery' && (
            <img src="/delivery-illustration.png" alt="livreur" className="w-56 h-56 animate-fade-in object-contain" />
          )}
          {role === 'customer' && (
            <img src="/client-illustration.png" alt="client" className="w-56 h-56 animate-fade-in object-contain" />
          )}
          {!role && (
            <img src="/yumzo-logo-big.png" alt="yumzo" className="w-56 h-56 animate-fade-in object-contain" />
          )}
        </div>
        {/* Right Side - Form */}
        <div className={`w-1/2 flex flex-col justify-center px-8 py-8 bg-[#ffe0db] transition-all duration-500 overflow-y-auto ${animating ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}>
          <div className="flex flex-col items-center mb-6">
            <Logo />
          </div>
          {!showForm ? (
            <div className="flex flex-col gap-6 animate-fade-in">
              <h2 className="text-xl font-semibold text-center mb-2">Choisissez votre type de compte</h2>
              <div className="flex justify-center gap-6">
                {Object.entries(roleData).map(([key, { label, color, icon }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleRoleSelect(key)}
                    className={`flex flex-col items-center px-6 py-4 rounded-2xl shadow-md text-lg font-semibold transition transform hover:scale-105 hover:shadow-xl focus:outline-none ${color}`}
                  >
                    <span className="text-4xl mb-2">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form className="space-y-4 animate-slide-in" onSubmit={handleSubmit}>
              <ErrorMessage error={error} />
              {/* Restaurant Owner Name input, only for restaurant role */}
              {role === 'restaurant' && (
                <Input
                  id="ownerName"
                  name="ownerName"
                  type="text"
                  autoComplete="off"
                  required
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="Nom du responsable du restaurant"
                />
              )}
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder={role === 'restaurant' ? 'Nom du restaurant' : role === 'delivery' ? 'livreur Name' : 'client Name'}
              />
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
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                showPassword={showConfirmPassword}
                setShowPassword={setShowConfirmPassword}
              />
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Numéro de téléphone"
              />
              {/* Extra field for restaurant */}
              {role === 'restaurant' && (
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
              )}
              <Button loading={loading} type="submit" className="rounded-full text-lg shadow-md bg-[#ff4d30] hover:bg-[#ff7043] transition-all duration-300">suivant</Button>
              <button type="button" className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700" onClick={handleBack}>Retour</button>
              <p className="mt-4 text-center text-sm text-black">
                Vous avez déja un compte ?{' '}
                <Link to="/Login" className="text-[#ff4d30] font-medium hover:text-[#ff7043]">Sign In</Link>
              </p>
            </form>
          )}
        </div>
      </div>
      {/* Animations */}
      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s; }
        .animate-slide-in { animation: slideIn 0.5s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default RegisterPage;