import React from "react";
import PageTitle from '../components/PageTitle';
import { useState, useEffect, useMemo } from 'react';
import { CheckCircle, XCircle,  Clock,  Hourglass } from 'lucide-react';
import {
  monthNames,
  displayMonthNames,
  monthNumbers,
  getDaysInMonth,
  areDatesEqual,
  getYearForMonthIndex
} from '../utils/SchedCalUtils';
import Calendar from '../components/Calendar';

const today = new Date();
let baseYear = today.getFullYear();
if (today.getMonth() < 8) { 
  baseYear -= 1;
}

const attendanceData = [
    { 
      date: new Date(baseYear, 8, 1), 
      status: 'Present', 
      title: 'Biology', 
      hour: '09:00 AM'
    },
    { 
      date: new Date(baseYear, 8, 1), 
      status: 'Present', 
      title: 'Mathematics', 
      hour: '10:00 AM'
    },
    { 
      date: new Date(baseYear, 8, 1), 
      status: 'Late', 
      title: 'Physics', 
      hour: '11:00 AM'
    },
    { 
      date: new Date(baseYear, 8, 1), 
      status: 'Absent', 
      title: 'PE', 
      hour: '12:00 AM'
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

export function Attendance() {

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

  // Function to render custom content on each date
  const renderDateContent = (currentDate) => {
    const attendanceForDate = getAttendanceForDate(currentDate);
    if (!attendanceForDate) return null;

    return (
      <div className="absolute -bottom-[6px] flex gap-1 items-center z-10">
        <span
          className={`w-1 h-1 rounded-full ${attendanceTypeColors[attendanceForDate.status]}`}
          title={attendanceForDate.status}
        ></span>
      </div>
    );
  };

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Attendance"/>
      <div className="flex flex-col 2xl:flex-row justify-between sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8 gap-8 2xl:gap-16">
        <div className='flex flex-col w-full'>
          <div className='flex flex-col xl:flex-row gap-16'>
            {/* Reusable Calendar Component */}
            <Calendar
              baseYear={baseYear}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
              renderDateContent={renderDateContent}
              handlePrev={handlePrev}
              handleNext={handleNext}
              currentMonthIndex={currentMonthIndex}
            />

            {/* Attendance Details Section */}
            <div className='w-full bg-white'>
              {/* Attendance Statistics */}
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

              {/* Attendance Details */}
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
      </div>
    </main>
  );
}
