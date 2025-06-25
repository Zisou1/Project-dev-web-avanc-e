import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserProfile from '../components/UserProfile';

const Layout = ({ children}) => {
  const { isAuthenticated } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sample notifications data
  const notifications = [
    { id: 1, message: "Votre commande #1234 a été livrée", time: "Il y a 5 min", unread: true },
    { id: 2, message: "Nouvelle promotion disponible chez Pizza Palace", time: "Il y a 1h", unread: true },
    { id: 3, message: "Votre commande #1233 est en préparation", time: "Il y a 2h", unread: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                <img src="/src/assets/Logo.png" alt="Food Delivery App Logo" className="h-16 w-auto" />
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {!isAuthenticated ? (
                <>
                  <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Accueil
                  </Link>
                  <Link to="/explorer" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Explorer
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Accueil
                  </Link>
                  <Link to="/explorer" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Explorer
                  </Link>
                  <Link to="/commandes" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Commandes
                  </Link>
                </>
              )}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <div className="flex items-center space-x-3">
                  {/* Panier Icon */}
                  <Link
                    to="/panier"
                    className="p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors relative"
                    title="Panier"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 10H6L5 9z" />
                    </svg>
                    {/* Cart badge - you can add logic to show item count */}
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
                  </Link>
                  
                  {/* Notifications Dropdown */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                      className="p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors relative"
                      title="Notifications"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {/* Notification badge */}
                      {notifications.some(n => n.unread) && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {notifications.filter(n => n.unread).length}
                        </span>
                      )}
                    </button>

                    {/* Notification Dropdown */}
                    {isNotificationOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          <div className="px-4 py-2 border-b border-gray-200">
                            <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                          </div>
                          {notifications.length > 0 ? (
                            <div className="max-h-64 overflow-y-auto">
                              {notifications.map((notification) => (
                                <div
                                  key={notification.id}
                                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                                    notification.unread ? 'bg-blue-50' : ''
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <p className={`text-sm ${notification.unread ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                                        {notification.message}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                    </div>
                                    {notification.unread && (
                                      <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1"></div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-6 text-center text-gray-500">
                              Aucune notification
                            </div>
                          )}
                          <div className="px-4 py-2 border-t border-gray-200">
                            <Link
                              to="/notifications"
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                              onClick={() => setIsNotificationOpen(false)}
                            >
                              Voir toutes les notifications
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {isAuthenticated ? (
                <UserProfile />
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Créer un compte
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 text-sm">
              © 2025 Food Delivery App. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-end space-x-6 mt-4 md:mt-0">
              <Link to="/about" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                À Propos
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                Contact
              </Link>
              <Link to="/faq" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                Aide/FAQ
              </Link>
              <Link to="/privacy" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                Confidentialité
              </Link>
              <Link to="/terms" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                Conditions d'utilisation
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;