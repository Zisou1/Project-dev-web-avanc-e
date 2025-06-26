import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserProfile from '../components/UserProfile';
import NotificationDropdown from '../components/NotificationDropdown';
import { useNotifications } from '../hooks/useNotifications';

const Layout = ({ children}) => {
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize notifications with sample data
  const initialNotifications = [
    { id: 1, message: "Votre commande #1234 a été livrée", time: "Il y a 5 min", unread: true, type: "order" },
    { id: 2, message: "Nouvelle promotion disponible chez Pizza Palace", time: "Il y a 1h", unread: true, type: "promotion" },
    { id: 3, message: "Votre commande #1233 est en préparation", time: "Il y a 2h", unread: false, type: "order" },
  ];

  const {
    notifications,
    markAsRead,
    markAllAsRead
  } = useNotifications(initialNotifications);

  const handleNotificationClick = (notification) => {
    console.log('Notification clicked:', notification);
    // Add any custom logic here (e.g., navigate to order details)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="relative">
                  <img 
                    src="/src/assets/Logo.png" 
                    alt="Food Delivery App Logo" 
                    className="h-8 sm:h-10 md:h-12 w-auto transition-transform duration-300 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-[#FF4D4F] opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300"></div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {!isAuthenticated ? (
                <>
                  <Link to="/" className="relative text-gray-700 hover:text-[#FF4D4F] transition-all duration-300 px-3 py-2 rounded-lg hover:bg-red-50 group">
                    <span className="relative z-10">Accueil</span>
                    <div className="absolute inset-0 bg-[#FF4D4F] opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
                  </Link>
                  <Link to="/explorer" className="relative text-gray-700 hover:text-[#FF4D4F] transition-all duration-300 px-3 py-2 rounded-lg hover:bg-red-50 group">
                    <span className="relative z-10">Explorer</span>
                    <div className="absolute inset-0 bg-[#FF4D4F] opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/" className="relative text-gray-700 hover:text-[#FF4D4F] transition-all duration-300 px-3 py-2 rounded-lg hover:bg-red-50 group">
                    <span className="relative z-10">Accueil</span>
                    <div className="absolute inset-0 bg-[#FF4D4F] opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
                  </Link>
                  <Link to="/explorer" className="relative text-gray-700 hover:text-[#FF4D4F] transition-all duration-300 px-3 py-2 rounded-lg hover:bg-red-50 group">
                    <span className="relative z-10">Explorer</span>
                    <div className="absolute inset-0 bg-[#FF4D4F] opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
                  </Link>
                  <Link to="/commandes" className="relative text-gray-700 hover:text-[#FF4D4F] transition-all duration-300 px-3 py-2 rounded-lg hover:bg-red-50 group">
                    <span className="relative z-10">Commandes</span>
                    <div className="absolute inset-0 bg-[#FF4D4F] opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
                  </Link>
                </>
              )}
            </nav>

            {/* Desktop Auth Section */}
            <div className="hidden sm:flex items-center space-x-2 lg:space-x-4">
              {isAuthenticated && (
                <div className="flex items-center space-x-2 lg:space-x-3">
                  {/* Panier Icon */}
                  <Link
                    to="/panier"
                    className="relative p-2 lg:p-3 text-gray-700 hover:text-[#FF4D4F] hover:bg-red-50 rounded-xl transition-all duration-300 transform hover:scale-105 group"
                    title="Panier"
                  >
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 10H6L5 9z" />
                    </svg>
                    {/* Cart badge - Enhanced with animation */}
                    <span className="absolute -top-1 -right-1 bg-[#FF4D4F] text-white text-xs rounded-full h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center animate-pulse shadow-lg">
                      3
                    </span>
                  </Link>
                  
                  {/* Notifications Dropdown */}
                  <div className="relative">
                    <NotificationDropdown
                      notifications={notifications}
                      onNotificationClick={handleNotificationClick}
                      onMarkAsRead={markAsRead}
                      onClearAll={markAllAsRead}
                    />
                  </div>
                </div>
              )}
              
              {isAuthenticated ? (
                <UserProfile />
              ) : (
                <div className="flex items-center space-x-2 lg:space-x-4">
                  <Link
                    to="/login"
                    className="hidden md:block text-gray-700 hover:text-[#FF4D4F] transition-all duration-300 px-3 lg:px-4 py-2 rounded-lg hover:bg-red-50 text-sm lg:text-base"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="bg-[#FF4D4F] hover:bg-[#E63946] text-white px-3 lg:px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm lg:text-base"
                  >
                    <span className="hidden sm:inline">Créer un compte</span>
                    <span className="sm:hidden">Inscription</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button and mobile auth */}
            <div className="flex items-center space-x-2 sm:hidden">
              {isAuthenticated && (
                <>
                  {/* Mobile Panier Icon */}
                  <Link
                    to="/panier"
                    className="relative p-2 text-gray-700 hover:text-[#FF4D4F] hover:bg-red-50 rounded-lg transition-all duration-300"
                    title="Panier"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 10H6L5 9z" />
                    </svg>
                    <span className="absolute -top-1 -right-1 bg-[#FF4D4F] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      3
                    </span>
                  </Link>
                  
                  {/* Mobile Notifications */}
                  <div className="relative">
                    <NotificationDropdown
                      notifications={notifications}
                      onNotificationClick={handleNotificationClick}
                      onMarkAsRead={markAsRead}
                      onClearAll={markAllAsRead}
                    />
                  </div>
                </>
              )}
              
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-gray-700 hover:text-[#FF4D4F] hover:bg-red-50 transition-all duration-300"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4 bg-white/95 backdrop-blur-md">
              <div className="flex flex-col space-y-2">
                {!isAuthenticated ? (
                  <>
                    <Link 
                      to="/" 
                      className="text-gray-700 hover:text-[#FF4D4F] hover:bg-red-50 px-4 py-3 rounded-lg transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Accueil
                    </Link>
                    <Link 
                      to="/explorer" 
                      className="text-gray-700 hover:text-[#FF4D4F] hover:bg-red-50 px-4 py-3 rounded-lg transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Explorer
                    </Link>
                    <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                      <Link
                        to="/login"
                        className="text-gray-700 hover:text-[#FF4D4F] hover:bg-red-50 px-4 py-3 rounded-lg transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Connexion
                      </Link>
                      <Link
                        to="/register"
                        className="bg-[#FF4D4F] hover:bg-[#E63946] text-white px-4 py-3 rounded-lg transition-all duration-300 text-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Créer un compte
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/" 
                      className="text-gray-700 hover:text-[#FF4D4F] hover:bg-red-50 px-4 py-3 rounded-lg transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Accueil
                    </Link>
                    <Link 
                      to="/explorer" 
                      className="text-gray-700 hover:text-[#FF4D4F] hover:bg-red-50 px-4 py-3 rounded-lg transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Explorer
                    </Link>
                    <Link 
                      to="/commandes" 
                      className="text-gray-700 hover:text-[#FF4D4F] hover:bg-red-50 px-4 py-3 rounded-lg transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Commandes
                    </Link>
                    <div className="pt-4 border-t border-gray-200">
                      <UserProfile />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-blue-100 mt-4 sm:mt-6 lg:mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col space-y-6 lg:space-y-0 lg:flex-row lg:justify-between lg:items-center">
            <div className="text-gray-600 text-sm text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-2">
                <span className="text-xl sm:text-2xl">🍕</span>
                <span className="text-xs sm:text-sm">© 2025 YumZo Food Delivery. Tous droits réservés.</span>
              </div>
            </div>
            
            {/* Footer Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-3 sm:gap-4 lg:gap-6 justify-center lg:justify-end text-center lg:text-left">
              <Link to="/about" className="text-gray-600 hover:text-[#FF4D4F] text-xs sm:text-sm transition-all duration-300 hover:scale-105 px-2 py-1 rounded hover:bg-red-50">
                À Propos
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-[#FF4D4F] text-xs sm:text-sm transition-all duration-300 hover:scale-105 px-2 py-1 rounded hover:bg-red-50">
                Contact
              </Link>
              <Link to="/faq" className="text-gray-600 hover:text-[#FF4D4F] text-xs sm:text-sm transition-all duration-300 hover:scale-105 px-2 py-1 rounded hover:bg-red-50">
                Aide/FAQ
              </Link>
              <Link to="/privacy" className="text-gray-600 hover:text-[#FF4D4F] text-xs sm:text-sm transition-all duration-300 hover:scale-105 px-2 py-1 rounded hover:bg-red-50">
                Confidentialité
              </Link>
              <Link to="/terms" className="text-gray-600 hover:text-[#FF4D4F] text-xs sm:text-sm transition-all duration-300 hover:scale-105 px-2 py-1 rounded hover:bg-red-50 col-span-2 sm:col-span-1">
                Conditions
              </Link>
            </div>
          </div>
          
          {/* Social Media Icons */}
          <div className="mt-6 pt-6 border-t border-gray-200 flex justify-center space-x-4 sm:space-x-6">
            <a href="#" className="text-gray-400 hover:text-[#FF4D4F] transition-all duration-300 transform hover:scale-125 p-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-[#FF4D4F] transition-all duration-300 transform hover:scale-125 p-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-[#FF4D4F] transition-all duration-300 transform hover:scale-125 p-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.162-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-[#FF4D4F] transition-all duration-300 transform hover:scale-125 p-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.5.75C6.146.75 1 5.896 1 12.25c0 5.089 3.292 9.387 7.863 10.91.575-.105 1.025-.485 1.025-1.037 0-.513-.022-2.219-.022-4.04-3.338.724-4.042-1.61-4.042-1.61C4.825 15.361 3.8 14.958 3.8 14.958c-1.094-.747.083-.735.083-.735 1.205.085 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.42-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112.5 9.75c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.24 24 12.25 24 5.896 18.854.75 12.5.75z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;