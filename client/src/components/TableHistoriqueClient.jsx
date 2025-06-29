import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faStore, 
  faReceipt,
  faCheckCircle,
  faCoins,
  faCalendarDays
} from "@fortawesome/free-solid-svg-icons";
import "../styles/animations.css";

const TableHistoriqueClient = ({ deliveries }) => {
  // Status mapping function to convert English backend statuses to French display labels
  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': 'En attente',
      'confirmed': 'Confirmé',
      'waiting for pickup': 'En attente de récupération',
      'product pickedup': 'Produit récupéré',
      'confirmed by delivery': 'Confirmé par le livreur',
      'confirmed by client': 'Confirmé par le client',
      'completed': 'Livré',
      'cancelled': 'Annulé'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="p-6">
      {/* Mobile cards */}
      <div className="block md:hidden space-y-6">
        {deliveries && deliveries.length > 0 ? (
          deliveries.map((delivery, index) => (
            <div
              key={delivery.id}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden card-hover animate-slide-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faReceipt} className="text-xl" />
                    <div>
                      <h3 className="font-bold text-lg">Commande #{index + 1}</h3>
                      <p className="text-orange-100 text-sm">
                        {new Date(delivery.created_at || Date.now()).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full text-sm font-semibold bg-green-500 text-white">
                    <FontAwesomeIcon 
                      icon={faCheckCircle} 
                      className="mr-1" 
                    />
                    {getStatusDisplay(delivery.status)}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faStore} className="text-orange-500 text-lg" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Restaurant</p>
                    <p className="font-semibold text-gray-900">{delivery.restaurant?.name || 'N/A'}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FontAwesomeIcon icon={faReceipt} className="text-gray-600" />
                    <p className="font-medium text-gray-700">Articles commandés</p>
                  </div>
                  <div className="space-y-2">
                    {Array.isArray(delivery.items) && delivery.items.length > 0
                      ? delivery.items.map((item, idx) => (
                          <div key={item.id || idx} className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                            <span className="text-gray-800">{item.name}</span>
                            {item.price && <span className="font-semibold text-orange-600">{item.price} DA</span>}
                          </div>
                        ))
                      : <p className="text-gray-500 italic">Aucun article</p>
                    }
                  </div>
                </div>

                <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCoins} className="text-green-600 text-lg" />
                    <span className="font-medium text-green-800">Total</span>
                  </div>
                  <span className="text-2xl font-bold text-green-700">
                    {delivery.total_price || delivery.montant} DA
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <FontAwesomeIcon icon={faCalendarDays} className="text-6xl text-gray-300 mb-4" />
            <p className="text-xl text-gray-500">Aucune commande trouvée</p>
          </div>
        )}
      </div>
      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="min-w-full bg-white">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <th className="px-6 py-4 text-left font-bold text-gray-700 text-sm uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faReceipt} className="text-orange-500" />
                    Commande
                  </div>
                </th>
                <th className="px-6 py-4 text-left font-bold text-gray-700 text-sm uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faStore} className="text-orange-500" />
                    Restaurant
                  </div>
                </th>
                <th className="px-6 py-4 text-left font-bold text-gray-700 text-sm uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faReceipt} className="text-orange-500" />
                    Articles
                  </div>
                </th>
                <th className="px-6 py-4 text-left font-bold text-gray-700 text-sm uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCoins} className="text-orange-500" />
                    Total
                  </div>
                </th>
                <th className="px-6 py-4 text-left font-bold text-gray-700 text-sm uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-orange-500" />
                    Date
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deliveries && deliveries.length > 0 ? (
                deliveries.map((delivery, index) => (
                  <tr 
                    key={delivery.id} 
                    className={`hover:bg-gray-50 transition-all duration-200 table-row-enter ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Commande #{index + 1}</div>
                          <div className="text-sm text-gray-500">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                              {getStatusDisplay(delivery.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faStore} className="text-gray-400" />
                        <div className="text-sm font-medium text-gray-900">
                          {delivery.restaurant?.name || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {Array.isArray(delivery.items) && delivery.items.length > 0 ? (
                          <div className="space-y-1">
                            {delivery.items.slice(0, 2).map((item, idx) => (
                              <div key={item.id || idx} className="flex justify-between items-center bg-gray-100 rounded-lg px-3 py-1">
                                <span className="text-sm text-gray-700 truncate">{item.name}</span>
                                {item.price && (
                                  <span className="text-sm font-semibold text-orange-600 ml-2">
                                    {item.price} DA
                                  </span>
                                )}
                              </div>
                            ))}
                            {delivery.items.length > 2 && (
                              <div className="text-xs text-gray-500 text-center py-1">
                                +{delivery.items.length - 2} autres articles
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 italic">Aucun article</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCoins} className="text-green-500" />
                        <span className="text-lg font-bold text-green-600">
                          {delivery.total_price || delivery.montant} DA
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {new Date(delivery.created_at || Date.now()).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(delivery.created_at || Date.now()).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <FontAwesomeIcon icon={faCalendarDays} className="text-6xl text-gray-300 mb-4" />
                    <p className="text-xl text-gray-500">Aucune commande trouvée</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableHistoriqueClient;