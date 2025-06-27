import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import DeleteAnimation from "../../components/DeleteAnimation";
import LivreurInfoCard from "../../components/LivreurInfoCard";
import LivreurForm from "../../components/LivreurForm";
import ProfileButtons from "../../components/ProfileButtons";

const Profillivreur = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    phone: user?.phone || ''
  });
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [showDeleteAnim, setShowDeleteAnim] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => setEditing(true);
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
      const updated = await authService.updateUser(updateData);
      setUser && setUser({ ...user, ...updated.user });
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
  if (!user) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Chargement du profil livreur...</div></div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {!editing && (
        <>
          <LivreurInfoCard form={form} />
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
  );
};

export default Profillivreur;