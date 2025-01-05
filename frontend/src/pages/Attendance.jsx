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
import Button from "../components/Button";
import ConfirmForm from '../components/forms/ConfirmForm';

const attendanceTypeColors = {
  Present: 'bg-green-500',
  Late: 'bg-yellow-500',
  Absent: 'bg-red-500',
  Excused: 'bg-blue-500',
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
  const [fetchedClasses, setFetchedClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classAttendances, setClassAttendances] = useState([]);

  const [studentId, setStudentId] = useState(null);

  const [excuseLoading, setExcuseLoading] = useState(false);
  const [excuseError, setExcuseError] = useState(null);
  const [excuseSuccess, setExcuseSuccess] = useState(null);

  const [isConfirmFormOpen, setIsConfirmFormOpen] = useState(false); // Added state for ConfirmForm

  const parentId = getUserId();
  const token = getToken();
  const userRole = getUserRole();

  const options = fetchedClasses.map((cls) => ({
    value: cls.id,
    label: cls.class_names.name
  }));

  useEffect(() => {
    if (userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) {
      fetchClasses();
    }
  }, [userRole]);

  const fetchStudentForParent = async () => {
    try {
      const response = await fetch(`http://localhost:3000/student-parent/${parentId}/students`, {
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
      setStudentId(result.data);
    } catch (err) {
      console.error("Failed to fetch students for parent:", err.message);
    }
  };

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
      setFetchedClasses(result.data);
    } catch(err){
      setError(err.message);
    } finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      if (userRole === UserRoles.Student) {
        const id = getUserId();
        setStudentId(id);
      } else if (userRole === UserRoles.Parent) {
        await fetchStudentForParent();
      }
    };

    initializeData();
  }, [userRole]);

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
    if (studentId) {
      fetchAttendance(studentId); 
    } else if (
      (userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) &&
      selectedClass
    ) {
      fetchClassAttendances();
    }
  }, [studentId, userRole, selectedClass]);

  const fetchAttendance = async (studentId) => {
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
    if (userRole === UserRoles.Student || userRole === UserRoles.Parent) {
      const presentCount = attendanceData.filter((attendance) => attendance.was_present && !attendance.was_late && !attendance.was_excused).length;
      const lateCount = attendanceData.filter((attendance) => attendance.was_present && attendance.was_late && !attendance.was_excused).length;
      const absentCount = attendanceData.filter((attendance) => !attendance.was_present && !attendance.was_late && !attendance.was_excused).length;
      const excusedCount = attendanceData.filter((attendance) => attendance.was_excused).length; // New statistic
      return { presentCount, lateCount, absentCount, excusedCount };
    }
    if (userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) {
      const presentCount = classAttendances.filter((attendance) => attendance.was_present && !attendance.was_late && !attendance.was_excused).length;
      const lateCount = classAttendances.filter((attendance) => attendance.was_present && attendance.was_late && !attendance.was_excused).length;
      const absentCount = classAttendances.filter((attendance) => !attendance.was_present && !attendance.was_late && !attendance.was_excused).length;
      const excusedCount = classAttendances.filter((attendance) => attendance.was_excused).length; // New statistic
      return { presentCount, lateCount, absentCount, excusedCount };
    }
    return { presentCount: 0, lateCount: 0, absentCount: 0, excusedCount: 0 };
  }, [attendanceData, classAttendances, userRole]);

  const getAttendancesForDate = (date) => {
    return attendanceData.filter((attendance) => {
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
  
    return classAttendances.filter((attendance) => {
      const lessonDate = new Date(attendance.lesson?.date);
      return areDatesEqual(lessonDate, selectedDate);
    });
  }, [classAttendances, selectedDate]);

  const selectedOption = options.find(option => option.value === selectedClass) || null;

  const renderDateContent = (currentDate) => {
    const attendancesForDate = getAttendancesForDate(currentDate);
    let dotElements = [];
    let uniqueStatuses = [];

    attendancesForDate.forEach((attendance) => {
      let status = null;
      if (attendance.was_excused) {
        status = 'Excused';
      } else if (attendance.was_present && !attendance.was_late) {
        status = 'Present';
      } else if (attendance.was_present && attendance.was_late) {
        status = 'Late';
      } else {
        status = 'Absent';
      }

      if (!uniqueStatuses.includes(status)) {
        uniqueStatuses.push(status);
      }
    }) 

    dotElements = uniqueStatuses.map((status, index) => (
      <span
        key={index}
        className={`w-[5px] h-[5px] rounded-full ${attendanceTypeColors[status]}`}
      ></span>
    ))
  
    return (
      <div className="absolute -bottom-[6px] flex gap-1 items-center">
        {dotElements}
      </div>
    );
  };

  const groupedAttendances = useMemo(() => {
    const group = {};

    filteredClassAttendances.forEach((attendance) => {
      const studentId = attendance.student.id;
      if (!group[studentId]) {
        group[studentId] = {
          student: attendance.student,
          attendances: [],
          stats: { present: 0, late: 0, absent: 0, excused: 0 },
        };
      }
      
      group[studentId].attendances.push(attendance);

      if (attendance.was_excused) {
        group[studentId].stats.excused += 1;
      } else if (attendance.was_present && !attendance.was_late) {
        group[studentId].stats.present += 1;
      } else if (attendance.was_present && attendance.was_late) {
        group[studentId].stats.late += 1;
      } else {
        group[studentId].stats.absent += 1;
      }
    });

    return Object.values(group);
  }, [filteredClassAttendances]);

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }; 

  // 1. Define a computed variable to check for unexcused absences
  const canExcuseAbsences = useMemo(() => {
    if (userRole === UserRoles.Parent && studentId) {
      return attendanceData.some(attendance => !attendance.was_present && !attendance.was_excused);
    }
    return false;
  }, [userRole, studentId, attendanceData]);

  const handleExcuseAbsences = async () => {
    // 3. Prevent action if there are no absences to excuse
    if (!canExcuseAbsences) {
      setExcuseError("There are no unexcused absences to excuse.");
      return;
    }

    setExcuseLoading(true);
    setExcuseError(null);
    setExcuseSuccess(null);

    try {
      const response = await fetch(`http://localhost:3000/attendance/excuse/${studentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      setExcuseSuccess("All absences have been excused successfully.");
      fetchAttendance(studentId);
    } catch (err) {
      setExcuseError(err.message || "An error occurred while excusing absences.");
    } finally {
      setExcuseLoading(false);
    }
  };

  const openConfirmForm = () => setIsConfirmFormOpen(true);
  const closeConfirmForm = () => setIsConfirmFormOpen(false);
  const handleConfirmExcuseAbsences = () => {
    closeConfirmForm();
    handleExcuseAbsences();
  };

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <div className="flex items-center justify-between">
        <PageTitle text="Attendance"/>
        {userRole === UserRoles.Parent && (
          <div className='w-full mb-4 sm:w-auto'>
            {excuseError && <p className='text-red-500'>{excuseError}</p>}
            {excuseSuccess && <p className='text-green-500'>{excuseSuccess}</p>}
            <Button
              text={!canExcuseAbsences ? "No Unexcused Absences" : excuseLoading ? 'Excusing...' : 'Excuse All Absences'}
              onClick={openConfirmForm}
              disabled={excuseLoading || !canExcuseAbsences}
              className='w-full md:w-auto'
            />
          </div>
        )}
      </div>
      
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
                <div className='w-full grid md:grid-cols-4 gap-4 mb-8'>
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
                  <div className='flex items-center gap-2 bg-[#e0f2fe] p-4 rounded-md'>
                    <Info className='text-blue-500 mr-2' size={36} />
                    <div>
                      <p className='text-lg font-semibold'>{attendanceStats.excusedCount}</p>
                      <p className='text-sm text-blue-600'>Excused</p>
                    </div>
                  </div>
                </div>

                {(userRole === UserRoles.Student || userRole === UserRoles.Parent) && (
                  <>
                    <h2 className='text-xl font-semibold mb-4'>
                      Attendance for {selectedDate ? `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}` : 'Select a day'}
                    </h2>
                    {selectedDate ? (
                      <>
                        {attendances.length > 0 ? (
                          <div className='w-full flex flex-col gap-2'>
                            {attendances.map((attendance) => {
                              let status = 'Absent';
                              if (attendance.was_excused) {
                                status = 'Excused';
                              } else if (attendance.was_present && !attendance.was_late) {
                                status = 'Present';
                              } else if (attendance.was_present && attendance.was_late) {
                                status = 'Late';
                              }

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
                                        case 'Excused':
                                          return <Info size={44} color='#3b82f6' />; 
                                        default:
                                          return <CheckCircle size={44} color='#16a34a' />;
                                      }
                                    })()}
                                  </div>
                                  <div className='w-full flex justify-between items-center'>
                                    <div className='flex flex-col gap-1'>
                                      <p className='text-textBg-900 font-semibold text-base'>
                                        {attendance.lesson?.subject.name || 'No lesson'}
                                      </p>
                                      <div className='flex gap-2 items-center'>
                                        <Clock size={12} />
                                        <p className='text-textBg-700 text-sm'>
                                          {formatTime(attendance.lesson.start_time)} - {formatTime(attendance.lesson.end_time)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className={`w-24 text-center py-1 rounded-md ${status === 'Present' ? 'bg-[#eefdf3]' : status === 'Late' ? 'bg-[#fef9ed]' : status === 'Absent' ? 'bg-primary-100' : 'bg-[#e0f2fe]'}`}>
                                      <p className={`text-base font-medium ${status === 'Present' ? 'text-[#17a948]' : status === 'Late' ? 'text-[#d29211]' : status === 'Absent' ? 'text-primary-600' : 'text-blue-600'}`}>{status}</p>
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
                          <div className='w-full flex flex-col gap-2'>
                            {groupedAttendances.map(({ student, attendances, stats }) => (
                              <div key={student.id} className='flex items-center justify-between'>
                                <div className='flex items-center gap-4'>
                                  <div className='flex items-center'>
                                    <span className='font-medium flex items-center w-32 overflow-hidden text-ellipsis'>
                                      {student.first_name} {student.last_name}
                                    </span>
                                    <Tooltip
                                      content={
                                        <div>
                                          <p className="mb-1">Student Statistics</p>
                                          <div className='flex gap-2 justify-between'>
                                            <p className="font-semibold">Present:</p>
                                            <p>{stats.present}</p>
                                          </div>
                                          <div className='flex gap-2 justify-between'>
                                            <p className="font-semibold">Late:</p>
                                            <p>{stats.late}</p>
                                          </div>
                                          <div className='flex gap-2 justify-between'>
                                            <p className="font-semibold">Absent:</p>
                                            <p>{stats.absent}</p>
                                          </div>
                                          <div className='flex gap-2 justify-between'>
                                            <p className="font-semibold">Excused:</p>
                                            <p>{stats.excused}</p>
                                          </div>
                                        </div>
                                      }
                                      position="top"
                                    >
                                      <Info className="w-4 h-4 ml-2 text-gray-500 cursor-pointer" />
                                    </Tooltip>
                                  </div>
                                </div>
                                <div className='flex gap-2'>
                                  {attendances.map((attendance, index) => {
                                    let status = 'Absent';
                                    if (attendance.was_excused) {
                                      status = 'Excused';
                                    } else if (attendance.was_present && !attendance.was_late) {
                                      status = 'Present';
                                    } else if (attendance.was_present && attendance.was_late) {
                                      status = 'Late';
                                    }

                                    return (
                                      <div
                                        key={index}
                                        className={`flex items-center justify-center w-5 h-5 rounded ${attendanceTypeColors[status]}`}
                                      >
                                        <Tooltip content={
                                          <div className='w-fit'>
                                            <div className='flex gap-2'>
                                              <p className="w-10 font-semibold">Subject:</p>
                                              <p>{attendance.lesson.subject.name || 'N/A'}</p>
                                            </div>
                                            <div className='flex gap-2'>
                                              <p className="w-10 font-semibold">Hours:</p>
                                              <p>
                                                {attendance.lesson.start_time && attendance.lesson.end_time
                                                  ? `${formatTime(attendance.lesson.start_time)} - ${formatTime(attendance.lesson.end_time)}`
                                                  : 'N/A'}
                                              </p>
                                            </div>
                                            <div className='flex gap-2'>
                                              <p className="w-10 font-semibold">Status:</p>
                                              <p>{status}</p>
                                            </div>
                                          </div>
                                        } position="left">
                                          <Info className="w-3 h-3 text-white cursor-pointer" strokeWidth={3} onClick={(e) => e.stopPropagation()} />
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

      <ConfirmForm
        isOpen={isConfirmFormOpen}
        onClose={closeConfirmForm}
        onConfirm={handleConfirmExcuseAbsences}
        title="Confirm Excuse Absences"
        description="Are you sure you want to excuse all absences for this student? This action is irreversible."
      />
    </main>
  );
}

export default Attendance; 
