import React, { useEffect, useState, createContext } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import Sidebar, { SidebarItem } from './components/Sidebar';
import Topbar from './components/Topbar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Schedule } from './pages/Schedule';
import { Messages } from './pages/Messages';
import { CalendarEvents } from './pages/CalendarEvents';
import { Attendance } from './pages/Attendance';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { Homework } from './pages/Homework';
import HomeworkDetail from './pages/HomeworkDetail';
import { Grades } from './pages/Grades';
import { Classes } from './pages/Classes';
import ClassDetails from './pages/ClassDetails';
import UserRoles from './data/userRoles';
import { getToken, getUserRole, decodeToken } from './utils/UserRoleUtils';
import { Students } from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import ClassNames from './pages/ClassNames';
import SchoolYears from './pages/SchoolYears';
import SchoolYearsDetails from './pages/SchoolYearDetails';
import { SocketProvider } from './context/SocketContext';
import { Subjects } from './pages/Subjects';

export const AuthContext = createContext();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); 
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    const storedUserId = localStorage.getItem('userId');

    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setUserRole(getUserRole());
        setUserId(storedUserId); 
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
        setUserId(null);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogin = () => {
    const token = getToken();
    const storedUserId = localStorage.getItem('userId');

    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setUserRole(getUserRole());
        setUserId(storedUserId); 
        setIsAuthenticated(true);
        navigate('/');
      } else {
        console.error('Nieprawidłowy token.');
        setIsAuthenticated(false);
        setUserRole(null);
        setUserId(null);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId'); 
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
    navigate('/login');
  };

  return (
    <SocketProvider>
      <AuthContext.Provider value={{ isAuthenticated, userRole, userId, handleLogin, handleLogout }}>
        {isAuthenticated && (
          <Topbar messNot messNotNumber={10} bellNot bellNotNumber={10} onLogout={handleLogout}/>
        )}
        <div className="flex">
          {isAuthenticated && (
            <Sidebar onLogout={handleLogout}>
              {userRole === UserRoles.Student  && (
                <>
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Home" path="/" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Schedule" path="/schedule" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Messages" path="/messages" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Calendar" path="/calendar" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Attendance" path="/attendance" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Homework" path="/homework" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Grades" path="/grades" />
                </>
              )}  
             
              {(userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) && (
                <>
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Students" path="/students" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Classes" path="/classes" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Schedule" path="/schedule" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Class Names" path="/class-names" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="School Years" path="/school-years" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Messages" path="/messages" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Subjects" path="/subjects" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Homework" path="/homework" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Calendar" path="/calendar" />
                </>
              )}
              
              <SidebarItem
                icon={<LogOut size={20} />}
                text="Logout"
                path="#"
                onClick={handleLogout}
                className="lg:hidden"
              />
            </Sidebar>
          )}
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            {isAuthenticated ? (
              <>
                <Route path="/schedule" element={<Schedule />} />
                {userRole === UserRoles.Student && (
                  <>
                    <Route path="/" element={<Home />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/calendar" element={<CalendarEvents />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/homework" element={<Homework />} />
                    <Route path="/homework/:id" element={<HomeworkDetail />} />
                    <Route path="/grades" element={<Grades />} />
                  </>
                )}
               
                {(userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) && (
                  <>
                    <Route path="students" element={<Students />} />
                    <Route path="/students/:id" element={<StudentDetails />} />
                    <Route path="/classes" element={<Classes />} />
                    <Route path="/classes/:id" element={<ClassDetails />} />
                    <Route path="/class-names" element={<ClassNames />} />
                    <Route path="/school-years" element={<SchoolYears />} />
                    <Route path="/school-years/:id" element={<SchoolYearsDetails />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/subjects" element={<Subjects />} />
                    <Route path="/homework" element={<Homework />} />
                    <Route path="/homework/:id" element={<HomeworkDetail />} />
                    <Route path="/calendar" element={<CalendarEvents />} />
                  </>
                )}
              </>
            ) : (
              <Route path="*" element={<Login onLogin={handleLogin} />} />
            )}
          </Routes>
        </div>
      </AuthContext.Provider>
    </SocketProvider>
  );
}  
