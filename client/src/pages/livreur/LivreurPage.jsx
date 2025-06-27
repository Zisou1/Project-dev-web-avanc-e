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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 py-8 px-2">
      <div className="w-full max-w-6xl mx-auto bg-white/90 rounded-2xl shadow-2xl p-8 md:p-12 mt-8">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-[#FF4D4F] drop-shadow-lg tracking-tight flex items-center justify-center gap-3">
          <span className="inline-block align-middle">🚚</span>
          Livraisons disponibles
        </h1>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-center mb-10 gap-4 items-center bg-white/80 shadow-lg rounded-2xl px-4 py-4">
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
        {deliveries.length > 0 ? (
          <DeliveryTable deliveries={deliveries} onAccept={handleAccept} />
        ) : (
          <div className="flex flex-col items-center justify-center mt-16">
            <div className="bg-[#FF4D4F]/10 rounded-full p-6 mb-4 shadow-lg">
              <svg className="w-16 h-16 text-[#FF4D4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h3m4 0v6a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Aucune livraison disponible</h2>
            <p className="text-gray-500 text-center max-w-xs">Il n'y a pas de livraisons à accepter pour le moment. Revenez plus tard !</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LivreurPage;
