import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const OrderTrackingStepper = ({ status, className = '' }) => {

  // Define the order of statuses
  const statusOrder = [
    'pending',
    'confirmed', 
    'waiting for pickup',
    'product pickedup',
    'confirmed by delivery',
    'confirmed by client',
    'completed'
  ];

  // Get tracking steps based on status
  const getTrackingSteps = (status) => {
    // If cancelled, show special cancelled state
    if (status === 'cancelled') {
      return [
        {
          id: 1,
          title: "Commande annulée",
          description: "La commande a été annulée",
          statuses: ['cancelled'],
          completed: true,
          cancelled: true
        }
      ];
    }

    const currentStatusIndex = statusOrder.indexOf(status);
    
    const steps = [
      {
        id: 1,
        title: "Commande en attente",
        description: "La commande est en attente de validation",
        statuses: ['pending'],
        completed: currentStatusIndex >= 0
      },
      {
        id: 2,
        title: "Commande confirmée",
        description: "La commande a été confirmée par le restaurant",
        statuses: ['confirmed'],
        completed: currentStatusIndex >= 1
      },
      {
        id: 3,
        title: "En attente de récupération",
        description: "En attente qu'un livreur récupère la commande",
        statuses: ['waiting for pickup'],
        completed: currentStatusIndex >= 2
      },
      {
        id: 4,
        title: "Produit récupéré",
        description: "Le livreur a récupéré la commande",
        statuses: ['product pickedup'],
        completed: currentStatusIndex >= 3
      },
      {
        id: 5,
        title: "Confirmée par le livreur",
        description: "Le livreur a confirmé la livraison",
        statuses: ['confirmed by delivery'],
        completed: currentStatusIndex >= 4
      },
      {
        id: 6,
        title: "Confirmée par le client",
        description: "Le client a confirmé la réception",
        statuses: ['confirmed by client'],
        completed: currentStatusIndex >= 5
      },
      {
        id: 7,
        title: "Commande terminée",
        description: "La commande a été livrée avec succès",
        statuses: ['completed'],
        completed: currentStatusIndex >= 6
      }
    ];

    return steps;
  };

  const trackingSteps = getTrackingSteps(status);

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {status === 'cancelled' 
          ? 'État de la commande' 
          : status === 'completed' 
            ? 'Livraison terminée'
            : 'État de la livraison'
        }
      </h2>
      
      <div className="relative px-6">
        {/* Horizontal Progress line */}
        <div className="absolute top-6 left-12 right-12 h-0.5 bg-gray-200"></div>
        <div 
          className={`absolute top-6 left-12 h-0.5 transition-all duration-500 ${
            status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'
          }`}
          style={{ 
            width: trackingSteps.length > 1 
              ? `calc(${(trackingSteps.filter(step => step.completed).length - 1) * 100 / (trackingSteps.length - 1)}% - 24px)` 
              : '0%'
          }}
        ></div>
        
        {/* Current position indicator on line */}
        {status !== 'cancelled' && (
          <div 
            className="absolute top-5 w-2 h-2 bg-yellow-400 rounded-full shadow-lg transition-all duration-500 animate-pulse"
            style={{ 
              left: trackingSteps.length > 1 
                ? `calc(12px + ${(trackingSteps.filter(step => step.completed).length) * 100 / (trackingSteps.length - 1)}% - 4px)` 
                : '44px'
            }}
          ></div>
        )}

        {/* Steps - Horizontal Layout */}
        <div className="flex justify-between items-start overflow-x-auto pb-4">
          {trackingSteps.map((step) => {
            const isCurrentStep = step.statuses.includes(status);
            return (
              <div key={step.id} className="flex flex-col items-center text-center flex-shrink-0" style={{ minWidth: trackingSteps.length > 4 ? '120px' : `${100 / trackingSteps.length}%` }}>
                {/* Step circle */}
                <div className={`relative z-10 w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-lg transition-all duration-300 mb-4 ${
                  step.cancelled
                    ? 'bg-red-500 border-red-500 text-white shadow-lg'
                    : step.completed 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : isCurrentStep
                        ? 'bg-yellow-400 border-yellow-400 text-white shadow-lg animate-pulse'
                        : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {step.completed ? (
                    <FontAwesomeIcon icon={faCheck} />
                  ) : isCurrentStep ? (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  ) : (
                    step.id
                  )}
                </div>

                {/* Step content */}
                <div className="max-w-32 px-2">
                  <h3 className={`text-sm font-semibold mb-2 ${
                    step.cancelled
                      ? 'text-red-600'
                      : step.completed 
                        ? 'text-blue-600' 
                        : isCurrentStep
                          ? 'text-yellow-600 font-bold'
                          : 'text-gray-500'
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-tight">{step.description}</p>
                  {step.completed && !step.cancelled && (
                    <p className="text-xs text-blue-600 font-medium mt-2">✓ Terminé</p>
                  )}
                  {step.cancelled && (
                    <p className="text-xs text-red-600 font-medium mt-2">✗ Annulé</p>
                  )}
                  {isCurrentStep && !step.completed && !step.cancelled && (
                    <p className="text-xs text-yellow-600 font-medium mt-2">● En cours</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingStepper;