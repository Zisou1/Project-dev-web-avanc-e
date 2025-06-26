import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logimg from '../../assets/loginimg.png';
import Logo from '../../components/Logo';
import Input from '../../components/input';
import PasswordInput from '../../components/PasswordInput';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import FormLinks from '../../components/FormLinks';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, loading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Login form submitted with:', { email: formData.email, password: '***' });
    console.log('Current error state:', error);
    
    try {
      await login(formData.email, formData.password);
      console.log('Login successful');
    } catch (err) {
      console.error('Login failed in component:', err);
      console.log('Error state after login attempt:', error);
      // Error is handled by AuthContext
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-[80%] max-w-4xl flex rounded-xl shadow-md overflow-hidden">
        {/* Left side with image and red background */}
        <div className="w-1/2 bg-[#ff4d30] p-8 flex flex-col items-center justify-center">
          <img src={logimg} alt="Food" className="w-60" />
        </div>

        {/* Right side with login form */}
        <div className="w-1/2 bg-[#fff6ef] p-10 flex flex-col justify-center">
          <Logo />
          <form className="space-y-4" onSubmit={handleSubmit}>
            <ErrorMessage error={error} />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />
            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
            <FormLinks />
            <Button loading={loading}>Connecter</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;