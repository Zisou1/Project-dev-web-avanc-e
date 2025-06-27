import React, { useEffect, useState } from 'react'
import { FaMapMarkerAlt } from "react-icons/fa";
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

function RestaurantPage() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all restaurants and find the one for the current user
        const res = await axios.get('/api/restaurants/getAll');
        const found = Array.isArray(res.data.restaurants)
          ? res.data.restaurants.find(r => r.user_id === user?.id)
          : null;
        setRestaurant(found || {});
      } catch (err) {
        setRestaurant({}); // Show empty boxes if error
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchRestaurant();
    else setLoading(false);
  }, [user]);

  const stats = {
    activeItems: restaurant.activeItems ?? 0,
    activeMenus: restaurant.activeMenus ?? 0,
    ordersToday: restaurant.ordersToday ?? 0,
    pendingOrders: restaurant.pendingOrders ?? 0,
    completedOrders: restaurant.completedOrders ?? 0,
    revenueToday: restaurant.revenueToday ?? 0,
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-8 px-2">
      {/* Header Card */}
      <div className="w-full max-w-4xl bg-gray-100 rounded-2xl shadow-md border-2 border-blue-400 flex flex-col md:flex-row items-center justify-between p-6 mb-8" style={{gap: '1.5rem'}}>
        <div className="flex-1 flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">restaurant : {restaurant.name || <span className='text-gray-400'>Nom non défini</span>}</h1>
          <div className="flex items-center text-lg text-gray-700 gap-2 mb-1">
            <span className="text-red-500 text-xl"><FaMapMarkerAlt /></span>
            <span>{restaurant.address || <span className='text-gray-400'>Adresse non définie</span>}</span>
          </div>
          <div className="text-base text-gray-600 font-medium">
            Type de cuisine : <span className="font-semibold text-gray-800">{restaurant.kitchen_type || <span className='text-gray-400'>Non défini</span>}</span>
          </div>
        </div>
        <div className="flex gap-4 mt-6 md:mt-0">
          <div className="bg-white rounded-2xl border border-gray-300 px-8 py-4 flex flex-col items-center min-w-[120px]">
            <span className="text-4xl font-bold text-gray-800" style={{color: '#3a2323'}}>{stats.activeItems}</span>
            <span className="text-sm font-medium text-gray-700 mt-1">Nombre d’articles actifs</span>
          </div>
          <div className="bg-white rounded-2xl border border-gray-300 px-8 py-4 flex flex-col items-center min-w-[120px]">
            <span className="text-4xl font-bold text-gray-800" style={{color: '#3a2323'}}>{stats.activeMenus}</span>
            <span className="text-sm font-medium text-gray-700 mt-1">Nombre menus actifs</span>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6 justify-center">
        <div className="flex-1 bg-gray-100 rounded-2xl shadow p-6 flex flex-col items-start min-w-[200px]">
          <span className="text-xl font-semibold mb-2">Commandes du jour</span>
          <span className="text-4xl font-bold" style={{color: '#3a2323'}}>{stats.ordersToday}</span>
        </div>
        <div className="flex-1 bg-gray-100 rounded-2xl shadow p-6 flex flex-col items-start min-w-[200px]">
          <span className="text-xl font-semibold mb-2">Commandes en attente</span>
          <span className="text-4xl font-bold text-red-500">{stats.pendingOrders}</span>
        </div>
        <div className="flex-1 bg-gray-100 rounded-2xl shadow p-6 flex flex-col items-start min-w-[200px]">
          <span className="text-xl font-semibold mb-2">commande terminer</span>
          <span className="text-4xl font-bold text-green-500">{stats.completedOrders}</span>
        </div>
        <div className="flex-1 bg-gray-100 rounded-2xl shadow p-6 flex flex-col items-start min-w-[200px]">
          <span className="text-xl font-semibold mb-2">Revenus du jour</span>
          <span className="text-4xl font-bold text-green-500">{stats.revenueToday} DA</span>
        </div>
      </div>
      {error && <div className="text-center text-red-500 py-4">{error}</div>}
    </div>
  );
}

export default RestaurantPage