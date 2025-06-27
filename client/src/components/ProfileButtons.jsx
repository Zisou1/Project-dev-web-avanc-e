import React from 'react';
import Button from './Button';

const ProfileButtons = ({ editing, onEdit, onCancel, onDelete }) => (
  <div className="flex justify-center gap-4 mt-8">
    {editing ? (
      <>
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
      </>
    ) : (
      <>
        <div className="w-32">
          <Button type="button" variant="primary" onClick={onEdit}>
            Modifier
          </Button>
        </div>
        <div className="w-40">
          <Button type="button" variant="secondary" onClick={onDelete}>
            Supprimer compte
          </Button>
        </div>
      </>
    )}
  </div>
);

export default ProfileButtons;
