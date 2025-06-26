import React from 'react';

const ProgressBar = ({ status }) => {
  return (
    <div className="w-full max-w-2xl mt-8 mb-8">
      <div className="flex justify-between text-sm font-medium mb-2">
        <span>Recuperer la livraison</span>
        <span>En cours de livraison</span>
        <span>Livraison effectuée</span>
      </div>
      <div className="flex items-center justify-between">
        {[0, 1, 2].map((step) => (
          <React.Fragment key={step}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${status >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
              {step + 1}
            </div>
            {step < 2 && (
              <div className={`flex-1 h-2 ${status > step ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;