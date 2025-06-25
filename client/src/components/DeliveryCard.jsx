// src/components/DeliveryCard.jsx
import React from "react";

const DeliveryCard = ({ id, pickup, address, price, status }) => {
  return (
    <>
      <tr className="text-center border-b">
        <td>{id}</td>
        <td>{pickup}</td>
        <td>{address}</td>
        <td>{price}</td>
        <td className="text-red-500">{status}</td>
        <td></td>
      </tr>
      <tr className="border-b">
        <td colSpan="6" className="text-center py-4">
          <button className="bg-red-400 text-white px-4 py-2 rounded hover:bg-red-500">
            Accepter
          </button>
        </td>
      </tr>
    </>
  );
};

export default DeliveryCard;
