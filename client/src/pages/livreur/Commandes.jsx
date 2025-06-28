import React, { useState, useEffect } from "react";
import { orderService } from "../../services/orderService";
import { deliveryService } from "../../services/deliveryService";
import { useAuth } from "../../context/AuthContext";
import SearchBar from "../../components/SearchBar";
import InfoCard from "../../components/InfoCard";
import FilterButton from "../../components/FilterButton";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";

export default function Commandes() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [showArticles, setShowArticles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [userHasActiveDelivery, setUserHasActiveDelivery] = useState(false);
  const [activeDeliveryOrderId, setActiveDeliveryOrderId] = useState(null);
  
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch all orders
        const response = await orderService.getAllOrders();
        setOrders(response.orders || []);
        console.log('Orders set in state:', response.orders || []);

        // Check if current user has an active delivery
        if (user?.id) {
          try {
            const deliveryData = await deliveryService.getDeliveryByUser(user.id);
            if (deliveryData && deliveryData.status === true) {
              setUserHasActiveDelivery(true);
              setActiveDeliveryOrderId(deliveryData.order_id);
            } else {
              setUserHasActiveDelivery(false);
              setActiveDeliveryOrderId(null);
            }
          } catch (deliveryErr) {
            // No active delivery found for this user - this is normal
            setUserHasActiveDelivery(false);
            setActiveDeliveryOrderId(null);
          }
        }
      } catch (err) {
        setError("Erreur lors du chargement des commandes.");
        console.error("Error in fetchData:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  // Handle accept order
  const handleAccept = async (orderId) => {
    try {
      await orderService.updateOrderStatus(orderId, "waiting for pickup", user.id);
      setOrders((prev) => prev.filter((cmd) => cmd.id !== orderId)); // Remove from list
      setUserHasActiveDelivery(true);
      setActiveDeliveryOrderId(orderId);
    } catch (err) {
      alert("Erreur lors de l'acceptation de la commande.");
    }
  };

  const applyFilters = (orders) => {
    return orders.filter(cmd => {
      if (filters.prime_min && (cmd.prime || cmd.price || 0) < parseFloat(filters.prime_min)) return false;
      if (filters.prime_max && (cmd.prime || cmd.price || 0) > parseFloat(filters.prime_max)) return false;
      if (filters.status && cmd.status !== filters.status) return false;
      return true;
    });
  };

  const filtered = applyFilters(orders.filter(
    (cmd) =>
      (cmd.status === "confirmed") &&
      (cmd.address?.toLowerCase().includes(search.toLowerCase()) || "")
  ));

  // Stats for info cards
  const availableOrders = orders.filter(cmd => cmd.status === "confirmed").length;
  const totalValue = filtered.reduce((sum, cmd) => sum + (cmd.prime || cmd.price || 0), 0);
  const avgValue = filtered.length > 0 ? (totalValue / filtered.length).toFixed(2) : 0;

  const filterFields = [
    {
      key: 'prime',
      label: 'Prime (€)',
      type: 'range',
      placeholderMin: 'Min €',
      placeholderMax: 'Max €'
    },
    {
      key: 'status',
      label: 'Statut',
      type: 'select',
      options: [
        { value: 'confirmed', label: 'Confirmé' },
        { value: 'waiting for pickup', label: 'En attente de récupération' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🚚 Livraisons disponibles</h1>
        <p className="text-gray-600">Découvrez les commandes prêtes à être livrées</p>
      </div>

      {/* Stats Cards */}
      <div className="flex flex-wrap gap-4 mb-6">
        <InfoCard 
          label="Commandes disponibles" 
          value={availableOrders} 
          valueClass="text-blue-600" 
        />
        <InfoCard 
          label="Valeur totale" 
          value={`${totalValue.toFixed(2)}€`} 
          valueClass="text-green-600" 
        />
        <InfoCard 
          label="Prime moyenne" 
          value={`${avgValue}€`} 
          valueClass="text-purple-600" 
        />
        {userHasActiveDelivery && (
          <InfoCard 
            label="En cours" 
            value="1 commande" 
            valueClass="text-orange-600" 
          />
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-6">
        <FilterButton 
          fields={filterFields} 
          onApply={setFilters} 
          initial={filters}
        />
        <div className="flex-1">
          <SearchBar 
            query={search}
            setQuery={setSearch}
            placeholder="Rechercher par adresse..."
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FE5336]"></div>
          <span className="ml-3 text-lg text-gray-600">Chargement des commandes...</span>
        </div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune commande disponible</h3>
              <p className="text-gray-500">Aucune commande ne correspond à vos critères de recherche.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map(cmd => (
                <div key={cmd.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-[#FE5336] to-[#FF6B4A] p-4 text-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">Commande #{cmd.id}</h3>
                        <p className="text-red-100 text-sm">📍 {cmd.address}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{cmd.prime || cmd.price || "-"}€</div>
                        <div className="text-red-100 text-sm">Prime</div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">🏪 Récupération:</span>
                        <span className="font-medium">{cmd.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">🏠 Livraison:</span>
                        <span className="font-medium">{cmd.address}</span>
                      </div>
                      
                      {/* Articles Section */}
                      <div className="border-t pt-3">
                        <button
                          className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                          onClick={() => setShowArticles(showArticles === cmd.id ? null : cmd.id)}
                        >
                          <span className="font-medium text-gray-700">📋 Articles ({(cmd.articles || []).length})</span>
                          <span className="text-[#FE5336]">
                            {showArticles === cmd.id ? '▼' : '▶'}
                          </span>
                        </button>
                        
                        {showArticles === cmd.id && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <ul className="space-y-1">
                              {(cmd.articles || []).map((a, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm">
                                  <span className="w-2 h-2 bg-[#FE5336] rounded-full"></span>
                                  {a.name || a}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4">
                      <Button
                        onClick={() => handleAccept(cmd.id)}
                        disabled={userHasActiveDelivery}
                        className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                          userHasActiveDelivery 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-[#FE5336] hover:bg-[#FF6B4A] text-white focus:ring-[#FE5336]'
                        }`}
                      >
                        {userHasActiveDelivery ? '🔒 Une livraison en cours' : '✅ Accepter la commande'}
                      </Button>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="px-4 pb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      ✅ Confirmée
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Warning message if delivery in progress */}
      {userHasActiveDelivery && (
        <div className="fixed bottom-6 right-6 bg-orange-100 border-l-4 border-orange-500 p-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-center">
            <div className="text-orange-500 mr-3">⚠️</div>
            <div>
              <p className="font-medium text-orange-800">Livraison en cours</p>
              <p className="text-sm text-orange-700">Terminez votre livraison actuelle avant d'en accepter une nouvelle.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
