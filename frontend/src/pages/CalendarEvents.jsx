import React, { useState, useEffect } from "react";
import PageTitle from '../components/PageTitle';
import { Clock, MapPin, PartyPopper, Plus, Edit, Trash2, Pen, Trash } from 'lucide-react';
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
import { getToken, getUserRole } from "../utils/UserRoleUtils";
import CreateEventForm from "../components/forms/events/CreateEventForm"; 
import EditEventForm from "../components/forms/events/EditEventForm";
import ConfirmDeletionForm from "../components/forms/ConfirmDeletionForm"; // Upewnij się, że ścieżka jest poprawna
import UserRoles from "../data/userRoles";

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

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
      newEventTypeLegendColors[type.id] = legendColors[index % cardColors.length];
    });
    setEventTypeCardColors(newEventTypeCardColors);
    setEventTypeLegendColors(newEventTypeLegendColors);
  };

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
    } catch (err) {
      console.error(err);
      setError('Failed to load event types.');
    }
  };

  useEffect(() => {
    fetchEventTypes();
  }, [token]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/school-event', {
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
      setEvents(result.data);
    } catch (err) {
      setError(err.message); 
    } finally {
      setLoading(false); 
    }
  };
  
  useEffect(() => {
    fetchEvents();
  }, []);

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

  const openEditModal = (event) => {
    setEventToEdit(event);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEventToEdit(null);
    setIsEditModalOpen(false);
  };

  const openDeleteModal = (event) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setEventToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
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
      handleSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      closeDeleteModal();
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
            <Button 
              size="m" 
              text="Create Event" 
              icon={<Plus size={16} color="#fff"/>} 
              onClick={() => setIsCreateModalOpen(true)}
            />
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
              ) : error ? (
                <p className='text-red-500'>{error}</p>
              ) : selectedDate ? (
                <>
                  {getEventsForDate(selectedDate).length > 0 ? (
                    <div className='w-full flex flex-col gap-2'>
                      {getEventsForDate(selectedDate).map((event, idx) => {
                        return (
                          <div key={idx} className='flex justify-between items-center border border-textBg-200 w-full p-3 rounded'>
                            <div className="flex gap-4">
                              <div className={`hidden w-12 h-12 ${eventTypeCardColors[event.event_type_id] || 'bg-gray-500'} rounded sm:flex items-center justify-center`}>
                                  <PartyPopper size={16}/>
                              </div>
                              <div className='flex flex-col justify-center gap-1'>
                                <p className='text-textBg-900 font-semibold text-base'>{event.name}</p>
                                <div className='flex flex-col gap-1 sm:flex-row sm:gap-4'>
                                  <div className='flex items-center gap-2 text-textBg-500'>
                                    <Clock size={16} />
                                    <p className='text-sm'>{new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                  </div>
                                  <div className='flex items-center gap-2 text-textBg-500'>
                                    <MapPin size={16} />
                                    <p className='text-sm'>{event.location}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {(userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) && (
                            <div className="flex">
                              <Button icon={<Pen size={16} color='#1A99EE'/>} type="link" onClick={() => openEditModal(event)}/>
                              <Button icon={<Trash size={16}/>} type="link" onClick={() => openDeleteModal(event)}/>
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
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onSuccess={handleSuccess}
          event={eventToEdit}
        />
      )}

      <ConfirmDeletionForm
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description="Are you sure you want to delete this event? This action is irreversible."
      />
    </main>
  );
} 

export default CalendarEvents;