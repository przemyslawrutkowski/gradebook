import React, { useState } from 'react';

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const baseDate = new Date();

const eventsData = [
  { title: 'Meeting with team', startTime: '09:00 AM', endTime: '10:00 AM', color: 'bg-[#1A99EE]', dateOffset: 0 },
  { title: 'Lunch with client', startTime: '12:00 PM', endTime: '01:00 PM', color: 'bg-green-500', dateOffset: 0 },
  { title: 'Project discussion', startTime: '03:00 PM', endTime: '05:00 PM', color: 'bg-red-500', dateOffset: 1 },
  { title: 'Wrap-up session', startTime: '05:00 PM', endTime: '06:00 PM', color: 'bg-yellow-500', dateOffset: -1 },
];

const convertTimeToHours = (time) => {
  const [timeString, modifier] = time.split(' ');
  let [hours, minutes] = timeString.split(':').map(Number);
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return hours + minutes / 60;
};

const Calendar = () => {
  const [selectedOffset, setSelectedOffset] = useState(0);

  const getDateWithOffset = (offset) => {
    const newDate = new Date(baseDate);
    newDate.setDate(newDate.getDate() + offset);
    return newDate;
  };

  const selectedDate = getDateWithOffset(selectedOffset);
  const todayOffset = 0;

  return (
    <div className='flex flex-col w-fit'>
      <p className="text-textBg-700 font-bold text-2xl mb-6">Calendar</p>
      
      <div className="flex flex-nowrap gap-4">
        {[-3, -2, -1, 0, 1, 2, 3].map((offset) => {
          const currentDate = getDateWithOffset(offset);
          const currentDayOfWeek = currentDate.getDay();
          const dayName = dayNames[(currentDayOfWeek + 6) % 7];
          const dayNumber = currentDate.getDate();
          const isSelected = offset === selectedOffset;
          const isToday = offset === todayOffset;

          return (
            <div key={offset} className="flex flex-col w-9 justify-center items-center gap-2">
              <p className="text-textBg-900 text-sm">{dayName.slice(0, 3)}</p>
              <p
                className={`h-8 w-8 text-base flex items-center justify-center cursor-pointer
                ${isSelected ? 'rounded-full bg-primary-500 text-textBg-100 focus:outline-none' : 'text-textBg-700 bg-textBg-100 border-none'}
                ${isToday && !isSelected ? 'border border-primary-500 focus:outline-none' : 'focus:outline-none'}`}
                onClick={() => setSelectedOffset(offset)}
              >
                {dayNumber}
              </p>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 max-w-sm">
        <div className="grid grid-rows-[repeat(11,66px)] text-left">
          {['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(
            (time, idx) => (
              <div key={idx} className={`${idx > 0 ? 'border-x border-b' : 'border'} border-textBg-300 relative p-[1px]`}>
                <span className="text-gray-500 text-xs absolute -left-16">{time}</span>
                {eventsData
                  .filter(event => event.dateOffset === selectedOffset)
                  .filter(event => 
                    convertTimeToHours(event.startTime) <= convertTimeToHours(time) &&
                    convertTimeToHours(event.endTime) > convertTimeToHours(time)
                  )
                  .map((event, eventIdx) => {
                    const eventStart = convertTimeToHours(event.startTime);
                    const eventEnd = convertTimeToHours(event.endTime);
                    const eventDuration = (eventEnd - eventStart) * 2;

                    return (
                      <div 
                        key={eventIdx} 
                        className={`px-6 py-3 rounded-sm ${event.color} text-white`}
                        style={{ gridRow: `span ${eventDuration}` }}
                      >
                        <div className='text-sm font-bold mb-1'>{event.title}</div>
                        <div className="text-sm">
                          {event.startTime} - {event.endTime}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
