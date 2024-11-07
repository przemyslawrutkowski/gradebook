import React, { useState } from 'react';
import { Mail, Bell, User, ChevronDown, Search, LogOut, Settings } from 'lucide-react';

export default function Topbar({ messNot, messNotNumber, bellNot, bellNotNumber, onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="hidden lg:flex justify-end py-3 px-8 gap-8 items-center w-full pt whitespace-nowrap bg-textBg-100">
      <div className="h-9 flex items-center px-3 py-3 bg-white rounded border border-solid border-neutral-400 text-textBg-700">
        <Search size={16} className="mr-2 text-textBg-700" />
        <input type="text" placeholder="Search" className="w-96 focus:outline-none text-sm" />
      </div>

      <div className="relative">
        {messNot && (
          <div className="absolute h-4 w-4 rounded-full bg-red-500 -right-1 -top-1 flex items-center justify-center">
            <p className="text-[8px] text-textBg-100">{messNotNumber > 9 ? '9+' : messNotNumber}</p>
          </div>
        )}
        <Mail size={24} className="text-textBg-700 hover:cursor-pointer" />
      </div>

      <div className="relative">
        {bellNot && (
          <div className="absolute h-4 w-4 rounded-full bg-red-500 -right-1 -top-1 flex items-center justify-center">
            <p className="text-[8px] text-textBg-100">{bellNotNumber > 9 ? '9+' : bellNotNumber}</p>
          </div>
        )}
        <Bell size={24} className="text-textBg-700 hover:cursor-pointer" />
      </div>

      <div className="relative">
        <div className="flex flex-row items-center hover:cursor-pointer" onClick={toggleDropdown}>
          <div className="bg-primary-500 w-9 h-9 rounded-full flex items-center justify-center">
            <User size={18} className="text-textBg-100" />
          </div>
          <ChevronDown size={24} className="text-textBg-700 ml-4" />
        </div>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-textBg-300 rounded shadow-2xl z-50 transition">
            <button
              onClick={onLogout}
              className="block w-full text-left px-4 py-2 text-sm text-textBg-700 hover:bg-gray-100"
            >
              <LogOut size={18} className="inline-block mr-2" />
              Logout
            </button>
            <button className="block w-full text-left px-4 py-2 text-sm text-textBg-700 hover:bg-gray-100">
              <Settings size={18} className="inline-block mr-2" />
              Settings
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
