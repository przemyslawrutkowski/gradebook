import React, { useState, useEffect } from 'react';
import Button from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Importing Lucide icons

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Definition of months to display and their corresponding JavaScript indices
const displayMonthNames = [
  "September", "October", "November", "December",
  "January", "February", "March", "April", "May", "June"
];
const monthNumbers = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5];
let datesToRender = [];

// Calculate the base year for the academic calendar
const today = new Date();
let baseYear = today.getFullYear();
if (today.getMonth() < 8) { // If before September, subtract one year
  baseYear -= 1;
}
const baseDate = new Date(baseYear, 8, 1); // September 1st of the academic year

// Helper function to get the correct year based on the month index
const getYearForMonthIndex = (monthIndex) => {
  return monthIndex <= 3 ? baseYear : baseYear + 1;
};

const eventsData = [
  { title: 'Meeting with team', startTime: '07:00 AM', endTime: '09:00 AM', bgColor: 'bg-[#f3f4f6]', date: new Date(baseYear, 8, 1), textColor: 'text-[#6f7787]' },
  { title: 'Lunch with client', startTime: '10:00 AM', endTime: '01:00 PM', bgColor: 'bg-[#1A99EE]', date: new Date(baseYear, 8, 1), textColor: 'text-[#ffffff]' },
  { title: 'Project discussion', startTime: '03:30 PM', endTime: '05:00 PM', bgColor: 'bg-[#f1f9fe]', date: new Date(baseYear, 8, 2), textColor: 'text-[#0f7bc4]' },
  { title: 'Wrap-up session', startTime: '05:00 PM', endTime: '06:00 PM', bgColor: 'bg-[#F5C747]', date: new Date(baseYear, 8, 3), textColor: 'text-[#ffffff]' },
  { title: 'Wrap-up session', startTime: '05:00 PM', endTime: '06:00 PM', bgColor: 'bg-[#F5C747]', date: new Date(baseYear + 1, 3, 1), textColor: 'text-[#ffffff]' },
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

// Function to get the start date of the week (Monday)
const getStartOfWeek = (date) => {
  const day = date.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
  const diff = (day + 6) % 7; // Adjusting to start the week on Monday
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - diff);
  return startOfWeek;
};

// Function to get the end date of the week (Sunday)
const getEndOfWeek = (startOfWeek) => {
  const end = new Date(startOfWeek);
  end.setDate(end.getDate() + 6);
  return end;
};

// Function to format the week range for display
const formatWeekRange = (startOfWeek) => {
  const endOfWeek = getEndOfWeek(startOfWeek);
  if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
    return `${startOfWeek.getDate()}-${endOfWeek.getDate()} ${monthNames[startOfWeek.getMonth()]}, ${startOfWeek.getFullYear()}`;
  } else {
    return `${startOfWeek.getDate()} ${monthNames[startOfWeek.getMonth()]} - ${endOfWeek.getDate()} ${monthNames[endOfWeek.getMonth()]}, ${startOfWeek.getFullYear()}`;
  }
};

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(today); // Initialize with today's date
  const [marginLeft, setMarginLeft] = useState('66px');
  const [scheduleType, setScheduleType] = useState("Day");
  const [daysInMonth, setDaysInMonth] = useState(
    getDaysInMonth(monthNumbers[0], getYearForMonthIndex(0))
  );

  // State for responsive month display
  const [visibleMonths, setVisibleMonths] = useState(3);
  const [startMonthIndex, setStartMonthIndex] = useState(0);
  const [monthNameButton, setMonthNameButton] = useState(displayMonthNames[0]); // Temporary setting

  // New state to control week view
  const [showAllWeeks, setShowAllWeeks] = useState(false);

  // Function to set the initial month to the current month if it's in displayMonthNames
  useEffect(() => {
    setSelectedDate(today); // Always set selectedDate to today on initial load
    const currentMonthName = monthNames[today.getMonth()];
    const initialMonthIndex = displayMonthNames.indexOf(currentMonthName);
    if (initialMonthIndex !== -1) {
      setMonthNameButton(currentMonthName);
      setStartMonthIndex(initialMonthIndex);
    } else {
      // If current month not visible, default to first month
      setMonthNameButton(displayMonthNames[0]);
      setStartMonthIndex(0);
    }
  }, []);

  const handleButtonChangeScheduleType = (value) => {
    setScheduleType(value);
  };

  const handleButtonChangeMonth = (value) => {
    setMonthNameButton(value);
    const newIndex = displayMonthNames.indexOf(value);
    setStartMonthIndex(newIndex);
    // Removed: setSelectedDate(null); // Do not reset the selection
  };

  // Determine the number of visible months based on screen width
  useEffect(() => {
    const updateVisibleMonths = () => {
      const width = window.innerWidth;
      if (width < 700) { // Mobile devices
        setVisibleMonths(1);
      } else if (width >= 700 && width < 1280) { // Tablets and small desktops
        setVisibleMonths(3);
      } else if (width >= 1280 && width < 1536) { // Large desktops
        setVisibleMonths(5);
      } else if (width >= 1536 && width < 1820) {
        setVisibleMonths(7);
      } else if (width >= 1820) { // Desktop: Display all 10 months
        setVisibleMonths(displayMonthNames.length);
      }
    };

    updateVisibleMonths();
    window.addEventListener('resize', updateVisibleMonths);

    return () => {
      window.removeEventListener('resize', updateVisibleMonths);
    };
  }, []);

  useEffect(() => {
    const monthIndex = displayMonthNames.indexOf(monthNameButton);
    const monthNumber = monthNumbers[monthIndex];
    const year = getYearForMonthIndex(monthIndex);
    setDaysInMonth(getDaysInMonth(monthNumber, year));
  }, [monthNameButton]);

  const handlePrev = () => {
    setStartMonthIndex((prevIndex) => {
      const newIndex = Math.max(prevIndex - 1, 0);
      if (visibleMonths === 1) {
        setMonthNameButton(displayMonthNames[newIndex]);
      }
      // Removed: setSelectedDate(null); // Do not reset the selection
      return newIndex;
    });
  };

  const handleNext = () => {
    setStartMonthIndex((prevIndex) => {
      const newIndex = Math.min(prevIndex + 1, displayMonthNames.length - visibleMonths);
      if (visibleMonths === 1) {
        setMonthNameButton(displayMonthNames[newIndex]);
      }
      // Removed: setSelectedDate(null); // Do not reset the selection
      return newIndex;
    });
  };

  // Ensure that startMonthIndex stays within valid range when visibleMonths changes
  useEffect(() => {
    setStartMonthIndex((prevIndex) => {
      if (prevIndex + visibleMonths > displayMonthNames.length) {
        return Math.max(displayMonthNames.length - visibleMonths, 0);
      }
      return prevIndex;
    });

    // On mobile devices, synchronize monthNameButton with startMonthIndex
    if (visibleMonths === 1) {
      setMonthNameButton(displayMonthNames[startMonthIndex]);
      // Removed: setSelectedDate(null); // Do not reset the selection
    }
  }, [visibleMonths, startMonthIndex]);

  const displayedMonths = displayMonthNames.slice(startMonthIndex, startMonthIndex + visibleMonths);

  const currentTimePosition = getCurrentTimePosition();
  const calendarStartHour = 7;
  const calendarEndHour = 18;
  const calendarHeight = (calendarEndHour - calendarStartHour) * 66;

  // Helper to get all dates in the current week
  const getCurrentWeekDates = () => {
    const startOfWeek = getStartOfWeek(selectedDate || today);
    return Array.from({ length: 7 }, (_, idx) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + idx);
      return date;
    });
  };

  // Handlers for Week Navigation
  const handlePrevWeek = () => {
    setSelectedDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    setSelectedDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  return (
    <div className='flex flex-col w-full'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8 gap-1'>
        <p className="text-textBg-700 font-bold text-base flex flex-col sm:flex-row">
        {scheduleType === "Day" ? (
        selectedDate ? (
            <>
              <span className="text-2xl font-semibold">
                {dayNames[(selectedDate.getDay() + 6) % 7]}, {selectedDate.getDate()}&nbsp;
              </span>
              <span className="block text-2xl font-semibold">
                {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </span>
            </>
          ) : (
            <span className="block text-2xl font-semibold">
              {monthNameButton} {getYearForMonthIndex(displayMonthNames.indexOf(monthNameButton))}
            </span>
          )
        ) : (
          <div className="flex justify-between items-center gap-6">        
            <span className="text-2xl font-semibold">
              {formatWeekRange(getStartOfWeek(selectedDate))}
            </span>
            <div className='flex gap-3'>
              <button
                onClick={handlePrevWeek}
                className="bg-textBg-200 grid place-items-center h-8 w-8 rounded text-textBg-700 p-1 hover:bg-textBg-300"
                aria-label="Previous week"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNextWeek}
                className="bg-textBg-200 grid place-items-center h-8 w-8  rounded text-textBg-700 p-1 hover:bg-textBg-300"
                aria-label="Next week"
              >
                <ChevronRight size={20} />
              </button>
            </div>
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
            className="min-w-[4rem] no-underline"
            onClick={() => handleButtonChangeScheduleType("Week")}
          />
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex w-full items-center justify-between mb-8">
        {/* Render "Previous" button only if not all months are visible */}
        {visibleMonths < displayMonthNames.length && (
          <button
            onClick={handlePrev}
            disabled={startMonthIndex === 0}
            className={`p-2 ${startMonthIndex === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:text-gray-700'}`}
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* List of Months */}
        <div className="flex overflow-x-auto space-x-2">
          {displayedMonths.map((month, idx) => (
            <Button
              key={idx}
              type={monthNameButton === month ? "primary" : "link"}
              size="l"
              text={month}
              className={`no-underline ${monthNameButton !== month ? 'text-black' : ''}`}
              onClick={() => handleButtonChangeMonth(month)}
            />
          ))}
        </div>

        {/* Render "Next" button only if not all months are visible */}
        {visibleMonths < displayMonthNames.length && (
          <button
            onClick={handleNext}
            disabled={startMonthIndex + visibleMonths >= displayMonthNames.length}
            className={`p-2 ${startMonthIndex + visibleMonths >= displayMonthNames.length ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:text-gray-700'}`}
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Schedule Type Content */}
      {scheduleType === "Day" ? (
        <>
          {/* Existing Day View Content */}
          <div className="grid grid-cols-7 gap-4 mb-8">
            {/* Day Names */}
            {dayNames.map((dayName, index) => (
              <div key={index} className="w-full flex justify-center items-center">
                <p className="text-textBg-900 font-bold text-sm text-center">{dayName}</p>
              </div>
            ))}

            {/* Dates */}
            {(() => {
              const monthIndex = displayMonthNames.indexOf(monthNameButton);
              const monthNumber = monthNumbers[monthIndex];
              const year = getYearForMonthIndex(monthIndex);

              if (showAllWeeks) {
                // Calculate the first day of the month
                const firstDayOfMonth = new Date(year, monthNumber, 1).getDay();
                const blanks = (firstDayOfMonth + 6) % 7; // Adjust to start week on Monday

                // Days from the previous month to fill the blanks
                const prevMonthIndex = (monthIndex === 0) ? displayMonthNames.length - 1 : monthIndex - 1;
                const prevMonthNumber = monthNumbers[prevMonthIndex];
                const prevMonthYear = getYearForMonthIndex(prevMonthIndex);
                const daysInPrevMonth = getDaysInMonth(prevMonthNumber, prevMonthYear);

                const prevMonthDays = Array.from({ length: blanks }, (_, idx) => {
                  const date = new Date(prevMonthYear, prevMonthNumber, daysInPrevMonth - blanks + idx + 1);
                  return date;
                });

                // Days in the current month
                const currentMonthDays = Array.from({ length: daysInMonth }, (_, dayIdx) => {
                  return new Date(year, monthNumber, dayIdx + 1);
                });

                datesToRender = [...prevMonthDays, ...currentMonthDays];
              } else {
                // Get the dates of the current week
                const weekStartDate = getStartOfWeek(selectedDate || today); // Use selectedDate or today
                datesToRender = [...Array(7)].map((_, idx) => {
                  const date = new Date(weekStartDate);
                  date.setDate(weekStartDate.getDate() + idx);
                  return date;
                });
              }

              return datesToRender.map((currentDate, idx) => {
                const dayNumber = currentDate.getDate();
                const isSelected = areDatesEqual(currentDate, selectedDate);
                const isCurrentMonth = currentDate.getMonth() === monthNumber && currentDate.getFullYear() === year;

                return (
                  <div key={idx} className="w-full flex flex-col justify-center items-center">
                    <p
                      className={`w-8 h-8 text-base flex items-center justify-center cursor-pointer
                        ${isSelected ? 'rounded-full bg-primary-500 text-textBg-100' : isCurrentMonth ? 'text-textBg-700 bg-textBg-100' : 'text-gray-400'}
                        focus:outline-none`}
                      onClick={() => setSelectedDate(currentDate)}
                    >
                      {dayNumber}
                    </p>
                  </div>
                );
              });
            })()}
          </div>
          
          <div className='w-full flex justify-center'>
            <Button
              size="s"
              text={showAllWeeks ? "Show current week" : "Show all weeks"}
              type="link"
              className="min-w-[4rem] no-underline ml-4"
              onClick={() => setShowAllWeeks(!showAllWeeks)}
            />
          </div>  

          <div className="w-full sm:w-full mt-8 max-w-full overflow-x-auto relative">
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

              {/* Render Events */}
              {eventsData
                .filter(event => {
                  if (showAllWeeks) {
                    return areDatesEqual(event.date, selectedDate) ||
                      (getStartOfWeek(event.date) <= getStartOfWeek(selectedDate || today) &&
                        getStartOfWeek(event.date) >= getStartOfWeek(selectedDate || today));
                  } else {
                    return datesToRender.some(date => areDatesEqual(event.date, date));
                  }
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
                      style={{ top: `${top + 2}px`, height: `${height - 5}px`, width: 'calc(100% - 76px)' }} // Ensure no overflow with padding
                    >
                      <div className="text-sm font-bold mb-1">{event.title}</div>
                      <div className="text-sm">
                        {event.startTime} - {event.endTime}
                      </div>
                    </div>
                  );
                })}

              {/* Current Time Line */}
              {currentTimePosition < calendarHeight && (
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
        // *** Weekly View Implementation Starts Here ***
        <div className="flex flex-col mt-4">
          {/* Week Header with Day Names and Dates */}
          <div className="grid grid-cols-[auto,repeat(7,1fr)] gap-4">
            {/* Empty cell for time labels */}
            <div className="pr-1 text-xs invisible">
              <p>07:00 AM</p>     
            </div>
            {/* Day Names and Dates */}
            {dayNames.map((dayName, index) => {
              const weekDate = getCurrentWeekDates()[index];
              const isToday = areDatesEqual(weekDate, today);
              return (
                <div key={index} className="w-full flex flex-col items-center gap-2">
                  <p className={`text-base font-bold ${isToday ? 'text-red-500' : 'text-textBg-500'}`}>
                      {weekDate.getDate()}
                  </p>
                  <p className={`text-base ${isToday ? 'text-red-500' : 'text-textBg-500'}`}>
                    {dayName}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Schedule Grid */}
          <div className="relative w-full sm:w-full mt-4 max-w-full overflow-x-auto">
            <div className="relative overflow-hidden" style={{ height: `${calendarHeight}px` }}>
              <div className="grid grid-cols-[auto,repeat(7,1fr)] grid-rows-[repeat(11,66px)] w-full h-full">
                {['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(
                  (time, idx) => (
                    <React.Fragment key={`week-time-row-${idx}`}>
                      {/* Time Labels */}
                      <div className="flex justify-end pr-4 text-gray-500 text-xs">
                        {time}
                      </div>
                      {/* Time Slots for Each Day */}
                      {Array.from({ length: 7 }).map((_, dayIdx) => (
                        <div key={dayIdx} className={`relative ${idx > 0 ? 'border-x border-b' : 'border'} border-textBg-300`}>
                          {/* Placeholder for events */}
                        </div>
                      ))}
                    </React.Fragment>
                  )
                )}
              </div>

              {/* Render Events in Weekly View */}
              {eventsData
                .filter(event => {
                  const weekDates = getCurrentWeekDates();
                  return weekDates.some(date => areDatesEqual(event.date, date));
                })
                .map((event, eventIdx) => {
                  const eventStart = convertTimeToHours(event.startTime);
                  const eventEnd = convertTimeToHours(event.endTime);
                  const top = (eventStart - calendarStartHour) * 66;
                  const height = (eventEnd - eventStart) * 66;

                  // Determine the day column (1 to 7)
                  const weekDates = getCurrentWeekDates();
                  const dayIndex = weekDates.findIndex(date => areDatesEqual(date, event.date));

                  if (dayIndex === -1) return null; // Event not in current week

                  return (
                    <div
                      key={eventIdx}
                      className={`absolute p-2 rounded-sm ${event.bgColor} ${event.textColor}`}
                      style={{
                        top: `${top + 2}px`,
                        height: `${height - 5}px`,
                        left: `${(dayIndex + 1) * (100 / 8)}%`, // +1 to account for time labels
                        width: `${100 / 8 - 2}%`, // Adjust width with some margin
                        boxSizing: 'border-box',
                        zIndex: 10,
                      }}
                    >
                      <div className="text-sm font-bold mb-1">{event.title}</div>
                      <div className="text-sm">
                        {event.startTime} - {event.endTime}
                      </div>
                    </div>
                  );
                })}

              {/* Current Time Line (Only in Today’s Column) */}
              {currentTimePosition < calendarHeight && (
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
        // *** Weekly View Implementation Ends Here ***
      )}
    </div>
  );
};

export default Calendar; 
