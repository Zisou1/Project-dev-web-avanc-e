import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import { itemService } from "../../services/itemService";
import ErrorMessage from "../../components/ErrorMessage";
import { FaImage, FaBoxOpen, FaDollarSign, FaSortNumericUp, FaAlignLeft } from "react-icons/fa";

export default function AddItemPage() {
  const [form, setForm] = useState({ name: "", price: "", status: 1, image: null, description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    if (type === "file") {
      setForm((prev) => ({ ...prev, image: files[0] }));
    } else if (name === "status") {
      // Only allow non-negative integers
      const val = checked ? 1 : 0;
      setForm((prev) => ({ ...prev, status: val }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Frontend validation
    if (!form.name || form.name.length < 2 || form.name.length > 100) {
      setError("Le nom doit comporter entre 2 et 100 caractères.");
      setLoading(false);
      return;
    }
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) {
      setError("Le prix doit être un nombre positif.");
      setLoading(false);
      return;
    }
    if (form.status === "" || isNaN(form.status) || Number(form.status) < 0) {
      setError("La quantité doit être un nombre entier positif ou nul.");
      setLoading(false);
      return;
    }
    if (!form.image) {
      setError("L'image du produit est requise.");
      setLoading(false);
      return;
    }
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("price", parseInt(form.price, 10));
      data.append("status", parseInt(form.status, 10));
      data.append("image", form.image);
      if (form.description) {
        data.append("description", form.description);
      }
      await itemService.create(data);
      navigate("/restaurant/items");
    } catch (err) {
      if (err.response?.data?.error === 'Validation Error') {
        setError(err.response.data.message);
      } else {
        setError(err.response?.data?.message || err.message || "Erreur lors de l'ajout");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-12 p-10 bg-white rounded-3xl shadow-2xl flex flex-col gap-10 border border-[#ffe3e3]">
      <h2 className="text-2xl font-extrabold text-[#ff5c42] mb-2 text-center tracking-tight">Ajouter un nouvel article</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-3">
          <label className="font-semibold mb-1 flex items-center gap-2 text-[#ff5c42]"><FaImage className="text-[#ffb3a7] text-xl" /> Image de produit</label>
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
            />
          </label>
        </div>
        <div className="flex flex-col gap-6 justify-between">
          <div className="flex flex-col gap-2">
            <label className="font-semibold mb-1 flex items-center gap-2 text-[#ff5c42]"><FaBoxOpen className="text-[#ffb3a7] text-lg" /> Nom de produit</label>
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
            <label className="font-semibold mb-1 flex items-center gap-2 text-[#ff5c42]"><FaDollarSign className="text-[#ffb3a7] text-lg" /> Prix de produit</label>
            <div className="relative">
              <FaDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ffb3a7] text-lg" />
              <input
                className="border border-[#ffd6d6] rounded-full px-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#ffb3a7] bg-[#fff7f0] placeholder:text-gray-400"
                name="price"
                type="number"
                min="0"
                placeholder="Prix"
                value={form.price}
                onChange={handleChange}
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
      <div className="flex flex-col gap-2">
        <label className="font-semibold mb-1 flex items-center gap-2 text-[#ff5c42]"><FaAlignLeft className="text-[#ffb3a7] text-lg" /> Description de produit</label>
        <div className="relative">
          <textarea
            className="border border-[#ffd6d6] rounded-xl px-4 py-3 min-h-[100px] w-full focus:outline-none focus:ring-2 focus:ring-[#ffb3a7] bg-[#fff7f0] placeholder:text-gray-400"
            name="description"
            placeholder="Description ..."
            value={form.description}
            onChange={handleChange}
          />
        </div>
      </div>
      {error && <ErrorMessage error={error} />}
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
