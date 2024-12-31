import React, { useState, useEffect, useRef } from 'react';
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
} from '../utils/SchedCalUtils'; // Ensure these utilities are correctly implemented
import { getToken, getUserId } from "../utils/UserRoleUtils"; // Import token and userId utilities
import { Plus, Trash, Pen, Info, MoreVertical } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Tooltip from '../components/Tooltip';
import CreateHomeworkForm from "../components/forms/homeworks/CreateHomeworkForm"; 
import ConfirmDeletionForm from '../components/forms/lessons/ConfirmDeleteLessonForm';
import '../customCSS/customScrollbar.css';
import UserRoles from '../data/userRoles';

const DashboardSchedule = () => {
  const [selectedOffset, setSelectedOffset] = useState(0);
  const [marginLeft, setMarginLeft] = useState('66px');
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isCreateHomeworkModalOpen, setIsCreateHomeworkModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  const token = getToken();
  const userId = getUserId();

  const baseDate = new Date();

  const getDateWithOffset = (offset) => {
    const newDate = new Date(baseDate);
    newDate.setDate(baseDate.getDate() + offset);
    return newDate;
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setMarginLeft('60px');
      } else {
        setMarginLeft('66px');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchLessons = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch lessons three days back
      const backResponse = await fetch(`http://localhost:3000/lesson/back/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      // Fetch lessons today
      const todayResponse = await fetch(`http://localhost:3000/lesson/today/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      // Fetch lessons three days ahead
      const aheadResponse = await fetch(`http://localhost:3000/lesson/ahead/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!backResponse.ok || !todayResponse.ok || !aheadResponse.ok) {
        throw new Error('Failed to fetch lessons data.');
      }

      const backData = await backResponse.json();
      const todayData = await todayResponse.json();
      const aheadData = await aheadResponse.json();

      console.log(backData.data);
      console.log(todayData.data);
      console.log(aheadData.data);

      const combinedLessons = [
        ...backData.data, 
        ...todayData.data, 
        ...aheadData.data
      ];

      setLessons(combinedLessons);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching lessons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  // Transform lessons into events format similar to Schedule component
  const transformLessonsToEvents = (lessons) => {
    return lessons.map((lesson) => {  
      const lessonDate = new Date(lesson.date); // Ensure 'date' field exists
      return {
        id: lesson.id,
        title: lesson.subjects.name, // Adjust according to your data structure
        classId: lesson.class_id,
        subjectId: lesson.subject_id,
        startTime: new Date(lesson.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date(lesson.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        bgColor: getBgColor(lesson.subjects.name), // Function to determine color based on subject
        date: lessonDate,
        textColor: 'text-[#ffffff]',
        lessonTopic: lesson.description || '',
        teacherName: `${lesson.teachers.first_name} ${lesson.teachers.last_name}`,
        isCompleted: lesson.is_completed,
        students: lesson.students,
      };
    });
  };

  // Function to determine background color based on subject
  const getBgColor = (subject) => {
    switch (subject) {
      case 'Biology':
        return 'bg-[#1A99EE]';
      case 'Music':
        return 'bg-[#EE1A99]';
      case 'Physics':
        return 'bg-[#F5C747]';
      case 'Chemistry':
        return 'bg-[#f1f9fe]';
      default:
        return 'bg-gray-500';
    }
  };

  const eventsData = transformLessonsToEvents(lessons);

  console.log(eventsData);

  const currentTimePosition = getCurrentTimePosition();
  const calendarStartHour = 7;
  const calendarEndHour = 18; 
  const calendarHeight = (calendarEndHour - calendarStartHour) * 66;

  const selectedDate = getDateWithOffset(selectedOffset);

  const filteredEvents = eventsData.filter(event => areDatesEqual(event.date, selectedDate));

  const openCreateHomeworkModal = (lesson) => {
    setSelectedEvent(lesson);
    setIsCreateHomeworkModalOpen(true);
  };

  const closeCreateHomeworkModal = () => {
    setSelectedEvent(null);
    setIsCreateHomeworkModalOpen(false);
  };

  const openDeleteModal = (lesson) => {
    setLessonToDelete(lesson);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setLessonToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async (type) => {
    if (!lessonToDelete) return;

    try {
      let response;
      if (type === 'single') {
        response = await fetch(`http://localhost:3000/lesson/${lessonToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      } else if (type === 'all') {
        response = await fetch(`http://localhost:3000/lesson/${lessonToDelete.classId}/${lessonToDelete.subjectId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      if (type === 'single') {
        setLessons(prevLessons => prevLessons.filter(lesson => lesson.id !== lessonToDelete.id));
      } else if (type === 'all') {
        setLessons(prevLessons => prevLessons.filter(lesson => !(lesson.class_id === lessonToDelete.classId && lesson.subject_id === lessonToDelete.subjectId)));
      }

      closeDeleteModal();
    } catch (err) {
      setError(err.message);
      closeDeleteModal();
    }
  };

  const handleSaveAttendance = async ({ lessonId, attendances }) => {
    // Implement attendance saving logic here
  };

  const handleLessonUpdate = async ({ lessonId, lessonTopic }) => {
    setUpdating(true);
    setUpdateError(null);
    try {
      const response = await fetch(`http://localhost:3000/lesson/${lessonId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: lessonTopic,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const updatedLesson = await response.json();

      setLessons((prevLessons) =>
        prevLessons.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, ...updatedLesson.data } : lesson
        )
      );
    } catch (err) {
      setUpdateError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className='flex flex-col w-full'>
      <p className="text-textBg-700 font-bold text-2xl mb-6">Calendar</p>
      
      {loading ? (
        <p>Loading lessons...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <>
          <div className="flex flex-nowrap sm:gap-4 mb-6">
            {[-3, -2, -1, 0, 1, 2, 3].map((offset) => {
              const currentDate = getDateWithOffset(offset);
              const currentDayOfWeek = currentDate.getDay();
              const dayName = dayNames[(currentDayOfWeek + 6) % 7];
              const dayNumber = currentDate.getDate();
              const isSelected = offset === selectedOffset;
              const isToday = offset === 0;

              return (
                <div key={offset} className="w-full flex flex-col justify-center items-center gap-2">
                  <p className="text-textBg-900 text-sm">{dayName.slice(0, 3)}</p>
                  <p
                    className={`w-8 h-8 text-base flex items-center justify-center cursor-pointer
                    ${isSelected ? 'rounded-full bg-primary-500 text-textBg-100' : 'text-textBg-700 bg-textBg-100'}
                    `}
                    onClick={() => setSelectedOffset(offset)}
                  >
                    {dayNumber}
                  </p>
                </div>
              );
            })}
          </div>
          
          <div className="w-full sm:w-full mt-8 max-w-full overflow-x-auto relative">
            <div className="relative" style={{ height: `${calendarHeight}px` }}>
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

       
              {filteredEvents.map((event, eventIdx) => {
                const eventStart = convertTimeToHours(event.startTime);
                const eventEnd = convertTimeToHours(event.endTime);
                const top = (eventStart - calendarStartHour) * 66;
                const height = (eventEnd - eventStart) * 66;

                return (
                  <div
                    key={event.id}
                    className={`absolute right-[2px] p-2 rounded-sm ${event.bgColor} ${event.textColor} cursor-pointer`}
                    style={{ top: `${top + 2}px`, height: `${height - 5}px`, width: 'calc(100% - 76px)' }}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className='flex justify-between'>
                      <div>
                        <div className="text-sm font-bold mb-1">
                          {event.title}
                        </div>
                        <div className="text-sm">
                          {event.startTime} - {event.endTime}
                        </div>
                      </div>
                      <div className='flex items-center space-x-2 z-10'>
                        <Tooltip 
                          content={
                            <div className='w-fit'>
                              <div className='flex gap-2 items-start'>
                                <p className="font-semibold text-textBg-100 text-left w-10">Topic</p>
                                <p>{event.lessonTopic || 'N/A'}</p>
                              </div>
                              <div className='flex gap-2 items-start'>
                                <p className="font-semibold text-textBg-100 text-left w-10">Teacher</p>
                                <p>{event.teacherName || 'N/A'}</p>
                              </div>
                            </div>
                          } 
                          position="left"
                        >
                          <Info 
                            className="w-4 h-4 text-white cursor-pointer" 
                            strokeWidth={3} 
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Tooltip>
                      </div>
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

          {/* Create Homework Modal */}
          {isCreateHomeworkModalOpen && selectedEvent && (
            <Modal onClose={closeCreateHomeworkModal}>
              <CreateHomeworkForm 
                lesson={selectedEvent}
                onClose={closeCreateHomeworkModal}
              />
            </Modal>
          )}

          {/* Confirm Deletion Modal */}
          {isDeleteModalOpen && lessonToDelete && (
            <Modal onClose={closeDeleteModal}>
              <ConfirmDeletionForm 
                lesson={lessonToDelete}
                onConfirm={() => handleConfirmDelete('single')}
                onCancel={closeDeleteModal}
              />
            </Modal>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardSchedule;
