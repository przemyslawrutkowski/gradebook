import React, { useState, useEffect, useMemo } from "react";
import PageTitle from '../components/PageTitle';
import { CheckCircle, XCircle, Clock, Hourglass, Info } from 'lucide-react';
import Calendar from '../components/Calendar';
import { decodeToken, getToken, getUserId, getUserRole } from '../utils/UserRoleUtils';
import {
  monthNames,
  displayMonthNames,
  monthNumbers,
  getDaysInMonth,
  areDatesEqual,
  getYearForMonthIndex
} from '../utils/SchedCalUtils';
import UserRoles from "../data/userRoles";
import Select from 'react-select';
import Tooltip from '../components/Tooltip';

const attendanceTypeColors = {
  Present: 'bg-green-500',
  Late: 'bg-yellow-500',
  Absent: 'bg-red-500',
};

export function Attendance() {
  const today = new Date();
  let baseYear = today.getFullYear();
  if (today.getMonth() < 8) { 
    baseYear -= 1;
  }

  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(() => {
    const currentMonthName = monthNames[today.getMonth()];
    const initialMonthIndex = displayMonthNames.indexOf(currentMonthName);
    return initialMonthIndex !== -1 ? initialMonthIndex : 0;
  });
  const [daysInMonth, setDaysInMonth] = useState(
    getDaysInMonth(monthNumbers[currentMonthIndex], getYearForMonthIndex(currentMonthIndex, baseYear))
  );

  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null); 
  const [fetchedClasses, setFetchedClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classAttendances, setClassAttendances] = useState([]);

  const token = getToken();
  const studentId = getUserId();

  const options = fetchedClasses.map(cls => ({
    value: cls.id,
    label: cls.class_names.name
  }));

  useEffect(() => {
    const initializeUser = async () => {
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
    };

    initializeUser();
  }, []);

  useEffect(() => {
    if (userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) {
      fetchClasses();
    }
  }, [userRole]);

  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/class', 
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        }
      });
      if(!response.ok){
        throw new Error(`Error: ${response.status}`);
      }
      const result = await response.json();
      console.log(result.data);
      setFetchedClasses(result.data);
    } catch(err){
      setError(err.message);
    } finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      (userRole === UserRoles.Administrator || userRole === UserRoles.Teacher) &&
      fetchedClasses.length > 0 &&
      !selectedClass
    ) {
      setSelectedClass(fetchedClasses[0].id);
    }
  }, [userRole, fetchedClasses, selectedClass]);

  useEffect(() => {
    if(userRole === UserRoles.Student) {
      fetchAttendance();
    } else if (
      (userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) &&
      selectedClass
    ) {
      fetchClassAttendances();
    }
  }, [userRole, selectedClass]);


  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/attendance/student/${studentId}`, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const result = await response.json();
      console.log(result.data);

      setAttendanceData(result.data);
    } catch (err) {
      setError(err.message); 
    } finally {
      setLoading(false); 
    }
  };


  const fetchClassAttendances = async () => {
    if (!selectedClass) return; 

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/attendance/class/${selectedClass}`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
          },
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log(result.data);
      setClassAttendances(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setDaysInMonth(getDaysInMonth(monthNumbers[currentMonthIndex], getYearForMonthIndex(currentMonthIndex, baseYear)));
  }, [currentMonthIndex, baseYear]);

  const attendanceStats = useMemo(() => {
    if (userRole === UserRoles.Student) {
      const presentCount = attendanceData.filter(attendance => attendance.was_present && !attendance.was_late).length;
      const lateCount = attendanceData.filter(attendance => attendance.was_present && attendance.was_late).length;
      const absentCount = attendanceData.filter(attendance => !attendance.was_present && !attendance.was_late).length;
      return { presentCount, lateCount, absentCount };
    }
    if (userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) {
      const presentCount = classAttendances.filter(attendance => attendance.was_present && !attendance.was_late).length;
      const lateCount = classAttendances.filter(attendance => attendance.was_present && attendance.was_late).length;
      const absentCount = classAttendances.filter(attendance => !attendance.was_present && !attendance.was_late).length;
      return { presentCount, lateCount, absentCount };
    }
    return { presentCount: 0, lateCount: 0, absentCount: 0 };
  }, [attendanceData, classAttendances, userRole]);
  

  const getAttendancesForDate = (date) => {
    return attendanceData.filter(attendance => {
      const attendanceDate = new Date(attendance.lesson?.date);
      return areDatesEqual(attendanceDate, date);
    });
  };

  const attendances = getAttendancesForDate(selectedDate);

  const handlePrev = () => {
    setCurrentMonthIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleNext = () => {
    setCurrentMonthIndex((prevIndex) => Math.min(prevIndex + 1, displayMonthNames.length - 1));
  };

  const handleChange = (selectedOption) => {
    if (userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) {
      setSelectedClass(selectedOption ? selectedOption.value : null);
      setSelectedDate(today);
    }
  };

  const filteredClassAttendances = useMemo(() => {
    if (!selectedDate || classAttendances.length === 0) return [];
  
    return classAttendances.filter(attendance => {
      const lessonDate = new Date(attendance.lesson?.date);
      return areDatesEqual(lessonDate, selectedDate);
    });
  }, [classAttendances, selectedDate]);

  const selectedOption = options.find(option => option.value === selectedClass) || null;

  const renderDateContent = (currentDate) => {
    const attendancesForDate = getAttendancesForDate(currentDate);
    if (!attendancesForDate.length) return null;

    return (
      <div className="absolute -bottom-[6px] flex gap-1 items-center z-10">
        {attendancesForDate.map((attendance, index) => {
          let status = 'Absent';
          if (attendance.was_present) status = 'Present';
          if (attendance.was_late) status = 'Late';
          
          return (
            <span
              key={index}
              className={`w-1 h-1 rounded-full ${attendanceTypeColors[status]}`}
              title={status}
            ></span>
          );
        })}
      </div>
    );
  };

  const groupedAttendances = useMemo(() => {
    const group = {};

    filteredClassAttendances.forEach(attendance => {
      const studentId = attendance.student.id;
      if (!group[studentId]) {
        group[studentId] = {
          student: attendance.student,
          attendances: []
        };
      }
      group[studentId].attendances.push(attendance);
    });

    console.log(Object.values(group))
    return Object.values(group);
  }, [filteredClassAttendances]);

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Attendance"/>
      
      {(userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) && (
        <div className='flex flex-col xs:flex-row gap-4 items-center justify-between mb-6 mt-4 sm:mt-0'>
          <Select
            value={selectedOption}
            onChange={handleChange}
            options={options}
            placeholder="Select class"
            className='w-full xs:w-48 focus:outline-none focus:border-none'
            isSearchable
          />
        </div>
      )}

      <div className="flex flex-col 2xl:flex-row justify-between sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8 gap-8 2xl:gap-16">
        <div className='flex flex-col w-full'>
          {loading ? (
            <p className="text-textBg-900 text-lg">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="flex flex-col xl:flex-row gap-16">
              <Calendar
                baseYear={baseYear}
                onDateSelect={setSelectedDate}
                selectedDate={selectedDate}
                renderDateContent={renderDateContent}
                handlePrev={handlePrev}
                handleNext={handleNext}
                currentMonthIndex={currentMonthIndex}
              />

              <div className='w-full bg-white'>
                <div className='w-full grid md:grid-cols-3 gap-4 mb-8'>
                  <div className='flex items-center gap-2 bg-[#eefdf3] p-4 rounded-md'>
                    <CheckCircle className='text-green-500 mr-2' size={36} />
                    <div>
                      <p className='text-lg font-semibold'>{attendanceStats.presentCount}</p>
                      <p className='text-sm text-green-600'>Attendances</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2 bg-[#fef9ed] p-4 rounded-md'>
                    <Hourglass className='text-yellow-500 mr-2' size={36} />
                    <div>
                      <p className='text-lg font-semibold'>{attendanceStats.lateCount}</p>
                      <p className='text-sm text-yellow-600'>Late</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2 bg-primary-100 p-4 rounded-md'>
                    <XCircle className='text-red-500 mr-2' size={36} />
                    <div>
                      <p className='text-lg font-semibold'>{attendanceStats.absentCount}</p>
                      <p className='text-sm text-red-600'>Absences</p>
                    </div>
                  </div>
                </div>

                {userRole === UserRoles.Student && (
                  <>
                    <h2 className='text-xl font-semibold mb-4'>
                      Attendance for {selectedDate ? `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}` : 'Select a day'}
                    </h2>
                    {selectedDate ? (
                      <>
                        {attendances.length > 0 ? (
                          <div className='w-full flex flex-col gap-2'>
                            {attendances.map(attendance => {
                              const status = attendance.was_present ? (attendance.was_late ? 'Late' : 'Present') : 'Absent';

                              return (
                                <div key={attendance.id} className='flex items-center gap-2 xxs:gap-4 border border-textBg-200 w-full p-3 rounded-xl'>
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
                                        {attendance.lesson?.subject_name || 'No lesson'}
                                      </p>
                                      <div className='flex gap-2 items-center'>
                                        <Clock size={12} />
                                        <p className='text-textBg-700 text-sm'>
                                          {attendance.lesson.start_time} - {attendance.lesson.end_time}
                                        </p>
                                      </div>
                                    </div>
                                    <div className={`w-24 text-center py-1 rounded-md ${status === 'Present' ? 'bg-[#eefdf3]' : status === 'Late' ? 'bg-[#fef9ed]' : 'bg-primary-100'}`}>
                                      <p className={`text-base font-medium ${status === 'Present' ? 'text-[#17a948]' : status === 'Late' ? 'text-[#d29211]' : 'text-primary-600'}`}>{status}</p>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <p className='text-textBg-500'>No attendance records for this day.</p>
                        )}
                      </>
                    ) : (
                      <p className='text-textBg-500'>Select a day to view attendance.</p>
                    )}
                  </>
                )}

                {(userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) && (
                  <div className='w-full bg-white mt-8'>
                    <h2 className='text-xl font-semibold mb-4'>
                      Attendance for {selectedDate ? `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}` : 'Select a day'}
                    </h2>
                    {selectedDate ? (
                      <>
                        {filteredClassAttendances.length > 0 ? (
                          <div className='w-full flex flex-col gap-0'>
                            {groupedAttendances.map(({ student, attendances }) => (
                              <div key={student.id} className='flex items-center justify-between w-full p-3 rounded-xl'>
                                <div className='flex items-center gap-4'>
                                  <div className='flex items-center'>
                                    <span className='font-medium'>{student.first_name} {student.last_name}</span>
                                  </div>
                                </div>
                                <div className='flex gap-2'>
                                  {attendances.map((attendance, index) => {
                                    let status = 'Absent';
                                    if (attendance.was_present) status = 'Present';
                                    if (attendance.was_late) status = 'Late';
                                    
                                    return (
                                      <div
                                        key={index}
                                        className={`flex items-center justify-center w-4 h-4 rounded ${attendanceTypeColors[status]}`}
                                      >
                                        <Tooltip content={
                                          <div className='w-fit'>
                                            <div className='flex gap-2'>
                                              <p>Subject:</p>
                                              <p>{attendance.lesson.subject_name || 'N/A'}</p>
                                            </div>
                                            <div className='flex gap-2'>
                                              <p>Hours:</p>
                                              <p>
                                                {attendance.lesson.start_time && attendance.lesson.end_time
                                                  ? `${attendance.lesson.start_time} - ${attendance.lesson.end_time}`
                                                  : 'N/A'}
                                              </p>
                                            </div>
                                          </div>
                                        } position="left">
                                          <Info className="w-[10px] h-[10px] text-white cursor-pointer" strokeWidth={3} onClick={(e) => e.stopPropagation()}/>
                                        </Tooltip>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className='text-textBg-500'>No attendance records for this day.</p>
                        )}
                      </>
                    ) : (
                      <p className='text-textBg-500'>Select a day to view attendance.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Attendance;
