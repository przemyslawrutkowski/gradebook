/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  dayNames,
  monthNames,
  displayMonthNames,
  monthNumbers,
  getDaysInMonth,
  areDatesEqual,
  getStartOfWeek,
  formatWeekRange,
  getYearForMonthIndex
} from '../utils/SchedCalUtils';

const Calendar = ({
  baseYear,
  onDateSelect,
  selectedDate,
  renderDateContent,
  handlePrev,
  handleNext,
  currentMonthIndex,
}) => {
  const today = new Date();

  const [daysInMonth, setDaysInMonth] = useState(
    getDaysInMonth(monthNumbers[currentMonthIndex], getYearForMonthIndex(currentMonthIndex, baseYear))
  );

  useEffect(() => {
    setDaysInMonth(getDaysInMonth(monthNumbers[currentMonthIndex], getYearForMonthIndex(currentMonthIndex, baseYear)));
  }, [currentMonthIndex, baseYear]);

  let datesToRender = [];

  return (
    <div className='xl:w-fit'>
      <div className='flex justify-between items-center mb-4'>
        <button
          onClick={handlePrev}
          disabled={currentMonthIndex === 0}
          className={`grid place-content-center w-6 h-6 bg-textBg-200 rounded ${
            currentMonthIndex === 0 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-textBg-300 hover:cursor-pointer'
          }`}
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
          className={`grid place-content-center w-6 h-6 bg-textBg-200 rounded ${
            currentMonthIndex === displayMonthNames.length - 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-textBg-300 hover:cursor-pointer'
          }`}
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
                  onClick={() => isCurrentMonth && onDateSelect(currentDate)}
                  aria-disabled={!isCurrentMonth}
                  aria-label={`${
                    isSelected ? 'Selected ' : ''
                  }${dayNames[(currentDate.getDay() + 6) % 7]}, ${currentDate.getDate()} ${
                    monthNames[currentDate.getMonth()]
                  } ${currentDate.getFullYear()}`}
                >
                  {dayNumber}
                </p>
                {isCurrentMonth && (renderDateContent && renderDateContent(currentDate))}
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
};

export default Calendar;
