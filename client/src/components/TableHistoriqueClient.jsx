import React, { useState } from "react";

const TableHistoriqueClient = ({ deliveries, onAction }) => {
  const [openActionId, setOpenActionId] = useState(null);

  const handleActionClick = (delivery) => {
    setOpenActionId(openActionId === delivery.id ? null : delivery.id);
  };

  const handleDeleteClick = (delivery) => {
    setOpenActionId(null);
    if (onAction) onAction(delivery);
  };

  return (
    <div>
      {/* Mobile cards */}
      <div className="block md:hidden space-y-6">
        {deliveries && deliveries.length > 0 ? (
          deliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="bg-[#f7f7f7] rounded-2xl shadow-lg p-6 mx-2 flex flex-col items-start"
            >
              <div className="mb-2 font-bold text-lg">
                <span>ID commande : </span>
                <span className="font-normal">{delivery.id}</span>
              </div>
              <div className="mb-2 font-bold">
                <span>Nom du restaurant : </span>
                <span className="font-normal">{delivery.restaurant}</span>
              </div>
              <div className="mb-2 font-bold">
                <span>Liste des articles : </span>
                <span className="font-normal block break-words">
                  {Array.isArray(delivery.articles) && delivery.articles.length > 0 ? (
                    <button className="border px-3 py-1 rounded-full text-sm font-semibold hover:bg-gray-100" onClick={() => alert(delivery.articles.join(', '))}>voir</button>
                  ) : 'Aucun'}
                </span>
              </div>
              <div className="mb-2 font-bold">
                <span>Montant total : </span>
                <span className="font-normal">{delivery.montant} DA</span>
              </div>
              <div className="mb-2 font-bold">
                <span>Statut de la livraison : </span>
                <span className={delivery.status === 'livré' ? 'text-green-500 font-normal' : 'text-red-500 font-normal'}>
                  {delivery.status === 'livré' ? 'livré' : 'pas livré'}
                </span>
              </div>
              <div className="mb-6 font-bold">
                <span>Action : </span>
                <span className="font-normal">en attente</span>
              </div>
              <button
                className="w-full bg-[#ef5350] hover:bg-[#e53935] text-white text-2xl font-semibold rounded-2xl py-4 transition-all"
                onClick={() => onAction(delivery)}
              >
                Supprimer
              </button>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8">Aucune livraison trouvée.</div>
        )}
      </div>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto max-h-[70vh] overflow-y-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b font-semibold text-gray-700 bg-gray-100 text-center">ID commande</th>
              <th className="px-4 py-2 border-b font-semibold text-gray-700 bg-gray-100 text-center">Nom du restaurant</th>
              <th className="px-4 py-2 border-b font-semibold text-gray-700 bg-gray-100 text-center">Liste des articles</th>
              <th className="px-4 py-2 border-b font-semibold text-gray-700 bg-gray-100 text-center">Montant total</th>
              <th className="px-4 py-2 border-b font-semibold text-gray-700 bg-gray-100 text-center">Statut de la livraison</th>
              <th className="px-4 py-2 border-b font-semibold text-gray-700 bg-gray-100 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {deliveries && deliveries.length > 0 ? (
              deliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50 relative">
                  <td className="px-4 py-4 border-b text-center align-middle font-normal text-lg">{delivery.id}</td>
                  <td className="px-4 py-4 border-b text-center align-middle font-normal text-lg">{delivery.restaurant}</td>
                  <td className="px-4 py-4 border-b text-center align-middle font-normal text-lg">
                    {Array.isArray(delivery.articles) && delivery.articles.length > 0 ? (
                      <button className="border px-3 py-1 rounded-full text-sm font-semibold hover:bg-gray-100" onClick={() => alert(delivery.articles.join(', '))}>voir</button>
                    ) : 'Aucun'}
                  </td>
                  <td className="px-4 py-4 border-b text-center align-middle font-normal text-lg">{delivery.montant} DA</td>
                  <td className="px-4 py-4 border-b text-center align-middle font-normal text-lg">
                    <span className={delivery.status === 'livré' ? 'text-green-500' : 'text-red-500'}>
                      {delivery.status === 'livré' ? 'livré' : 'pas livré'}
                    </span>
                  </td>
                  <td className="px-4 py-4 border-b text-center align-middle font-normal text-lg relative">
                    <button className="text-xl" onClick={() => handleActionClick(delivery)}>⋮</button>
                    {openActionId === delivery.id && (
                      <div className="absolute right-0 z-20 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg animate-fade-in-up">
                        <button
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() => handleDeleteClick(delivery)}
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-400">
                  Aucune livraison trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.25s cubic-bezier(.4,1.7,.6,.95);
        }
      `}</style>
    </div>
  );
};

export default TableHistoriqueClient;
