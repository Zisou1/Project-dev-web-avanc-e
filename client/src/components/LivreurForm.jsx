import React from 'react';
import ProfileFormInput from "./ProfileFormInput";
import ProfileButtons from "./ProfileButtons";

const LivreurForm = ({ form, editing, onChange, onSave, status, error, onCancel, onDelete }) => (
  <form className="w-full max-w-md space-y-6" onSubmit={onSave}>
    <ProfileFormInput type="text" name="name" value={form.name} onChange={onChange} placeholder="Nom" disabled={!editing} />
    <ProfileFormInput type="email" name="email" value={form.email} onChange={onChange} placeholder="Email" disabled={!editing} />
    <ProfileFormInput type="password" name="password" value={form.password} onChange={onChange} placeholder="Mot de passe" disabled={!editing} />
    <ProfileFormInput type="text" name="phone" value={form.phone} onChange={onChange} placeholder="Numéro de téléphone" disabled={!editing} />
    
    {status && <div className="text-green-600 text-center">{status}</div>}
    {error && <div className="text-red-600 text-center">{error}</div>}
    
    <ProfileButtons editing={editing} onCancel={onCancel} onDelete={onDelete} />
  </form>
);

export default LivreurForm;