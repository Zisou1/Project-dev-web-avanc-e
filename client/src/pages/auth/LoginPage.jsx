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
  
  const { login, loading, error, clearError, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to get role-based redirect path
  const getRoleBasedPath = (userRole) => {
    switch (userRole) {
      case 'admin':
        return '/admin';
      case 'restaurant':
        return '/restaurant';
      case 'delivery':
        return '/livreur';
      case 'client':
      case 'user':
      default:
        return '/';
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname;
      
      // Check if the 'from' path matches user's role, otherwise use role-based path
      const userRoleBasedPath = getRoleBasedPath(user.role);
      let redirectPath = userRoleBasedPath; // Default to role-based path
      
      // Only use 'from' path if it matches the user's role access
      if (from) {
        const isValidFromPath = checkPathMatchesRole(from, user.role);
        if (isValidFromPath) {
          redirectPath = from;
        }
      }
      
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, location, user]);

  // Helper function to check if a path matches the user's role
  const checkPathMatchesRole = (path, userRole) => {
    const rolePaths = {
      'admin': ['/admin'],
      'restaurant': ['/restaurant'],
      'delivery': ['/livreur'],
      'client': ['/'],
      'user': ['/'],
      'customer': ['/']
    };
    
    const allowedPaths = rolePaths[userRole] || ['/'];
    return allowedPaths.some(allowedPath => path.startsWith(allowedPath));
  };

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
    
    try {
      const loginResponse = await login(formData.email, formData.password);
      
      // Always use role-based path for redirect after login to avoid stale redirects
      const userRole = loginResponse.user?.role;
      const redirectPath = getRoleBasedPath(userRole);
      
      navigate(redirectPath, { replace: true });
      
    } catch (err) {
      console.error('Login failed in component:', err);
      // Error is handled by AuthContext
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-4xl flex flex-col lg:flex-row rounded-xl shadow-md overflow-hidden">
        {/* Left side with image and red background */}
        <div className="w-full lg:w-1/2 bg-[#ff4d30] p-6 lg:p-8 flex flex-col items-center justify-center min-h-[200px] lg:min-h-auto">
          <img src={logimg} alt="Food" className="w-40 sm:w-48 lg:w-60" />
        </div>

        {/* Right side with login form */}
        <div className="w-full lg:w-1/2 bg-[#fff6ef] p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
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