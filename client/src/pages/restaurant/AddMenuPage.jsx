import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";
import { menuService } from "../../services/menuService";
import { itemService } from "../../services/itemService";
import { FaImage, FaBoxOpen, FaDollarSign, FaSortNumericUp } from "react-icons/fa";

export default function AddMenuPage() {
  const [form, setForm] = useState({ name: "", price: "", status: true, image: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    if (type === "file") {
      setForm((prev) => ({ ...prev, image: files[0] }));
      setPreview(files[0] ? URL.createObjectURL(files[0]) : null);
    } else if (type === "checkbox" && name === "status") {
      setForm((prev) => ({ ...prev, status: checked }));
    } else if (name === "price") {
      // Only allow non-negative numbers
      const val = value.replace(/[^\d.]/g, "");
      setForm((prev) => ({ ...prev, price: val }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Collect all validation errors
    const errors = [];
    if (!form.name || form.name.length < 2) {
      errors.push("Le nom du menu est requis et doit comporter au moins 2 caractères pour permettre une identification claire du menu.");
    }
    if (!form.price || isNaN(form.price)) {
      errors.push("Le prix du menu est requis et doit être un nombre.");
    } else if (Number(form.price) < 10) {
      errors.push("Le prix du menu ne peut pas être inférieur à 10. Veuillez entrer un prix d'au moins 10 pour garantir la viabilité du menu.");
    }
    if (!form.image) {
      errors.push("L'image du menu est requise afin de permettre aux clients de visualiser le menu.");
    }
    if (errors.length > 0) {
      setError(errors);
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
          setError(["Aucun restaurant trouvé pour cet utilisateur."]);
          setLoading(false);
          return;
        }
      } else {
        setError(["Utilisateur non authentifié."]);
        setLoading(false);
        return;
      }
      await menuService.create(data);
      navigate("/restaurant/menu");
    } catch (err) {
      setError([err.response?.data?.message || err.message || "Erreur lors de l'ajout du menu"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-12 p-10 bg-white rounded-3xl shadow-2xl flex flex-col gap-10 border border-[#ffe3e3]">
      <h2 className="text-2xl font-extrabold text-[#ff5c42] mb-2 text-center tracking-tight">Ajouter un menu</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-3">
          <label className="font-semibold mb-1 flex items-center gap-2 text-[#ff5c42]"><FaImage className="text-[#ffb3a7] text-xl" /> Image du menu</label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#ffb3a7] rounded-xl p-6 cursor-pointer hover:border-[#ff5c42] transition group min-h-[180px]">
            {form.image ? (
              <img src={URL.createObjectURL(form.image)} alt="preview" className="h-28 object-contain mb-2 rounded-lg shadow" />
            ) : (
              <FaImage className="text-5xl text-[#ffd6d6] mb-2 group-hover:text-[#ffb3a7] transition" />
            )}
            <span className="text-sm text-gray-600 mb-1">{form.image ? form.image.name : "Choisir une image"}</span>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
              required
            />
          </label>
        </div>
        <div className="flex flex-col gap-6 justify-between">
          <div className="flex flex-col gap-2">
            <label className="font-semibold mb-1 flex items-center gap-2 text-[#ff5c42]"><FaBoxOpen className="text-[#ffb3a7] text-lg" /> Nom du menu</label>
            <div className="relative">
              <FaBoxOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ffb3a7] text-lg" />
              <input
                className="border border-[#ffd6d6] rounded-full px-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#ffb3a7] bg-[#fff7f0] placeholder:text-gray-400"
                name="name"
                placeholder="Nom"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold mb-1 flex items-center gap-2 text-[#ff5c42]"><FaDollarSign className="text-[#ffb3a7] text-lg" /> Prix du menu</label>
            <div className="relative">
              <FaDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ffb3a7] text-lg" />
              <input
                className="border border-[#ffd6d6] rounded-full px-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#ffb3a7] bg-[#fff7f0] placeholder:text-gray-400"
                name="price"
                type="number"
                min="0"
                step="any"
                placeholder="Prix"
                value={form.price}
                onChange={handleChange}
                onKeyDown={e => {
                  if (e.key === "-" || e.key === "e") e.preventDefault();
                }}
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold mb-1 flex items-center gap-2 text-[#ff5c42]"><FaSortNumericUp className="text-[#ffb3a7] text-lg" /> Disponible</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="status"
                checked={!!form.status}
                onChange={handleChange}
                className="h-5 w-5 text-[#ff5c42] border-[#ffd6d6] rounded focus:ring-[#ffb3a7]"
              />
              <span className="text-gray-700">En stock</span>
            </div>
          </div>
        </div>
      </div>
      {Array.isArray(error) && error.length > 0 && (
        <div className="mb-2">
          <ul className="text-red-500 text-sm font-semibold list-disc pl-5">
            {error.map((err, idx) => <li key={idx}>{err}</li>)}
          </ul>
        </div>
      )}
      {typeof error === 'string' && <ErrorMessage error={error} />}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
        <Button
          type="button"
          className="bg-gray-200 text-gray-800 px-8 py-2 rounded-full font-semibold shadow hover:bg-gray-300 transition"
          onClick={() => navigate(-1)}
        >
          Retour
        </Button>
        <Button type="submit" className="bg-[#ff5c42] text-white px-16 py-3 rounded-full text-lg font-semibold shadow-md hover:bg-[#ff6a5c] transition" disabled={loading}>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
