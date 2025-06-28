import React, { useState, useEffect } from "react";
import { orderService } from "../../services/orderService";

export default function Commandes() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [showArticles, setShowArticles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError(null);
      try {
        // Fetch all orders using /orders/getAll
        const response = await orderService.getAllOrders();
        setOrders(response.orders || []);
        console.log('Orders set in state:', response.orders || []);
      } catch (err) {
        setError("Erreur lors du chargement des commandes.");
        console.error("Error in fetchOrders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const filtered = orders.filter(
    (cmd) =>
      (cmd.address?.toLowerCase().includes(search.toLowerCase()) || "")
  );

  return (
    <div className="min-h-screen bg-white p-6">
      <h2 className="text-2xl font-bold mb-4">livraisons disponibles</h2>
      <div className="flex items-center gap-3 mb-4">
        <button className="p-2 rounded-full border border-gray-300 bg-white hover:bg-gray-100">
          {/* Filter icon SVG */}
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 5h18M6 8v6a2 2 0 002 2h8a2 2 0 002-2V8" />
            <circle cx="12" cy="17" r="2" />
          </svg>
        </button>
        <input
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff5c5c]"
          placeholder="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-center border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-3 font-medium">ID commande</th>
                <th className="py-2 px-3 font-medium">adresse de récupération</th>
                <th className="py-2 px-3 font-medium">Adresse de livraison</th>
                <th className="py-2 px-3 font-medium">prime</th>
                <th className="py-2 px-3 font-medium">Liste des articles</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(cmd => (
                <tr key={cmd.id} className="border-b">
                  <td className="py-4">{cmd.id}</td>
                  <td className="py-4">{cmd.address}</td>
                  <td className="py-4">{cmd.address}</td>
                  <td className="py-4 font-semibold">{cmd.prime || cmd.price || "-"}</td>
                  <td className="py-4">
                    <button
                      className="border border-[#ff5c5c] rounded-full px-4 py-1 text-[#222] hover:bg-[#ffedea]"
                      onClick={() => setShowArticles(cmd.id)}
                    >
                      voir
                    </button>
                    {showArticles === cmd.id && (
                      <div className="absolute bg-white border rounded shadow p-3 mt-2 z-50">
                        <div className="font-semibold mb-2">Articles:</div>
                        <ul className="text-left text-sm">
                          {(cmd.articles || []).map((a, i) => (
                            <li key={i}>- {a.name || a}</li>
                          ))}
                        </ul>
                        <button className="mt-2 text-xs text-[#ff5c5c] underline" onClick={() => setShowArticles(null)}>Fermer</button>
                      </div>
                    )}
                  </td>
                  <td className="py-4">
                    <button className="bg-[#ff5c5c] hover:bg-[#ff7e7e] text-white font-bold px-12 py-3 rounded-lg text-lg shadow transition">
                      Accepter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
