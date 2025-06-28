import React, { useState, useEffect } from "react";
import TableHistoriqueClient from "../../components/TableHistoriqueClient";
import SearchBar from "../../components/SearchBar";
import FilterButton from "../../components/FilterButton";
import ConfirmationModal from "../../components/ConfirmationModal";
import axios from "axios";

const filterFields = [
  {
    key: "restaurant",
    label: "Restaurant",
    type: "text",
    placeholder: "Nom du restaurant",
  },
  {
    key: "status",
    label: "Statut",
    type: "select",
    options: [
      { value: "", label: "Tous" },
      { value: "livré", label: "Livré" },
      { value: "pas livré", label: "Pas livré" },
    ],
  },
];

const HistoriqueClient = () => {
  const [commandes, setCommandes] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [actionRow, setActionRow] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/orders/getAll",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
            },
          }
        );
        // Adapter ici selon la structure de la réponse de l'API
        setCommandes(response.data.orders || response.data);
      } catch (error) {
        setCommandes([]);
      }
    };
    fetchCommandes();
  }, []);

  // Filtering logic
  const filteredCommandes = commandes.filter((c) => {
    // Pour le search bar, on cherche sur le nom du restaurant (c.restaurant.name)
    const restaurantName = c.restaurant?.name || '';
    const matchesSearch =
      !search || restaurantName.toLowerCase().includes(search.toLowerCase());
    // Pour le filtre, on cherche aussi sur le nom du restaurant
    const matchesRestaurant =
      !filters.restaurant ||
      restaurantName.toLowerCase().includes(filters.restaurant.toLowerCase());
    const matchesStatus = !filters.status || c.status === filters.status;
    return matchesSearch && matchesRestaurant && matchesStatus;
  });

  // Handle action button click
  const handleAction = (row) => {
    setActionRow(row);
    setShowModal(true);
  };

  // Handle delete confirm
  const handleDelete = async () => {
    if (!actionRow) return;
    try {
      const response = await axios.delete(
        `http://localhost:3000/api/orders/delete/${actionRow.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
          },
        }
      );
      if (response.status === 200 && response.data.success !== false) {
        setCommandes((prev) => prev.filter((c) => c.id !== actionRow.id));
      } else {
        alert("Suppression échouée côté serveur.");
        console.error("Réponse API:", response);
      }
    } catch (error) {
      alert("Erreur lors de la suppression de la commande. Voir la console.");
      console.error("Erreur API:", error.response || error);
    }
    setShowModal(false);
    setActionRow(null);
  };

  return (
    <div className="sm:p-8 p-1">
      <h1 className="text-2xl font-bold mb-6">Historique des commande</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <FilterButton
          fields={filterFields}
          onApply={setFilters}
          initial={filters}
        />
        <div className="flex-1 w-full">
          <SearchBar
            query={search}
            setQuery={setSearch}
            placeholder="search"
          />
        </div>
      </div>
      <TableHistoriqueClient
        deliveries={filteredCommandes}
        onAction={handleAction}
      />
      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
        title="Supprimer la commande"
        message={`Voulez-vous vraiment supprimer la commande #${actionRow?.id} ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
};

export default HistoriqueClient;