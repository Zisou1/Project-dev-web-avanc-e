import React from 'react';

const InfoCard = ({ label, value, valueClass }) => (
  <div className="bg-white rounded-2xl shadow-md p-6 min-w-[180px] flex flex-col items-start justify-center mr-4 mb-4">
    <span className="font-semibold text-base mb-2 text-black">{label}</span>
    <span className={`text-2xl font-bold ${valueClass}`}>{value}</span>
  </div>
);

export default InfoCard;
