import React from 'react';
import { FaBox } from 'react-icons/fa';

const ItemsList = ({ items }) => (
  <div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[280px] max-w-[350px]">
    <div className="flex items-center gap-2 font-bold text-lg mb-4 text-black">
      <FaBox className="text-xl text-[#FE5336]" />
      Les articles à livrer
    </div>
    <ul className="list-none flex flex-col gap-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-center gap-2 text-black">
          <span className="inline-block bg-[#FE5336]/10 text-black rounded-full px-3 py-1 text-xs font-semibold">{item.name}</span>
          {item.qty && <span className="bg-gray-100 text-black rounded px-2 py-0.5 text-xs font-medium">{item.qty}x</span>}
        </li>
      ))}
    </ul>
  </div>
);

export default ItemsList;