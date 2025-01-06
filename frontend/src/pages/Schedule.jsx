import React, { useState, useEffect } from 'react';
import PageTitle from '../components/PageTitle';
import Button from '../components/Button';
import { Plus, Trash, Info, MoreVertical, NotebookPen, FilePlus, Award, FilePlus2 } from 'lucide-react';
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
import { getToken, getUserRole, getUserId } from '../utils/UserRoleUtils';
import UserRoles from '../data/userRoles';
import '../customCSS/customScrollbar.css';
import Calendar from '../components/Calendar';
import Select from 'react-select';
import CreateLessonForm from "../components/forms/lessons/CreateLessonForm";
import AddAttendanceForm from '../components/forms/attendance/AddAttendanceForm';
import ConfirmDeleteLesson from '../components/forms/lessons/ConfirmDeleteLessonForm';
import Tooltip from '../components/Tooltip';
import CreateHomeworkForm from "../components/forms/homeworks/CreateHomeworkForm"; 
import CreateGradeForm from '../components/forms/grades/CreateGradeForm';
import DropdownMenu from '../components/Dropdown';
import { toast } from 'react-toastify';
import {formatTime} from '../utils/dateTimeUtils'
import CreateExamForm from '../components/forms/exams/CreateExamForm';

const today = new Date();
let baseYear = today.getFullYear();
if (today.getMonth() < 8) {
  baseYear -= 1;
}

export function Schedule() {
  const [selectedDate, setSelectedDate] = useState(today);
  const [scheduleType, setScheduleType] = useState('Day');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(() => {
    const currentMonthName = monthNames[today.getMonth()];
    const initialMonthIndex = displayMonthNames.indexOf(currentMonthName);
    return initialMonthIndex !== -1 ? initialMonthIndex : 0;
  });
  const [selectedClass, setSelectedClass] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false); 
  const [selectedEvent, setSelectedEvent] = useState(null); 
  const [isCreateHomeworkModalOpen, setIsCreateHomeworkModalOpen] = useState(false); 
  const [selectedLessonForHomework, setSelectedLessonForHomework] = useState(null);
  const calendarStartHour = 7;
  const calendarEndHour = 18;
  const calendarHeight = (calendarEndHour - calendarStartHour) * 66;
  const currentTimePosition = getCurrentTimePosition();
  const [loading, setLoading] = useState(false);
  const [fetchedClasses, setFetchedClasses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletionType, setDeletionType] = useState('single');
  const [isCreateGradeModalOpen, setIsCreateGradeModalOpen] = useState(false);
  const [selectedLessonForGrade, setSelectedLessonForGrade] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isCreateExamModalOpen, setIsCreateExamModalOpen] = useState(false);
  const [selectedLessonForExam, setSelectedLessonForExam] = useState(null);

  const parentId = getUserId();
  const token = getToken();
  const userRole = getUserRole();

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
      setUserId(result.data);
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      if (userRole === UserRoles.Student) {
        const id = getUserId();
        setUserId(id);
      } else if (userRole === UserRoles.Parent) {
        await fetchStudentForParent();
      }
    };
  
    initializeData();
  }, [userRole]);

  const options = fetchedClasses.map(cls => ({
    value: cls.id,
    label: cls.class_names.name
  }));

  useEffect(() => {
    if ((userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) && fetchedClasses.length > 0 && !selectedClass) {
      setSelectedClass(fetchedClasses[0].id);
    }
  }, [userRole, fetchedClasses, selectedClass]);

  useEffect(() => {
    const fetchData = async () => {
      if (userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) {
        if (selectedClass) {
          fetchLessonsForClass(selectedClass); 
        } else {
          fetchLessonsForUser(userId);
        }
      } else if (userRole === UserRoles.Student || userRole === UserRoles.Parent) {
        if (userId) {
          fetchLessonsForUser(userId);
        }
      }
    };
  
    fetchData();
  }, [userRole, selectedClass, userId]);

  const fetchClasses = async () => {
    if (userRole !== UserRoles.Teacher && userRole !== UserRoles.Administrator) return;

    setLoading(true);
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
      toast.error(err.message || 'An unexpected error occurred.');
    } finally{
      setLoading(false);
    }
  };

  const fetchLessonsForClass = async (classId) => {
    if (!classId) {
      setLessons([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:3000/lesson/class/${classId}`, {
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
      setLessons(result.data);
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonsForUser = async (userId) => {
    if (!userId) {
      setLessons([]);
      return;
    }

    setLoading(true);

    if(userRole === UserRoles.Student || userRole === UserRoles.Teacher || userRole === UserRoles.Parent){
      try {
        const response = await fetch(`http://localhost:3000/lesson/user/${userId}`, {
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
        setLessons(result.data);
      } catch (err) {
        toast.error(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
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

      const data = await response.json();

      if (type === 'single') {
        setLessons(prevLessons => prevLessons.filter(lesson => lesson.id !== lessonToDelete.id));
      } else if (type === 'all') {
        setLessons(prevLessons => prevLessons.filter(lesson => !(lesson.class_id === lessonToDelete.classId && lesson.subject_id === lessonToDelete.subjectId)));
      }

      closeDeleteModal();
      toast.success(data.message || 'Class name deleted successfully.');
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
      closeDeleteModal();
    }
  };

  useEffect(() => {
    if (userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) {
      fetchClasses();
    }
  }, [userRole]);

  const handleButtonChangeScheduleType = (value) => {
    setScheduleType(value);
  };

  const handlePrev = () => {
    setCurrentMonthIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleNext = () => {
    setCurrentMonthIndex((prevIndex) => Math.min(prevIndex + 1, displayMonthNames.length - 1));
  };

  const getCurrentWeekDates = () => {
    const startOfWeek = getStartOfWeek(selectedDate || today);
    return Array.from({ length: 7 }, (_, idx) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + idx);
      return date;
    });
  };

  const handleChange = (selectedOption) => {
    if (userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) {
      setSelectedClass(selectedOption ? selectedOption.value : null);
      setSelectedDate(today);
    }
  };

  const selectedOption = options.find(option => option.value === selectedClass) || null;

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openDeleteModal = (lesson) => {
    setLessonToDelete(lesson);
    setIsDeleteModalOpen(true);
  };
  
  const closeDeleteModal = () => {
    setLessonToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const openCreateHomeworkModal = (lesson) => {
    setSelectedLessonForHomework(lesson);
    setIsCreateHomeworkModalOpen(true);
  };

  const closeCreateHomeworkModal = () => {
    setSelectedLessonForHomework(null);
    setIsCreateHomeworkModalOpen(false);
  };

  const openCreateGradeModal = (lesson) => {
    setSelectedLessonForGrade(lesson);
    setIsCreateGradeModalOpen(true);
  };
  
  const closeCreateGradeModal = () => {
    setSelectedLessonForGrade(null);
    setIsCreateGradeModalOpen(false);
  };

  const openCreateExamModal = (lesson) => {
    setSelectedLessonForExam(lesson);
    setIsCreateExamModalOpen(true);
  };

  const closeCreateExamModal = () => {
    setSelectedLessonForExam(null);
    setIsCreateExamModalOpen(false);
  };

  const mapLessonsToEvents = () => {
    return lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.subjects.name, 
      classId: lesson.class_id,
      subjectId: lesson.subject_id,
      teacherId: lesson.teacher_id,
      startTime: formatTime(lesson.start_time),
      endTime: formatTime(lesson.end_time),
      bgColor: getBackgroundColor(lesson.subjects.name),
      date: new Date(lesson.date),
      textColor: 'text-[#ffffff]',
      students: lesson.students,
      lessonTopic: lesson.description || '',
      isCompleted: lesson.is_completed,
      teacherName: `${lesson.teachers.first_name} ${lesson.teachers.last_name}`
    }));
  };

  const getBackgroundColor = (subjectName) => {
    switch (subjectName) {
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

  const events = mapLessonsToEvents();

  const [updateError, setUpdateError] = useState(null);
  const [updating, setUpdating] = useState(false);

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
      toast.success(updatedLesson.message || 'Class name deleted successfully.');
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setUpdating(false);
    }
  };


  const handleSaveAttendance = async ({ lessonId, attendances }) => {
    setUpdating(true);
    setUpdateError(null);
    try {
      const response = await fetch('http://localhost:3000/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          lessonId,
          attendances,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) {
        if (selectedClass) {
          fetchLessonsForClass(selectedClass);
        } else {
          fetchLessonsForUser(userId);
        }
      } else if (userRole === UserRoles.Student || userRole === UserRoles.Parent) {
        if (userId) {
          fetchLessonsForUser(userId);
        }
      }
  
      closeModal();
      toast.success(data.message || 'Class name deleted successfully.');
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setUpdating(false);
    }
  };

  const openModal = (event) => {
    if (userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) {
      if (event && event.id) {
        setSelectedEvent({ ...event, description: event.lessonTopic });
        setIsAttendanceModalOpen(true);
      } else {
        console.error('Invalid event data', event);
      }
    }
  };

  const closeModal = () => {
    setIsAttendanceModalOpen(false);
    setSelectedEvent(null);
  };

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event) => {
      setOpenDropdownId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const openDropdown = (event, buttonElement) => {
    const rect = buttonElement.getBoundingClientRect();
    const dropdownWidth = 176; // px, odpowiada Tailwind klasie w-44
    let left = rect.left + window.scrollX - dropdownWidth; // Pozycja po lewej stronie przycisku

    // Jeśli dropdown wychodzi poza lewą krawędź ekranu, ustaw na 0
    if (left < 0) left = rect.left + window.scrollX;

    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: left,
    });
    setOpenDropdownId(event.id);
  };

  if (loading) {
    return <div className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">Loading...</div>;
  }


  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Schedule"/>
      
      {(userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) && (
        <div className='flex flex-col xs:flex-row gap-4 items-center justify-between mb-6 mt-4 sm:mt-0'>
          <Select
            value={selectedOption}
            onChange={handleChange}
            options={options}
            placeholder="Select class"
            className='w-full xs:w-48 focus:outline-none focus:border-none'
            isClearable={userRole !== UserRoles.Administrator}
            isSearchable
          />
          <div className="flex gap-2 w-full xs:w-auto">
            <Button 
              type="primary" 
              text="Create Lesson" 
              icon={<Plus size={16} />} 
              onClick={openCreateModal} 
              className="w-full xs:w-36"
            />
          </div>
        </div>
      )}
      
      <div className="flex flex-col 2xl:flex-row justify-between sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8 gap-8 2xl:gap-16">
        <div className="flex flex-col w-full">

          <div className="flex items-center justify-between mb-8 gap-1">
              <p className="text-textBg-700 font-bold text-base flex flex-col sm:flex-row">
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
                      {/* Siatka czasu */}
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

                      {/* Lekcje */}
                      {events
                      .filter((event) => areDatesEqual(event.date, selectedDate))
                      .map((event, eventIdx) => {
                        const eventStart = convertTimeToHours(event.startTime);
                        const eventEnd = convertTimeToHours(event.endTime);
                        const top = (eventStart - calendarStartHour) * 66;
                        const height = (eventEnd - eventStart) * 66;

                        return (
                          <div
                            key={eventIdx}
                            className={`absolute right-[2px] p-2 rounded-sm ${event.bgColor} ${event.textColor} ${userRole === UserRoles.Teacher || userRole === UserRoles.Administrator ? 'cursor-pointer' : ''}`}
                            style={{ top: `${top + 2}px`, height: `${height - 5}px`, width: 'calc(100% - 76px)' }}
                            onClick={() => openModal(event)} 
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
                              <div className='flex items-center z-10'>
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

                                {/* Akcje dla desktop */}
                                {(userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) && (
                                  <div className='hidden md:flex -space-x-1'>
                                    <Button 
                                      type="link" 
                                      icon={<Award size={16} color='#fff' strokeWidth={3}/>} 
                                      size="xs"
                                      className="z-10" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openCreateGradeModal(event);
                                      }}
                                    />
                                    <Button 
                                      type="link" 
                                      icon={<FilePlus2 size={16} color='#fff' strokeWidth={3}/>} 
                                      size="xs"
                                      className="z-10" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openCreateHomeworkModal(event);
                                      }}
                                    />
                                    <Button 
                                      type="link" 
                                      icon={<NotebookPen size={16} color='#fff' strokeWidth={3}/>} 
                                      size="xs"
                                      className="z-10" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openCreateExamModal(event);
                                      }}
                                    />
                                    <Button 
                                      type="link" 
                                      icon={<Trash size={16} color='#fff' strokeWidth={3}/>} 
                                      size="xs"
                                      className="z-10" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openDeleteModal(event);
                                      }}
                                    />
                                  </div>
                                )}

                                {/* Akcje dla mobile z dropdownem */}
                                {(userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) && (
                                  <div className='md:hidden relative ml-1'>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openDropdown(event, e.currentTarget);
                                      }}
                                      className="text-white focus:outline-none flex items-center justify-center"
                                    >
                                      <MoreVertical size={16} />
                                    </button>
                                    {openDropdownId === event.id && (
                                      <DropdownMenu
                                        position={dropdownPosition}
                                        onClose={() => setOpenDropdownId(null)}
                                      >
                                        <div className='flex items-center gap-2 text-textBg-600 p-2'>
                                          <NotebookPen size={16} strokeWidth={3}/>
                                          <button
                                            className="py-2 text-sm font-medium w-full text-left"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openCreateGradeModal(event);
                                              setOpenDropdownId(null);
                                            }}
                                          >
                                            Add Grades
                                          </button>
                                        </div>
                                        <div className='flex items-center gap-2 text-textBg-600 p-2'>
                                          <Plus size={16} strokeWidth={3}/>
                                          <button
                                            className="py-2 text-sm font-medium w-full text-left"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openCreateHomeworkModal(event);
                                              setOpenDropdownId(null);
                                            }}
                                          > 
                                            Create Homework
                                          </button>
                                        </div>

                                        <div className='flex items-center gap-2 text-textBg-600 p-2'>
                                        <FilePlus size={16} strokeWidth={3}/>
                                          <button
                                            className="py-2 text-sm font-medium w-full text-left"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openCreateExamModal(event);
                                              setOpenDropdownId(null);
                                            }}
                                          >
                                            Create Exam
                                          </button>
                                        </div>

                                        <div className='flex items-center gap-2 text-textBg-600 p-2'>
                                          <Trash size={16} strokeWidth={3}/>
                                          <button
                                            className="py-2 text-sm font-medium w-full text-left"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openDeleteModal(event);
                                              setOpenDropdownId(null);
                                            }}
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      </DropdownMenu>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Indykator aktualnego czasu */}
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
                        {/* Siatka czasu tygodniowego */}
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

                        {/* Lekcje tygodniowe */}
                        {events
                          .filter((event) => 
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
                                <div className="text-sm">
                                  {event.startTime} - {event.endTime}
                                </div>
                          
                              </div>
                            );
                          })}

                        {/* Indykator aktualnego czasu */}
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

      {/* Formularze modali */}
      <CreateLessonForm
        isOpen={isCreateModalOpen} 
        onSuccess={() => {
          closeCreateModal();
          if (userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) {
            if (selectedClass) {
              fetchLessonsForClass(selectedClass);
            } else {
              fetchLessonsForUser(userId);
            }
          } else if (userRole === UserRoles.Student || userRole === UserRoles.Parent) {
            if (userId) {
              fetchLessonsForUser(userId);
            }
          }
        }}
        onClose={closeCreateModal}
      />

      <AddAttendanceForm
        isOpen={isAttendanceModalOpen}
        onClose={closeModal}
        selectedEvent={selectedEvent}
        userRole={userRole}
        handleSaveAttendance={handleSaveAttendance}
        handleLessonUpdate={handleLessonUpdate}
        fetchLessonsForClass={fetchLessonsForClass}
        fetchLessonsForTeacher={fetchLessonsForUser}
        selectedClass={selectedClass}
      />

      <ConfirmDeleteLesson
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description="Are you sure you want to delete this lesson? You can choose to delete only this lesson or all lessons for this class and subject."
      />

      <CreateHomeworkForm
        isOpen={isCreateHomeworkModalOpen} 
        onClose={closeCreateHomeworkModal}
        onSuccess={() => {
          closeCreateHomeworkModal();
          if (userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) {
            if (selectedClass) {
              fetchLessonsForClass(selectedClass);
            } else {
              fetchLessonsForUser(userId);
            }
          } 
        }}
        lessonId={selectedLessonForHomework ? selectedLessonForHomework.id : null}
      />

      <CreateGradeForm
        isOpen={isCreateGradeModalOpen}
        onClose={closeCreateGradeModal}
        onSuccess={() => {
          closeCreateGradeModal();
          if (userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) {
            if (selectedClass) {
              fetchLessonsForClass(selectedClass);
            } else {
              fetchLessonsForUser(userId);
            }
          } 
        }}
        students={selectedLessonForGrade ? selectedLessonForGrade.students : []}
        lessonId={selectedLessonForGrade ? selectedLessonForGrade.id : null}
        subjectId={selectedLessonForGrade ? selectedLessonForGrade.subjectId : null}
        teacherId={selectedLessonForGrade ? selectedLessonForGrade.teacherId : null}
      />

      <CreateExamForm
        isOpen={isCreateExamModalOpen}
        onClose={closeCreateExamModal}
        onSuccess={() => {
          closeCreateExamModal();
          fetchLessonsForClass();
        }}
        lessonId={selectedLessonForExam ? selectedLessonForExam.id : null}
      />

      {updating && <div className="mt-4 text-blue-500">Updating lesson...</div>}
      {updateError && <div className="mt-4 text-red-500">Error: {updateError}</div>}
    </main>
  );
} 

export default Schedule;
