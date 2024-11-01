/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Locate, MapPin, X } from 'lucide-react';
import Button from "../components/Button";
import {
  dayNames,
  monthNames,
  displayMonthNames,
  monthNumbers,
  getDaysInMonth,
  areDatesEqual,
  getYearForMonthIndex
} from '../utils/SchedCalUtils';

const Modal = ({ isOpen, onClose, events, date }) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    } else {
      document.removeEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      <div
        className="bg-white rounded-xl py-5 px-7 shadow-sm z-50 max-w-md w-full mx-8 sm:mx-0 transform transition-all duration-300 opacity-100 scale-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div>
          <div className="flex justify-between items-center">
            <h2 id="modal-title" className="text-xl font-bold text-textBg-900">
              Events
            </h2>

            <button
              onClick={onClose}
              className="text-textBg-900 focus:outline-none"
              aria-label="Zamknij modal"
            >
             <X size={24} />
            </button>
          </div>
          
          <p className='text-sm text-textBg-600 mt-2'>
            All events on {date.toLocaleDateString()}
          </p>
        </div>

        <div className="mt-6 space-y-4 max-h-92 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-sm text-gray-500">Brak dodatkowych wydarzeń.</p>
          ) : (
            events.map((event, index) => (
              <div key={index}>
                <p className={`text-sm font-semibold mb-[6px] text-primary-500`}>
                  {event.title}
                </p>
                <div className='flex flex-col gap-2'>
                  <div className='flex w-full'>
                    <div className='flex gap-1 items-center w-24'>
                      <Clock size={14} color="#9095a1" />
                      <p className='text-sm text-textBg-500'>Time</p>
                    </div>
                    <p className='text-sm text-textBg-900'>
                      {event.hour}
                    </p>
                  </div>
                  <div className='flex w-full'>
                    <div className='flex gap-1 items-center w-24'>
                      <MapPin size={14} color="#9095a1" />
                      <p className='text-sm text-textBg-500'>Room</p>
                    </div>
                    <p className='text-sm text-textBg-900'>
                      {event.room}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button size="m" type="primary" text="Close" onClick={onClose}/>
        </div>
      </div>
    </div>
  );
};

const today = new Date();
let baseYear = today.getFullYear();
if (today.getMonth() < 8) { 
  baseYear -= 1;
}

const eventsData = [
  { 
    title: 'PE Exam', 
    hour: '07:00 AM', 
    room: '101', 
    bgColor: 'bg-[#f3f4f6]', 
    date: new Date(baseYear, 8, 1), 
    textColor: 'text-[#6f7787]' 
  },
  { 
    title: 'Biology Exam', 
    hour: '10:00 AM', 
    room: '102', 
    bgColor: 'bg-[#1A99EE]', 
    date: new Date(baseYear, 8, 1), 
    textColor: 'text-[#000]' 
  },
  { 
    title: 'Biology Exam', 
    hour: '10:00 AM', 
    room: '103', 
    bgColor: 'bg-[#1A99EE]', 
    date: new Date(baseYear, 8, 1), 
    textColor: 'text-[#000]' 
  },
  { 
    title: 'Chemistry Exam', 
    hour: '10:00 AM', 
    room: '104', 
    bgColor: 'bg-[#1A99EE]', 
    date: new Date(baseYear, 8, 1), 
    textColor: 'text-[#000]' 
  },
  { 
    title: 'Math Exam', 
    hour: '10:00 AM', 
    room: '105', 
    bgColor: 'bg-[#1A99EE]', 
    date: new Date(baseYear, 8, 1), 
    textColor: 'text-[#000]' 
  },
  { 
    title: 'Physics Exam', 
    hour: '10:00 AM', 
    room: '106', 
    bgColor: 'bg-[#1A99EE]', 
    date: new Date(baseYear, 8, 1), 
    textColor: 'text-[#000]' 
  },
  { 
    title: 'Math Exam', 
    hour: '03:30 PM', 
    room: '201', 
    bgColor: 'bg-[#f1f9fe]', 
    date: new Date(baseYear, 8, 2), 
    textColor: 'text-[#0f7bc4]' 
  },
  { 
    title: 'Physics Exam', 
    hour: '05:00 PM', 
    room: '202', 
    bgColor: 'bg-[#F5C747]', 
    date: new Date(baseYear, 8, 3), 
    textColor: 'text-[#000]' 
  },
  { 
    title: 'Physics Exam', 
    hour: '05:00 PM', 
    room: '203', 
    bgColor: 'bg-[#F5C747]', 
    date: new Date(baseYear, 8, 4), 
    textColor: 'text-[#000]' 
  },
  { 
    title: 'Physics Exam', 
    hour: '05:00 PM', 
    room: '204', 
    bgColor: 'bg-[#F5C747]', 
    date: new Date(baseYear, 8, 5), 
    textColor: 'text-[#000]' 
  },
  { 
    title: 'Physics Exam', 
    hour: '05:00 PM', 
    room: '205', 
    bgColor: 'bg-[#F5C747]', 
    date: new Date(baseYear, 8, 6), 
    textColor: 'text-[#000]' 
  },
  { 
    title: 'Physics Exam', 
    hour: '05:00 PM', 
    room: '206', 
    bgColor: 'bg-[#F5C747]', 
    date: new Date(baseYear + 1, 3, 1), 
    textColor: 'text-[#000]' 
  },
  { 
    title: 'Physics Exam', 
    hour: '05:00 PM', 
    room: '207', 
    bgColor: 'bg-[#F5C747]', 
    date: new Date(baseYear, 9, 1), 
    textColor: 'text-[#000]' 
  },
];

const getEventsForDate = (date) => {
  return eventsData.filter(event => areDatesEqual(event.date, date));
};

export const CalendarMonth = () => {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(() => {
    const currentMonthName = monthNames[today.getMonth()];
    const initialMonthIndex = displayMonthNames.indexOf(currentMonthName);
    return initialMonthIndex !== -1 ? initialMonthIndex : 0;
  });

  const [daysInMonth, setDaysInMonth] = useState(
    getDaysInMonth(monthNumbers[currentMonthIndex], getYearForMonthIndex(currentMonthIndex, baseYear))
  );

  useEffect(() => {
    setDaysInMonth(getDaysInMonth(monthNumbers[currentMonthIndex], getYearForMonthIndex(currentMonthIndex, baseYear)));
  }, [currentMonthIndex, baseYear]);

  const handlePrev = () => {
    setCurrentMonthIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleNext = () => {
    setCurrentMonthIndex((prevIndex) => Math.min(prevIndex + 1, displayMonthNames.length - 1));
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEvents, setModalEvents] = useState([]);
  const [modalDate, setModalDate] = useState(null);

  const openModal = (events, date) => {
    setModalEvents(events);
    setModalDate(date);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalEvents([]);
    setModalDate(null);
  };

  const MAX_EVENTS_DISPLAY = 2;

  return (
    <div className='flex flex-col w-full'>
      <div className='flex items-center justify-between mb-8 gap-1'>
        <p className="text-textBg-700 w-full font-bold text-base flex flex-col sm:flex-row">
          <span className="block text-base sm:text-xl lg:text-2xl font-semibold">
            {today.getDate()} {monthNames[today.getMonth()]} {today.getFullYear()}
          </span>
        </p>
      </div>

      <div className='flex justify-between items-center mb-8'>
        <button
          onClick={handlePrev}
          disabled={currentMonthIndex === 0}
          className={`grid place-content-center w-8 h-8 bg-textBg-200 rounded ${
            currentMonthIndex === 0 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-textBg-300 hover:cursor-pointer'
          }`}
          aria-label="Previous month"
        >
          <ChevronLeft size={24} />
        </button>

        <p className="text-xl font-medium">
          {monthNames[monthNumbers[currentMonthIndex]]} {getYearForMonthIndex(currentMonthIndex, baseYear)}
        </p>

        <button
          onClick={handleNext}
          disabled={currentMonthIndex === displayMonthNames.length - 1}
          className={`grid place-content-center w-8 h-8 bg-textBg-200 rounded ${
            currentMonthIndex === displayMonthNames.length - 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-textBg-300 hover:cursor-pointer'
          }`}
          aria-label="Next month"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {dayNames.map((dayName, index) => {
          const isWeekend = index === 5 || index === 6;
          return (
            <div key={index} className="w-full flex justify-center items-center">
              <p className={`text-base text-center ${isWeekend ? 'text-primary-600' : 'text-textBg-500'}`}>
                {dayName}
              </p>
            </div>
          );
        })}
      </div>
      
      <div className="w-full grid grid-cols-7 gap-0 border-r border-b border-textBg-200">
        {(() => {
          const monthIndex = currentMonthIndex;
          const monthNumber = monthNumbers[monthIndex];
          const year = getYearForMonthIndex(currentMonthIndex, baseYear);

          const firstDayOfMonth = new Date(year, monthNumber, 1).getDay();
          const blanks = (firstDayOfMonth + 6) % 7;

          const prevMonthIndex = (monthIndex === 0) ? displayMonthNames.length - 1 : monthIndex - 1;
          const prevMonthNumber = monthNumbers[prevMonthIndex];
          const prevMonthYear = getYearForMonthIndex(prevMonthIndex, baseYear);
          const daysInPrevMonth = getDaysInMonth(prevMonthNumber, prevMonthYear);

          const prevMonthDays = Array.from({ length: blanks }, (_, idx) => {
            return new Date(prevMonthYear, prevMonthNumber, daysInPrevMonth - blanks + idx + 1);
          });

          const currentMonthDays = Array.from({ length: daysInMonth }, (_, dayIdx) => {
            return new Date(year, monthNumber, dayIdx + 1);
          });

          const totalDays = prevMonthDays.length + currentMonthDays.length;
          const weeks = Math.ceil(totalDays / 7);

          const nextMonthIndex = (monthIndex + 1) % displayMonthNames.length;
          const nextMonthNumber = monthNumbers[nextMonthIndex];
          const nextMonthYear = getYearForMonthIndex(nextMonthIndex, baseYear);
          const remainingDays = weeks * 7 - totalDays;
          const nextMonthDays = Array.from({ length: remainingDays }, (_, idx) => {
            return new Date(nextMonthYear, nextMonthNumber, idx + 1);
          });

          const datesToRender = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

          return datesToRender.map((currentDate, idx) => {
            const dayNumber = currentDate.getDate();
            const isCurrentMonth = currentDate.getMonth() === monthNumber && currentDate.getFullYear() === year;
            const dayOfWeek = currentDate.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            const isToday = areDatesEqual(currentDate, today);
            const dayEvents = getEventsForDate(currentDate);

            return (
              <div
                key={idx}
                className={`p-2 overflow-hidden h-24 flex flex-col justify-start items-start border-t border-l border-textBg-200 bg-textBg-100
                }`}
              >
                <p className={`text-sm font-medium mb-1
                  ${isToday && isCurrentMonth ? 'text-primary-600 font-black' : 
                    isWeekend && isCurrentMonth ? 'text-primary-600' :
                    isCurrentMonth ? 'text-textBg-700' : 
                    'text-textBg-300'}
                `}>
                  {dayNumber}
                </p>
                
                {isCurrentMonth && dayEvents.slice(0, MAX_EVENTS_DISPLAY).map((event, eventIdx) => (
                  <div key={eventIdx} className='flex items-center gap-2'>
                    <div className={`w-[6px] h-[6px] rounded-full ${event.bgColor}`}/>
                    <p className={`text-xs font-semibold ${event.textColor}`}>
                      {event.title}
                    </p>
                  </div>
                ))}


                {isCurrentMonth && dayEvents.length > MAX_EVENTS_DISPLAY && (
                  <button
                    onClick={() => openModal(dayEvents.slice(MAX_EVENTS_DISPLAY), currentDate)}
                    className="ml-3 mt-1 text-xs text-textBg-500 hover:underline"
                  >
                    +{dayEvents.length - MAX_EVENTS_DISPLAY} events
                  </button>
                )}
              </div>
            );
          });
        })()}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        events={modalEvents}
        date={modalDate}
      />
    </div>
  );
};
