import React from 'react';

/**
 * SidebarContainer is a flexible layout wrapper for sidebar + main content.
 * @param {React.ReactNode} sidebar - The sidebar component.
 * @param {React.ReactNode} children - The main content.
 * @param {string} className - Additional classes for the container.
 */
const SidebarContainer = ({ sidebar, children, className = '' }) => (
  <div className={`flex h-[calc(100vh-80px)] ${className}`}>
    <div className="sticky left-0 top-0 h-full z-10">{sidebar}</div>
    <div className="flex-1">{children}</div>
  </div>
);

export default SidebarContainer;
