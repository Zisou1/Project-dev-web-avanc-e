// components/DeliveryTable.jsx
import React from "react";

const DeliveryTable = ({ deliveries, onAccept }) => {
  const columns = [
    { label: "ID COMMAND", key: "id" },
    { label: "RÉCUPÉRATION", key: "pickup" },
    { label: "LIVRAISON", key: "address" },
    { label: "PRIME", key: "price" },
    { label: "STATUT", key: "status" },
    { label: "Action", key: "action" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-2 border-b font-semibold text-gray-700 bg-gray-100">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {deliveries && deliveries.length > 0 ? (
            deliveries.map((delivery) => (
              <tr key={delivery.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{delivery.id}</td>
                <td className="px-4 py-2 border-b">{delivery.pickup}</td>
                <td className="px-4 py-2 border-b">{delivery.address}</td>
                <td className="px-4 py-2 border-b">{delivery.price}</td>
                <td className="px-4 py-2 border-b">{delivery.status}</td>
                <td className="px-4 py-2 border-b">
                  <button
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
                    onClick={() => onAccept && onAccept(delivery)}
                  >
                    Accepter
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center py-6 text-gray-400">
                Aucune livraison disponible.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DeliveryTable;