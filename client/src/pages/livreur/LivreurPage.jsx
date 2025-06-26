import React from "react";
import SearchBar from "../../components/SearchBar";
import DeliveryTable from "../../components/DataTable"; 
import FilterButton from "../../components/FilterButton";

const LivreurPage = () => {
  // Example data for testing
  const deliveries = [
    {
      id: 'CMD001',
      pickup: '123 Rue de Paris',
      address: '456 Avenue de Lyon',
      price: '8€',
      status: 'En attente',
    },
    {
      id: 'CMD002',
      pickup: '789 Boulevard Saint-Germain',
      address: '321 Rue Victor Hugo',
      price: '10€',
      status: 'En cours',
    },
    {
      id: 'CMD003',
      pickup: '12 Place Bellecour',
      address: '34 Rue Nationale',
      price: '7€',
      status: 'Livrée',
    },
  ];

  const handleAccept = (delivery) => {
    console.log("Livraison acceptée:", delivery);
    // Logic to accept the delivery (e.g., API call)
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow p-10 mt-8">
      <h1 className="text-2xl font-bold mb-6 text-left">
        Livraisons disponibles
      </h1>

      {/* Search and Filter */}
      <div className="flex justify-center mb-8 gap-4 flex-wrap">
        <FilterButton
          fields={[
            { key: 'pickup', label: 'Adresse de récupération', type: 'text', placeholder: 'Rechercher par adresse' },
            { key: 'status', label: 'Statut', type: 'select', options: [
              { value: 'En attente', label: 'En attente' },
              { value: 'En cours', label: 'En cours' },
              { value: 'Livrée', label: 'Livrée' },
            ] },
          ]}
          onApply={console.log}
        />
        <div className="w-full max-w-3xl">
          <SearchBar />
        </div>
      </div>

      {/* Table of Deliveries */}
      <DeliveryTable deliveries={deliveries} onAccept={handleAccept} />
    </div>
  );
};

export default LivreurPage;
