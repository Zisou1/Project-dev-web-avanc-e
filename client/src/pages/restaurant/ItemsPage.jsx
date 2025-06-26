import { useState, useEffect, useRef } from "react";
import Button from "../../components/Button";
import SearchBar from "../../components/SearchBar";
import DataTable from "../../components/DataTable";
import { itemService } from "../../services/itemService";
import ErrorMessage from "../../components/ErrorMessage";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import FilterButton from "../../components/FilterButton";

export default function ItemsPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({});
  const filterRef = useRef();

  useEffect(() => {
    if (user && user.role === 'restaurant') {
      fetchArticles(user.id);
    }
  }, [user]);

  const fetchArticles = async (restaurantId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await itemService.getAll(restaurantId);
      if (!data.items || !Array.isArray(data.items)) {
        throw new Error("Aucun article trouvé ou format de réponse invalide");
      }
      setArticles(data.items);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Erreur inconnue";
      setError(errorMsg);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    try {
      await itemService.delete(deleteId);
      setDeleteId(null);
      if (user && user.role === 'restaurant') {
        await fetchArticles(user.id);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Erreur lors de la suppression";
      setError(errorMsg);
    }
  };

  // Filter fields config for FilterButton
  const filterFields = [
    { key: "name", label: "Nom de l'article", type: "text", placeholder: "Nom..." },
    { key: "status", label: "Quantité en stock", type: "number", placeholder: "Quantité..." },
    { key: "price", label: "Prix", type: "range", placeholderMin: "Min DA", placeholderMax: "Max DA" },
  ];

  // Filtering logic
  const filteredArticles = articles.filter((article) => {
    // Search term (from search bar)
    const matchesSearch = article.name && article.name.toLowerCase().includes(searchTerm.toLowerCase());
    // Name filter
    const matchesName = !filters.name || (article.name && article.name.toLowerCase().includes(filters.name.toLowerCase()));
    // Status/quantity filter
    const matchesStatus = !filters.status || (article.status !== undefined && String(article.status) === String(filters.status));
    // Price range filter
    const minPrice = filters.price_min ? parseFloat(filters.price_min) : null;
    const maxPrice = filters.price_max ? parseFloat(filters.price_max) : null;
    const matchesPrice = (
      (minPrice === null || article.price >= minPrice) &&
      (maxPrice === null || article.price <= maxPrice)
    );
    return matchesSearch && matchesName && matchesStatus && matchesPrice;
  });

  // Table columns config (French labels)
  const columns = [
    { key: "id", label: "ID Article" },
    { key: "name", label: "Nom de l'article" },
    { key: "description", label: "Description" },
    { key: "price", label: "Prix" },
  ];

  // Table actions: show only a menu icon for now (like screenshot)
  const tableActions = () => (
    <button className="text-2xl text-gray-700 hover:text-gray-900 px-2 py-1 rounded transition bg-transparent shadow-none border-none" title="Plus d'actions">
      <span className="material-icons">more_vert</span>
    </button>
  );

  // Close filter popup when clicking outside
  useEffect(() => {
    if (!showFilter) return;
    function handleClick(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showFilter]);

  // Responsive card view for mobile
  const ArticleCard = ({ article, onDelete, onEdit }) => (
    <div className="bg-[#f8f8f8] border-2 border-blue-400 rounded-2xl shadow-md p-4 mb-6 flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-1">
        <div className="flex gap-2"><span className="font-bold">ID Article :</span> <span>{article.id}</span></div>
        <div className="font-bold">Nom de l'article : <span className="font-normal">{article.name}</span></div>
        <div className="font-bold">Description : <span className="font-normal">{article.description}</span></div>
        <div className="font-bold">Prix :<span className="font-normal">{article.price} DA</span></div>
      </div>
      <div className="flex flex-col xs:flex-row gap-3 mt-2 w-full">
        <Button onClick={() => onDelete(article.id)} className="bg-[#ff5c5c] hover:bg-[#ff7e7e] text-white font-bold flex-1 flex items-center justify-center gap-2 text-base shadow-md">
          <span className="material-icons">delete</span> Supprimer
        </Button>
        <Button onClick={() => onEdit && onEdit(article.id)} className="bg-[#ff5c5c] hover:bg-[#ff7e7e] text-white font-bold flex-1 flex items-center justify-center gap-2 text-base shadow-md">
          <span className="material-icons">edit</span> Modifier
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white py-10 px-2 sm:px-8 relative z-10">
      <div className="max-w-[95vw] xl:max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-6">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-0">mes articles</h2>
          <Link to="/restaurant/items/add" className="w-full sm:w-auto">
            <Button className="bg-[#ff5c5c] hover:bg-[#ff7e7e] text-white font-bold px-8 sm:px-14 py-4 sm:py-6 rounded-2xl shadow-md transition text-lg sm:text-2xl w-full">
              + Ajouter articles
            </Button>
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 w-full relative">
          <FilterButton fields={filterFields} onApply={setFilters} />
          <div className="flex-1 w-full">
            <SearchBar query={searchTerm} setQuery={setSearchTerm} placeholder="search" />
          </div>
        </div>
        <hr className="border-gray-300 mb-2" />
        {loading && (
          <div className="text-center py-8 text-gray-700 text-lg z-10">
            Chargement...
          </div>
        )}
        {error && <ErrorMessage error={error} />}
        {/* Responsive: show cards on mobile, table on desktop */}
        <div className="block sm:hidden">
          {filteredArticles.length === 0 && !loading ? (
            <div className="bg-[#f8f8f8] border-2 border-blue-400 rounded-2xl shadow-md p-4 mb-6 flex flex-col gap-4 w-full min-h-[120px] justify-center items-center">
              <span className="text-gray-400 text-lg">Aucun article</span>
            </div>
          ) : (
            filteredArticles.map(article => (
              <ArticleCard key={article.id} article={article} onDelete={handleDelete} onEdit={() => {}} />
            ))
          )}
        </div>
        <div className="hidden sm:block">
          <DataTable columns={columns} data={filteredArticles} actions={tableActions} />
        </div>
      </div>
      {deleteId && (
        <DeleteConfirmPage id={deleteId} onClose={() => setDeleteId(null)} onDeleted={handleConfirmDelete} />
      )}
    </div>
  );
}

function DeleteConfirmPage({ id, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await onDeleted();
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Erreur lors de la suppression";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white p-8 rounded-xl shadow-xl min-w-[350px] flex flex-col gap-4">
        <h3 className="text-lg font-semibold mb-2 text-center">Confirmer la suppression</h3>
        <p className="text-center">Voulez-vous vraiment supprimer cet article ?</p>
        {error && <ErrorMessage error={error} />}
        <div className="flex gap-2 mt-4">
          <Button onClick={handleDelete} className="bg-red-500 text-white flex-1" disabled={loading}>
            {loading ? 'Suppression...' : 'Supprimer'}
          </Button>
          <Button onClick={onClose} className="bg-gray-300 text-gray-800 flex-1" disabled={loading}>
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
}