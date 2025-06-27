import React from "react";

const LivreurInfoCard = ({ livreur }) => {
  if (!livreur) return null;
  return (
    <div className="bg-white rounded-xl shadow p-6 border border-gray-200 w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Profil Livreur</h2>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Nom:</span>
          <span className="font-semibold text-gray-800">{livreur.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Email:</span>
          <span className="font-semibold text-gray-800">{livreur.email}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Téléphone:</span>
          <span className="font-semibold text-blue-600">{livreur.phone}</span>
        </div>
      </div>
    </div>
  );
};

export default LivreurInfoCard;