import React, { useState, useEffect } from 'react';
import Button from "../../Button";
import { X } from 'lucide-react';
import Modal from '../../Modal';
import { getToken } from '../../../utils/UserRoleUtils';
import { formatDateToInput, formatTimeToInput } from '../../../utils/dateTimeUtils';
import { toast } from 'react-toastify';

function EditEventForm({ onSuccess, onClose, isOpen, event }) {
  const [name, setName] = useState(event?.name || '');
  const [location, setLocation] = useState(event?.location || '');
  const [description, setDescription] = useState(event?.description || '');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [eventTypeId, setEventTypeId] = useState('');
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = getToken();

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
    } catch (err) {
      setError('Failed to load event types.');
      toast.error(err.message || 'An unexpected error occurred.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEventTypes();
      if (event) {
        setName(event.name);
        setLocation(event.location);
        setDescription(event.description);
        setDate(formatDateToInput(event.date));
        setStartTime(formatTimeToInput(event.start_time));
        setEndTime(formatTimeToInput(event.end_time)); 
        setEventTypeId(event.event_type_id);
      }
    }
  }, [isOpen, event, token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    if (endDateTime <= startDateTime) {
      setError('End time must be after start time.');
      toast.error('End time must be after start time.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/school-event/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          location,
          description,
          date,
          start_time: startTime,
          end_time: endTime,
          event_type_id: eventTypeId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      const data = await response.json();

      onSuccess(); 
      onClose();
      toast.success(data.message || 'Class name deleted successfully.');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Edit School Event</h2>
        <X size={24} className="hover:cursor-pointer" onClick={onClose}/>
      </div>
      <form className="flex flex-col gap-6" onSubmit={handleUpdate}>
        <div className="flex flex-col gap-2">
          <label className="text-base text-textBg-700" htmlFor="eventName">Event Name</label>
          <input
            id="eventName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
            placeholder="e.g., Science Fair"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base text-textBg-700" htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
            placeholder="e.g., Auditorium"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base text-textBg-700" htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 min-h-20 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
            placeholder="Describe the event..."
            rows={4}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base text-textBg-700" htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base text-textBg-700" htmlFor="startTime">Start Time</label>
          <input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base text-textBg-700" htmlFor="endTime">End Time</label>
          <input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base text-textBg-700" htmlFor="eventType">Event Type</label>
          <select
            id="eventType"
            value={eventTypeId}
            onChange={(e) => setEventTypeId(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
          >
            <option value="" disabled hidden>Select event type</option>
            {eventTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            text="Cancel"
            type="secondary"
            onClick={onClose}
            className="px-4 py-2"
          />
          <Button
            text={loading ? "Updating..." : "Update"}
            type="primary"
            disabled={loading}
            className="px-4 py-2"
            btnType="submit"
          />
        </div>
      </form>
    </Modal>
  );
}

export default EditEventForm;
