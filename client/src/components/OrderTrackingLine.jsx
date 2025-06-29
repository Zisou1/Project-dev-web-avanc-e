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
  
  // Calculate progress with better handling
  let progress = 0;
  if (status === 'cancelled') {
    progress = 0;
  } else if (status === 'completed') {
    progress = 100;
  } else if (currentIndex >= 0) {
    progress = ((currentIndex + 1) / statusOrder.length) * 100;
  }
  
  // Ensure progress is within valid range
  progress = Math.min(100, Math.max(0, progress));

  // Size configurations
  const sizeConfig = {
    sm: { height: 'h-2', width: 'w-16', text: 'text-xs' },
    md: { height: 'h-3', width: 'w-24', text: 'text-xs' },
    lg: { height: 'h-4', width: 'w-32', text: 'text-sm' }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  return (
    <div className="flex items-center gap-2">
      <div className={`${config.width} bg-gray-200 rounded-full ${config.height} shadow-inner relative overflow-hidden`}>
        <div 
          className={`${config.height} rounded-full transition-all duration-500 ease-out ${
            status === 'cancelled' 
              ? 'bg-red-500' 
              : status === 'completed'
                ? 'bg-green-500'
                : 'bg-gradient-to-r from-blue-500 to-blue-600'
          }`}
          style={{ 
            width: `${progress}%`,
            minWidth: progress > 0 ? '2px' : '0px'
          }}
        ></div>
      </div>
      {showPercentage && (
        <span className={`${config.text} font-medium text-gray-600 min-w-[35px] tabular-nums`}>
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
};

export default OrderTrackingLine;
