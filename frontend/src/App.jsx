/* eslint-disable no-unused-vars */
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Sidebar, { SidebarItem } from './components/Sidebar';
import Topbar from './components/Topbar';
import { Home } from './pages/Home';
import React from "react";
import {  Boxes,  UserCircle,  LayoutDashboard } from 'lucide-react';
import { Schedule } from './pages/Schedule';


export default function App() {
  return (
    <>  
    <Topbar messNot messNotNumber={10} bellNot bellNotNumber={10}/>
    <div className="flex">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/1" element={<Schedule />} />
      </Routes>
      <Sidebar>
        <SidebarItem icon={<LayoutDashboard size={20} />} text="Home" path="/" active/>
        <SidebarItem icon={<LayoutDashboard size={20} />} text="Home" path="/1"/>
      </Sidebar> 
    </div>
    </>
  );
}
