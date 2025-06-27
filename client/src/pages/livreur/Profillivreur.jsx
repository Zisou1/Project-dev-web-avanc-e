import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import DeleteAnimation from "../../components/DeleteAnimation";
import LivreurInfoCard from "../../components/LivreurInfoCard";
import LivreurForm from "../../components/LivreurForm";
import ProfileButtons from "../../components/ProfileButtons";

const Profillivreur = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [showDeleteAnim, setShowDeleteAnim] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use user from AuthContext directly, do not call API
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        phone: user.phone || ''
      });
    }
    setLoading(false);
    // eslint-disable-next-line
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      phone: user?.phone || ''
    });
    setEditing(true);
  };
  const handleCancel = () => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      phone: user?.phone || ''
    });
    setEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus(null);
    setError(null);
    try {
      const updateData = { ...form };
      if (!updateData.password) delete updateData.password;
      // Call API to update user
      const updated = await authService.updateUser(updateData);
      setUser && setUser({ ...user, ...updated.user });
      setForm({
        name: updated.user?.name || '',
        email: updated.user?.email || '',
        password: '',
        phone: updated.user?.phone || ''
      });
      setStatus('Modifications enregistrées !');
      setEditing(false);
    } catch (err) {
      setError('Erreur lors de la mise à jour.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      setShowDeleteAnim(true);
      setTimeout(async () => {
        try {
          await authService.deleteUser();
          setUser(null);
        } catch (err) {
          setError('Erreur lors de la suppression du compte.');
        }
      }, 2000);
    }
  };

  if (showDeleteAnim) return <DeleteAnimation />;
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Chargement du profil livreur...</div></div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Aucun profil trouvé.</div></div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      <div className="w-full max-w-lg p-8 bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col items-center animate-fade-in">
        {!editing && (
          <>
            <div className="flex flex-col items-center w-full mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center mb-4 shadow-lg border-4 border-white">
                <span className="text-4xl font-bold text-white">{user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-1 tracking-tight">Profil Livreur</h2>
              <span className="text-sm text-gray-500 mb-2">#{user?.id}</span>
            </div>
            <div className="w-full mb-6">
              <LivreurInfoCard livreur={user} />
            </div>
            <ProfileButtons editing={editing} onEdit={handleEdit} onDelete={handleDelete} />
          </>
        )}
        {editing && (
          <LivreurForm 
            form={form}
            editing={editing}
            onChange={handleChange}
            onSave={handleSave}
            status={status}
            error={error}
            onCancel={handleCancel}
            onDelete={handleDelete}
          />
        )}
      </div>
      {showDeleteAnim && <DeleteAnimation />}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-60 z-50">
          <div className="text-blue-600 text-lg font-semibold animate-pulse">Chargement du profil livreur...</div>
        </div>
      )}
      {!user && !loading && (
        <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Aucun profil trouvé.</div></div>
      )}
    </div>
  );
};

export default Profillivreur;
