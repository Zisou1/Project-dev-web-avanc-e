import { useState, useEffect } from "react";
import Button from "../../components/Button";
import Input from "../../components/input";
import { FiSearch } from "react-icons/fi";
import { itemService } from "../../services/itemService";
import ErrorMessage from "../../components/ErrorMessage";
import { Link, useNavigate } from "react-router-dom";

export default function ItemsPage() {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await itemService.getAll();
      if (!data.items || !Array.isArray(data.items)) {
        throw new Error("Aucun article trouvé ou format de réponse invalide");
      }
      setArticles(data.items);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Erreur inconnue");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await itemService.delete(deleteId);
      setDeleteId(null);
      await fetchArticles();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Erreur lors de la suppression");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredArticles = articles.filter((article) =>
    article.name && article.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-2 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-extrabold mb-8 text-gray-900 tracking-tight">
          Mes articles
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10 w-full">
          <div className="flex items-center flex-1 bg-white rounded-full px-12 py-5 shadow border border-gray-400 w-full">
            <FiSearch className="text-2xl text-gray-400 mr-2" />
            <Input
              type="text"
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400 text-xl min-h-[3.5rem] px-4"
            />
          </div>
          <Link to="/restaurant/items/add" className="w-full sm:w-auto flex-shrink-0">
            <Button className="bg-gradient-to-r from-[#ff4d30] to-[#ff7e5f] hover:from-[#ff7e5f] hover:to-[#ff4d30] text-white font-bold px-16 py-5 rounded-full shadow-md transition w-full sm:w-[320px] min-w-[220px] text-xl">
              + Ajouter
            </Button>
          </Link>
        </div>

        {loading && (
          <div className="text-center py-8 text-gray-700 text-lg">
            Chargement...
          </div>
        )}
        {error && <ErrorMessage error={error} />}

        <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-100 max-w-5xl mx-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-4 px-6 font-bold text-gray-700 text-lg">ID</th>
                <th className="py-4 px-6 font-bold text-gray-700 text-lg">Nom</th>
                <th className="py-4 px-6 font-bold text-gray-700 text-lg">
                  Description
                </th>
                <th className="py-4 px-6 font-bold text-gray-700 text-lg">Prix</th>
                <th className="py-4 px-6 font-bold text-gray-700 text-lg text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((article) => (
                <tr
                  key={article.id}
                  className="border-b hover:bg-gray-100 transition"
                >
                  <td className="py-3 px-6 text-gray-900 font-semibold text-base">
                    {article.id}
                  </td>
                  <td className="py-3 px-6 text-gray-900 text-base">
                    {article.name}
                  </td>
                  <td className="py-3 px-6 text-gray-700 text-base max-w-xs truncate">
                    {article.description}
                  </td>
                  <td className="py-3 px-6 text-gray-900 text-base">
                    {article.price} DA
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex justify-center gap-2">
                      <Link to={`/restaurant/items/edit/${article.id}`}>
                        <Button className="text-blue-500 hover:text-blue-700 text-lg px-2 py-1 rounded transition bg-transparent shadow-none border-none" title="Modifier">
                          ✎
                        </Button>
                      </Link>
                      <Button
                        className="text-red-500 hover:text-red-700 text-lg px-2 py-1 rounded transition bg-transparent shadow-none border-none"
                        title="Supprimer"
                        onClick={() => handleDelete(article.id)}
                      >
                        🗑
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !error && filteredArticles.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-lg">
              Aucun article trouvé.
            </div>
          )}
        </div>
      </div>
      {/* Delete confirmation page navigation */}
      {deleteId && (
        <DeleteConfirmPage id={deleteId} onClose={() => setDeleteId(null)} onDeleted={fetchArticles} />
      )}
    </div>
  );
}

function DeleteConfirmPage({ id, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await itemService.delete(id);
      onClose();
      onDeleted();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Erreur lors de la suppression");
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
          <Button onClick={handleDelete} className="bg-red-500 text-white flex-1" disabled={loading}>{loading ? 'Suppression...' : 'Supprimer'}</Button>
          <Button onClick={onClose} className="bg-gray-300 text-gray-800 flex-1" disabled={loading}>Annuler</Button>
        </div>
      </div>
    </div>
  );
}
