import React, { useState, useEffect } from 'react';

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
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

const Calendar = () => {
  const [selectedOffset, setSelectedOffset] = useState(0);
  const [marginLeft, setMarginLeft] = useState('66px');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setMarginLeft('60px');
      } else {
        setMarginLeft('66px');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
      <p className="text-textBg-700 font-bold text-2xl mb-6">Calendar</p>
      
      <div className="flex flex-nowrap sm:gap-4">
        {[-3, -2, -1, 0, 1, 2, 3].map((offset) => {
          const currentDate = getDateWithOffset(offset);
          const currentDayOfWeek = currentDate.getDay();
          const dayName = dayNames[(currentDayOfWeek + 6) % 7];
          const dayNumber = currentDate.getDate();
          const isSelected = offset === selectedOffset;
          const isToday = offset === todayOffset;

          return (
            <div key={offset} className="w-full flex flex-col justify-center items-center gap-2">
              <p className="text-textBg-900 text-sm">{dayName.slice(0, 3)}</p>
              <p
                className={`w-8 h-8 text-base flex items-center justify-center cursor-pointer
                ${isSelected ? 'rounded-full bg-primary-500 text-textBg-100 focus:outline-none' : 'text-textBg-700 bg-textBg-100 border-none'}
                ${isToday && !isSelected ? 'w-8 border border-primary-500 focus:outline-none' : 'focus:outline-none'}`}
                onClick={() => setSelectedOffset(offset)}
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
    </div>
  );
};

export default Calendar;
