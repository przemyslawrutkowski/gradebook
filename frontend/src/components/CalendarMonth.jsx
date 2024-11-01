import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  dayNames,
  monthNames,
  displayMonthNames,
  monthNumbers,
  getDaysInMonth,
  areDatesEqual,
  getYearForMonthIndex
} from '../utils/SchedCalUtils';

// Komponent Modalny
const Modal = ({ isOpen, onClose, events, date }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg w-80 p-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          &times;
        </button>
        <h2 className="text-lg font-semibold mb-4">
          Wydarzenia - {date.toLocaleDateString()}
        </h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {events.map((event, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${event.bgColor}`} />
              <p className={`text-sm font-semibold ${event.textColor}`}>
                {event.title}
              </p>
            </div>
          ))}
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
  { title: 'PE Exam', startTime: '07:00 AM', endTime: '09:00 AM', bgColor: 'bg-[#f3f4f6]', date: new Date(baseYear, 8, 1), textColor: 'text-[#6f7787]' },
  { title: 'Biology Exam', startTime: '10:00 AM', endTime: '01:00 PM', bgColor: 'bg-[#1A99EE]', date: new Date(baseYear, 8, 1), textColor: 'text-[#000]' },
  { title: 'Biology Exam', startTime: '10:00 AM', endTime: '01:00 PM', bgColor: 'bg-[#1A99EE]', date: new Date(baseYear, 8, 1), textColor: 'text-[#000]' },
  { title: 'Biology Exam', startTime: '10:00 AM', endTime: '01:00 PM', bgColor: 'bg-[#1A99EE]', date: new Date(baseYear, 8, 1), textColor: 'text-[#000]' },
  { title: 'Biology Exam', startTime: '10:00 AM', endTime: '01:00 PM', bgColor: 'bg-[#1A99EE]', date: new Date(baseYear, 8, 1), textColor: 'text-[#000]' },
  { title: 'Biology Exam', startTime: '10:00 AM', endTime: '01:00 PM', bgColor: 'bg-[#1A99EE]', date: new Date(baseYear, 8, 1), textColor: 'text-[#000]' },
  { title: 'Math Exam', startTime: '03:30 PM', endTime: '05:00 PM', bgColor: 'bg-[#f1f9fe]', date: new Date(baseYear, 8, 2), textColor: 'text-[#0f7bc4]' },
  { title: 'Physics Exam', startTime: '05:00 PM', endTime: '06:00 PM', bgColor: 'bg-[#F5C747]', date: new Date(baseYear, 8, 3), textColor: 'text-[#000]' },
  { title: 'Physics Exam', startTime: '05:00 PM', endTime: '06:00 PM', bgColor: 'bg-[#F5C747]', date: new Date(baseYear, 8, 4), textColor: 'text-[#000]' },
  { title: 'Physics Exam', startTime: '05:00 PM', endTime: '06:00 PM', bgColor: 'bg-[#F5C747]', date: new Date(baseYear, 8, 5), textColor: 'text-[#000]' },
  { title: 'Physics Exam', startTime: '05:00 PM', endTime: '06:00 PM', bgColor: 'bg-[#F5C747]', date: new Date(baseYear, 8, 6), textColor: 'text-[#000]' },
  { title: 'Physics Exam', startTime: '05:00 PM', endTime: '06:00 PM', bgColor: 'bg-[#F5C747]', date: new Date(baseYear + 1, 3, 1), textColor: 'text-[#000]' },
  { title: 'Physics Exam', startTime: '05:00 PM', endTime: '06:00 PM', bgColor: 'bg-[#F5C747]', date: new Date(baseYear, 9, 1), textColor: 'text-[#000]' },
];

// Funkcja pomocnicza do pobierania wydarzeń dla danej daty
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

  // Stan dla modala
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEvents, setModalEvents] = useState([]);
  const [modalDate, setModalDate] = useState(null);

  // Funkcja otwierająca modal
  const openModal = (events, date) => {
    setModalEvents(events);
    setModalDate(date);
    setIsModalOpen(true);
  };

  // Funkcja zamykająca modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalEvents([]);
    setModalDate(null);
  };

  // Maksymalna liczba wydarzeń do wyświetlenia przed oznaczeniem "+X"
  const MAX_EVENTS_DISPLAY = 2;

  return (
    <div className='flex flex-col w-full'>
      {/* Nagłówek z bieżącą datą */}
      <div className='flex items-center justify-between mb-8 gap-1'>
        <p className="text-textBg-700 w-full font-bold text-base flex flex-col sm:flex-row">
          <span className="block text-base sm:text-xl lg:text-2xl font-semibold">
            {today.getDate()} {monthNames[today.getMonth()]} {today.getFullYear()}
          </span>
        </p>
      </div>

      {/* Nawigacja między miesiącami */}
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

      {/* Nagłówki dni tygodnia */}
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
      
      {/* Tabela dni */}
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
                
                {/* Renderowanie wydarzeń tylko jeśli jest to bieżący miesiąc */}
                {isCurrentMonth && dayEvents.slice(0, MAX_EVENTS_DISPLAY).map((event, eventIdx) => (
                  <div key={eventIdx} className='flex items-center gap-2'>
                    <div className={`w-2 h-2 rounded-full ${event.bgColor}`}/>
                    <p className={`text-xs font-semibold ${event.textColor}`}>
                      {event.title}
                    </p>
                  </div>
                ))}

                {/* Jeśli jest więcej wydarzeń niż MAX_EVENTS_DISPLAY, dodaj przycisk "+X wydarzeń" */}
                {isCurrentMonth && dayEvents.length > MAX_EVENTS_DISPLAY && (
                  <button
                    onClick={() => openModal(dayEvents.slice(MAX_EVENTS_DISPLAY), currentDate)}
                    className="mt-1 text-xs text-blue-500 hover:underline"
                  >
                    +{dayEvents.length - MAX_EVENTS_DISPLAY} wydarzeń
                  </button>
                )}
              </div>
            );
          });
        })()}
      </div>

      {/* Komponent Modalny */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        events={modalEvents}
        date={modalDate}
      />
    </div>
  );
};
