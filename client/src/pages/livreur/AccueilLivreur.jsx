import React from 'react';
import InfoCard from '../../components/InfoCard';

const AccueilLivreur = () => {
  // Example data
  const livreur = {
    name: 'Ramy test',
    phone: '0559922630',
    commandesJour: 47,
    commandesAttente: 40,
    commandesTerminer: 5,
    revenusJour: '7800 DA',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start pt-16">
      <div className="w-full max-w-4xl bg-gray-100 rounded-2xl shadow-md px-8 py-6 flex flex-col" style={{width: '900px'}}>
        {/* Livreur Info on top */}
        <div className="flex flex-col min-w-[260px] max-w-[320px] bg-gray-100 rounded-2xl shadow-md px-8 py-6 ml-0 mr-auto">
          <div className="text-2xl font-bold mb-2">Nom : {livreur.name}</div>
          <div className="text-lg font-medium">
            numéro de téléphone : <span className="text-[#FF4D4F] font-semibold">{livreur.phone}</span>
          </div>
        </div>
        {/* Stats Cards - all on one line, centered below info */}
        <div className="flex flex-row flex-nowrap justify-center items-stretch w-full max-w-4xl gap-4 overflow-x-auto pb-2 mt-8">
          <InfoCard label="Commandes du jour" value={livreur.commandesJour} valueClass="text-black" />
          <InfoCard label="Commandes en attente" value={livreur.commandesAttente} valueClass="text-[#FF4D4F]" />
          <InfoCard label="commande terminer" value={livreur.commandesTerminer} valueClass="text-green-600" />
          <InfoCard label="Revenus du jour" value={livreur.revenusJour} valueClass="text-green-600" />
        </div>
      </div>
    </div>
  );
};

export default AccueilLivreur;
