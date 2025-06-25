import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile && sidebarOpen) {
        // On mobile, close sidebar by default
        setSidebarOpen(false);
      }
    };

    handleResize(); // Check initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: '📊',
      path: '/admin',
      active: location.pathname === '/admin'
    },
    {
      name: 'Users',
      icon: '👥',
      path: '/admin/users',
      active: location.pathname.startsWith('/admin/users')
    },
    {
      name: 'Restaurants',
      icon: '🏪',
      path: '/admin/restaurants',
      active: location.pathname.startsWith('/admin/restaurants')
    },
    {
      name: 'Orders',
      icon: '📦',
      path: '/admin/orders',
      active: location.pathname.startsWith('/admin/orders')
    },
    {
      name: 'Delivery',
      icon: '🚚',
      path: '/admin/delivery',
      active: location.pathname.startsWith('/admin/delivery')
    },
    {
      name: 'Analytics',
      icon: '📈',
      path: '/admin/analytics',
      active: location.pathname.startsWith('/admin/analytics')
    },
    {
      name: 'Settings',
      icon: '⚙️',
      path: '/admin/settings',
      active: location.pathname.startsWith('/admin/settings')
    }
  ];

  return (
    <div style={styles.layout}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navbarLeft}>
          <button
            onClick={toggleSidebar}
            style={styles.menuButton}
            onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ☰
          </button>
          <h1 style={styles.logo}>Admin Panel</h1>
        </div>
        
        <div style={styles.navbarRight}>
          <div style={styles.userInfo}>
            <span style={styles.userIcon}>👤</span>
            <span style={styles.userName}>{user?.name || 'Admin'}</span>
          </div>
          <button
            onClick={handleLogout}
            style={styles.logoutButton}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#dc2626';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#ef4444';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div style={styles.container}>
        {/* Sidebar */}
        <aside style={{
          ...styles.sidebar,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-250px)'
        }}>
          <div style={styles.sidebarContent}>
            <div style={styles.sidebarHeader}>
              <h3 style={styles.sidebarTitle}>Navigation</h3>
            </div>
            
            <nav style={styles.sidebarNav}>
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    ...styles.sidebarItem,
                    backgroundColor: item.active 
                      ? '#3b82f6' 
                      : hoveredItem === item.path 
                        ? '#f3f4f6' 
                        : 'transparent',
                    color: item.active ? '#ffffff' : '#374151'
                  }}
                >
                  <span style={styles.sidebarIcon}>{item.icon}</span>
                  <span style={styles.sidebarText}>{item.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{
          ...styles.main,
          marginLeft: sidebarOpen && !isMobile ? '250px' : '0'
        }}>
          <div style={styles.content}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div
          style={styles.overlay}
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

const styles = {
  layout: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 1rem',
    height: '64px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    position: 'relative'
  },
  
  navbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  
  menuButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '0.375rem',
    transition: 'background-color 0.2s',
    color: '#374151'
  },
  
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0
  },
  
  navbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#f3f4f6',
    borderRadius: '0.5rem'
  },
  
  userIcon: {
    fontSize: '1.25rem'
  },
  
  userName: {
    fontWeight: '500',
    color: '#374151'
  },
  
  logoutButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s',
    fontSize: '0.875rem'
  },
  
  container: {
    display: 'flex',
    flex: 1,
    position: 'relative',
    overflow: 'hidden'
  },
  
  sidebar: {
    position: 'fixed',
    top: '64px',
    left: 0,
    width: '250px',
    height: 'calc(100vh - 64px)',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    transition: 'transform 0.3s ease-in-out',
    zIndex: 999,
    boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  },
  
  sidebarContent: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  
  sidebarHeader: {
    padding: '1.5rem 1rem 1rem 1rem',
    borderBottom: '1px solid #e5e7eb'
  },
  
  sidebarTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#374151',
    margin: 0
  },
  
  sidebarNav: {
    flex: 1,
    padding: '1rem 0'
  },
  
  sidebarItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.75rem 1rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s',
    textAlign: 'left'
  },
  
  sidebarIcon: {
    fontSize: '1.25rem',
    width: '20px',
    textAlign: 'center'
  },
  
  sidebarText: {
    flex: 1
  },
  
  main: {
    flex: 1,
    transition: 'margin-left 0.3s ease-in-out',
    minHeight: 'calc(100vh - 64px)'
  },
  
  content: {
    padding: '2rem',
    maxWidth: '100%',
    height: '100%'
  },
  
  overlay: {
    position: 'fixed',
    top: '64px',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
    cursor: 'pointer'
  }
};

export default AdminLayout;