import React, { useState, useEffect } from 'react';
import Button from './Button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Modal from './Modal'; 
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
  getYearForMonthIndex,
} from '../utils/SchedCalUtils';
import { getToken, getUserRole, decodeToken } from '../utils/UserRoleUtils';
import UserRoles from '../data/userRoles';
import '../customCSS/customScrollbar.css';

let datesToRender = [];

const today = new Date();
let baseYear = today.getFullYear();
if (today.getMonth() < 8) {
  baseYear -= 1;
}

const eventsData = [
  {
    id: 1,
    title: 'Biology',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    bgColor: 'bg-[#1A99EE]',
    date: new Date(baseYear, 8, 1),
    textColor: 'text-[#ffffff]',
    students: [
      { id: 1, name: 'Alice Johnson', attendance: 'Late' },
      { id: 2, name: 'Bob Brown', attendance: 'Present' },
      { id: 3, name: 'Charlie Smith', attendance: 'Absent' },
      { id: 4, name: 'Diana Miller', attendance: 'Late' },
      { id: 5, name: 'Eve Davis', attendance: 'Present' },
      { id: 6, name: 'Frank Wilson', attendance: 'Absent' },
      { id: 7, name: 'Grace Lee', attendance: 'Present' },
      { id: 8, name: 'Henry Clark', attendance: 'Late' },
      { id: 9, name: 'Ivy Harris', attendance: 'Absent' },
      { id: 10, name: 'Jack Martinez', attendance: 'Present' },
      { id: 11, name: 'Kara White', attendance: 'Late' },
      { id: 12, name: 'Leo Walker', attendance: 'Present' },
      { id: 13, name: 'Mia Young', attendance: 'Absent' },
      { id: 14, name: 'Noah King', attendance: 'Present' },
      { id: 15, name: 'Olivia Scott', attendance: 'Late' },
      { id: 16, name: 'Paul Green', attendance: 'Present' },
      { id: 17, name: 'Quincy Adams', attendance: 'Absent' },
      { id: 18, name: 'Rachel Turner', attendance: 'Present' },
      { id: 19, name: 'Steve Allen', attendance: 'Late' },
      { id: 20, name: 'Tina Campbell', attendance: 'Absent' }
    ],
  },
  {
    id: 2,
    title: 'Chemistry',
    startTime: '02:00 PM',
    endTime: '04:00 PM',
    bgColor: 'bg-[#EE1A99]',
    date: new Date(baseYear, 8, 2),
    textColor: 'text-[#ffffff]',
    students: [
      { id: 5, name: 'Charlie Davis', attendance: 'Absent' },
      { id: 6, name: 'Diana Evans', attendance: 'Present' },
    ],
  },
];

const ScheduleCalendar = () => {
  const [userRole, setUserRole] = useState(null); 
  const [selectedDate, setSelectedDate] = useState(today);
  const [scheduleType, setScheduleType] = useState('Day');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(() => {
    const currentMonthName = monthNames[today.getMonth()];
    const initialMonthIndex = displayMonthNames.indexOf(currentMonthName);
    return initialMonthIndex !== -1 ? initialMonthIndex : 0;
  });

  useEffect(() => {
    const token = getToken();
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        const role = getUserRole();
        setUserRole(role);
        console.log('Rola użytkownika:', role);
      } else {
        setUserRole(null);
      }
    }
  }, []);

  const [daysInMonth, setDaysInMonth] = useState(
    getDaysInMonth(monthNumbers[currentMonthIndex], getYearForMonthIndex(currentMonthIndex, baseYear))
  );

  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [selectedEvent, setSelectedEvent] = useState(null); 

  useEffect(() => {
    setDaysInMonth(getDaysInMonth(monthNumbers[currentMonthIndex], getYearForMonthIndex(currentMonthIndex, baseYear)));
  }, [currentMonthIndex, baseYear]);

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

  const openModal = (event) => {
    if (userRole === UserRoles.Administrator) {
      setSelectedEvent(event);
      setIsModalOpen(true);
    } else {
      return null;
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleAttendanceChange = (studentId, status) => {
    if (userRole === UserRoles.Administrator) {
      setSelectedEvent((prevEvent) => {
        const updatedStudents = prevEvent.students.map((student) =>
          student.id === studentId ? { ...student, attendance: status } : student
        );
        return { ...prevEvent, students: updatedStudents };
      });
    }
  };

  return (
    <div className="flex flex-col w-full">

    <Modal isOpen={isModalOpen} onClose={closeModal} widthHeightClassname="max-w-xl max-h-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Add attendance</h2>
        <X size={24} className="hover:cursor-pointer" onClick={closeModal}/>
      </div>
      {selectedEvent && (
        <div>
          <div className='w-full flex mb-2'>
            <div className='w-2/5'>
              <p className='text-textBg-700 font-medium'>Student Name</p>
            </div>
            <div className='flex justify-evenly w-[calc(60%-18px)]'>
              <p className='text-textBg-700 font-medium'>Present</p>
              <p className='text-textBg-700 font-medium'>Late</p>
              <p className='text-textBg-700 font-medium'>Absent</p>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {selectedEvent.students.map((student) => (
              <div className='w-full flex mb-2' key={student.id}>
                <div className='w-2/5'>
                  <p className='text-base text-textBg-500'>{student.name}</p>
                </div>
                <div className='flex items-center justify-evenly w-3/5'> 
                  <input
                    type="radio"
                    name={`attendance-${student.id}`}
                    value="Present"
                    checked={student.attendance === 'Present'}
                    onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                    className=" h-4 w-4 accent-blueAccent-500 hover:cursor-pointer"
                  />
                  <input
                    type="radio"
                    name={`attendance-${student.id}`}
                    value="Late"
                    checked={student.attendance === 'Late'}
                    onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                    className="form-radio h-4 w-4 accent-blueAccent-500 hover:cursor-pointer"
                  />
                  <input
                    type="radio"
                    name={`attendance-${student.id}`}
                    value="Absent"
                    checked={student.attendance === 'Absent'}
                    onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                    className="form-radio h-4 w-4 accent-blueAccent-500 hover:cursor-pointer"
                  />                
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end gap-4">
            <Button text="Close" type="secondary" onClick={closeModal} />
            <Button text="Add" type="primary"  />
          </div>
        </div>
        )}
      </Modal>

      <div className="flex items-center justify-between mb-8 gap-1">
        <p className="text-textBg-700 w-full font-bold text-base flex flex-col sm:flex-row">
          {scheduleType === 'Day' ? (
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
                {monthNames[monthNumbers[currentMonthIndex]]} {getYearForMonthIndex(currentMonthIndex, baseYear)}
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
        <div className="flex items-center">
          <Button
            size="s"
            text="Day"
            type={scheduleType === 'Day' ? 'primary' : 'link'}
            className="min-w-[4rem] no-underline"
            onClick={() => handleButtonChangeScheduleType('Day')}
          />
          <Button
            size="s"
            text="Week"
            type={scheduleType === 'Week' ? 'primary' : 'link'}
            className="min-w-[4rem] no-underline hidden md:block"
            onClick={() => handleButtonChangeScheduleType('Week')}
          />
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-16">
        <div className="xl:w-fit">
          <div className="flex justify-between items-center mb-4">
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
        <div className="w-full">
          {scheduleType === 'Day' ? (
            <>
              <div className="w-full sm:w-full mt-1 max-w-full overflow-x-auto relative">
                <div className="relative overflow-hidden" style={{ height: `${calendarHeight}px` }}>
                  <div className="grid grid-cols-[auto,1fr] grid-rows-[repeat(11,66px)] w-full h-full">
                    {['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(
                      (time, idx) => (
                        <React.Fragment key={`time-row-${idx}`}>
                          <div className="flex justify-end pr-4 text-gray-500 text-xs">{time}</div>
                          <div className={`relative ${idx > 0 ? 'border-x border-b' : 'border'} border-textBg-300`}></div>
                        </React.Fragment>
                      )
                    )}
                  </div>

                  {eventsData
                    .filter((event) => areDatesEqual(event.date, selectedDate))
                    .map((event, eventIdx) => {
                      const eventStart = convertTimeToHours(event.startTime);
                      const eventEnd = convertTimeToHours(event.endTime);
                      const top = (eventStart - calendarStartHour) * 66;
                      const height = (eventEnd - eventStart) * 66;

                      return (
                        <div
                          key={eventIdx}
                          className={`absolute right-[2px] p-2 rounded-sm ${event.bgColor} ${event.textColor} ${userRole === UserRoles.Administrator ? 'cursor-pointer' : ''} `}
                          style={{ top: `${top + 2}px`, height: `${height - 5}px`, width: 'calc(100% - 76px)' }}
                          onClick={() => openModal(event)} 
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
                      className="absolute right-0 left-8 sm:left-4 flex items-center"
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
                      <p className={`text-base ${isWeekend ? 'text-red-500' : 'text-textBg-700'}`}>{weekDate.getDate()}</p>
                      <p className={`text-base ${isWeekend ? 'text-red-500' : 'text-textBg-500'}`}>{dayName}</p>
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
                          <div className="flex justify-end pr-4 text-gray-500 text-xs">{time}</div>
                          {Array.from({ length: 5 }).map((_, dayIdx) => (
                            <div key={dayIdx} className={`relative ${dayIdx === 0 ? 'border-l' : ''} ${idx > 0 ? 'border-r border-b' : 'border-r border-b border-t'} border-textBg-300`}></div>
                          ))}
                        </React.Fragment>
                      )
                    )}
                  </div>

                  {eventsData
                    .filter((event) => {
                      const weekDates = getCurrentWeekDates();
                      return weekDates.some((date) => areDatesEqual(date, event.date));
                    })
                    .map((event, eventIdx) => {
                      const eventStart = convertTimeToHours(event.startTime);
                      const eventEnd = convertTimeToHours(event.endTime);
                      const top = (eventStart - calendarStartHour) * 66;
                      const height = (eventEnd - eventStart) * 66;

                      const weekDates = getCurrentWeekDates();
                      const dayIndex = weekDates.findIndex((date) => areDatesEqual(date, event.date));

                      if (dayIndex === -1) return null;

                      return (
                        <div
                          key={eventIdx}
                          className={`absolute mx-auto p-2 rounded-sm ${event.bgColor} ${event.textColor} cursor-pointer`}
                          style={{
                            top: `${top + 2}px`,
                            height: `${height - 5}px`,
                            left: `calc(((100% - 72px) / 5) * ${dayIndex} + 74px)`,
                            width: 'calc((100% - 98px) / 5)',
                          }}
                          onClick={() => openModal(event)}
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
                      className="absolute right-0 left-8 sm:left-4 flex items-center"
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
