import React from 'react';
import ProfileFormInput from "./ProfileFormInput";
import Button from "./Button";

const LivreurForm = ({ form, editing, onChange, onSave, status, error, onCancel, onDelete }) => (
  <form className="w-full max-w-md space-y-6" onSubmit={onSave}>
    <ProfileFormInput type="text" name="name" value={form.name} onChange={onChange} placeholder="Nom" disabled={!editing} />
    <ProfileFormInput type="email" name="email" value={form.email} onChange={onChange} placeholder="Email" disabled={!editing} />
    <ProfileFormInput type="password" name="password" value={form.password} onChange={onChange} placeholder="Mot de passe" disabled={!editing} />
    <ProfileFormInput type="text" name="phone" value={form.phone} onChange={onChange} placeholder="Numéro de téléphone" disabled={!editing} />
    
    {status && <div className="text-green-600 text-center">{status}</div>}
    {error && <div className="text-red-600 text-center">{error}</div>}
    
    <div className="flex justify-center gap-4 mt-8">
      <div className="w-32">
        <Button type="submit" variant="primary">
          Enregistrer
        </Button>
      </div>
      <div className="w-32">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </div>
  </form>
);

export default LivreurForm;
