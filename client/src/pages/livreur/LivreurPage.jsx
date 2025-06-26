import React from "react";
import SearchBar from "../../components/SearchBar";
import DeliveryTable from "../../components/DataTable"; // ✅ updated import

const LivreurPage = () => {
  const deliveries = []; // Replace with real data later

  const handleAccept = (delivery) => {
    console.log("Livraison acceptée:", delivery);
    // Logic to accept the delivery (e.g., API call)
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow p-10 mt-8">
      <h1 className="text-2xl font-bold mb-6 text-left">
        Livraisons disponibles
      </h1>

      {/* Search */}
      <div className="flex justify-center mb-8">
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
