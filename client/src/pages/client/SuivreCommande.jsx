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
import { orderService } from "../../services/orderService";
import "../../styles/animations.css";

const filterFields = [
  {
    key: "restaurant",
    label: "Restaurant",
    type: "text",
    placeholder: "Nom du restaurant",
  },
];

function SuivreCommande() {
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
        const response = await orderService.getUserOrders(user.id);
        const orders = response.orders || response;
        console.log("Raw orders data:", orders);
        console.log("Orders length:", orders.length);
        if (orders.length > 0) {
          console.log("First order:", orders[0]);
          console.log("First order status:", orders[0].status);
        }
        setCommandes(orders);
      } catch (error) {
        console.error("Erreur lors du chargement des commandes:", error);
        setCommandes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCommandes();
  }, [user]);

  // Filtering logic - show orders that are not completed and not cancelled (include pending orders)
  const filteredCommandes = commandes.filter((c) => {
    console.log("Filtering order:", c.id || c._id, "Status:", c.status);
    
    // First filter: exclude completed and cancelled orders (but include pending)
    const isNotCompletedOrCancelled = c.status !== 'completed' && c.status !== 'cancelled';
    console.log("Is not completed or cancelled:", isNotCompletedOrCancelled);
    
    // Then apply other filters
    const restaurantName = c.restaurant?.name || '';
    const matchesSearch =
      !search || restaurantName.toLowerCase().includes(search.toLowerCase());
    const matchesRestaurant =
      !filters.restaurant ||
      restaurantName.toLowerCase().includes(filters.restaurant.toLowerCase());
    
    const finalResult = isNotCompletedOrCancelled && matchesSearch && matchesRestaurant;
    console.log("Final filter result:", finalResult);
    
    return finalResult;
  });

  console.log("Total orders:", commandes.length);
  console.log("Filtered orders:", filteredCommandes.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200 animate-fade-in">
        <div className="sm:p-8 p-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg animate-float">
              <FontAwesomeIcon icon={faBoxOpen} className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 gradient-text">Suivi des commandes</h1>
              <p className="text-gray-600 mt-1">Suivez vos commandes en cours</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faReceipt} className="text-blue-600 text-xl" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Commandes en cours</p>
                  <p className="text-2xl font-bold text-blue-800">{filteredCommandes.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200 animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faStore} className="text-orange-600 text-xl" />
                <div>
                  <p className="text-sm text-orange-600 font-medium">Restaurants</p>
                  <p className="text-2xl font-bold text-orange-800">
                    {new Set(filteredCommandes.map(c => c.restaurant?.name)).size}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200 animate-slide-up" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faChartLine} className="text-green-600 text-xl" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Total dépensé</p>
                  <p className="text-2xl font-bold text-green-800">
                    {filteredCommandes.reduce((sum, c) => sum + (c.total_price || c.montant || 0), 0).toFixed(2)}€
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <FilterButton 
              fields={filterFields}
              onFilter={setFilters}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            />
            <div className="flex-1">
              <SearchBar 
                value={search} 
                onChange={setSearch} 
                placeholder="Rechercher par restaurant..." 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="sm:p-8 p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-slide-up" style={{animationDelay: '0.5s'}}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <span className="ml-4 text-gray-600 font-medium">Chargement des commandes...</span>
            </div>
          ) : filteredCommandes.length > 0 ? (
            <TableHistoriqueClient deliveries={filteredCommandes} />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <FontAwesomeIcon icon={faBoxOpen} className="text-6xl mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">Aucune commande en cours</h3>
              <p>Vous n'avez aucune commande en cours de traitement.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SuivreCommande;