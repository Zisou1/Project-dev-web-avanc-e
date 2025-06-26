import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import { itemService } from "../../services/itemService";
import ErrorMessage from "../../components/ErrorMessage";
import { FaImage, FaBoxOpen, FaDollarSign, FaSortNumericUp, FaAlignLeft } from "react-icons/fa";

export default function EditItemPage() {
  const { id } = useParams();
  const [form, setForm] = useState({ name: "", price: "", quantity: "", image: null, description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchItem() {
      setLoading(true);
      setError(null);
      try {
        const data = await itemService.getAll();
        const item = data.items?.find((a) => String(a.id) === String(id));
        if (!item) throw new Error("Article introuvable");
        setForm({
          name: item.name || "",
          price: item.price || "",
          quantity: item.quantity || item.status || "",
          image: null,
          description: item.description || "",
        });
        setPreview(item.imageUrl || null);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    }
    fetchItem();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setForm((prev) => ({ ...prev, image: files[0] }));
      setPreview(files[0] ? URL.createObjectURL(files[0]) : null);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!form.image && !preview) {
      setError("L'image du produit est requise.");
      setLoading(false);
      return;
    }
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("price", form.price);
      data.append("quantity", form.quantity);
      data.append("description", form.description);
      if (form.image) {
        data.append("image", form.image);
      }
      await itemService.update(id, data);
      navigate("/restaurant/items");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Erreur lors de la modification");
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
            ) : preview ? (
              <img src={preview} alt="preview" className="h-24 object-contain mb-2" />
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
            <label className="font-semibold mb-1 flex items-center gap-2"><FaSortNumericUp className="text-gray-500" /> Quantité</label>
            <div className="relative">
              <FaSortNumericUp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="border rounded-full px-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                name="quantity"
                type="number"
                placeholder="Quantité"
                value={form.quantity}
                onChange={handleChange}
                required
              />
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
