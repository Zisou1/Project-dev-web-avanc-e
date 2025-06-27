import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";
import { menuService } from "../../services/menuService";
import { itemService } from "../../services/itemService";

export default function AddMenuPage() {
  const [form, setForm] = useState({ name: "", price: "", status: true, image: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    if (type === "file") {
      setForm((prev) => ({ ...prev, image: files[0] }));
    } else if (type === "checkbox" && name === "status") {
      setForm((prev) => ({ ...prev, status: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!form.name || form.name.length < 2) {
      setError("Le nom du menu est requis.");
      setLoading(false);
      return;
    }
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) {
      setError("Le prix doit être un nombre positif.");
      setLoading(false);
      return;
    }
    if (!form.image) {
      setError("L'image du menu est requise.");
      setLoading(false);
      return;
    }
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("price", form.price);
      data.append("status", form.status ? "true" : "false");
      data.append("image", form.image);
      // Get restaurant_id from itemService logic
      const user = itemService.getUserFromToken();
      if (user?.id) {
        const restaurantId = await itemService.getRestaurantIdByUserId(user.id);
        if (restaurantId) {
          data.append("restaurant_id", restaurantId);
        } else {
          setError("Aucun restaurant trouvé pour cet utilisateur.");
          setLoading(false);
          return;
        }
      } else {
        setError("Utilisateur non authentifié.");
        setLoading(false);
        return;
      }
      await menuService.create(data);
      navigate("/restaurant/menu");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Erreur lors de l'ajout du menu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-12 p-10 bg-white rounded-3xl shadow-2xl flex flex-col gap-10 border border-[#ffe3e3]">
      <h2 className="text-2xl font-extrabold text-[#ff5c42] mb-2 text-center tracking-tight">Ajouter un menu</h2>
      <div className="flex flex-col gap-4">
        <label>Nom du menu</label>
        <input name="name" value={form.name} onChange={handleChange} required className="border rounded px-3 py-2" />
        <label>Prix</label>
        <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required className="border rounded px-3 py-2" />
        <label>Disponible</label>
        <input type="checkbox" name="status" checked={form.status} onChange={handleChange} />
        <label>Image</label>
        <input type="file" name="image" accept="image/*" onChange={handleChange} required />
      </div>
      {error && <ErrorMessage error={error} />}
      <div className="flex gap-4 mt-4">
        <Button type="button" onClick={() => navigate(-1)} className="bg-gray-200 text-gray-800 px-8 py-2 rounded-full font-semibold shadow hover:bg-gray-300 transition">Retour</Button>
        <Button type="submit" className="bg-[#ff5c42] text-white px-8 py-2 rounded-full font-semibold shadow hover:bg-[#ff6a5c] transition" disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer"}</Button>
      </div>
    </form>
  );
}
