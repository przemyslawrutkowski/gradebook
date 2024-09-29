import React, { useState, useEffect } from 'react';
import Button from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Importing Lucide icons

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const baseDate = new Date();

const eventsData = [
  { title: 'Meeting with team', startTime: '07:00 AM', endTime: '09:00 AM', bgColor: 'bg-[#f3f4f6]', dateOffset: 0, textColor: 'text-[#6f7787]' },
  { title: 'Lunch with client', startTime: '10:00 AM', endTime: '01:00 PM', bgColor: 'bg-[#1A99EE]', dateOffset: 0, textColor: 'text-[#ffffff]' },
  { title: 'Project discussion', startTime: '03:30 PM', endTime: '05:00 PM', bgColor: 'bg-[#f1f9fe]', dateOffset: 1, textColor: 'text-[#0f7bc4]' },
  { title: 'Wrap-up session', startTime: '05:00 PM', endTime: '06:00 PM', bgColor: 'bg-[#F5C747]', dateOffset: -1, textColor: 'text-[#ffffff]' },
];

const convertTimeToHours = (time) => {
  const [timeString, modifier] = time.split(' ');
  let [hours, minutes] = timeString.split(':').map(Number);
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return hours + minutes / 60;
};

const getCurrentTimePosition = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return (hours - 7) * 66 + (minutes / 60) * 66;
};

const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

const Calendar = () => {
  const [selectedOffset, setSelectedOffset] = useState(0);
  const [marginLeft, setMarginLeft] = useState('66px');
  const [scheduleType, setScheduleType] = useState("Day");
  const [monthNameButton, setMonthNameButton] = useState(monthNames[baseDate.getMonth()]);
  const [daysInMonth, setDaysInMonth] = useState(getDaysInMonth(baseDate.getMonth(), baseDate.getFullYear()));
  
  // State for responsive month display
  const [visibleMonths, setVisibleMonths] = useState(3);
  const [startMonthIndex, setStartMonthIndex] = useState(baseDate.getMonth());

  const handleButtonChangeScheduleType = (value) => {
    setScheduleType(value);
  };

  const handleButtonChangeMonth = (value) => {
    setMonthNameButton(value);
  };

  // Determine number of visible months based on screen width
  useEffect(() => {
    const updateVisibleMonths = () => {
      const width = window.innerWidth;
      if (width < 700) { // Mobile devices
        setVisibleMonths(1);
      } else if (width >= 700 && width < 1280) { // Tablets and small desktops
        setVisibleMonths(3);
      } else if (width >= 1280 && width < 1536) { // Large desktops
        setVisibleMonths(5);
      }else if (width >= 1536 && width < 1820){
        setVisibleMonths(7);
      }else{
        setVisibleMonths(9);
      }
    };

    updateVisibleMonths();
    window.addEventListener('resize', updateVisibleMonths);

    return () => {
      window.removeEventListener('resize', updateVisibleMonths);
    };
  }, []);

  useEffect(() => {
    setDaysInMonth(getDaysInMonth(monthNames.indexOf(monthNameButton), baseDate.getFullYear()));
  }, [monthNameButton]);

  const handlePrev = () => {
    setStartMonthIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleNext = () => {
    setStartMonthIndex((prevIndex) => Math.min(prevIndex + 1, monthNames.length - visibleMonths));
  };

  // Ensure startMonthIndex is within valid range when visibleMonths changes
  useEffect(() => {
    setStartMonthIndex((prevIndex) => {
      if (prevIndex + visibleMonths > monthNames.length) {
        return Math.max(monthNames.length - visibleMonths, 0);
      }
      return prevIndex;
    });
  }, [visibleMonths]);

  const displayedMonths = monthNames.slice(startMonthIndex, startMonthIndex + visibleMonths);

  const getDateWithOffset = (offset) => {
    const newDate = new Date(baseDate);
    newDate.setDate(newDate.getDate() + offset);
    return newDate;
  };

  const selectedDate = getDateWithOffset(selectedOffset);
  const todayOffset = 0;
  const currentTimePosition = getCurrentTimePosition();
  const calendarStartHour = 7;
  const calendarEndHour = 18;
  const calendarHeight = (calendarEndHour - calendarStartHour) * 66;

  return (
    <div className='flex flex-col w-full'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8 gap-2'>
      <p className="text-textBg-700 font-bold text-base flex flex-col sm:flex-row">
        <span>
           {dayNames[baseDate.getDay()]}, {baseDate.getDate()}&nbsp;
        </span>
        <span className="block">
          {monthNames[baseDate.getMonth()]} {baseDate.getFullYear()}
        </span>
      </p>
        <div className='flex'>
          <Button
            size="s"
            text="Day"
            type={scheduleType === "Day" ? "primary" : "link"}
            className="min-w-[4rem] no-underline"
            onClick={() => handleButtonChangeScheduleType("Day")}
          />
          <Button
            size="s"
            text="Week"
            type={scheduleType === "Week" ? "primary" : "link"}
            className="min-w-[4rem] no-underline"
            onClick={() => handleButtonChangeScheduleType("Week")}
          />
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex w-full items-center justify-between mb-8">
        <button 
          onClick={handlePrev} 
          disabled={startMonthIndex === 0}
          className={`p-2 ${startMonthIndex === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:text-gray-700'}`}
          aria-label="Previous Month"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex overflow-hidden">
          {displayedMonths.map((month, idx) => (
            <Button 
              key={idx}
              type={monthNameButton === month ? "primary" : "link"} 
              size="l" 
              text={month} 
              className={`no-underline mx-1 ${monthNameButton !== month ? 'text-black' : ''}`} 
              onClick={() => handleButtonChangeMonth(month)}
            />
          ))}
        </div>
        <button 
          onClick={handleNext} 
          disabled={startMonthIndex + visibleMonths >= monthNames.length}
          className={`p-2 ${startMonthIndex + visibleMonths >= monthNames.length ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:text-gray-700'}`}
          aria-label="Next Month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Schedule Type Content */}
      {scheduleType === "Day" ? (
        <>
<div className="grid grid-cols-7 sm:grid-cols-[repeat(auto-fit,minmax(32px,1fr))] gap-4 mb-8 overflow-x-auto sm:overflow-x-visible sm:flex-nowrap">
  {[...Array(daysInMonth)].map((_, dayIdx) => {
    const currentDate = new Date(baseDate.getFullYear(), monthNames.indexOf(monthNameButton), dayIdx + 1);
    const currentDayOfWeek = currentDate.getDay();
    const dayName = dayNames[(currentDayOfWeek + 6) % 7];
    const dayNumber = currentDate.getDate();
    const isSelected = currentDate.getDate() === selectedDate.getDate();
    const isToday = currentDate.getDate() === baseDate.getDate() && currentDate.getMonth() === baseDate.getMonth();

    return (
      <div key={dayIdx} className="w-full flex flex-col justify-center items-center gap-2">
        <p className="text-textBg-600 text-sm hidden sm:block">{dayName.slice(0, 3)}</p>
        <p
          className={`w-8 h-8 text-base flex items-center justify-center cursor-pointer
          ${isSelected ? 'rounded-full bg-primary-500 text-textBg-100 focus:outline-none' : 'text-textBg-700 bg-textBg-100 border-none'}
          ${isToday && !isSelected ? 'border border-primary-500' : 'focus:outline-none'}`}
          onClick={() => setSelectedOffset(dayIdx - baseDate.getDate() + 1)}
        >
          {dayNumber}
        </p>
      </div>
    );
  })}
</div>



        <div className="w-full sm:w-full mt-8 max-w-full overflow-x-auto relative">
          <div className="relative" style={{ height: `${calendarHeight}px` }}>
            <div className="grid grid-cols-[auto,1fr] grid-rows-[repeat(11,66px)] w-full h-full">
                {['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(
                (time, idx) => (
                    <React.Fragment key={`time-row-${idx}`}>
                    <div className="flex justify-end pr-4 text-gray-500 text-xs">
                        {time}
                    </div>
                    <div className={`relative ${idx > 0 ? 'border-x border-b' : 'border'} border-textBg-300`}>
                        
                    </div>
                    </React.Fragment>
                )
                )}
            </div>

            {/* Renderowanie wydarzeń */}
            {eventsData
            .filter(event => event.dateOffset === selectedOffset)
            .map((event, eventIdx) => {
                const eventStart = convertTimeToHours(event.startTime);
                const eventEnd = convertTimeToHours(event.endTime);
                const top = (eventStart - calendarStartHour) * 66;
                const height = (eventEnd - eventStart) * 66;

                return (
                <div
                    key={eventIdx}
                    className={`absolute right-[2px] p-2 rounded-sm ${event.bgColor} ${event.textColor}`}
                    style={{ top: `${top + 2}px`, height: `${height - 5}px`, width: 'calc(100% - 76px)' }} // Ensure no overflow with padding
                >
                    <div className="text-sm font-bold mb-1">{event.title}</div>
                    <div className="text-sm">
                    {event.startTime} - {event.endTime}
                    </div>
                </div>
                );
            })}

            {/* Linia bieżącego czasu */}
            {currentTimePosition < calendarHeight &&(
                <div
                className="absolute right-0 left-0 flex items-center"
                style={{ top: `${currentTimePosition}px` }}
            >
                <div className="w-2 h-2 rounded-full bg-red-500 ml-8 sm:ml-12" style={{ marginLeft }} />
                <div className="h-[1px] w-full bg-red-500" />
            </div>
            )}
            </div>
        </div> 
        </>
      ) : (
        <div>
          {/* Your Week schedule content here */}
        </div>
      )} 
    </div>
  );
};

export default Calendar;
