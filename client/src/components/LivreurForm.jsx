import React from 'react';
import ProfileFormInput from "./ProfileFormInput";
import Button from "./Button";

const LivreurForm = ({ form, editing, onChange, onSave, status, error, onCancel, onDelete, showPasswordFields, setShowPasswordFields }) => (
  <form className="w-full max-w-md space-y-6" onSubmit={onSave}>
    <ProfileFormInput type="text" name="name" value={form.name} onChange={onChange} placeholder="Nom" disabled={!editing} />
    <ProfileFormInput type="email" name="email" value={form.email} onChange={onChange} placeholder="Email" disabled={!editing} />
    <ProfileFormInput type="text" name="phone" value={form.phone} onChange={onChange} placeholder="Numéro de téléphone" disabled={!editing} />
    {editing && !showPasswordFields && (
      <Button type="button" variant="secondary" onClick={() => setShowPasswordFields(true)}>
        Modifier le mot de passe
      </Button>
    )}
    {showPasswordFields && (
      <div className="space-y-3">
        <ProfileFormInput type="password" name="oldPassword" value={form.oldPassword} onChange={onChange} placeholder="Ancien mot de passe" disabled={!editing} />
        <ProfileFormInput type="password" name="newPassword" value={form.newPassword} onChange={onChange} placeholder="Nouveau mot de passe" disabled={!editing} />
        <ProfileFormInput type="password" name="confirmPassword" value={form.confirmPassword} onChange={onChange} placeholder="Confirmer le nouveau mot de passe" disabled={!editing} />
      </div>
    )}
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
