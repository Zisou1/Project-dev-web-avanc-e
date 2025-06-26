import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import { itemService } from "../../services/itemService";
import ErrorMessage from "../../components/ErrorMessage";
import { FaImage, FaBoxOpen, FaDollarSign, FaSortNumericUp, FaAlignLeft } from "react-icons/fa";

export default function AddItemPage() {
  const [form, setForm] = useState({ name: "", price: "", status: true, image: null, description: "" });
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
    // Frontend validation
    if (!form.name || form.name.length < 2 || form.name.length > 100) {
      setError("Le nom doit comporter entre 2 et 100 caractères.");
      setLoading(false);
      return;
    }
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) {
      setError("Le prix doit être un nombre positif.");
      setLoading(false);
      return;
    }
    if (typeof form.status !== 'boolean' && typeof form.status !== 'string') {
      setError("Le statut est requis.");
      setLoading(false);
      return;
    }
    if (!form.image) {
      setError("L'image du produit est requise.");
      setLoading(false);
      return;
    }
    try {
      // Debug: check image type and value
      console.log('Image to upload:', form.image, 'Type:', form.image && form.image.constructor && form.image.constructor.name);
      const data = new FormData();
      data.append("name", form.name);
      data.append("price", parseInt(form.price, 10));
      data.append("status", form.status ? "true" : "false");
      data.append("image", form.image); // always append image, required by backend
      // Attach restaurant_id from user in localStorage if available
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.id) {
          data.append('restaurant_id', user.id);
        }
      } catch (e) {}
      // Debug: log FormData keys and values
      for (let pair of data.entries()) {
        console.log(pair[0]+ ':', pair[1]);
      }
      await itemService.create(data);
      navigate("/restaurant/items");
    } catch (err) {
      // Show backend Joi validation error if present
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
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="font-semibold mb-1 flex items-center gap-2"><FaImage className="text-gray-500" /> Image de produit</label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition">
            {form.image ? (
              <img src={URL.createObjectURL(form.image)} alt="preview" className="h-24 object-contain mb-2" />
            ) : (
              <FaImage className="text-4xl text-gray-300 mb-2" />
            )}
            <span className="text-sm text-gray-600 mb-1">{form.image ? form.image.name : "Upload a file"}</span>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
          </label>
        </div>
        <div className="flex flex-col gap-4 justify-between">
          <div className="flex flex-col gap-2">
            <label className="font-semibold mb-1 flex items-center gap-2"><FaBoxOpen className="text-gray-500" /> Nom de produit</label>
            <div className="relative">
              <FaBoxOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="border rounded-full px-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                name="name"
                placeholder="Nom"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold mb-1 flex items-center gap-2"><FaDollarSign className="text-gray-500" /> Prix de produit</label>
            <div className="relative">
              <FaDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="border rounded-full px-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                name="price"
                type="number"
                placeholder="Prix"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold mb-1 flex items-center gap-2"><FaSortNumericUp className="text-gray-500" /> Disponible</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="status"
                checked={form.status}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">En stock</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-semibold mb-1 flex items-center gap-2"><FaAlignLeft className="text-gray-500" /> Description de produit</label>
        <div className="relative">
          <textarea
            className="border rounded px-4 py-3 min-h-[100px] w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
            name="description"
            placeholder="description ...."
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
