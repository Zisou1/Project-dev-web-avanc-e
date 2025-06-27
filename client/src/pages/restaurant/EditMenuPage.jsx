import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";
import { menuService } from "../../services/menuService";

export default function EditMenuPage() {
  const { id } = useParams();
  const [form, setForm] = useState({ name: "", price: "", status: true, image: null });
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      setError(null);
      try {
        const data = await menuService.getById(id);
        const menu = data.menu;
        setForm({
          name: menu.name || "",
          price: menu.price || "",
          status: menu.status,
          image: null,
        });
        setCurrentImageUrl(menu.imageUrl || "");
        setRestaurantId(menu.restaurant_id || "");
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Erreur lors du chargement du menu");
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, [id]);

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
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("price", form.price);
      data.append("status", form.status ? "true" : "false");
      if (form.image) data.append("image", form.image);
      if (restaurantId) data.append("restaurant_id", restaurantId);
      await menuService.update(id, data);
      navigate("/restaurant/menu");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Erreur lors de la modification du menu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff0e6] via-[#ffe3e3] to-[#fff]">
      <div className="w-full max-w-lg mx-auto bg-white/95 rounded-3xl shadow-2xl border border-[#ffd6d6] backdrop-blur-lg overflow-hidden flex flex-col items-center" style={{ boxShadow: '0 8px 32px 0 rgba(255, 92, 66, 0.12), 0 1.5px 8px 0 rgba(255, 92, 66, 0.08)', minHeight: '650px' }}>
        <div className="w-full flex flex-col items-center pt-8 pb-2 px-6 border-b border-[#ffe3e3] bg-gradient-to-r from-[#fff0e6] to-[#ffe3e3]">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ff5c42] text-center tracking-tight drop-shadow-lg">Modifier le menu</h2>
        </div>
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-5 p-6 sm:p-8 max-h-[85vh] overflow-y-auto"
        >
          <div className="flex flex-row gap-6 items-start">
            <div className="flex flex-col gap-3 flex-1">
              <label className="font-semibold text-[#ff5c42]">Nom du menu</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="border-2 border-[#ffd6d6] rounded-xl px-4 py-2 focus:outline-none focus:border-[#ff5c42] transition text-lg bg-[#fff8f6] shadow-sm"
                placeholder="Nom du menu"
              />
              <label className="font-semibold text-[#ff5c42] mt-1">Prix</label>
              <input
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                required
                className="border-2 border-[#ffd6d6] rounded-xl px-4 py-2 focus:outline-none focus:border-[#ff5c42] transition text-lg bg-[#fff8f6] shadow-sm"
                placeholder="Prix du menu"
              />
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  name="status"
                  checked={form.status}
                  onChange={handleChange}
                  className="accent-[#ff5c42] w-5 h-5 rounded focus:ring-2 focus:ring-[#ff5c42]"
                  id="status-checkbox"
                />
                <label htmlFor="status-checkbox" className="font-semibold text-[#ff5c42] cursor-pointer select-none">Disponible</label>
              </div>
              <label className="font-semibold text-[#ff5c42] mt-1">Image</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ff5c42]/10 file:text-[#ff5c42] hover:file:bg-[#ff5c42]/20 transition"
              />
            </div>
            <div className="flex flex-col items-center min-w-[120px]">
              {form.image ? (
                <img
                  src={URL.createObjectURL(form.image)}
                  alt="Aperçu de la nouvelle image"
                  className="w-28 h-28 object-cover rounded-2xl border-2 border-[#ffd6d6] shadow-lg"
                />
              ) : currentImageUrl ? (
                <img
                  src={currentImageUrl.startsWith('http') ? currentImageUrl : `${window.location.origin}${currentImageUrl}`} 
                  alt="Image actuelle du menu"
                  className="w-28 h-28 object-cover rounded-2xl border-2 border-[#ffd6d6] shadow-lg"
                  onError={e => { e.target.onerror = null; e.target.src = '/vite.svg'; }}
                />
              ) : (
                <span className="text-gray-400 text-sm flex items-center">Aucune image</span>
              )}
            </div>
          </div>
          {error && <ErrorMessage error={error} />}
          <div className="flex flex-col sm:flex-row gap-4 mt-2 justify-center">
            <Button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gradient-to-r from-[#ffe3e3] to-[#fff0e6] text-[#ff5c42] px-8 py-2 rounded-full font-bold shadow hover:from-[#ffd6d6] hover:to-[#fff0e6] border border-[#ffd6d6] transition text-lg"
            >
              Retour
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#ff5c42] to-[#ff8a65] text-white px-8 py-2 rounded-full font-bold shadow hover:from-[#ff6a5c] hover:to-[#ffb199] transition text-lg border border-[#ff5c42]"
              disabled={loading}
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
