import React from 'react';
import { FaCheckCircle, FaTruck, FaBoxOpen } from 'react-icons/fa';

const stepIcons = [FaBoxOpen, FaTruck, FaCheckCircle];

const ProgressBar = ({ status, accentColor = '#FE5336' }) => {
  return (
    <div className="w-full max-w-2xl mt-8 mb-8">
      <div className="flex justify-between text-sm font-medium mb-2">
        <span className="flex items-center gap-2"><FaBoxOpen className="text-[#FE5336]" />Récupérer</span>
        <span className="flex items-center gap-2"><FaTruck className="text-[#FE5336]" />En cours</span>
        <span className="flex items-center gap-2"><FaCheckCircle className="text-[#FE5336]" />Livrée</span>
      </div>
      <div className="flex items-center justify-between">
        {[0, 1, 2].map((step) => {
          const Icon = stepIcons[step];
          return (
            <React.Fragment key={step}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${status >= step ? 'bg-[#FE5336] text-white scale-110 shadow-lg' : 'bg-gray-200 text-gray-400'}`}>
                <Icon className="text-xl" />
              </div>
              {step < 2 && (
                <div className={`flex-1 h-2 transition-all duration-300 ${status > step ? 'bg-[#FE5336]' : 'bg-gray-200'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;