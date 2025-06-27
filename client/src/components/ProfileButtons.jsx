const ProfileButtons = ({ editing, onEdit, onCancel, onDelete }) => (
  <div className="flex justify-center gap-8 mt-8">
    {editing ? (
      <>
        <button
          type="submit"
          className="bg-[#FF5C39] text-white px-10 py-3 rounded-full shadow-md text-lg font-semibold hover:bg-[#ff3c1a] transition"
        >
          Enregistrer
        </button>
        <button
          type="button"
          className="bg-[#FF5C39] text-white px-10 py-3 rounded-full shadow-md text-lg font-semibold hover:bg-[#ff3c1a] transition"
          onClick={onCancel}
        >
          Annuler
        </button>
      </>
    ) : (
      <>
        <button
          type="button"
          className="bg-[#FF5C39] text-white px-10 py-3 rounded-full shadow-md text-lg font-semibold hover:bg-[#ff3c1a] transition"
          onClick={onEdit}
        >
          Modifier
        </button>
        <button
          type="button"
          className="bg-red-600 text-white px-8 py-2 rounded-full shadow-md text-base font-semibold hover:bg-red-700 transition"
          onClick={onDelete}
        >
          Supprimer mon compte
        </button>
      </>
    )}
  </div>
);

export default ProfileButtons;
