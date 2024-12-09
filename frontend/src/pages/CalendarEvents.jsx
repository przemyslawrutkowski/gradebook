import React, { useState, useEffect } from "react";
import PageTitle from '../components/PageTitle';
import { Atom, Clock, MapPin } from 'lucide-react';
import {
  dayNames,
  monthNames,
  displayMonthNames,
  monthNumbers,
  getDaysInMonth,
  areDatesEqual,
  getYearForMonthIndex
} from '../utils/SchedCalUtils';
import Calendar from '../components/Calendar';

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
      title: 'Physics Exam', 
      hour: '10:00 AM', 
      room: '106', 
      bgColor: 'bg-[#1A99EE]', 
      date: new Date(baseYear, 8, 1), 
      textColor: 'text-[#000]',
      type: 'Other' 
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

export function CalendarEvents() {

  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(() => {
    const currentMonthName = monthNames[today.getMonth()];
    const initialMonthIndex = displayMonthNames.indexOf(currentMonthName);
    return initialMonthIndex !== -1 ? initialMonthIndex : 0;
  });

  useEffect(() => {
    setDaysInMonth(getDaysInMonth(monthNumbers[currentMonthIndex], getYearForMonthIndex(currentMonthIndex, baseYear)));
  }, [currentMonthIndex, baseYear]);

  const [daysInMonth, setDaysInMonth] = useState(
    getDaysInMonth(monthNumbers[currentMonthIndex], getYearForMonthIndex(currentMonthIndex, baseYear))
  );

  const handlePrev = () => {
    setCurrentMonthIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleNext = () => {
    setCurrentMonthIndex((prevIndex) => Math.min(prevIndex + 1, displayMonthNames.length - 1));
  };

  const renderDateContent = (currentDate) => {
    const eventsForDate = getEventsForDate(currentDate);
    if (eventsForDate.length === 0) return null;

    return (
      <div className="absolute -bottom-[6px] flex gap-1 items-center z-10">
        {eventsForDate.slice(0, 3).map((event, idx) => (
          <span
            key={idx}
            className={`w-1 h-1 rounded-full ${eventTypeColors[event.type]}`}
            title={event.title}
          ></span>
        ))}
        {eventsForDate.length > 3 && <span className="text-xs">+{eventsForDate.length - 3}</span>}
      </div>
    );
  };

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Calendar"/>
      <div className="flex flex-col 2xl:flex-row justify-between sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8 gap-8 2xl:gap-16">
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
            )}
          </p>
        </div>
  
        <div className='flex flex-col xl:flex-row gap-16'>
          <Calendar
            baseYear={baseYear}
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
            renderDateContent={renderDateContent}
            handlePrev={handlePrev}
            handleNext={handleNext}
            currentMonthIndex={currentMonthIndex}
          />
  
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
      </div>
    </main>
  );
}
