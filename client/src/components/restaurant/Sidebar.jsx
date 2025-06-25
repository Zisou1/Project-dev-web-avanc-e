import React from 'react';
import SidebarItem from './SidebarItem';

/**
 * Sidebar is a reusable vertical navigation component.
 * @param {Array} items - Array of sidebar item objects {icon, label, active, onClick}.
 * @param {string} className - Additional classes for the sidebar.
 * @param {number} headerHeight - Height of the header in px (default 80).
 */
const Sidebar = ({ items = [], className = '', headerHeight = 80 }) => (
  <aside
    className={`w-72 min-h-full border-r bg-white flex flex-col gap-2 pt-8 fixed left-0 z-20 ${className}`}
    style={{ top: headerHeight, height: `calc(100vh - ${headerHeight}px)` }}
  >
    <div className="flex flex-col gap-2 px-2">
      {items.map((item) => (
        <SidebarItem key={item.label} {...item} />
      ))}
    </div>
  </aside>
);

export default Sidebar;
