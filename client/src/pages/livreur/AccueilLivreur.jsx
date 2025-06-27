import React from 'react';
import InfoCard from '../../components/InfoCard';

const AccueilLivreur = () => {
  // Example data
  const livreur = {
    name: 'Ramy test',
    phone: '0559922630',
    commandesJour: 47,
    commandesAttente: 40,
    commandesTerminer: 5,
    revenusJour: '7800 DA',
    rating: 4.8,
    totalDeliveries: 1247
  };

  const recentOrders = [
    { id: '#CMD001', restaurant: 'Pizza Palace', address: '15 Rue de la Liberté', status: 'En cours', time: '14:30', amount: '2450 DA' },
    { id: '#CMD002', restaurant: 'Burger King', address: '22 Avenue Mohamed V', status: 'Livré', time: '13:45', amount: '1800 DA' },
    { id: '#CMD003', restaurant: 'Sushi Bar', address: '8 Rue Didouche Mourad', status: 'Livré', time: '12:20', amount: '3200 DA' },
    { id: '#CMD004', restaurant: 'Café Central', address: '45 Boulevard Zirout Youcef', status: 'Livré', time: '11:30', amount: '850 DA' }
  ];

  const weeklyStats = [
    { day: 'Lun', orders: 12, revenue: '2100 DA' },
    { day: 'Mar', orders: 15, revenue: '2850 DA' },
    { day: 'Mer', orders: 18, revenue: '3200 DA' },
    { day: 'Jeu', orders: 14, revenue: '2650 DA' },
    { day: 'Ven', orders: 22, revenue: '4100 DA' },
    { day: 'Sam', orders: 28, revenue: '5200 DA' },
    { day: 'Dim', orders: 20, revenue: '3600 DA' }
  ];

  return (
    <div className="w-full min-h-screen p-4 overflow-y-auto">
      <div className="max-w-7xl mx-auto pb-8">
        {/* Header */}
        <div className="mb-8 pt-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Tableau de Bord Livreur</h1>
          <p className="text-gray-600">Bonjour {livreur.name}, voici votre aperçu d'aujourd'hui</p>
        </div>

        {/* Top Section - Profile and Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Livreur Profile Card */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Profil Livreur</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-gray-600 w-24">Nom:</span>
                <span className="font-semibold text-gray-800">{livreur.name}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 w-24">Téléphone:</span>
                <span className="font-semibold text-blue-600">{livreur.phone}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 w-24">Note:</span>
                <div className="flex items-center">
                  <span className="font-semibold text-yellow-600 mr-1">{livreur.rating}</span>
                  <div className="flex text-yellow-400">
                    {'★'.repeat(Math.floor(livreur.rating))}{'☆'.repeat(5 - Math.floor(livreur.rating))}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 w-24">Total:</span>
                <span className="font-semibold text-gray-800">{livreur.totalDeliveries} livraisons</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Commandes du jour</p>
                  <p className="text-3xl font-bold text-gray-800">{livreur.commandesJour}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">En attente</p>
                  <p className="text-3xl font-bold text-orange-600">{livreur.commandesAttente}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Terminées</p>
                  <p className="text-3xl font-bold text-green-600">{livreur.commandesTerminer}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Revenus du jour</p>
                  <p className="text-3xl font-bold text-green-600">{livreur.revenusJour}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section - Recent Orders and Weekly Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Commandes Récentes</h3>
            <div className="space-y-3">
              {recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-800">{order.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'En cours' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{order.restaurant}</p>
                    <p className="text-xs text-gray-500">{order.address}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">{order.time}</span>
                      <span className="font-semibold text-green-600">{order.amount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Statistiques de la Semaine</h3>
            <div className="space-y-3">
              {weeklyStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="font-semibold text-blue-600">{stat.day}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{stat.orders} commandes</p>
                      <p className="text-sm text-gray-600">{stat.revenue}</p>
                    </div>
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{width: `${(stat.orders / 30) * 100}%`}}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section - Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Actions Rapides</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 transition-colors duration-200">
              <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">Ma Position</span>
            </button>
            
            <button className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 transition-colors duration-200">
              <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium">Nouvelles Commandes</span>
            </button>
            
            <button className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg p-4 transition-colors duration-200">
              <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Historique</span>
            </button>
            
            <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-4 transition-colors duration-200">
              <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">Paramètres</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccueilLivreur;
