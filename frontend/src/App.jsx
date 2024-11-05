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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() =>{
    const token = localStorage.getItem('token');
    if (token){
      setIsAuthenticated(true);
    }else{
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
              <Route path="/1" element={<Schedule />} />
              <Route path="/2" element={<Messages />} />
              <Route path="/3" element={<Calendar />} />
              <Route path="/4" element={<Attendance />} />
              <Route path="/5" element={<Homework />} />
            </>
          ) : (
            <Route path="*" element={<Login onLogin={handleLogin} />} />
          )}
        </Routes>
        {isAuthenticated && (
          <Sidebar onLogout={handleLogout}>
            <SidebarItem icon={<LayoutDashboard size={20} />} text="Home" path="/" active />
            <SidebarItem icon={<LayoutDashboard size={20} />} text="Schedule" path="/1" />
            <SidebarItem icon={<LayoutDashboard size={20} />} text="Messages" path="/2" />
            <SidebarItem icon={<LayoutDashboard size={20} />} text="Calendar" path="/3" />
            <SidebarItem icon={<LayoutDashboard size={20} />} text="Attendance" path="/4" />
            <SidebarItem icon={<LayoutDashboard size={20} />} text="Homework" path="/5" />
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
