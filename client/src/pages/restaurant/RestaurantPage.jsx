import React from 'react';
import Sidebar from '../../components/restaurant/Sidebar';
import SidebarContainer from '../../components/restaurant/SidebarContainer';
import { FaHome, FaBoxOpen, FaClipboardList, FaShoppingCart, FaClock, FaChartLine, FaUser } from 'react-icons/fa';

const restaurantSidebarItems = [
  { icon: <FaHome />, label: 'accueil', active: true },
  { icon: <FaBoxOpen />, label: 'Gestion des articles' },
  { icon: <FaClipboardList />, label: 'Gestion des menus' },
  { icon: <FaShoppingCart />, label: 'Commandes' },
  { icon: <FaClock />, label: 'Historique des Commandes' },
  { icon: <FaChartLine />, label: 'Statistiques' },
  { icon: <FaUser />, label: 'compte restaurate' },
];

function RestaurantPage() {
  return (
    <SidebarContainer sidebar={<Sidebar items={restaurantSidebarItems} />}>
      {/* Main content area */}
    </SidebarContainer>
  );
}

export default RestaurantPage;