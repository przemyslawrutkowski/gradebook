import React, { useState, useEffect, useMemo } from "react";
import PageTitle from '../components/PageTitle';
import { CheckCircle, XCircle, Clock, Hourglass, Search, Plus } from 'lucide-react';
import Button from "../components/Button";
import Calendar from '../components/Calendar';
import { getToken, getUserId } from '../utils/UserRoleUtils';
import {
  monthNames,
  displayMonthNames,
  monthNumbers,
  getDaysInMonth,
  areDatesEqual,
  getYearForMonthIndex
} from '../utils/SchedCalUtils';

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

  const token = getToken();
  const studentId = getUserId();

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/attendance/student/${studentId}`, { // Change endpoint as needed
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

      const mappedData = result.data.map(attendance => {
        let status = 'Absent';
        if (attendance.was_present) status = 'Present';
        if (attendance.was_late) status = 'Late';
        
        const startTime = attendance.lesson ? new Date(attendance.lesson.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null;
        const endTime = attendance.lesson ? new Date(attendance.lesson.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null;
        
        return {
          id: attendance.id,
          date: new Date(attendance.lesson?.date),
          status,
          title: attendance.lesson?.subject_name || 'No lesson',
          hour: attendance.lesson && startTime && endTime ? `${startTime} - ${endTime}` : 'No data'
        };
    });
      console.log(mappedData);
      setAttendanceData(mappedData);
    } catch (err) {
      setError(err.message); 
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    setDaysInMonth(getDaysInMonth(monthNumbers[currentMonthIndex], getYearForMonthIndex(currentMonthIndex, baseYear)));
  }, [currentMonthIndex, baseYear]);

  const attendanceStats = useMemo(() => {
    const presentCount = attendanceData.filter(attendance => attendance.status === 'Present').length;
    const lateCount = attendanceData.filter(attendance => attendance.status === 'Late').length;
    const absentCount = attendanceData.filter(attendance => attendance.status === 'Absent').length;
    return { presentCount, lateCount, absentCount };
  }, [attendanceData]);

  const getAttendancesForDate = (date) => {
    return attendanceData.filter(attendance => areDatesEqual(attendance.date, date));
  };

  const attendances = getAttendancesForDate(selectedDate);

  const handlePrev = () => {
    setCurrentMonthIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleNext = () => {
    setCurrentMonthIndex((prevIndex) => Math.min(prevIndex + 1, displayMonthNames.length - 1));
  };

  const renderDateContent = (currentDate) => {
    const attendancesForDate = getAttendancesForDate(currentDate);
    if (!attendancesForDate.length) return null;

    return (
      <div className="absolute -bottom-[6px] flex gap-1 items-center z-10">
        {attendancesForDate.map((attendance, index) => (
          <span
            key={index}
            className={`w-1 h-1 rounded-full ${attendanceTypeColors[attendance.status]}`}
            title={attendance.status}
          ></span>
        ))}
      </div>
    );
  };


  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Attendance"/>
      
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

                <h2 className='text-xl font-semibold mb-4'>
                  Attendance for {selectedDate ? `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}` : 'Select a day'}
                </h2>
                {selectedDate ? (
                  <>
                    {attendances.length > 0 ? (
                      <div className='w-full flex flex-col gap-2'>
                        {attendances.map(attendance => (
                          <div key={attendance.id} className='flex items-center gap-2 xxs:gap-4 border border-textBg-200 w-full p-3 rounded-xl'>
                            <div className='w-12 h-12 hidden xxs:flex items-center justify-center'>
                              {(() => {
                                switch (attendance.status) {
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
                                  {attendance.title}
                                </p>
                                <div className='flex gap-2 items-center'>
                                  <Clock size={12} />
                                  <p className='text-textBg-700 text-sm'>
                                    {attendance.hour}
                                  </p>
                                </div>
                              </div>
                              <div className={`w-24 text-center py-1 rounded-md ${attendance.status === 'Present' ? 'bg-[#eefdf3]' : attendance.status === 'Late' ? 'bg-[#fef9ed]' : 'bg-primary-100'}`}>
                                <p className={`text-base font-medium ${attendance.status === 'Present' ? 'text-[#17a948]' : attendance.status === 'Late' ? 'text-[#d29211]' : 'text-primary-600'}`}>{attendance.status}</p>
                              </div>
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
            </div>
          )}
          </div>
        </div>
    </main>
  );
}

export default Attendance;
