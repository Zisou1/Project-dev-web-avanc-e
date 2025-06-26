import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartBar, 
  faUsers, 
  faStore, 
  faBox, 
  faTruck, 
  faChartLine, 
  faCog, 
  faSignOutAlt,
  faBars,
  faUtensils,
  faClipboardList,
  faUser,
  faMapMarkedAlt,
  faDollarSign,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import ConfirmationModal from '../components/ConfirmationModal';
import NotificationDropdown from '../components/NotificationDropdown';
import { useNotifications } from '../hooks/useNotifications';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize notifications based on user role
  const getInitialNotifications = () => {
    const baseNotifications = [
      { id: 1, message: "Nouveau message système", time: "Il y a 2 min", unread: true, type: "info" },
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseNotifications,
          { id: 2, message: "Nouveau restaurant inscrit", time: "Il y a 10 min", unread: true, type: "info" },
          { id: 3, message: "Rapport mensuel disponible", time: "Il y a 1h", unread: false, type: "info" },
          { id: 4, message: "Alerte système: Trafic élevé", time: "Il y a 2h", unread: true, type: "info" },
        ];
      case 'restaurant':
        return [
          ...baseNotifications,
          { id: 2, message: "Nouvelle commande #1234 reçue", time: "Il y a 5 min", unread: true, type: "order" },
          { id: 3, message: "Commande #1233 livrée", time: "Il y a 15 min", unread: false, type: "delivery" },
          { id: 4, message: "Votre menu a été approuvé", time: "Il y a 1h", unread: true, type: "info" },
        ];
      case 'livreur':
      case 'delivery':
        return [
          ...baseNotifications,
          { id: 2, message: "Nouvelle livraison disponible", time: "Il y a 3 min", unread: true, type: "delivery" },
          { id: 3, message: "Livraison #1234 confirmée", time: "Il y a 20 min", unread: false, type: "delivery" },
          { id: 4, message: "Votre paiement a été traité", time: "Il y a 2h", unread: true, type: "info" },
        ];
      default:
        return baseNotifications;
    }
  };

  const {
    notifications,
    markAsRead,
    markAllAsRead
  } = useNotifications(getInitialNotifications());

  const handleNotificationClick = (notification) => {
    console.log('Dashboard notification clicked:', notification);
    // Add role-specific navigation logic
    if (notification.type === 'order' && user?.role === 'restaurant') {
      navigate('/restaurant/orders');
    } else if (notification.type === 'delivery' && (user?.role === 'livreur' || user?.role === 'delivery')) {
      navigate('/livreur/deliveries');
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile && sidebarOpen) {
        // Sur mobile, fermer la barre latérale par défaut
        setSidebarOpen(false);
      }
    };

    handleResize(); // Vérifier la taille initiale
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true, state: null });
      setShowLogoutModal(false);
    } catch (error) {
      console.error('Logout error:', error);
      setShowLogoutModal(false);
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    // Fermer la barre latérale sur mobile après navigation
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Configuration des menus selon le rôle
  const getMenuConfig = () => {
    switch (user?.role) {
      case 'admin':
        return {
          title: 'Panneau d\'administration',
          menuItems: [
            {
              name: 'Tableau de bord',
              icon: faChartBar,
              path: '/admin',
              active: location.pathname === '/admin'
            },
            {
              name: 'Utilisateurs',
              icon: faUsers,
              path: '/admin/users',
              active: location.pathname.startsWith('/admin/users')
            },
            {
              name: 'Restaurants',
              icon: faStore,
              path: '/admin/restaurants',
              active: location.pathname.startsWith('/admin/restaurants')
            },
            {
              name: 'Commandes',
              icon: faBox,
              path: '/admin/orders',
              active: location.pathname.startsWith('/admin/orders')
            },
            {
              name: 'Livraison',
              icon: faTruck,
              path: '/admin/delivery',
              active: location.pathname.startsWith('/admin/delivery')
            },
            {
              name: 'Analyses',
              icon: faChartLine,
              path: '/admin/analytics',
              active: location.pathname.startsWith('/admin/analytics')
            }
          ]
        };

      case 'restaurant':
        return {
          title: 'Panneau Restaurant',
          menuItems: [
            {
              name: 'Tableau de bord',
              icon: faChartBar,
              path: '/restaurant',
              active: location.pathname === '/restaurant'
            },
            {
              name: 'Gestion Menu',
              icon: faUtensils,
              path: '/restaurant/menu',
              active: location.pathname.startsWith('/restaurant/menu')
            },
            {
              name: 'Commandes',
              icon: faClipboardList,
              path: '/restaurant/orders',
              active: location.pathname.startsWith('/restaurant/orders')
            },
            {
              name: 'Analyses',
              icon: faChartLine,
              path: '/restaurant/analytics',
              active: location.pathname.startsWith('/restaurant/analytics')
            },
            {
              name: 'Profil',
              icon: faStore,
              path: '/restaurant/profile',
              active: location.pathname.startsWith('/restaurant/profile')
            }
          ]
        };

      case 'livreur':
      case 'delivery':
        return {
          title: 'Panneau Livreur',
          menuItems: [
            {
              name: 'Tableau de bord',
              icon: faChartBar,
              path: '/livreur',
              active: location.pathname === '/livreur'
            },
            {
              name: 'Commandes Disponibles',
              icon: faBox,
              path: '/livreur/orders',
              active: location.pathname.startsWith('/livreur/orders')
            },
            {
              name: 'Mes Livraisons',
              icon: faTruck,
              path: '/livreur/deliveries',
              active: location.pathname.startsWith('/livreur/deliveries')
            },
            {
              name: 'Gains',
              icon: faDollarSign,
              path: '/livreur/earnings',
              active: location.pathname.startsWith('/livreur/earnings')
            },
            {
              name: 'Profil',
              icon: faUser,
              path: '/livreur/profile',
              active: location.pathname.startsWith('/livreur/profile')
            }
          ]
        };

      default:
        return {
          title: 'Panneau Utilisateur',
          menuItems: []
        };
    }
  };

  const { title, menuItems } = getMenuConfig();

  const bottomMenuItems = [
    {
      name: 'Paramètres',
      icon: faCog,
      path: `/${user?.role}/settings`,
      active: location.pathname.startsWith(`/${user?.role}/settings`)
    }
  ];

  // Fonction pour obtenir le libellé du rôle
  const getRoleLabel = (role, isShort = false) => {
    const labels = {
      admin: { full: 'Administrateur', short: 'Admin' },
      restaurant: { full: 'Restaurant', short: 'Rest.' },
      livreur: { full: 'Livreur', short: 'Livr.' },
      delivery: { full: 'Livreur', short: 'Livr.' },
      customer: { full: 'Client', short: 'Client' }
    };
    
    return labels[role] ? (isShort ? labels[role].short : labels[role].full) : (isShort ? 'User' : 'Utilisateur');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Barre de navigation */}
      <nav className="flex justify-between items-center px-4 h-16 bg-white border-b border-gray-200 shadow-sm z-50 relative">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="bg-transparent border-none cursor-pointer p-2 rounded-md transition-colors duration-200 text-gray-700 hover:bg-gray-100"
          >
            <FontAwesomeIcon icon={faBars} className="text-2xl" />
          </button>
          <img 
            src="/src/assets/Logo.png" 
            alt="Logo" 
            className="h-12 w-auto"
          />
        </div>
        
        <div className="flex items-center gap-4">
          {/* Notifications Dropdown */}
          <NotificationDropdown
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onMarkAsRead={markAsRead}
            onClearAll={markAllAsRead}
          />
          
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            <span className="text-xl">👤</span>
            <div className="hidden sm:block">
              <div className="font-medium text-gray-700 text-sm">
                {user?.name || getRoleLabel(user?.role)}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {getRoleLabel(user?.role)}
              </div>
            </div>
            <div className="sm:hidden">
              <div className="font-medium text-gray-700 text-sm">
                {getRoleLabel(user?.role, true)}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 relative overflow-hidden">
        {/* Barre latérale */}
        <aside className={`fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out z-40 shadow-lg overflow-hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-64'
        }`}>
          <div className="h-full flex flex-col">
            <div className="p-6 pb-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-700 m-0">{title}</h3>
            </div>
            
            <nav className="flex-1 py-4 px-3">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`flex items-center gap-3 w-full px-4 py-3 mb-1 border-none cursor-pointer text-sm font-medium transition-all duration-200 text-left rounded-lg ${
                    item.active 
                      ? 'bg-[#FF4D4F] text-white' 
                      : hoveredItem === item.path 
                        ? 'bg-gray-100 text-gray-700' 
                        : 'bg-transparent text-gray-700'
                  }`}
                >
                  <FontAwesomeIcon icon={item.icon} className="w-6 text-center text-lg" />
                  <span className="flex-1">{item.name}</span>
                </button>
              ))}
            </nav>

            {/* Éléments du menu inférieur */}
            <div className="border-t border-gray-200 py-4 px-3">
              {bottomMenuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`flex items-center gap-3 w-full px-4 py-3 mb-1 border-none cursor-pointer text-sm font-medium transition-all duration-200 text-left rounded-lg ${
                    item.active 
                      ? 'bg-[#FF4D4F] text-white' 
                      : hoveredItem === item.path 
                        ? 'bg-gray-100 text-gray-700' 
                        : 'bg-transparent text-gray-700'
                  }`}
                >
                  <FontAwesomeIcon icon={item.icon} className="w-6 text-center text-lg" />
                  <span className="flex-1">{item.name}</span>
                </button>
              ))}
              
              {/* Bouton de déconnexion */}
              <button
                onClick={handleLogout}
                onMouseEnter={() => setHoveredItem('logout')}
                onMouseLeave={() => setHoveredItem(null)}
                className={`flex items-center gap-3 w-full px-4 py-3 border-none cursor-pointer text-sm font-medium transition-all duration-200 text-left rounded-lg ${
                  hoveredItem === 'logout' 
                    ? 'bg-gray-100 text-gray-700' 
                    : 'bg-transparent text-gray-700'
                }`}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="w-6 text-center text-lg" />
                <span className="flex-1">Déconnexion</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Contenu principal */}
        <main className={`flex-1 transition-all duration-300 ease-in-out min-h-[calc(100vh-4rem)] ${
          sidebarOpen && !isMobile ? 'ml-64' : 'ml-0'
        }`}>
          <div className="p-8 max-w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Superposition pour mobile */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 z-30 cursor-pointer"
          onClick={toggleSidebar}
        />
      )}

      {/* Modal de confirmation de déconnexion */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
        title="Confirmer la déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder au panneau."
        confirmText="Déconnexion"
        cancelText="Annuler"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
};

export default DashboardLayout;
