/* eslint-disable no-unused-vars */
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Sidebar, { SidebarItem } from './components/Sidebar';
import Topbar from './components/Topbar';
import { Home } from './pages/Home';
import React from "react";
import {  Boxes,  UserCircle,  LayoutDashboard } from 'lucide-react';


export default function App() {
  return (
    <>  
    <Topbar messNot messNotNumber={10} bellNot bellNotNumber={10}/>
    <div className="flex">
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <Sidebar>
        <SidebarItem icon={<LayoutDashboard size={20} />} text="Home" path="/" active/>
      </Sidebar> 
    </div>
    </>
  );
}
