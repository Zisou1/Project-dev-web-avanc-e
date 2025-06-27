import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";
import { menuService } from "../../services/menuService";
import { itemService } from "../../services/itemService";
import { FaBoxOpen, FaTrash } from "react-icons/fa";
import IconButton from "../../components/IconButton";

export default function AddItemsToMenuPage() {
  const { id } = useParams(); // menu id
  const [menu, setMenu] = useState(null);
  const [items, setItems] = useState([]); // all available items
  const [menuItems, setMenuItems] = useState([]); // items currently in menu
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
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
        const menuItemsData = await menuService.getMenuItems(id);
        setMenuItems(menuItemsData.items || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // Reset page if menuItems changes
  useEffect(() => { setCurrentPage(1); }, [menuItems]);

  // Remove item from menu
  const handleRemove = async (itemId) => {
    setLoading(true);
    setError(null);
    try {
      // FIX: Use correct backend route for delete
      await menuService.removeItem(id, itemId); // menuId, itemId
      // Refetch menu items to ensure sync with backend
      const menuItemsData = await menuService.getMenuItems(id);
      setMenuItems(menuItemsData.items || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Erreur lors de la suppression de l'article");
    } finally {
      setLoading(false);
    }
  };

  // Add item to menu
  const handleAdd = async (itemId) => {
    setLoading(true);
    setError(null);
    try {
      await menuService.addItems(id, itemId);
      // Refetch menu items
      const menuItemsData = await menuService.getMenuItems(id);
      setMenuItems(menuItemsData.items || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Erreur lors de l'ajout de l'article");
    } finally {
      setLoading(false);
    }
  };

  // Helper to resolve image URL
  const getImageUrl = (url) => {
    if (!url) return '/Logo.png';
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url.startsWith('/') ? url : '/' + url}`;
  };

  // Items not in menu
  const menuItemIds = new Set(menuItems.map((item) => item.id));
  // Use the same logic for both menuItems and itemsToAdd
  const getItemImageUrl = (item) => {
    // Only show the image if it exists, otherwise show nothing (no fallback logo)
    const url = item.imageUrl || item.image || (item.image && item.image.url);
    if (!url) return null;
    return getImageUrl(url);
  };
  const itemsToAdd = items.filter((item) => !menuItemIds.has(item.id));
  // console.log('itemsToAdd', itemsToAdd); // DEBUG: See what image properties are present

  return (
    <form className="max-w-4xl mx-auto mt-10 p-0 bg-gradient-to-br from-[#fff7f0] to-[#ffe3e3] rounded-3xl shadow-2xl border border-[#ffd6d6] overflow-hidden">
      <div className="bg-[#ff5c42] py-6 px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-auto">
          <h2 className="text-2xl sm:text-2xl font-extrabold text-white mb-1 tracking-tight drop-shadow-lg">Gérer les articles du menu</h2>
          {menu && <div className="text-base sm:text-lg text-white/90 font-semibold">Menu : <span className="underline underline-offset-2">{menu.name}</span></div>}
        </div>
        <Button type="button" className="bg-white text-[#ff5c42] px-4 sm:px-6 py-1 rounded-full font-bold shadow hover:bg-[#ffe3e3] border-2 border-[#ff5c42] transition w-full md:w-auto text-sm" onClick={() => navigate(-1)}>
          Retour
        </Button>
      </div>
      {error && <ErrorMessage error={error} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Current menu items */}
        <div className="bg-white/80 p-3 sm:p-5 flex flex-col gap-4 border-r border-[#ffe3e3] min-h-[300px]">
          <h3 className="font-bold text-[#ff5c42] flex items-center gap-2 mb-2 text-base sm:text-lg"><FaBoxOpen /> Articles dans le menu</h3>
          {menuItems.length === 0 && <div className="text-gray-400 italic">Aucun article dans ce menu.</div>}
          <div className="flex flex-col gap-4">
            {menuItems.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage).map(item => (
              <div key={item.id} className="flex flex-row items-center bg-white rounded-2xl p-4 shadow border border-[#ffd6d6] hover:shadow-lg transition-transform">
                <img src={getItemImageUrl(item)} alt={item.name} className="h-16 w-16 object-cover rounded-xl shadow-md border border-[#ffd6d6] bg-white mr-5" onError={e => e.target.src='/Logo.png'} />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold text-lg text-[#ff5c42] truncate mb-1">{item.name}</span>
                  <span className="text-gray-500 text-sm truncate">{item.description}</span>
                </div>
                <IconButton onClick={() => handleRemove(item.id)} className="ml-5"><FaTrash /></IconButton>
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          {menuItems.length > itemsPerPage && (
            <div className="flex justify-center mt-4 gap-2">
              <button type="button" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1} className="px-3 py-1 rounded bg-[#ffe3e3] text-[#ff5c42] font-bold disabled:opacity-50">Précédent</button>
              <span className="px-3 py-1 text-[#ff5c42] font-semibold">{currentPage} / {Math.ceil(menuItems.length/itemsPerPage)}</span>
              <button type="button" onClick={() => setCurrentPage(p => Math.min(Math.ceil(menuItems.length/itemsPerPage), p+1))} disabled={currentPage===Math.ceil(menuItems.length/itemsPerPage)} className="px-3 py-1 rounded bg-[#ffe3e3] text-[#ff5c42] font-bold disabled:opacity-50">Suivant</button>
            </div>
          )}
        </div>
        {/* All available items not in menu */}
        <div className="bg-[#fff7f0] p-3 sm:p-5 flex flex-col gap-3 sm:gap-4 min-h-[300px]">
          <h3 className="font-bold text-[#ff5c42] flex items-center gap-2 mb-2 text-base sm:text-lg"><FaBoxOpen /> Ajouter des articles</h3>
          {itemsToAdd.length === 0 && <div className="text-gray-400 italic">Aucun article à ajouter.</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {itemsToAdd.map(item => (
              <div key={item.id} className="flex flex-col items-center bg-white rounded-xl p-3 sm:p-4 shadow border border-[#ffd6d6] hover:scale-[1.01] transition-transform">
                {getItemImageUrl(item) && (
                  <img src={getItemImageUrl(item)} alt={item.name} className="h-12 w-12 sm:h-14 sm:w-14 object-cover rounded-lg shadow border border-[#ffd6d6] bg-white mb-1" />
                )}
                <div className="font-bold text-[#ff5c42] text-sm sm:text-base mb-1 truncate w-full text-center">{item.name}</div>
                <div className="text-gray-500 text-xs mb-1 text-center line-clamp-2 min-h-[24px]">{item.description}</div>
                <Button type="button" variant="secondary" onClick={() => handleAdd(item.id)} className="px-3 sm:px-4 py-1 text-sm bg-[#ffe3e3] text-[#ff5c42] hover:bg-[#ffd6d6] border border-[#ffd6d6] rounded-full font-bold mt-1 shadow w-full">
                  Ajouter
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}

// Add to menuService.js:
// async getMenuItems(menuId) {
//   const response = await api.get(`/restaurants/menuItem/getItemMenu/${menuId}`);
//   return response.data;
// }
// async removeItem(menuId, itemId) {
//   return api.delete(`/restaurants/menuItem/delete/${menuId}/${itemId}`);
// }
