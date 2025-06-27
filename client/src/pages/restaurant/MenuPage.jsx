import React, { useEffect, useState, useRef } from "react";
import Button from "../../components/Button";
import DataTable from "../../components/DataTable";
import ErrorMessage from "../../components/ErrorMessage";
import FilterButton from "../../components/FilterButton";
import SearchBar from "../../components/SearchBar";
import { menuService } from "../../services/menuService";
import { useNavigate } from "react-router-dom";

export default function MenuPage() {
  const [menus, setMenus] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const filterRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await menuService.getAll();
      setMenus(data.menus || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Erreur lors du chargement des menus");
      setMenus([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await menuService.delete(deleteId);
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchMenus();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Erreur lors de la suppression");
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  // Filtering logic (customize as needed)
  const filteredMenus = menus.filter((menu) => {
    const matchesSearch = menu.name && menu.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesName = !filters.name || (menu.name && menu.name.toLowerCase().includes(filters.name.toLowerCase()));
    return matchesSearch && matchesName;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredMenus.length / itemsPerPage);
  const paginatedMenus = filteredMenus.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Table columns config
  const columns = [
    { key: "id", label: "ID Menu" },
    {
      key: "imageUrl",
      label: "Image",
      render: (row) =>
        row.imageUrl ? (
          <img src={row.imageUrl} alt={row.name} className="h-14 w-14 object-cover rounded-xl border border-[#ffd6d6] bg-white mx-auto" style={{boxShadow:'0 2px 8px #ffe3e3'}} />
        ) : (
          <div className="h-14 w-14 flex items-center justify-center rounded-xl bg-[#fff7f0] text-2xl text-[#ffd6d6] mx-auto">🍽️</div>
        ),
      style: { minWidth: 70, maxWidth: 80, textAlign: 'center' },
    },
    { key: "name", label: "Nom du menu" },
    { key: "price", label: "Prix" },
    {
      key: "status",
      label: "Disponible",
      render: (row) => {
        let value = row.status;
        if (typeof value === "string") value = value.trim().toLowerCase();
        const isAvailable = value === true || value === 1 || value === "1" || value === "true";
        return (
          <span className={isAvailable ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
            {isAvailable ? "Oui" : "Non"}
          </span>
        );
      },
    },
  ];

  // Actions dropdown for each menu row
  function MenuActions({ menu, onDelete, onEdit, onAddItems }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef();
    useEffect(() => {
      function handleClick(e) {
        if (open && menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
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
                onClick={() => onEdit(menu.id)}
              >
                Modifier
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-green-50 text-green-700 text-left font-medium transition"
                style={{ fontSize: '0.97rem', minHeight: '32px', borderBottom: '1px solid #e5e7eb' }}
                onClick={() => onAddItems(menu.id)}
              >
                Ajouter des articles
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-700 text-left font-medium transition"
                style={{ fontSize: '0.97rem', minHeight: '32px' }}
                onClick={() => onDelete(menu.id)}
              >
                Supprimer
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Table actions: use MenuActions component
  const tableActions = (menu) => (
    <MenuActions 
      menu={menu} 
      onDelete={handleDelete} 
      onEdit={(id) => navigate(`/restaurant/menu/edit/${id}`)}
      onAddItems={(id) => navigate(`/restaurant/menu/${id}/add-items`)}
    />
  );

  // Fix: ensure DataTable gets a key for actions
  return (
    <div className="min-h-screen py-4 px-2 sm:px-6 lg:px-8 relative text-[0.92rem] ">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
          <h2 className="text-3xl font-extrabold text-[#ff5c42] tracking-tight mb-0 drop-shadow-lg">🍽️ Mes menus</h2>
          <Button 
            className="bg-gradient-to-r from-[#ff5c5c] to-[#ff7e7e] hover:from-[#ff7e7e] hover:to-[#ff5c5c] text-white font-bold px-8 py-3 rounded-2xl shadow-lg transition text-lg w-full sm:w-auto border-2 border-[#ffb3b3]"
            onClick={() => navigate('/restaurant/menu/add')}
          >
            + Ajouter un menu
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-6 w-full relative">
          <FilterButton fields={[{ key: "name", label: "Nom du menu", type: "text", placeholder: "Nom..." }]} onApply={setFilters} />
          <div className="flex-1 w-full">
            <SearchBar query={searchTerm} setQuery={setSearchTerm} placeholder="Rechercher..." />
          </div>
        </div>
        <hr className="border-[#ffd6d6] mb-4" />
        {loading && (
          <div className="text-center py-8 text-[#ff5c42] text-lg font-semibold animate-pulse z-10">
            Chargement des menus...
          </div>
        )}
        {error && <ErrorMessage error={error} />}
        {/* DataTable for Menus */}
        <div className="w-full">
          <DataTable 
            columns={columns} 
            data={paginatedMenus} 
            actions={tableActions} 
            keyField="id"
          />
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-10">
            <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="px-4 py-2 rounded-full bg-[#ffe3e3] text-[#ff5c42] font-bold shadow border border-[#ffd6d6] disabled:opacity-50 transition">Précédent</button>
            <span className="text-[#ff5c42] font-semibold text-lg">{currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-full bg-[#ffe3e3] text-[#ff5c42] font-bold shadow border border-[#ffd6d6] disabled:opacity-50 transition">Suivant</button>
          </div>
        )}
      </div>
      {/* ConfirmationModal can be added here if you have one */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full flex flex-col items-center">
            <h3 className="text-lg font-bold mb-4 text-[#ff5c42]">Confirmer la suppression</h3>
            <p className="mb-6 text-gray-700">Voulez-vous vraiment supprimer ce menu ?</p>
            <div className="flex gap-4">
              <Button onClick={handleCloseDeleteModal} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full font-semibold shadow hover:bg-gray-300 transition">Annuler</Button>
              <Button onClick={handleConfirmDelete} className="bg-[#ff5c42] text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-[#ff6a5c] transition">Supprimer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
