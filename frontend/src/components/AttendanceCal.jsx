import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, MapPin, Clock, Moon, Hourglass } from 'lucide-react';
import {
  dayNames,
  monthNames,
  displayMonthNames,
  monthNumbers,
  getDaysInMonth,
  areDatesEqual,
  getYearForMonthIndex
} from '../utils/SchedCalUtils';

let datesToRender = [];

const today = new Date();
let baseYear = today.getFullYear();
if (today.getMonth() < 8) { 
  baseYear -= 1;
}

const attendanceData = [
    { 
      date: new Date(baseYear, 8, 1), 
      status: 'Present', 
      title: 'Mathematics', 
      hour: '09:00 AM'
    },
    { 
      date: new Date(baseYear, 8, 2), 
      status: 'Absent', 
      title: 'Biology', 
      hour: '10:00 AM'
    },
    { 
      date: new Date(baseYear, 8, 3), 
      status: 'Late', 
      title: 'Chemistry', 
      hour: '11:00 AM'
    },
    { 
      date: new Date(baseYear, 8, 4), 
      status: 'Present', 
      title: 'Physics', 
      hour: '01:00 PM'
    },
    { 
      date: new Date(baseYear, 8, 5), 
      status: 'Absent', 
      title: 'History', 
      hour: '02:00 PM'
    },
    { 
      date: new Date(baseYear, 8, 6), 
      status: 'Present', 
      title: 'Geography', 
      hour: '03:00 PM'
    },
    { 
      date: new Date(baseYear + 1, 3, 1), 
      status: 'Present', 
      title: 'Art', 
      hour: '04:00 PM'
    },
    { 
      date: new Date(baseYear, 9, 1), 
      status: 'Absent', 
      title: 'Music', 
      hour: '05:00 PM'
    },
];

const attendanceTypeColors = {
    Present: 'bg-green-500',
    Late: 'bg-yellow-500',
    Absent: 'bg-red-500',
};

const getAttendanceForDate = (date) => {
    return attendanceData.find(attendance => areDatesEqual(attendance.date, date));
};

const AttendanceCal = () => {
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

  const attendanceStats = useMemo(() => {
    const presentCount = attendanceData.filter(attendance => attendance.status === 'Present').length;
    const lateCount = attendanceData.filter(attendance => attendance.status === 'Late').length;
    const absentCount = attendanceData.filter(attendance => attendance.status === 'Absent').length;
    return { presentCount, lateCount, absentCount };
  }, []);

  const attendance = getAttendanceForDate(selectedDate);
  const status = attendance?.status;

  const handlePrev = () => {
    setCurrentMonthIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleNext = () => {
    setCurrentMonthIndex((prevIndex) => Math.min(prevIndex + 1, displayMonthNames.length - 1));
  };

  return (
    <div className='flex flex-col w-full'>
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
                const attendanceForDate = getAttendanceForDate(currentDate);

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
                      {isCurrentMonth && attendanceForDate && (
                        <div
                          className={`absolute -bottom-[6px] flex gap-1 items-center z-10`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${attendanceTypeColors[attendanceForDate.status]}`}
                            title={attendanceForDate.status}
                          ></span>
                        </div>
                      )}
                    </div>
                  );
              });
            })()}
          </div>
          <div className='w-full flex xl:justify-between justify-between sm:justify-normal gap-4 xl:gap-0 mt-4'>
            {Object.entries(attendanceTypeColors).map(([type, colorClass]) => (
                <li key={type} className="flex items-center">
                    <span className={`w-2 h-2 rounded-full ${colorClass} mr-2`}></span>
                    <span className='text-base text-textBg-900'>{type}</span>
                </li>
            ))}
          </div>
            
        </div>

        <div className='w-full bg-white'>
          <div className='w-full grid md:grid-cols-3 gap-4 mb-8'>
            <div className='flex items-center gap-2 bg-[#eefdf3] p-4 rounded-md'>
              <CheckCircle className='text-green-500 mr-2' size={36} />
              <div>
                <p className='text-lg font-semibold'>{attendanceStats.presentCount}</p>
                <p className='text-sm text-green-600'>Obecności</p>
              </div>
            </div>
            <div className='flex items-center gap-2 bg-[#fef9ed] p-4 rounded-md'>
              <Hourglass className='text-yellow-500 mr-2' size={36} />
              <div>
                <p className='text-lg font-semibold'>{attendanceStats.lateCount}</p>
                <p className='text-sm text-yellow-600'>Spóźnienia</p>
              </div>
            </div>
            <div className='flex items-center gap-2 bg-primary-100 p-4 rounded-md'>
              <XCircle className='text-red-500 mr-2' size={36} />
              <div>
                <p className='text-lg font-semibold'>{attendanceStats.absentCount}</p>
                <p className='text-sm text-red-600'>Nieobecności</p>
              </div>
            </div>
          </div>

          <h2 className='text-xl font-semibold mb-4'>
            Attendance on {selectedDate ? `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}` : 'Select a day'}
          </h2>
          {selectedDate ? (
            <>
              {getAttendanceForDate(selectedDate) ? (
                <div className='w-full flex flex-col gap-2'>
                  <div className='flex items-center gap-2 xxs:gap-4 border border-textBg-200 w-full p-3 rounded-xl'>
                    <div className='w-12 h-12 hidden xxs:flex items-center justify-center'>
                      {(() => {
                        switch (status) {
                          case 'Present':
                            return <CheckCircle size={44} color='#16a34a' />;
                          case 'Late':
                            return <Hourglass size={44} color='#f59e0b' />;
                          case 'Absent':
                            return <XCircle size={44} color='#ef4444' />;
                          default:
                            return <CheckCircle size={44} color='#16a34a' />;
                        }
                      })()}
                    </div>
                    <div className='w-full flex justify-between items-center'>
                      <div className='flex flex-col gap-1'>
                        <p className='text-textBg-900 font-semibold text-base'>
                         {getAttendanceForDate(selectedDate).title}
                        </p>
                        <div className='flex gap-2 items-center'>
                          <Clock size={12} />
                          <p className='text-textBg-700 text-sm'>
                            {getAttendanceForDate(selectedDate).hour}
                          </p>
                        </div>
                      </div>
                      {(() => {
                        return (
                          <div className={`w-24 text-center py-1 rounded-md ${status === 'Present' ? 'bg-[#eefdf3]' : status === 'Late' ? 'bg-[#fef9ed]' : 'bg-primary-100'}`}>
                            <p className={`text-base font-medium ${status === 'Present' ? 'text-[#17a948]' : status === 'Late' ? 'text-[#d29211]' : 'text-primary-600'}`}>{status}</p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ) : (
                <p className='text-textBg-500'>No attendance record for this day.</p>
              )}
            </>
          ) : (
            <p className='text-textBg-500'>Select a day to see attendance.</p>
          )}
      </div>
    </div>
    </div>
  );
};

export default AttendanceCal;
