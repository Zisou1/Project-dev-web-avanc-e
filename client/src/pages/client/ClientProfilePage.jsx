import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import ProfileFormInput from "../../components/ProfileFormInput";
import ProfileButtons from "../../components/ProfileButtons";
import DeleteAnimation from "../../components/DeleteAnimation";

const ClientProfilePage = () => {
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
  if (!user) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Chargement du profil client...</div></div>;

  return (
    <div className="flex flex-col items-center min-h-screen justify-start pt-24">
      <h2 className="text-2xl font-bold mb-8">Informations personnelles</h2>
      <form className="w-full max-w-md space-y-6" onSubmit={handleSave}>
        <ProfileFormInput type="text" name="name" value={form.name} onChange={handleChange} placeholder="Nom" disabled={!editing} />
        <ProfileFormInput type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" disabled={!editing} />
        <ProfileFormInput type="password" name="password" value={form.password} onChange={handleChange} placeholder="Mot de passe" disabled={!editing} />
        <ProfileFormInput type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="Numéro de téléphone" disabled={!editing} />

        {status && <div className="text-green-600 text-center">{status}</div>}
        {error && <div className="text-red-600 text-center">{error}</div>}

        <ProfileButtons editing={editing} onEdit={handleEdit} onCancel={handleCancel} onDelete={handleDelete} />
      </form>
    </div>
  );
};

export default ClientProfilePage;
