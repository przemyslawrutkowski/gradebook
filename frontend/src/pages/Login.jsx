/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cloud,
  Heart,
  Star,
  Sun,
  Moon,
  AlertTriangle,
  Bell,
  Camera,
  Feather,
  Gift,
  Zap,
  Book,
  CameraOff,
  Coffee,
  Music,
  Pencil,
  ShoppingBag,
  Trash,
  User,
  Wifi,
  ZapOff,
} from 'lucide-react';
import Button from '../components/Button';

export function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [token, setToken] = useState();
  const [userId, setUserId] = useState();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('http://localhost:3000/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        const token = data.token || data.data?.jwt || data.jwt; 
        if (!token) {
          throw new Error('Token nie został znaleziony w odpowiedzi serwera.');
        }
  
        const userId = data.data?.id || data.id;
        if (!userId) {
          throw new Error('ID użytkownika nie zostało znalezione w odpowiedzi serwera.');
        }
        console.log(userId);
  
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
  
        setToken(token);
        setUserId(userId);
        onLogin();
        navigate('/');
      } else {
        setError(data.message || 'Wystąpił błąd podczas logowania.');
      }
    } catch (error) {
      console.error('Błąd podczas logowania:', error);
      setError('Wystąpił błąd podczas logowania.');
    }
  };
  return (
    <div className="relative h-svh sm:h-screen w-screen flex items-center justify-center bg-white overflow-hidden">

      <div className="absolute -bottom-[800px] -left-[400px] w-[1280px] h-[1280px] bg-[#fafafb] rounded-full"></div>
      <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] bg-[#fafafb] rounded-full"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#fafafb] rounded-full"></div>
      <div className="absolute -top-[52rem] left-[12rem] w-[64rem] h-[64rem] bg-[#fafafb] rounded-full"></div>
     
      <Cloud className="hidden sm:block absolute top-20 left-20 text-blue-400 opacity-70 w-16 h-16 animate-float"/>
      <Heart className="hidden sm:block absolute bottom-20 right-32 text-red-400 opacity-70 w-12 h-12 animate-float-reverse"/>
      <Star className="hidden sm:block absolute top-1/2 left-64 text-yellow-400 opacity-60 w-14 h-14 animate-float"/>
      <Sun className="hidden sm:block absolute bottom-1/3 left-2/3 text-yellow-300 opacity-50 w-20 h-20 animate-float"/>
      <Moon className="hidden sm:block absolute top-3/4 right-[30rem] text-purple-400 opacity-65 w-12 h-12 animate-float-reverse"/>
      <AlertTriangle className="hidden sm:block absolute top-3/4 left-[28rem] text-orange-400 opacity-60 w-16 h-16 animate-float"/>
      <Bell className="hidden sm:block absolute top-48 left-64 text-green-400 opacity-70 w-14 h-14 animate-float"/>
      <Camera className="hidden sm:block absolute top-16 right-32 text-pink-400 opacity-60 w-12 h-12 animate-float-reverse"/>
      <Feather className="hidden sm:block absolute top-12 left-1/4 text-indigo-400 opacity-65 w-16 h-16 animate-float"/>
      <Gift className="hidden sm:block absolute bottom-16 left-1/6 text-purple-300 opacity-50 w-20 h-20 animate-float-reverse"/>
      <Zap className="hidden sm:block absolute bottom-24 right-1/3 text-yellow-500 opacity-60 w-14 h-14 animate-float"/>
      <Book className="hidden sm:block absolute top-1/3 left-10 text-teal-400 opacity-60 w-12 h-12 animate-float-reverse"/>
      <Coffee className="hidden sm:block absolute bottom-10 left-40 text-brown-400 opacity-55 w-16 h-16 animate-float"/>
      <Music className="hidden sm:block absolute bottom-1/2 right-10 text-purple-500 opacity-60 w-16 h-16 animate-float"/>
      <Pencil className="hidden sm:block absolute top-28 left-[50%] text-gray-500 opacity-50 w-12 h-12 animate-float-reverse"/>
      <ShoppingBag className="hidden sm:block absolute bottom-60 left-20 text-pink-500 opacity-60 w-14 h-14 animate-float"/>
      <Trash className="hidden sm:block absolute top-[47%] text-red-400 opacity-55 w-12 h-12 animate-float-reverse"/>
      <User className="hidden sm:block absolute bottom-2/3 left-1/3 text-blue-500 opacity-60 w-16 h-16 animate-float"/>
      <Wifi className="hidden sm:block absolute top-[20rem] right-[15%] text-blue-300 opacity-50 w-14 h-14 animate-float"/>
      <ZapOff className="hidden sm:block absolute bottom-1/3 right-[12rem] text-yellow-400 opacity-55 w-12 h-12 animate-float-reverse"/>
      <CameraOff className="hidden sm:block absolute top-2/3 left-[48rem] text-gray-400 opacity-50 w-14 h-14 animate-float"/>
      <Heart className="hidden sm:block absolute top-4 right-[36rem] text-red-500 opacity-70 w-16 h-16 animate-float-reverse"/>

      <Cloud className="sm:hidden absolute top-5 left-5 text-blue-300 opacity-60 w-10 h-10 animate-float"/>
      <Heart className="sm:hidden absolute bottom-5 right-5 text-red-300 opacity-60 w-10 h-10 animate-float-reverse"/>
      <Star className="sm:hidden absolute top-1/4 left-1/2 transform -translate-x-1/2 text-yellow-300 opacity-50 w-12 h-12 animate-float"/>
      <Sun className="sm:hidden absolute bottom-1/4 right-1/2 transform translate-x-1/2 text-yellow-200 opacity-50 w-14 h-14 animate-float"/>
      <Moon className="sm:hidden absolute top-10 right-10 text-purple-300 opacity-50 w-10 h-10 animate-float-reverse"/>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 2xl:gap-24 z-10 px-4">
        <div className="text-center lg:text-left">
          <h2 className="text-2xl sm:text-4xl font-normal text-textBg-600 mb-4">
            Great to have you back!
          </h2>
          <p className="text-textBg-500 text-base">
            Please login to continue accessing your account and stay connected.
          </p>
        </div>

        <div className="rounded-md px-8 py-24 border-primary-500 bg-white w-full max-w-md shadow-xl">
          <h2 className="font-epilogue text-3xl font-bold text-center mb-8 text-textBg-900">
            Sign in
          </h2>
          {error && (
            <p className="text-red-500 mb-4 text-center">{error}</p>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col justify-center gap-[2px] w-full bg-textBg-200 px-3 py-0 h-12 rounded-md">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-textBg-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none placeholder:text-textBg-400"
                placeholder="example.email@gmail.com"
                required
              />
            </div>
            <div className="flex flex-col justify-center gap-[2px] w-full bg-textBg-200 px-3 py-0 h-12 rounded-md">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-textBg-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none placeholder:text-textBg-400"
                placeholder="password"
                required
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary-500"
                />
                <span className="ml-2 text-sm text-textBg-900">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-sm text-primary-500 hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <Button
              text="Sign In"
              type="submit"
              className="w-full bg-primary-500 text-white py-2 rounded-md hover:bg-primary-600 transition"
            />
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        @keyframes float-reverse {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(20px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: float-reverse 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
