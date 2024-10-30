import React, { useState, useEffect } from 'react';
import Button from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const displayMonthNames = [
  "September", "October", "November", "December",
  "January", "February", "March", "April", "May", "June"
];
const monthNumbers = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5];

let datesToRender = [];

const today = new Date();
let baseYear = today.getFullYear();
if (today.getMonth() < 8) { 
  baseYear -= 1;
}

const getYearForMonthIndex = (monthIndex) => {
  return monthIndex <= 3 ? baseYear : baseYear + 1;
};

const eventsData = [
  { title: 'PE', startTime: '07:00 AM', endTime: '09:00 AM', bgColor: 'bg-[#f3f4f6]', date: new Date(baseYear, 8, 1), textColor: 'text-[#6f7787]' },
  { title: 'Biology', startTime: '10:00 AM', endTime: '01:00 PM', bgColor: 'bg-[#1A99EE]', date: new Date(baseYear, 8, 1), textColor: 'text-[#ffffff]' },
  { title: 'Math', startTime: '03:30 PM', endTime: '05:00 PM', bgColor: 'bg-[#f1f9fe]', date: new Date(baseYear, 8, 2), textColor: 'text-[#0f7bc4]' },
  { title: 'Physics', startTime: '05:00 PM', endTime: '06:00 PM', bgColor: 'bg-[#F5C747]', date: new Date(baseYear, 8, 3), textColor: 'text-[#ffffff]' },
  { title: 'Physics', startTime: '05:00 PM', endTime: '06:00 PM', bgColor: 'bg-[#F5C747]', date: new Date(baseYear, 8, 4), textColor: 'text-[#ffffff]' },
  { title: 'Physics', startTime: '05:00 PM', endTime: '06:00 PM', bgColor: 'bg-[#F5C747]', date: new Date(baseYear, 8, 5), textColor: 'text-[#ffffff]' },
  { title: 'Physics', startTime: '05:00 PM', endTime: '06:00 PM', bgColor: 'bg-[#F5C747]', date: new Date(baseYear, 8, 6), textColor: 'text-[#ffffff]' },
  { title: 'Physics', startTime: '05:00 PM', endTime: '06:00 PM', bgColor: 'bg-[#F5C747]', date: new Date(baseYear + 1, 3, 1), textColor: 'text-[#ffffff]' },
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

const getDaysInMonth = (monthNumber, year) => {
  return new Date(year, monthNumber + 1, 0).getDate();
};

const areDatesEqual = (date1, date2) => {
  if (!date1 || !date2) return false;
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
};

const getStartOfWeek = (date) => {
  const day = date.getDay(); 
  const diff = (day + 6) % 7;
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - diff);
  return startOfWeek;
};

const getEndOfWeek = (startOfWeek) => {
  const end = new Date(startOfWeek);
  end.setDate(end.getDate() + 6);
  return end;
};

const formatWeekRange = (startOfWeek) => {
  const endOfWeek = getEndOfWeek(startOfWeek);
  if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
    return `${startOfWeek.getDate()}-${endOfWeek.getDate()} ${monthNames[startOfWeek.getMonth()]}, ${startOfWeek.getFullYear()}`;
  } else {
    return `${startOfWeek.getDate()} ${monthNames[startOfWeek.getMonth()]} - ${endOfWeek.getDate()} ${monthNames[endOfWeek.getMonth()]}, ${startOfWeek.getFullYear()}`;
  }
};

const ScheduleCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(today);
  const [scheduleType, setScheduleType] = useState("Day");
  const [currentMonthIndex, setCurrentMonthIndex] = useState(() => {
    const currentMonthName = monthNames[today.getMonth()];
    const initialMonthIndex = displayMonthNames.indexOf(currentMonthName);
    return initialMonthIndex !== -1 ? initialMonthIndex : 0;
  });

  const [daysInMonth, setDaysInMonth] = useState(
    getDaysInMonth(monthNumbers[currentMonthIndex], getYearForMonthIndex(currentMonthIndex))
  );

  useEffect(() => {
    setDaysInMonth(getDaysInMonth(monthNumbers[currentMonthIndex], getYearForMonthIndex(currentMonthIndex)));
  }, [currentMonthIndex]);

  const handleButtonChangeScheduleType = (value) => {
    setScheduleType(value);
  };

  const handlePrev = () => {
    setCurrentMonthIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleNext = () => {
    setCurrentMonthIndex((prevIndex) => Math.min(prevIndex + 1, displayMonthNames.length - 1));
  };

  const calendarStartHour = 7;
  const calendarEndHour = 18;
  const calendarHeight = (calendarEndHour - calendarStartHour) * 66;

  const getCurrentWeekDates = () => {
    const startOfWeek = getStartOfWeek(selectedDate || today);
    return Array.from({ length: 7 }, (_, idx) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + idx);
      return date;
    });
  };

  const currentTimePosition = getCurrentTimePosition();

  return (
    <div className='flex flex-col w-full'>
      <div className='flex items-center justify-between mb-8 gap-1'>
        <p className="text-textBg-700 w-full font-bold text-base flex flex-col sm:flex-row">
          {scheduleType === "Day" ? (
            selectedDate ? (
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
                {monthNames[monthNumbers[currentMonthIndex]]} {getYearForMonthIndex(currentMonthIndex)}
              </span>
            )
          ) : (
            <div className="flex justify-between items-center gap-6">
              <span className="text-base sm:text-xl lg:text-2xl font-semibold">
                {formatWeekRange(getStartOfWeek(selectedDate))}
              </span>
            </div>
          )}
        </p>
        <div className='flex items-center'>
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
            className="min-w-[4rem] no-underline hidden md:block"
            onClick={() => handleButtonChangeScheduleType("Week")}
          />
        </div>
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
                {monthNames[monthNumbers[currentMonthIndex]]} {getYearForMonthIndex(currentMonthIndex)}
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
              const year = getYearForMonthIndex(monthIndex);

              const firstDayOfMonth = new Date(year, monthNumber, 1).getDay();
              const blanks = (firstDayOfMonth + 6) % 7;

              const prevMonthIndex = (monthIndex === 0) ? displayMonthNames.length - 1 : monthIndex - 1;
              const prevMonthNumber = monthNumbers[prevMonthIndex];
              const prevMonthYear = getYearForMonthIndex(prevMonthIndex);
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
              const nextMonthYear = getYearForMonthIndex(nextMonthIndex);
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

                return (
                  <div key={idx} className="w-full flex flex-col justify-center items-center">
                    <p
                      className={`w-8 h-8 -my-1 text-base flex items-center justify-center
                        ${isCurrentMonth ? 'cursor-pointer' : 'cursor-not-allowed'}
                        ${isSelected && isCurrentMonth ? 'rounded-full bg-primary-500 text-textBg-100' : isCurrentMonth ? 'bg-textBg-100' : 'text-gray-300 bg-transparent'}
                        ${isCurrentMonth && isWeekend ? 'text-primary-600' : ''}
                        focus:outline-none`}
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
                  </div>
                );
              });
            })()}
          </div>
        </div>

        <div className='w-full'>
        {scheduleType === "Day" ? (
        <>
          <div className="w-full sm:w-full mt-1 max-w-full overflow-x-auto relative">
            <div className="relative overflow-hidden" style={{ height: `${calendarHeight}px` }}>
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

              {eventsData
                .filter(event => {
                  return areDatesEqual(event.date, selectedDate)
                })
                .map((event, eventIdx) => {
                  const eventStart = convertTimeToHours(event.startTime);
                  const eventEnd = convertTimeToHours(event.endTime);
                  const top = (eventStart - calendarStartHour) * 66;
                  const height = (eventEnd - eventStart) * 66;

                  return (
                    <div
                      key={eventIdx}
                      className={`absolute right-[2px] p-2 rounded-sm ${event.bgColor} ${event.textColor}`}
                      style={{ top: `${top + 2}px`, height: `${height - 5}px`, width: 'calc(100% - 76px)' }}
                    >
                      <div className="text-sm font-bold mb-1">{event.title}</div>
                      <div className="text-sm">
                        {event.startTime} - {event.endTime}
                      </div>
                    </div>
                  );
                })}

              {currentTimePosition < calendarHeight && (
                <div
                  className="absolute right-0 left-4 flex items-center"
                  style={{ top: `${currentTimePosition}px` }}
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 ml-8 sm:ml-12" />
                  <div className="h-[1px] w-full bg-red-500" />
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="flex-col mt-4 hidden md:flex">
          <div className="grid grid-cols-[auto,repeat(5,1fr)] gap-4">
            <div className="pr-1 text-xs invisible">
              <p>07:00 AM</p>
            </div>
            {dayNames.map((dayName, index) => {
              const weekDate = getCurrentWeekDates()[index];
              const dayOfWeek = weekDate.getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

              if (isWeekend) {
                return null;
              }

              return (
                <div key={index} className="w-full flex flex-col items-center gap-2">
                  <p className={`text-base ${isWeekend ? 'text-red-500' : 'text-textBg-700'}`}>
                      {weekDate.getDate()}
                  </p>
                  <p className={`text-base ${isWeekend ? 'text-red-500' : 'text-textBg-500'}`}>
                    {dayName}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="relative w-full sm:w-full mt-4 max-w-full overflow-x-auto">
            <div className="relative overflow-hidden" style={{ height: `${calendarHeight}px` }}>
              <div className="grid grid-cols-[auto,repeat(5,1fr)] grid-rows-[repeat(11,66px)] w-full h-full">
                {['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(
                  (time, idx) => (
                    <React.Fragment key={`week-time-row-${idx}`}>
                      <div className="flex justify-end pr-4 text-gray-500 text-xs">
                        {time}
                      </div>
                      {Array.from({ length: 5 }).map((_, dayIdx) => (
                        <div key={dayIdx} className={`relative ${dayIdx === 0 ? 'border-l' : ''} ${idx > 0 ? 'border-r border-b' : 'border-r border-b border-t'} border-textBg-300`}>
                        </div>
                      ))}
                    </React.Fragment>
                  )
                )}
              </div>

              {eventsData
                .filter(event => {
                  const weekDates = getCurrentWeekDates();
                  return weekDates.some(date => areDatesEqual(date, event.date));
                })
                .map((event, eventIdx) => {
                  const eventStart = convertTimeToHours(event.startTime);
                  const eventEnd = convertTimeToHours(event.endTime);
                  const top = (eventStart - calendarStartHour) * 66;
                  const height = (eventEnd - eventStart) * 66;

                  const weekDates = getCurrentWeekDates();
                  const dayIndex = weekDates.findIndex(date => areDatesEqual(date, event.date));

                  if (dayIndex === -1) return null;

                  return (
                    <div
                      key={eventIdx}
                      className={`absolute mx-auto p-2 rounded-sm ${event.bgColor} ${event.textColor}`}
                      style={{
                        top: `${top + 2}px`,
                        height: `${height - 5}px`,
                        left: `calc(((100% - 72px) / 5) * ${dayIndex} + 74px)`,
                        width: 'calc((100% - 98px) / 5)',
                      }}
                    >
                      <div className="text-sm font-bold mb-1">{event.title}</div>
                      <div className="text-xs">
                        {event.startTime} - {event.endTime}
                      </div>
                    </div>
                  );
                })}

              {currentTimePosition < calendarHeight && (
                <div
                  className="absolute right-0 left-4 flex items-center"
                  style={{ top: `${currentTimePosition}px` }}
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 ml-8 sm:ml-12" />
                  <div className="h-[1px] w-full bg-red-500" />
                </div>
              )}
            </div>
          </div>
        </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleCalendar;
