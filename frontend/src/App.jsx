// ./App.jsx
import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import Sidebar, { SidebarItem } from './components/Sidebar';
import Topbar from './components/Topbar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Schedule } from './pages/Schedule';
import { Messages } from './pages/Messages';
import { Calendar } from './pages/Calendar';
import { Attendance } from './pages/Attendance';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { Homework } from './pages/Homework';
import HomeworkDetail from './pages/HomeworkDetail'; // Import komponentu
import { Grades } from './pages/Grades';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() =>{
    const token = localStorage.getItem('token');
    if (token){
      setIsAuthenticated(true);
    } else {
      navigate('/login');
    }
  }, [navigate])

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <>  
      {isAuthenticated && (
        <Topbar messNot messNotNumber={10} bellNot bellNotNumber={10} onLogout={handleLogout}/>
      )}
      <div className="flex">
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        {isAuthenticated ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/homework" element={<Homework />} />
            <Route path="/homework/:id" element={<HomeworkDetail />} />
            <Route path="/grades" element={<Grades />} />
          </>
        ) : (
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        )}
      </Routes>
        {isAuthenticated && (
         <Sidebar onLogout={handleLogout}>
         <SidebarItem icon={<LayoutDashboard size={20} />} text="Home" path="/" active />
         <SidebarItem icon={<LayoutDashboard size={20} />} text="Schedule" path="/schedule" />
         <SidebarItem icon={<LayoutDashboard size={20} />} text="Messages" path="/messages" />
         <SidebarItem icon={<LayoutDashboard size={20} />} text="Calendar" path="/calendar" />
         <SidebarItem icon={<LayoutDashboard size={20} />} text="Attendance" path="/attendance" />
         <SidebarItem icon={<LayoutDashboard size={20} />} text="Homework" path="/homework" />
         <SidebarItem icon={<LayoutDashboard size={20} />} text="Grades" path="/grades" />
         <SidebarItem
           icon={<LogOut size={20} />}
           text="Logout"
           path="#"
           onClick={handleLogout}
           className="lg:hidden"
         />
       </Sidebar>
        )}
      </div>
    </>
  );
}