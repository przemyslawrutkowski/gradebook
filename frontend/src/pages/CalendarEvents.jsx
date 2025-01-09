import React, { useState, useEffect } from "react";
import PageTitle from '../components/PageTitle';
import { Clock, MapPin, PartyPopper, Plus, Pen, Trash, Info } from 'lucide-react';
import {
  dayNames,
  monthNames,
  displayMonthNames,
  monthNumbers,
  getDaysInMonth,
  areDatesEqual,
  getYearForMonthIndex
} from '../utils/SchedCalUtils';
import Calendar from '../components/Calendar';
import Button from "../components/Button";
import { getToken, getUserRole, getUserId } from "../utils/UserRoleUtils";
import CreateEventForm from "../components/forms/events/CreateEventForm"; 
import EditEventForm from "../components/forms/events/EditEventForm";
import EditExamForm from "../components/forms/exams/EditExamForm";
import ConfirmForm from "../components/forms/ConfirmForm";
import UserRoles from "../data/userRoles";
import { toast } from "react-toastify";

const today = new Date();
let baseYear = today.getFullYear();
if (today.getMonth() < 8) { 
  baseYear -= 1;
}

export function CalendarEvents() {
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(() => {
    const currentMonthName = monthNames[today.getMonth()];
    const initialMonthIndex = displayMonthNames.indexOf(currentMonthName);
    return initialMonthIndex !== -1 ? initialMonthIndex : 0;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [isDeleteEventModalOpen, setIsDeleteEventModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const [isEditExamModalOpen, setIsEditExamModalOpen] = useState(false);
  const [examToEdit, setExamToEdit] = useState(null);
  const [isDeleteExamModalOpen, setIsDeleteExamModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);

  const [userId, setUserId] = useState(null);
  
  const parentId = getUserId();
  const token = getToken();
  const userRole = getUserRole();

  const [eventTypes, setEventTypes] = useState([]);
  const [eventTypeCardColors, setEventTypeCardColors] = useState({});
  const [eventTypeLegendColors, setEventTypeLegendColors] = useState({});

  const assignColorsToEventTypeCardColors = (types) => {
    const cardColors = [
      'bg-[#f1f8fd] text-[#379ae6]',
      'bg-[#eefdf3] text-[#1dd75b]',
      'bg-[#fdf1f3] text-[#EB4C60]',
      'bg-[#fef9ed] text-[#efb034]',
      'bg-[#f3f1fe] text-[#7051EE]',
      'bg-[#f2fafd] text-[#1e8eb1]',
      'bg-[#fdf2f2] text-pink-500',
      'bg-teal-100 text-teal-600',
      'bg-orange-100 text-orange-600',
      'bg-gray-100 text-gray-600',
    ];
    const legendColors = [
      'bg-[#379ae6]',
      'bg-[#1dd75b]',
      'bg-[#EB4C60]',
      'bg-[#efb034]',
      'bg-[#7051EE]',
      'bg-[#1e8eb1]',
      'bg-pink-500',
      'bg-teal-600',
      'bg-orange-600',
      'bg-gray-600',
    ];
    const newEventTypeCardColors = {};
    const newEventTypeLegendColors = {};
    types.forEach((type, index) => {
      newEventTypeCardColors[type.id] = cardColors[index % cardColors.length];
      newEventTypeLegendColors[type.id] = legendColors[index % legendColors.length];
    });
    newEventTypeCardColors['exam'] = 'bg-red-100 text-red-600';
    newEventTypeLegendColors['exam'] = 'bg-red-600';
    setEventTypeCardColors(newEventTypeCardColors);
    setEventTypeLegendColors(newEventTypeLegendColors);
  };
  
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
        console.error("Failed to fetch students for parent:", err.message);
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



  const fetchEventTypes = async () => {
    try {
      const response = await fetch('http://localhost:3000/event-type', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching event types: ${response.status}`);
      }
      const result = await response.json();

      setEventTypes(result.data);
      assignColorsToEventTypeCardColors(result.data);
      setEventTypes(prevTypes => [
        ...prevTypes,
        { id: 'exam', name: 'Exam' }
      ]);
    } catch (err) {
      setError(err.message || 'Failed to load event types.');
      toast.error(err.message || 'An unexpected error occurred.');
    }
  };

  useEffect(() => {
    fetchEventTypes();
  }, [token]);

  const fetchEvents = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const eventsResponse = await fetch('http://localhost:3000/school-event', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
      });

      if (!eventsResponse.ok) {
        throw new Error(`Error fetching events: ${eventsResponse.status}`);
      }

      const eventsResult = await eventsResponse.json();

      let examsUrl = 'http://localhost:3000/exam';
      if (userRole !== UserRoles.Administrator) {
        examsUrl = `http://localhost:3000/exam/${userId}`;
      }

      const examsResponse = await fetch(examsUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
      });

      if (!examsResponse.ok) {
        throw new Error(`Error fetching exams: ${examsResponse.status}`);
      }

      const examsResult = await examsResponse.json();

      const mappedExams = examsResult.data.map(exam => ({
        id: exam.id,
        name: `Exam ${exam.topic}`,
        date: exam.lesson.date || '',
        start_time: exam.lesson.start_time || '',
        end_time: exam.lesson.end_time || '',
        location: exam.location || 'N/A',
        event_type_id: 'exam',
        type: 'exam',
        topic: exam.topic || '',
        scope: exam.scope || '', 
      }));

      const combinedEvents = [
        ...eventsResult.data.map(event => ({
          ...event,
          type: 'event',
        })),
        ...mappedExams,
      ];

      setEvents(combinedEvents);
      console.log(combinedEvents);
    } catch (err) {
      setError(err.message || 'Failed to load events and exams.');
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchEvents(userId); 
    }
  }, [token, userId, userRole]);

  useEffect(() => {
    setDaysInMonth(getDaysInMonth(monthNumbers[currentMonthIndex], getYearForMonthIndex(currentMonthIndex, baseYear)));
  }, [currentMonthIndex, baseYear]);

  const [daysInMonth, setDaysInMonth] = useState(
    getDaysInMonth(monthNumbers[currentMonthIndex], getYearForMonthIndex(currentMonthIndex, baseYear))
  );

  const handlePrev = () => {
    setCurrentMonthIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleNext = () => {
    setCurrentMonthIndex((prevIndex) => Math.min(prevIndex + 1, displayMonthNames.length - 1));
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return areDatesEqual(eventDate, date);
    });
  };

  const renderDateContent = (currentDate) => {
    const eventsForDate = getEventsForDate(currentDate);
    if (eventsForDate.length === 0) return null;

    return (
      <div className="absolute -bottom-[6px] left-1/2 transform -translate-x-1/2 flex gap-1 items-center z-10">
        {eventsForDate.slice(0, 3).map((event, idx) => {
          return (
            <span
              key={idx}
              className={`w-[5px] h-[5px] rounded-full ${eventTypeLegendColors[event.event_type_id] || 'bg-gray-500'}`}
              title={event.name}
            ></span>
          );
        })}
        {eventsForDate.length > 3 && <span className="text-xs">+{eventsForDate.length - 3}</span>}
      </div>
    );
  };

  const handleSuccess = () => {
    fetchEvents(); 
  };

  const openEditEventModal = (event) => {
    setEventToEdit(event);
    setIsEditEventModalOpen(true);
  };

  const closeEditEventModal = () => {
    setEventToEdit(null);
    setIsEditEventModalOpen(false);
  };

  const openDeleteEventModal = (event) => {
    setEventToDelete(event);
    setIsDeleteEventModalOpen(true);
  };

  const closeDeleteEventModal = () => {
    setEventToDelete(null);
    setIsDeleteEventModalOpen(false);
  };

  const openEditExamModal = (event) => {
    setExamToEdit(event);
    setIsEditExamModalOpen(true);
  };

  const closeEditExamModal = () => {
    setExamToEdit(null);
    setIsEditExamModalOpen(false);
  };

  const openDeleteExamModal = (event) => {
    setExamToDelete(event);
    setIsDeleteExamModalOpen(true);
  };

  const closeDeleteExamModal = () => {
    setExamToDelete(null);
    setIsDeleteExamModalOpen(false);
  };

  const handleConfirmEventDelete = async () => {
    if (!eventToDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/school-event/${eventToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();

      handleSuccess();
      toast.success(data.message || 'Event deleted successfully.');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      closeDeleteEventModal();
    }
  };

  const handleConfirmExamDelete = async () => {
    if (!examToDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/exam/${examToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();

      handleSuccess();
      toast.success(data.message || 'Event deleted successfully.');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      closeDeleteExamModal();
    }
  };

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Calendar"/>
      <div className="flex flex-col 2xl:flex-row justify-between sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8 gap-8 2xl:gap-16">
        <div className='flex flex-col w-full'>
          <div className='flex items-center justify-between mb-8 gap-1'>
            <p className="text-textBg-700 w-full font-bold text-base flex flex-col sm:flex-row">
              {selectedDate ? (
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
              )}
            </p>
            {(userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) && (
              <Button 
                size="m" 
                text="Create Event" 
                icon={<Plus size={16} color="#fff"/>} 
                onClick={() => setIsCreateModalOpen(true)}
              />
            )}
          </div>

          <div className='flex flex-col gap-4 xl:flex-row xl:gap-16'>
            <div className="flex flex-col">
              <Calendar
                baseYear={baseYear}
                onDateSelect={setSelectedDate}
                selectedDate={selectedDate}
                renderDateContent={renderDateContent}
                handlePrev={handlePrev}
                handleNext={handleNext}
                currentMonthIndex={currentMonthIndex}
              />

              <div className="mt-6 bg-white">
                <div className="flex flex-wrap gap-4">
                  {eventTypes.map((type) => (
                    <div key={type.id} className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${eventTypeLegendColors[type.id] || 'bg-gray-500'}`}></span>
                      <span className="text-sm text-textBg-700">{type.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className='w-full bg-white'>
              <h2 className='text-xl font-semibold mb-4'>
                Events on {selectedDate ? `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}` : 'Select a day'}
              </h2>
              {loading ? (
                <p className='text-textBg-500'>Loading events...</p>
              ) : selectedDate ? (
                <>
                  {getEventsForDate(selectedDate).length > 0 ? (
                    <div className='w-full flex flex-col gap-2'>
                      {getEventsForDate(selectedDate).map((event, idx) => {
                        return (
                          <div key={idx} className='flex justify-between items-center border border-textBg-200 w-full p-3 rounded'>
                            <div className="flex gap-4">
                              <div className={`hidden w-12 h-12 ${eventTypeCardColors[event.event_type_id] || 'bg-gray-500'} rounded sm:flex items-center justify-center`}>
                                  {event.type === 'exam' ? <Pen size={16} color="#dc2626" /> : <PartyPopper size={16}/>}
                              </div>
                              <div className='flex flex-col justify-center gap-1'>
                                <p className='text-textBg-900 font-semibold text-base'>{event.name}</p>
                                <div className='flex flex-col gap-1 sm:flex-row sm:gap-4'>
                                  <div className='flex items-center gap-2 text-textBg-500'>
                                    <Clock size={16} />
                                    <p className='text-sm'>{new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                  </div>
                                  {event.type === 'exam' ? (
                                    <div className='flex items-center gap-2 text-textBg-500'>
                                      <Info size={16} />
                                      <p className='text-sm'>{event.scope}</p>
                                    </div>
                                  ) : (
                                    <div className='flex items-center gap-2 text-textBg-500'>
                                      <MapPin size={16} />
                                      <p className='text-sm'>{event.location}</p>
                                    </div>
                                  )}
                                  
                                </div>
                              </div>
                            </div>
                            {(userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) && (
                            <div className="flex">
                              {event.type !== 'exam' && (
                                <>
                                  <Button icon={<Pen size={16} color='#1A99EE'/>} type="link" onClick={() => openEditEventModal(event)}/>
                                  <Button icon={<Trash size={16}/>} type="link" onClick={() => openDeleteEventModal(event)}/>
                                </>
                              )}
                              {event.type === 'exam' && (
                                <>
                                  <Button icon={<Pen size={16} color='#1A99EE'/>} type="link" onClick={() => openEditExamModal(event)}/>
                                  <Button icon={<Trash size={16}/>} type="link" onClick={() => openDeleteExamModal(event)}/>
                                </>
                              )}
                            </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className='text-textBg-500'>No events for this day.</p>
                  )}
                </>
              ) : (
                <p className='text-textBg-500'>Select a day to see events.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateEventForm 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={handleSuccess}
      />

      {eventToEdit && (
        <EditEventForm
          isOpen={isEditEventModalOpen}
          onClose={closeEditEventModal}
          onSuccess={handleSuccess}
          event={eventToEdit}
        />
      )}

      {examToEdit && (
        <EditExamForm
          isOpen={isEditExamModalOpen}
          onClose={closeEditExamModal}
          onSuccess={handleSuccess}
          exam={examToEdit}
        />
      )}

      <ConfirmForm
        isOpen={isDeleteEventModalOpen}
        onClose={closeDeleteEventModal}
        onConfirm={handleConfirmEventDelete}
        title="Confirm Deletion"
        description="Are you sure you want to delete this event? This action is irreversible."
      />

      <ConfirmForm
        isOpen={isDeleteExamModalOpen}
        onClose={closeDeleteExamModal}
        onConfirm={handleConfirmExamDelete}
        title="Confirm Deletion"
        description="Are you sure you want to delete this exam? This action is irreversible."
      />
    </main>
  );
} 

export default CalendarEvents;
