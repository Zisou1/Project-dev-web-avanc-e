import React from 'react';

const LivreurInfo = ({ name, phone }) => (
  <div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[280px] max-w-[350px] flex flex-col justify-center h-full">
    <div className="font-bold text-lg mb-2">Livreur</div>
    <div>Détail du livreur :</div>
    <div>Nom : <span className="font-semibold">{name}</span></div>
    <div>numéro de téléphone : <span>{phone}</span></div>
  </div>
);

export default LivreurInfo;
