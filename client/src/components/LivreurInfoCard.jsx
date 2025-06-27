import React from 'react';

const LivreurInfoCard = ({ form }) => (
  <div className="w-full max-w-md bg-white rounded-2xl shadow-md px-8 py-6 mb-6">
    <div className="text-2xl font-bold mb-8">Informations du livreur</div>
    <div className="mb-6"><span className="font-semibold">Nom :</span> {form.name}</div>
    <div className="mb-6"><span className="font-semibold">Email :</span> {form.email}</div>
    <div className="mb-6"><span className="font-semibold">Téléphone :</span> {form.phone}</div>
  </div>
);

export default LivreurInfoCard;