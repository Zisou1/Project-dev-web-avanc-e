import React from 'react';

const OrderTrackingLine = ({ status, showPercentage = true, size = 'md' }) => {
  // Status order for tracking
  const statusOrder = [
    'pending',
    'confirmed', 
    'waiting for pickup',
    'product pickedup',
    'confirmed by delivery',
    'confirmed by client',
    'completed'
  ];

  const currentIndex = statusOrder.indexOf(status);
  const progress = status === 'cancelled' ? 0 : Math.max(0, ((currentIndex + 1) / statusOrder.length) * 100);

  // Size configurations
  const sizeConfig = {
    sm: { height: 'h-2', width: 'w-16', text: 'text-xs' },
    md: { height: 'h-3', width: 'w-24', text: 'text-xs' },
    lg: { height: 'h-4', width: 'w-32', text: 'text-sm' }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  return (
    <div className="flex items-center gap-2">
      <div className={`${config.width} bg-gray-200 rounded-full ${config.height} shadow-inner`}>
        <div 
          className={`${config.height} rounded-full transition-all duration-500 ${
            status === 'cancelled' 
              ? 'bg-red-500' 
              : status === 'completed'
                ? 'bg-green-500'
                : 'bg-gradient-to-r from-blue-500 to-blue-600'
          }`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      {showPercentage && (
        <span className={`${config.text} font-medium text-gray-600 min-w-[35px]`}>
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
};

export default OrderTrackingLine;
