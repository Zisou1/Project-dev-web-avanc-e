import React from "react";
import SearchBar from "../../components/SearchBar";
import DeliveryCard from "../../components/DeliveryCard";

const LivreurPage = () => {
  const deliveries = []; // Fetch or inject dynamic data later

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow p-10 mt-8">
      <h1 className="text-2xl font-bold mb-6 text-left">
        Livraisons disponibles
      </h1>

      {/* Search */}
      <div className="flex justify-center mb-8">
        <div className="w-full max-w-3xl">
          <SearchBar />
        </div>
      </div>

      {/* List of Deliveries */}
      <div className="space-y-8">
        {deliveries.length === 0 ? (
          <div className="text-center text-gray-500 text-lg">
            Aucune livraison disponible.
          </div>
        ) : (
          deliveries.map((delivery) => (
            <DeliveryCard key={delivery.id} delivery={delivery} /> 
          ))
        )}
      </div>
    </div>
  );
};

export default LivreurPage;
