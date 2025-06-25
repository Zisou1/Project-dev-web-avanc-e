// src/components/Sidebar.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faClockRotateLeft, faMotorcycle, faHome, faCog } from "@fortawesome/free-solid-svg-icons";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white h-[calc(100vh-6rem)] flex flex-col justify-between border-r select-none fixed left-0 top-24 z-20" style={{ minWidth: 260 }}>
      <div>
        {/* Logo */}
        <div className="flex items-center pt-8 pl-6 pb-2">
          <img src="/logo.png" alt="Yumzo" className="h-6 mr-2" />
          <span className="text-3xl font-bold text-[#FF5A5F]" style={{fontFamily: 'inherit'}}>Yumzo</span>
        </div>
        {/* Menu */}
        <ul className="mt-2 ml-2">
          <li className="flex items-center gap-3 px-2 py-2 rounded-l-full bg-[#FF5A5F] text-white font-bold text-base mb-1 w-[90%]">
            <FontAwesomeIcon icon={faHome} className="text-lg" />
            <span className="ml-2">Accueil</span>
          </li>
          <li className="flex items-center gap-3 px-2 py-2 rounded-l-full text-[#222] font-normal text-base mb-1 w-[90%] hover:bg-gray-100 cursor-pointer">
            <FontAwesomeIcon icon={faMotorcycle} className="text-lg" />
            <span className="ml-2">livraison en cours</span>
          </li>
          <li className="flex items-center gap-3 px-2 py-2 rounded-l-full text-[#222] font-normal text-base mb-1 w-[90%] hover:bg-gray-100 cursor-pointer">
            <FontAwesomeIcon icon={faClockRotateLeft} className="text-lg" />
            <span className="ml-2">historique des livraisons</span>
          </li>
          <li className="flex items-center gap-3 px-2 py-2 rounded-l-full text-[#222] font-normal text-base mb-1 w-[90%] hover:bg-gray-100 cursor-pointer">
            <FontAwesomeIcon icon={faUser} className="text-lg" />
            <span className="ml-2">compte Livreur</span>
          </li>
        </ul>
      </div>
      {/* Settings */}
      <div className="mb-2 ml-2">
        <div className="flex items-center gap-3 px-2 py-1 text-gray-500 text-sm">
          <FontAwesomeIcon icon={faCog} className="text-base" />
          <span className="ml-2">Settings</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
