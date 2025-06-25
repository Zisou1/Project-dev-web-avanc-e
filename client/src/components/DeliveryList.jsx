// src/components/DeliveryList.jsx
import React from "react";
import DeliveryCard from "./DeliveryCard";

const DeliveryList = ({ deliveries }) => {
  return (
    <table className="w-full table-auto mt-4 text-sm">
      <thead>
        <tr className="bg-gray-100 text-gray-700">
          <th>ID commande</th>
          <th>Adresse de récupération</th>
          <th>Adresse de livraison</th>
          <th>Prime</th>
          <th>Distance estimée</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {deliveries.map((delivery) => (
          <DeliveryCard key={delivery.id} {...delivery} />
        ))}
      </tbody>
    </table>
  );
};

export default DeliveryList;
