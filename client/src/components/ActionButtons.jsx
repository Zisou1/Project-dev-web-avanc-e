import React from 'react';

const ActionButtons = ({ onConfirm, onCancel }) => (
  <div className="flex gap-8 mt-8 mb-12">
    <button
      className="bg-[#FF5C39] text-white px-12 py-4 rounded-full shadow-md text-lg font-semibold hover:bg-[#ff3c1a] transition"
      onClick={onConfirm}
    >
      Livraison effectuée
    </button>
    <button
      className="bg-[#FF5C39] text-white px-12 py-4 rounded-full shadow-md text-lg font-semibold hover:bg-[#ff3c1a] transition"
      onClick={onCancel}
    >
      Annuler
    </button>
  </div>
);

export default ActionButtons;