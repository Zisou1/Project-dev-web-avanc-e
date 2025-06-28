import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import SearchBar from "../../components/SearchBar";
import DataTable from "../../components/DataTable";
import { itemService } from "../../services/itemService";
import ErrorMessage from "../../components/ErrorMessage";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import FilterButton from "../../components/FilterButton";

export default function ItemsPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({});
  const filterRef = useRef();
  const navigate = useNavigate();

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get the restaurant ID for the current user
      const restaurantId = await itemService.getRestaurantIdByUserId(user.id);
      
      if (!restaurantId) {
        throw new Error("Restaurant non trouvé pour cet utilisateur");
      }

      // Get items for this specific restaurant
      const data = await itemService.getRestaurantItems(restaurantId);
      console.log('📦 Restaurant items data:', data);
      
      // Handle both possible response formats
      const items = data.items || data.item || [];
      if (!Array.isArray(items)) {
        throw new Error("Format de réponse invalide");
      }
      
      setArticles(items);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Erreur inconnue";
      setError(errorMsg);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'restaurant') {
      fetchArticles();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      await itemService.delete(deleteId);
      setShowDeleteModal(false);
      setDeleteId(null);
      if (user && user.role === 'restaurant') {
        await fetchArticles();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Erreur lors de la suppression";
      setError(errorMsg);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
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

  // Format articles for display with properly formatted dates
  const formattedArticles = filteredArticles.map(article => ({
    ...article,
    createdAt: article.createdAt ? new Date(article.createdAt).toLocaleDateString('fr-FR') : 'N/A'
  }));

  // Table columns config (French labels)
  const columns = [
    { key: "id", label: "ID Article" },
    { key: "name", label: "Nom de l'article" },
    { key: "description", label: "Description" },
    { key: "price", label: "Prix" },
    { key: "createdAt", label: "Date de création" },
  ];

  // Actions dropdown for each article row
  function ArticleActions({ article, onDelete, onEdit }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef();

    useEffect(() => {
      if (!open) return;
      function handleClick(e) {
        if (menuRef.current && !menuRef.current.contains(e.target)) {
          setOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    return (
      <div className="relative" ref={menuRef}>
        <button
          className="text-lg text-gray-700 hover:text-gray-900 px-1 py-0.5 rounded transition bg-transparent shadow-none border-none"
          title="Plus d'actions"
          style={{ minWidth: 0, width: '28px', height: '28px' }}
          onClick={() => setOpen((v) => !v)}
        >
          {/* Three dots icon SVG */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="5" r="2" fill="currentColor"/>
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
            <circle cx="12" cy="19" r="2" fill="currentColor"/>
          </svg>
        </button>
        {open && (
          <div className="fixed left-0 top-0 w-full h-full z-40" style={{pointerEvents: 'none'}}></div>
        )}
        {open && (
          <div className="fixed z-50" style={{top: `${menuRef.current?.getBoundingClientRect().bottom + window.scrollY}px`, left: `${menuRef.current?.getBoundingClientRect().left + window.scrollX}px`, minWidth: '7rem', fontSize: '0.95rem'}}>
            <div className="bg-white border border-gray-200 rounded shadow-lg flex flex-col">
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-blue-700 text-left font-medium transition"
                style={{ fontSize: '0.97rem', minHeight: '32px', borderBottom: '1px solid #e5e7eb' }}
                onClick={() => {
                  setOpen(false);
                  if (onEdit) onEdit(article.id);
                }}
              >
                {/* Edit icon (pencil) */}
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16.862 3.487a2.25 2.25 0 0 1 3.182 3.182l-9.75 9.75-4.243 1.06 1.06-4.243 9.75-9.75Z"/><path d="M19.5 6.75 17.25 4.5"/></svg>
                Modifier
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-700 text-left font-medium transition"
                style={{ fontSize: '0.97rem', minHeight: '32px' }}
                onClick={() => {
                  setOpen(false);
                  if (onDelete) onDelete(article.id);
                }}
              >
                {/* Delete icon (trash) */}
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m5 6v6m4-6v6"/></svg>
                Supprimer
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Table actions: use ArticleActions component
  const tableActions = (article) => (
    <ArticleActions article={article} onDelete={handleDelete} onEdit={(id) => navigate(`/restaurant/items/edit/${id}`)} />
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

  return (
    <div className="min-h-screen py-8 px-2 sm:px-4 relative  text-[0.97rem]">
      <div className="full-width mx-auto bg-white rounded-2xl  p-6 sm:p-10 border border-[#ffe3e3]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-extrabold text-[#ff5c5c] tracking-tight mb-0 flex items-center gap-2">
            <span className="inline-block bg-[#ffedea] rounded-full px-3 py-1 text-[#ff5c5c] text-base font-semibold shadow-sm">Mes articles</span>
          </h2>
          <Button 
            className="bg-[#ff5c5c] hover:bg-[#ff7e7e] text-white font-bold px-7 py-2.5 rounded-full shadow-lg transition text-base  sm:w-auto border-2 border-[#ffb3a7] focus:ring-2 focus:ring-[#ffb3a7] focus:outline-none"
            onClick={() => navigate('/restaurant/items/add')}
          >
            + Ajouter un article
          </Button>
        </div>
        <div className="flex items-center gap-2 mb-5 w-full relative">
          <FilterButton 
            fields={filterFields} 
            onApply={setFilters} 
            iconColor="#ff5c5c" 
            buttonClassName="bg-[#ff5c5c] hover:bg-[#ff7e7e] text-white font-bold px-4 py-2 rounded-full shadow transition border-2 border-[#ffb3a7] focus:ring-2 focus:ring-[#ffb3a7] focus:outline-none"
          />

          <div className="flex-1">
            <SearchBar query={searchTerm} setQuery={setSearchTerm} placeholder="Rechercher..." />
          </div>
        </div>
        <hr className="border-[#ffd6d6] mb-2" />
        {loading && (
          <div className="text-center py-6 text-[#ff5c5c] text-lg font-semibold animate-pulse z-10">
            Chargement des articles...
          </div>
        )}
        {error && <ErrorMessage error={error} />}
        <div className="hidden sm:block">
          <DataTable 
            columns={columns} 
            data={formattedArticles} 
            actions={tableActions} 
            className="rounded-xl overflow-hidden shadow border border-[#ffe3e3] bg-white"
            rowClassName="hover:bg-[#fff0f0] transition cursor-pointer"
            headerClassName="bg-[#ffedea] text-[#ff5c5c] text-base font-bold"
          />
        </div>
        {/* Mobile table fallback */}
        <div className="sm:hidden mt-4">
          {formattedArticles.length === 0 && !loading ? (
            <div className="text-center text-gray-500 py-6">Aucun article trouvé.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {formattedArticles.map(article => (
                <div key={article.id} className="bg-white rounded-xl shadow border border-[#ffe3e3] p-4 flex flex-col gap-3">
                  {/* Header with ID, Name and Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-[#f0f0f0] text-gray-600 px-2 py-1 rounded text-xs font-medium">ID: {article.id}</span>
                      </div>
                      <div className="font-bold text-[#ff5c5c] text-lg leading-tight break-words">{article.name}</div>
                    </div>
                    <div className="flex-shrink-0">
                      {tableActions(article)}
                    </div>
                  </div>

                  {/* Description */}
                  {article.description && (
                    <div className="text-gray-700 text-sm leading-relaxed">
                      <span className="font-medium text-gray-800">Description: </span>
                      {article.description}
                    </div>
                  )}

                  {/* Price and Status in a more detailed layout */}
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium text-sm">Prix:</span>
                      <span className="bg-[#ffedea] text-[#ff5c5c] px-3 py-1 rounded-full text-sm font-bold">{article.price} DA</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium text-sm">Statut:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${article.status ? 'bg-[#eaffea] text-[#2ecc40]' : 'bg-[#ffeaea] text-[#ff5c5c]'}`}>
                        {article.status ? 'En stock' : 'Indisponible'}
                      </span>
                    </div>
                    {/* Add quantity if available */}
                    {typeof article.quantity !== 'undefined' && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium text-sm">Quantité:</span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">{article.quantity}</span>
                      </div>
                    )}
                  </div>

                  {/* Additional info if available */}
                  <div className="pt-2 border-t border-[#ffd6d6]">
                    <div className="text-xs text-gray-500">
                      {article.createdAt && article.createdAt !== 'N/A' && (
                        <div>
                          <span className="font-medium">Date de création: </span>
                          <span>{article.createdAt}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Confirmer la suppression"
        message="Voulez-vous vraiment supprimer cet article ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        icon={faTrash}
        iconColor="text-red-500"
      />
    </div>
  );
}