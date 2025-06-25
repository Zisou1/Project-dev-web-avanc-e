import React from "react";
import Sidebar from "../../components/Sidebar";
import SearchBar from "../../components/SearchBar";

const LivreurPage = () => {
  const deliveries = [
    {
      id: 1,
      pickup: "padre alger restaurant",
      address: "Q34G, Rte des quatre canons, alger centre",
      price: "400 DA",
      status: "en attente",
    },
    {
      id: 2,
      pickup: "padre alger restaurant",
      address: "H9FR, nador, algérie",
      price: "650 DA",
      status: "disponible",
    },
    {
      id: 3,
      pickup: "wonder food bab ezouar",
      address: "Q857F h'raoua, algérie",
      price: "550 DA",
      status: "disponible",
    },
  ];

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 flex-1 bg-white min-h-screen">
        <header className="flex justify-between items-center border-b h-24 px-8">
          <div></div>
          <div className="flex items-center space-x-3">
            <div className="h-14 w-14 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="material-icons text-4xl text-gray-400">
                account_circle
              </span>
            </div>
            <div>
              <p className="text-gray-900 font-semibold text-lg">Ramy test</p>
              <p className="text-gray-500 text-base">livreur</p>
            </div>
          </div>
        </header>
        <div className="px-12 pt-8">
          <h1 className="text-xl font-bold mb-4">livraisons disponibles</h1>
          <div className="flex items-center mb-4">
            <SearchBar />
          </div>
          <table className="w-full border-t border-b">
            <thead>
              <tr className="text-center text-gray-700 text-base font-medium">
                <th className="py-2">ID commande</th>
                <th>adresse de récupération</th>
                <th>Adresse de livraison</th>
                <th>prime</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => (
                <tr
                  key={delivery.id}
                  className="text-center text-gray-800 text-base h-24"
                >
                  <td>{delivery.id}</td>
                  <td>{delivery.pickup}</td>
                  <td>{delivery.address}</td>
                  <td className="font-semibold">{delivery.price}</td>
                  <td>{delivery.status}</td>
                  <td>
                    <button className="bg-[#FF5A5F] hover:bg-[#ff7a7f] text-white px-10 py-2 rounded-lg text-lg font-medium shadow-md">
                      Accepter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default LivreurPage;