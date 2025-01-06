import React, { useState, useEffect } from 'react';
import Button from "../../Button";
import { X } from 'lucide-react';
import Modal from '../../Modal';
import { getToken } from '../../../utils/UserRoleUtils';
import '../../../customCSS/customScrollbar.css';
import { formatTime } from '../../../utils/dateTimeUtils'
import { toast } from 'react-toastify';

function CreateLessonForm({ onSuccess, onClose, isOpen }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [teacherId, setTeacherId] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [lessonSchedules, setLessonSchedules] = useState([
    { dayOfWeek: 1, startTime: '09:00', endTime: '10:00', frequency: 1 },
  ]);

  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const token = getToken();

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
      setClasses(result.data);
    } catch(err){
      setError(err.message);
      toast.error(err.message || 'An unexpected error occurred.');
    } finally{
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/teacher', 
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
      setTeachers(result.data);
    } catch(err){
      setError(err.message);
      toast.error(err.message || 'An unexpected error occurred.');
    } finally{
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/subject', 
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
      setSubjects(result.data);
    } catch(err){
      setError(err.message);
      toast.error(err.message || 'An unexpected error occurred.');
    } finally{
      setLoading(false);
    }
  };

  const fetchSemesters = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/semester/8457e092-cab2-11ef-8ac6-9c6b00209ac2', 
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
      setSemesters(result.data);
    } catch(err){
      setError(err.message);
      toast.error(err.message || 'An unexpected error occurred.');
    } finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        await Promise.all([
          fetchTeachers(),
          fetchClasses(),
          fetchSubjects(),
          fetchSemesters(),
        ]);
      } catch (err) {
        setError('Failed to load dropdown data.');
        toast.error(err.message || 'An unexpected error occurred.');
      }
    };

    if (isOpen) {
      loadDropdownData();
    }
  }, [isOpen]);

  const handleAddSchedule = () => {
    setLessonSchedules([
      ...lessonSchedules,
      { dayOfWeek: 1, startTime: '09:00', endTime: '10:00', frequency: 1 },
    ]);
  };

  const handleRemoveSchedule = (index) => {
    const updatedSchedules = lessonSchedules.filter((_, idx) => idx !== index);
    setLessonSchedules(updatedSchedules);
  };

  const handleScheduleChange = (index, field, value) => {
    const updatedSchedules = lessonSchedules.map((schedule, idx) =>
      idx === index ? { ...schedule, [field]: value } : schedule
    );
    setLessonSchedules(updatedSchedules);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start Date cannot be after End Date.');
      toast.error('Start Date cannot be after End Date.');
      setLoading(false);
      return;
    }

    if (
      !startDate ||
      !endDate ||
      !teacherId ||
      !classId ||
      !subjectId ||
      !semesterId ||
      lessonSchedules.length === 0
    ) {
      setError('Please fill in all required fields.');
      toast.error('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/lesson', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({
          startDate,
          endDate,
          teacherId,
          classId,
          subjectId,
          semesterId,
          lessonSchedules,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      const data = response.json();

      onSuccess(); 
      onClose(); 
      toast.success(data.message || 'Lessons created successfully.');
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-lg max-h-[48rem]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Create Lesson</h2>
        <X size={24} className="hover:cursor-pointer" onClick={onClose}/>
      </div>
      <form className="flex flex-col gap-6" onSubmit={handleCreate}>
        {error && <p className="text-red-500">{error}</p>}
        
        <div className="flex flex-col gap-2">
          <label htmlFor="startDate" className="font-medium">Start Date</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="border p-2 rounded"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="endDate" className="font-medium">End Date</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="border p-2 rounded"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="teacher" className="font-medium">Teacher</label>
          <select
            id="teacher"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            required
            className="border p-2 rounded"
          >
            <option value="" hidden disabled>Select Teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.first_name} {teacher.last_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="class" className="font-medium">Class</label>
          <select
            id="class"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            required
            className="border p-2 rounded"
          >
            <option value="" hidden disabled>Select Class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.class_names.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="subject" className="font-medium">Subject</label>
          <select
            id="subject"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            required
            className="border p-2 rounded"
          >
            <option value="" hidden disabled>Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="semester" className="font-medium">Semester</label>
          <select
            id="semester"
            value={semesterId}
            onChange={(e) => setSemesterId(e.target.value)}
            required
            className="border p-2 rounded"
          >
            <option value="" hidden disabled>Select Semester</option>
            {semesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
                {semester.semester}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Lesson Schedules</h3>
          {lessonSchedules.map((schedule, index) => (
            <div key={index} className="border p-4 rounded">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Schedule {index + 1}</h4>
                {lessonSchedules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSchedule(index)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <label htmlFor={`dayOfWeek-${index}`} className="font-medium">Day of the Week</label>
                  <select
                    id={`dayOfWeek-${index}`}
                    value={schedule.dayOfWeek}
                    onChange={(e) => handleScheduleChange(index, 'dayOfWeek', Number(e.target.value))}
                    required
                    className="border p-2 rounded"
                  >
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor={`startTime-${index}`} className="font-medium">Start Time</label>
                  <input
                    type="time"
                    id={`startTime-${index}`}
                    value={schedule.startTime}
                    onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                    required
                    className="border p-2 rounded"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor={`endTime-${index}`} className="font-medium">End Time</label>
                  <input
                    type="time"
                    id={`endTime-${index}`}
                    value={schedule.endTime}
                    onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                    required
                    className="border p-2 rounded"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor={`frequency-${index}`} className="font-medium">Frequency (weeks)</label>
                  <input
                    type="number"
                    id={`frequency-${index}`}
                    value={schedule.frequency}
                    onChange={(e) => handleScheduleChange(index, 'frequency', Number(e.target.value))}
                    min="1"
                    required
                    className="border p-2 rounded"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            text="Add Schedule"
            type="secondary"
            onClick={handleAddSchedule}
            className="px-4 py-2 self-start"
            btnType="button"
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            text="Cancel"
            type="secondary"
            onClick={onClose}
            className="px-4 py-2"
          />
          <Button
            text={loading ? "Creating..." : "Create"}
            type="primary"
            disabled={loading}
            className="px-4 py-2"
          />
        </div>
      </form>
    </Modal>
  );
}

export default CreateLessonForm;
