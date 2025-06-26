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

  // Card view for mobile
  const renderMobileCards = () => (
    <div className="flex flex-col gap-6 md:hidden">
      {deliveries && deliveries.length > 0 ? (
        deliveries.map((delivery) => (
          <div key={delivery.id} className="bg-white rounded-2xl shadow p-6 flex flex-col gap-3">
            <div className="font-semibold">ID commande : <span className="font-normal">{delivery.id}</span></div>
            <div className="font-semibold">Adresse de récupération : <span className="font-normal">{delivery.pickup}</span></div>
            <div className="font-semibold">Adresse de livraison : <span className="font-normal">{delivery.address}</span></div>
            <div className="font-semibold">prime : <span className="font-normal">{delivery.price}</span></div>
            <div className="font-semibold">Statut de la commande : <span className="font-normal">{delivery.status}</span></div>
            <button
              className="mt-4 w-full bg-[#FF4D4F] text-white py-3 px-8 rounded shadow hover:bg-[#e04345] transition font-semibold text-lg"
              onClick={() => onAccept && onAccept(delivery)}
            >
              Accepter
            </button>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-400">
          Aucune livraison disponible.
        </div>
      )}
    </div>
  );

  // Table view for desktop
  const renderDesktopTable = () => (
    <div className="overflow-x-auto hidden md:block">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
        <thead>
          <tr>
            {columns.slice(0, -1).map((col) => (
              <th key={col.key} className="px-4 py-2 border-b font-semibold text-gray-700 bg-gray-100">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {deliveries && deliveries.length > 0 ? (
            deliveries.map((delivery) => (
              <React.Fragment key={delivery.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{delivery.id}</td>
                  <td className="px-4 py-2 border-b">{delivery.pickup}</td>
                  <td className="px-4 py-2 border-b">{delivery.address}</td>
                  <td className="px-4 py-2 border-b font-bold">{delivery.price}</td>
                  <td className="px-4 py-2 border-b">{delivery.status}</td>
                </tr>
                <tr>
                  <td colSpan={columns.length - 1} className="py-4">
                    <div className="flex justify-center">
                      <button
                        className="mt-2 px-8 py-3 bg-[#FF4D4F] text-white rounded shadow hover:bg-[#e04345] transition font-semibold text-lg"
                        onClick={() => onAccept && onAccept(delivery)}
                      >
                        Accepter
                      </button>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length - 1} className="text-center py-6 text-gray-400">
                Aucune livraison disponible.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      {renderMobileCards()}
      {renderDesktopTable()}
    </>
  );
};

export default DeliveryTable;