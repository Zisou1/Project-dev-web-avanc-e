import React, { useState } from "react";
import TableHistoriqueClient from "../../components/TableHistoriqueClient";
import SearchBar from "../../components/SearchBar";
import FilterButton from "../../components/FilterButton";
import ConfirmationModal from "../../components/ConfirmationModal";

const mockCommandes = [
  {
    id: 1,
    restaurant: "Macdonald",
    articles: ["Burger", "Frites"],
    montant: 7000,
    status: "livré",
  },
  {
    id: 2,
    restaurant: "R tacos",
    articles: ["Tacos"],
    montant: 3400,
    status: "livré",
  },
  {
    id: 3,
    restaurant: "Padre",
    articles: ["Pizza"],
    montant: 1500,
    status: "pas livré",
  },
];

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
  const [commandes, setCommandes] = useState(mockCommandes);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [actionRow, setActionRow] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filtering logic
  const filteredCommandes = commandes.filter((c) => {
    const matchesSearch =
      !search ||
      c.restaurant.toLowerCase().includes(search.toLowerCase());
    const matchesRestaurant =
      !filters.restaurant ||
      c.restaurant.toLowerCase().includes(filters.restaurant.toLowerCase());
    const matchesStatus = !filters.status || c.status === filters.status;
    return matchesSearch && matchesRestaurant && matchesStatus;
  });

  // Handle action button click
  const handleAction = (row) => {
    setActionRow(row);
    setShowModal(true);
  };

  // Handle delete confirm
  const handleDelete = () => {
    setCommandes((prev) => prev.filter((c) => c.id !== actionRow.id));
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
            value={search}
            onChange={setSearch}
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
