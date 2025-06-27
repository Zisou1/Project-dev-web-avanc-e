import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";
import { menuService } from "../../services/menuService";
import { itemService } from "../../services/itemService";

export default function AddItemsToMenuPage() {
  const { id } = useParams(); // menu id
  const [menu, setMenu] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const menuData = await menuService.getById(id);
        setMenu(menuData.menu);
        const itemsData = await itemService.getAll();
        setItems(itemsData.items || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleSelect = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // You need to implement menuService.addItems(menuId, itemIds)
      await menuService.addItems(id, selectedItems);
      navigate("/restaurant/menu");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Erreur lors de l'ajout des articles au menu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-12 p-10 bg-white rounded-3xl shadow-2xl flex flex-col gap-10 border border-[#ffe3e3]">
      <h2 className="text-2xl font-extrabold text-[#ff5c42] mb-2 text-center tracking-tight">Ajouter des articles au menu</h2>
      {menu && <div className="mb-4">Menu: <b>{menu.name}</b></div>}
      {error && <ErrorMessage error={error} />}
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <label key={item.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={() => handleSelect(item.id)}
            />
            {item.name}
          </label>
        ))}
      </div>
      <div className="flex gap-4 mt-4">
        <Button type="button" onClick={() => navigate(-1)} className="bg-gray-200 text-gray-800 px-8 py-2 rounded-full font-semibold shadow hover:bg-gray-300 transition">Retour</Button>
        <Button type="submit" className="bg-[#ff5c42] text-white px-8 py-2 rounded-full font-semibold shadow hover:bg-[#ff6a5c] transition" disabled={loading}>{loading ? "Ajout..." : "Ajouter au menu"}</Button>
      </div>
    </form>
  );
}
