/* eslint-disable react/prop-types */
import { LogOut, Menu, X } from "lucide-react";
import { createContext, useState } from "react";
import { Link, useLocation } from 'react-router-dom';

const SidebarContext = createContext();

export default function Sidebar({ children, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <aside className="fixed z-50 top-0 left-0 pb-1 lg:h-full w-screen lg:w-64 bg-white border-b">
        <nav className="h-full flex flex-col">
          <div className="p-4 pb-2 flex justify-between items-center h-12">
            <img
              src="https://img.logoipsum.com/297.svg"
              className="w-32 lg:mt-4"
              alt="LogoIpsum"
            />
            <button
              className="lg:hidden p-1.5 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <SidebarContext.Provider value={{ isMobileMenuOpen }}>
            <ul
              className={`
                flex-1 px-3 lg:block mt-5
                ${isMobileMenuOpen ? 'block' : 'hidden'} lg:h-auto lg:overflow-y-auto
              `}
            >
              {children}
            </ul>
          </SidebarContext.Provider>      
        </nav>
      </aside>
    </>
  );
}

export function SidebarItem({ icon, text, path, alert, onClick, className }) {
  const location = useLocation();
  const isActive = location.pathname === path;
  return (
    <Link
      to={path}
      onClick={onClick}
      className={`relative flex items-center py-3 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors ${className}
        ${isActive ? "bg-primary-100 text-primary-500" : "hover:bg-textBg-200 text-textBg-600"}
    `}
    >
      {icon}
      <span className="w-52 ml-3">{text}</span>
      {alert && <div className="absolute right-2 w-2 h-2 rounded bg-primary-500" />}
    </Link>
  );
} 
