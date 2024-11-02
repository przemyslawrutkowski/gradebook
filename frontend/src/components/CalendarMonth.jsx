import React, { useState, useEffect } from 'react';
import { Atom, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import {
  dayNames,
  monthNames,
  displayMonthNames,
  monthNumbers,
  convertTimeToHours,
  getCurrentTimePosition,
  getDaysInMonth,
  areDatesEqual,
  getStartOfWeek,
  formatWeekRange,
  getYearForMonthIndex
} from '../utils/SchedCalUtils';

let datesToRender = [];

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
      textColor: 'text-[#6f7787]',
      type: 'Exam' 
    },
    { 
      title: 'Biology Exam', 
      hour: '10:00 AM', 
      room: '102', 
      bgColor: 'bg-[#1A99EE]', 
      date: new Date(baseYear, 8, 1), 
      textColor: 'text-[#000]',
      type: 'Quiz' 
    },
    { 
      title: 'Biology Exam', 
      hour: '10:00 AM', 
      room: '103', 
      bgColor: 'bg-[#1A99EE]', 
      date: new Date(baseYear, 8, 1), 
      textColor: 'text-[#000]',
      type: 'Exam' 
    },
    { 
      title: 'Chemistry Exam', 
      hour: '10:00 AM', 
      room: '104', 
      bgColor: 'bg-[#1A99EE]', 
      date: new Date(baseYear, 8, 1), 
      textColor: 'text-[#000]',
      type: 'Exam' 
    },
    { 
      title: 'Math Exam', 
      hour: '10:00 AM', 
      room: '105', 
      bgColor: 'bg-[#1A99EE]', 
      date: new Date(baseYear, 8, 1), 
      textColor: 'text-[#000]',
      type: 'Exam' 
    },
    { 
      title: 'Physics Exam', 
      hour: '10:00 AM', 
      room: '106', 
      bgColor: 'bg-[#1A99EE]', 
      date: new Date(baseYear, 8, 1), 
      textColor: 'text-[#000]',
      type: 'Exam' 
    },
    { 
      title: 'Math Exam', 
      hour: '03:30 PM', 
      room: '201', 
      bgColor: 'bg-[#f1f9fe]', 
      date: new Date(baseYear, 8, 2), 
      textColor: 'text-[#0f7bc4]',
      type: 'Exam' 
    },
    { 
      title: 'Physics Exam', 
      hour: '05:00 PM', 
      room: '202', 
      bgColor: 'bg-[#F5C747]', 
      date: new Date(baseYear, 8, 3), 
      textColor: 'text-[#000]',
      type: 'Exam' 
    },
    { 
      title: 'Physics Exam', 
      hour: '05:00 PM', 
      room: '203', 
      bgColor: 'bg-[#F5C747]', 
      date: new Date(baseYear, 8, 4), 
      textColor: 'text-[#000]',
      type: 'Exam' 
    },
    { 
      title: 'Physics Exam', 
      hour: '05:00 PM', 
      room: '204', 
      bgColor: 'bg-[#F5C747]', 
      date: new Date(baseYear, 8, 5), 
      textColor: 'text-[#000]',
      type: 'Exam' 
    },
    { 
      title: 'Physics Exam', 
      hour: '05:00 PM', 
      room: '205', 
      bgColor: 'bg-[#F5C747]', 
      date: new Date(baseYear, 8, 6), 
      textColor: 'text-[#000]',
      type: 'Exam' 
    },
    { 
      title: 'Physics Exam', 
      hour: '05:00 PM', 
      room: '206', 
      bgColor: 'bg-[#F5C747]', 
      date: new Date(baseYear + 1, 3, 1), 
      textColor: 'text-[#000]',
      type: 'Other' 
    },
    { 
      title: 'Physics Exam', 
      hour: '05:00 PM', 
      room: '207', 
      bgColor: 'bg-[#F5C747]', 
      date: new Date(baseYear, 9, 1), 
      textColor: 'text-[#000]',
      type: 'Meeting' 
    },
  ];

  const eventTypeColors = {
    Exam: 'bg-blue-500',
    Quiz: 'bg-green-500',
    Other: 'bg-purple-500',
};

const getEventsForDate = (date) => {
    return eventsData.filter(event => areDatesEqual(event.date, date));
};

const CalendarMonth = () => {
  const [selectedDate, setSelectedDate] = useState(today);
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

  return (
    <div className='flex flex-col w-full'>
      <div className='flex items-center justify-between mb-8 gap-1'>
        <p className="text-textBg-700 w-full font-bold text-base flex flex-col sm:flex-row">
          {selectedDate ? (
              <>
                <span className="text-base sm:text-xl lg:text-2xl font-semibold">
                  {dayNames[(selectedDate.getDay() + 6) % 7]}, {selectedDate.getDate()}&nbsp;
                </span>
                <span className="block text-base sm:text-xl lg:text-2xl font-semibold">
                  {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </span>
              </>
            ) : (
              <span className="block text-base sm:text-xl lg:text-2xl font-semibold">
                {monthNames[monthNumbers[currentMonthIndex]]} {getYearForMonthIndex(currentMonthIndex, baseYear)}
              </span>
            )
          }
        </p>
      </div>

      <div className='flex flex-col xl:flex-row gap-16'>
        <div className='xl:w-fit'>
          <div className='flex justify-between items-center mb-4'>
            <button
              onClick={handlePrev}
              disabled={currentMonthIndex === 0}
              className={`grid place-content-center w-6 h-6 bg-textBg-200 rounded ${currentMonthIndex === 0 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-textBg-300 hover:cursor-pointer'}`}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>

            <p className="text-base">
              {monthNames[monthNumbers[currentMonthIndex]]} {getYearForMonthIndex(currentMonthIndex, baseYear)}
            </p>

            <button
              onClick={handleNext}
              disabled={currentMonthIndex === displayMonthNames.length - 1}
              className={`grid place-content-center w-6 h-6 bg-textBg-200 rounded ${currentMonthIndex === displayMonthNames.length - 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-textBg-300 hover:cursor-pointer'}`}
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-4">
            {dayNames.map((dayName, index) => {
              const isWeekend = index === 5 || index === 6;
              return (
                <div key={index} className="w-full flex justify-center items-center">
                  <p className={`font-semibold text-xs text-center ${isWeekend ? 'text-primary-600' : 'text-textBg-500'}`}>
                    {dayName.slice(0,1)}
                  </p>
                </div>
              );
            })}

            {(() => {
              const monthIndex = currentMonthIndex;
              const monthNumber = monthNumbers[monthIndex];
              const year = getYearForMonthIndex(monthIndex, baseYear);

              const firstDayOfMonth = new Date(year, monthNumber, 1).getDay();
              const blanks = (firstDayOfMonth + 6) % 7;

              const prevMonthIndex = (monthIndex === 0) ? displayMonthNames.length - 1 : monthIndex - 1;
              const prevMonthNumber = monthNumbers[prevMonthIndex];
              const prevMonthYear = getYearForMonthIndex(prevMonthIndex, baseYear);
              const daysInPrevMonth = getDaysInMonth(prevMonthNumber, prevMonthYear);

              const prevMonthDays = Array.from({ length: blanks }, (_, idx) => {
                const date = new Date(prevMonthYear, prevMonthNumber, daysInPrevMonth - blanks + idx + 1);
                return date;
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
                const date = new Date(nextMonthYear, nextMonthNumber, idx + 1);
                return date;
              });

              datesToRender = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

              return datesToRender.map((currentDate, idx) => {
                const dayNumber = currentDate.getDate();
                const isSelected = areDatesEqual(currentDate, selectedDate);
                const isCurrentMonth = currentDate.getMonth() === monthNumber && currentDate.getFullYear() === year;
                const dayOfWeek = currentDate.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const eventsForDate = getEventsForDate(currentDate);

                return (
                    <div key={idx} className="relative w-full flex flex-col justify-center items-center">
                      <p
                        className={`flex items-center justify-center text-base focus:outline-none
                          ${isSelected && isCurrentMonth ? 'w-6 h-6 -my-0.5' : 'w-8 h-8 -my-1'}
                          ${isCurrentMonth ? 'cursor-pointer' : 'cursor-not-allowed'}
                          ${isSelected && isCurrentMonth
                            ? 'rounded-full bg-primary-500 text-textBg-100'
                            : isCurrentMonth
                            ? 'bg-textBg-100'
                            : 'text-gray-300 bg-transparent'}
                          ${isCurrentMonth && isWeekend ? 'text-primary-600' : ''}
                        `}
                        onClick={() => isCurrentMonth && setSelectedDate(currentDate)}
                        aria-disabled={!isCurrentMonth}
                        aria-label={`${
                          isSelected ? 'Selected ' : ''
                        }${dayNames[(currentDate.getDay() + 6) % 7]}, ${currentDate.getDate()} ${
                          monthNames[currentDate.getMonth()]
                        } ${currentDate.getFullYear()}`}
                      >
                        {dayNumber}
                      </p>
                      <div
                        className={`absolute -bottom-[6px] flex gap-1 items-center z-10`}
                      >
                        {eventsForDate.slice(0, 3).map((event, i) => (
                          <span
                            key={i}
                            className={`w-1 h-1 rounded-full ${eventTypeColors[event.type]}`}
                            title={event.title}
                          ></span>
                        ))}
                      </div>
                    </div>
                  );
              });
            })()}
          </div>
          <div className='w-full flex xl:justify-between justify-between sm:justify-normal gap-4 xl:gap-0 mt-4'>
            {Object.entries(eventTypeColors).map(([type, colorClass]) => (
                <li key={type} className="flex items-center">
                    <span className={`w-2 h-2 rounded-full ${colorClass} mr-2`}></span>
                    <span className='text-base text-textBg-900'>{type}</span>
                </li>
            ))}
          </div>
            
        </div>

        <div className='w-full bg-white rounded'>
          <h2 className='text-xl font-semibold mb-4'>
            Events on {selectedDate ? `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}` : 'Select a day'}
          </h2>
          {selectedDate ? (
            <>
              {getEventsForDate(selectedDate).length > 0 ? (
                <div className='w-full flex flex-col gap-2'>
                  {getEventsForDate(selectedDate).map((event, idx) => (
                    <div key={idx} className='flex border border-textBg-200 w-full p-3 rounded-xl gap-4'>
                      <div className={`w-12 h-12 bg-[#d3cafa] rounded flex items-center justify-center`}>
                          <Atom size={28} color='#7051EE'/>
                      </div>
                      <div className='flex flex-col justify-between py-[2px]'>
                        <p className='text-textBg-900 font-semibold text-base'>{event.title}</p>
                        <div className='w-fit flex gap-4'>
                          <div className='flex items-center gap-2 text-textBg-500'>
                            <Clock size={16} />
                            <p className='text-sm'>{event.hour}</p>
                          </div>
                          <div className='flex items-center gap-2 text-textBg-500'>
                            <MapPin size={16} />
                            <p className='text-sm'>{event.room}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-textBg-500'>No events for this day.</p>
              )}
            </>
          ) : (
            <p className='text-textBg-500'>Select a day to see events.</p>
          )}
      </div>
    </div>
    </div>
  );
};

export default CalendarMonth;
