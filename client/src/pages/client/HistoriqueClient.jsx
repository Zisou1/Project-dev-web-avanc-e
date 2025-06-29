import React, { useState, useEffect } from "react";
import TableHistoriqueClient from "../../components/TableHistoriqueClient";
import SearchBar from "../../components/SearchBar";
import FilterButton from "../../components/FilterButton";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faClockRotateLeft, 
  faReceipt, 
  faChartLine,
  faStore,
  faCalendarDays,
  faBoxOpen
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "../../styles/animations.css";

const filterFields = [
  {
    key: "restaurant",
    label: "Restaurant",
    type: "text",
    placeholder: "Nom du restaurant",
  },
];

const HistoriqueClient = () => {
  const { user } = useAuth();
  const [commandes, setCommandes] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);

  // Status mapping function to convert English backend statuses to French display labels
  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': 'En attente',
      'confirmed': 'Confirmé',
      'waiting for pickup': 'En attente de récupération',
      'product pickedup': 'Produit récupéré',
      'confirmed by delivery': 'Confirmé par le livreur',
      'confirmed by client': 'Confirmé par le client',
      'completed': 'Livré',
      'cancelled': 'Annulé'
    };
    return statusMap[status] || status;
  };

  useEffect(() => {
    const fetchCommandes = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:3000/api/orders/getOrderByUser/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
            },
          }
        );
        setCommandes(response.data.orders || response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des commandes:", error);
        setCommandes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCommandes();
  }, [user]);

  // Filtering logic - only show completed orders in history
  const filteredCommandes = commandes.filter((c) => {
    // First filter: only show completed orders
    const isCompleted = c.status === 'completed';
    
    // Then apply other filters
    const restaurantName = c.restaurant?.name || '';
    const matchesSearch =
      !search || restaurantName.toLowerCase().includes(search.toLowerCase());
    const matchesRestaurant =
      !filters.restaurant ||
      restaurantName.toLowerCase().includes(filters.restaurant.toLowerCase());
    
    return isCompleted && matchesSearch && matchesRestaurant;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200 animate-fade-in">
        <div className="sm:p-8 p-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg animate-float">
              <FontAwesomeIcon icon={faClockRotateLeft} className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 gradient-text">Historique des commandes</h1>
              <p className="text-gray-600 mt-1">Gérez et consultez vos commandes passées</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-slide-in-up">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Commandes Livrées</p>
                  <p className="text-3xl font-bold">{commandes.filter(c => c.status === 'completed').length}</p>
                </div>
                <FontAwesomeIcon icon={faReceipt} className="text-3xl text-blue-200 animate-pulse-subtle" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Restaurants Visités</p>
                  <p className="text-3xl font-bold">
                    {new Set(commandes.filter(c => c.status === 'completed').map(c => c.restaurant?.id)).size}
                  </p>
                </div>
                <FontAwesomeIcon icon={faStore} className="text-3xl text-green-200 animate-pulse-subtle" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Dépensé</p>
                  <p className="text-3xl font-bold">
                    {commandes
                      .filter(c => c.status === 'completed')
                      .reduce((total, c) => total + (c.total_price || c.montant || 0), 0)} DA
                  </p>
                </div>
                <FontAwesomeIcon icon={faChartLine} className="text-3xl text-purple-200 animate-pulse-subtle" />
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 card-hover">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faStore} className="text-orange-500 text-xl" />
                <FilterButton
                  fields={filterFields}
                  onApply={setFilters}
                  initial={filters}
                />
              </div>
              <div className="flex-1 w-full">
                <SearchBar
                  query={search}
                  setQuery={setSearch}
                  placeholder="Rechercher par restaurant..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="sm:p-8 p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden card-hover">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-600 font-medium">Chargement de vos commandes...</p>
                <p className="text-gray-400 text-sm mt-1">Veuillez patienter</p>
              </div>
            </div>
          ) : filteredCommandes.length > 0 ? (
            <TableHistoriqueClient
              deliveries={filteredCommandes}
            />
          ) : (
            <div className="text-center py-16">
              <div className="mb-6">
                <FontAwesomeIcon icon={faCalendarDays} className="text-6xl text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune commande livrée trouvée</h3>
              <p className="text-gray-500">
                {search || Object.keys(filters).length > 0 
                  ? "Essayez de modifier vos critères de recherche" 
                  : "Vous n'avez pas encore de commandes livrées"}
              </p>
              {search || Object.keys(filters).length > 0 ? (
                <button 
                  onClick={() => {
                    setSearch("");
                    setFilters({});
                  }}
                  className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                  Réinitialiser les filtres
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoriqueClient;