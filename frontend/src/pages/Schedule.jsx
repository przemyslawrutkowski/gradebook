import React, { useState, useEffect } from 'react';
import PageTitle from '../components/PageTitle';
import Button from '../components/Button';
import { Plus, X } from 'lucide-react';
import Modal from '../components/Modal'; 
import {
  dayNames,
  monthNames,
  displayMonthNames,
  monthNumbers,
  convertTimeToHours,
  getCurrentTimePosition,
  areDatesEqual,
  getStartOfWeek,
  formatWeekRange,
  getYearForMonthIndex,
} from '../utils/SchedCalUtils';
import { getToken, getUserRole, decodeToken } from '../utils/UserRoleUtils';
import UserRoles from '../data/userRoles';
import '../customCSS/customScrollbar.css';
import Calendar from '../components/Calendar';
import Select from 'react-select'
import CreateLessonForm from "../components/forms/lessons/CreateLessonForm";

let datesToRender = [];

const today = new Date();
let baseYear = today.getFullYear();
if (today.getMonth() < 8) {
  baseYear -= 1;
}

const classes = [
  { id: 1, name: 'Klasa 1A' },
  { id: 2, name: 'Klasa 2B' },
  { id: 3, name: 'Klasa 3C' },
];

const options = classes.map(cls => ({
  value: cls.id,
  label: cls.name
}));

const eventsData = [
  {
    id: 1,
    title: 'Biology',
    classId: 1,
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
    title: 'Music',
    classId: 1,
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
  {
    id: 3,
    title: 'Biology',
    classId: 1,
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    bgColor: 'bg-[#1A99EE]',
    date: new Date(baseYear, 8, 3),
    textColor: 'text-[#ffffff]',
    students: [
      { id: 5, name: 'Charlie Davis', attendance: 'Absent' },
      { id: 6, name: 'Diana Evans', attendance: 'Present' },
    ],
  },
  {
    id: 4,
    title: 'Physics',
    classId: 1,
    startTime: '10:00 AM',
    endTime: '12:30 PM',
    bgColor: 'bg-[#F5C747]',
    date: new Date(baseYear, 8, 4),
    textColor: 'text-[#ffffff]',
    students: [
      { id: 5, name: 'Charlie Davis', attendance: 'Absent' },
      { id: 6, name: 'Diana Evans', attendance: 'Present' },
    ],
  },
  {
    id: 5,
    title: 'Chemistry',
    classId: 1,
    startTime: '01:00 PM',
    endTime: '04:00 PM',
    bgColor: 'bg-[#f1f9fe]',
    date: new Date(baseYear, 8, 5),
    textColor: 'text-[#0f7bc4]',
    students: [
      { id: 5, name: 'Charlie Davis', attendance: 'Absent' },
      { id: 6, name: 'Diana Evans', attendance: 'Present' },
    ],
  },
];

export function Schedule() {
  const [userRole, setUserRole] = useState(null); 
  const [selectedDate, setSelectedDate] = useState(today);
  const [scheduleType, setScheduleType] = useState('Day');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(() => {
    const currentMonthName = monthNames[today.getMonth()];
    const initialMonthIndex = displayMonthNames.indexOf(currentMonthName);
    return initialMonthIndex !== -1 ? initialMonthIndex : 0;
  });
  const [selectedClass, setSelectedClass] = useState(classes[0].id);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        const role = getUserRole();
        setUserRole(role);
        console.log('User role:', role);
      } else {
        setUserRole(null);
      }
    }
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [selectedEvent, setSelectedEvent] = useState(null); 

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
    if (userRole === UserRoles.Teacher) {
      setSelectedEvent(event);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleAttendanceChange = (studentId, status) => {
    if (userRole === UserRoles.Teacher) {
      setSelectedEvent((prevEvent) => {
        const updatedStudents = prevEvent.students.map((student) =>
          student.id === studentId ? { ...student, attendance: status } : student
        );
        return { ...prevEvent, students: updatedStudents };
      });
    }
  };

  const handleChange = (selectedOption) => {
    setSelectedClass(selectedOption ? selectedOption.value : null);
  };

  const selectedOption = options.find(option => option.value === selectedClass) || null;
  
  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Schedule"/>
      {userRole === UserRoles.Teacher || userRole === UserRoles.Administrator && (
        <div className='flex items-center justify-between mb-6'>
          <Select
            value={selectedOption}
            onChange={handleChange}
            options={options}
            placeholder="Select Class"
            className='w-48 focus:outline-none focus:border-none'
            isClearable
            isSearchable
          />
          <Button type="primary" text="Create Lesson" icon={<Plus size={16} />} onClick={openCreateModal}/>
        </div>
      )}
      
      <div className="flex flex-col 2xl:flex-row justify-between sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8 gap-8 2xl:gap-16">
        <div className="flex flex-col w-full">

          <Modal isOpen={isModalOpen} onClose={closeModal} widthHeightClassname="max-w-xl max-h-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-textBg-700">Dodaj Obecność</h2>
              <X size={24} className="hover:cursor-pointer" onClick={closeModal}/>
            </div>
            {selectedEvent && (
              <div>

                <div className='w-full flex mb-2'>
                  <div className='w-2/5'>
                    <p className='text-textBg-700 font-medium'>Imię i Nazwisko</p>
                  </div>
                  <div className='flex justify-evenly w-[calc(60%-18px)]'>
                    <p className='text-textBg-700 font-medium'>Obecny</p>
                    <p className='text-textBg-700 font-medium'>Spóźniony</p>
                    <p className='text-textBg-700 font-medium'>Nieobecny</p>
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
                  <Button text="Zamknij" type="secondary" onClick={closeModal} />
                  <Button text="Dodaj" type="primary"  />
                </div>
              </div>
            )}
          </Modal>

          <div className="flex items-center justify-between mb-8 gap-1">
              <p className="text-textBg-700 w-96 font-bold text-base flex flex-col sm:flex-row">
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

            <div className='flex items-center'>
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
            <Calendar
              baseYear={baseYear}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
              handlePrev={handlePrev}
              handleNext={handleNext}
              currentMonthIndex={currentMonthIndex}
            />

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
                        .filter((event) => 
                          event.classId === Number(selectedClass) &&
                          areDatesEqual(event.date, selectedDate)
                        )
                        .map((event, eventIdx) => {
                          const eventStart = convertTimeToHours(event.startTime);
                          const eventEnd = convertTimeToHours(event.endTime);
                          const top = (eventStart - calendarStartHour) * 66;
                          const height = (eventEnd - eventStart) * 66;

                          return (
                            <div
                              key={eventIdx}
                              className={`absolute right-[2px] p-2 rounded-sm ${event.bgColor} ${event.textColor} ${userRole === UserRoles.Teacher ? 'cursor-pointer' : ''}`}
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
                <>
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
                          .filter((event) => 
                            event.classId === Number(selectedClass) &&
                            getCurrentWeekDates().some((date) => areDatesEqual(date, event.date))
                          )
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <CreateLessonForm
        isOpen={isCreateModalOpen} 
        onSuccess={() => {
          closeCreateModal();
        }}
        onClose={closeCreateModal}
      />

    </main>
  );
}