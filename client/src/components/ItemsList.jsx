import React from 'react';

const ItemsList = ({ items }) => (
  <div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[280px] max-w-[350px]">
    <div className="font-bold text-lg mb-2">Les articles à livrer</div>
    <ul className="list-disc ml-6">
      {items.map((item, idx) => (
        <li key={idx}>{item.name}{item.qty ? ` —${item.qty}x` : ''}</li>
      ))}
    </ul>
  </div>
);

export default ItemsList;