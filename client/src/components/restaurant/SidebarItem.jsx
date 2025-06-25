import React from 'react';

/**
 * SidebarItem is a reusable component for sidebar navigation links.
 * @param {React.ReactNode} icon - Icon component or element.
 * @param {string} label - The label for the sidebar item.
 * @param {boolean} active - Whether the item is currently active.
 * @param {function} onClick - Click handler for the item.
 */
const SidebarItem = ({ icon, label, active, onClick }) => (
  <button
    className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-colors font-semibold ${
      active ? 'bg-red-400 text-white' : 'hover:bg-gray-100 text-gray-700'
    }`}
    onClick={onClick}
    type="button"
  >
    <span className="text-xl">{icon}</span>
    <span>{label}</span>
  </button>
);

export default SidebarItem;
