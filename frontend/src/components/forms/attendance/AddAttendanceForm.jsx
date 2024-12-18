import React, { useState, useEffect } from 'react';
import Button from '../../Button';
import { X } from 'lucide-react';
import Modal from '../../Modal';
import UserRoles from '../../../data/userRoles';
import { getToken } from '../../../utils/UserRoleUtils';

const AddAttendanceForm = ({ isOpen, onClose, selectedEvent, userRole, handleSaveAttendance, handleLessonUpdate, fetchLessons, selectedClass }) => {
  const [lessonTopic, setLessonTopic] = useState(selectedEvent?.description || '');
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [existingAttendances, setExistingAttendances] = useState(null);

  const token = getToken(); 

  useEffect(() => {
    if (isOpen && selectedEvent) {
      setLoading(true);
      setError(null);
      fetch(`http://localhost:3000/attendance/${selectedEvent.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 404) {
          return null; 
        } else {
          throw new Error(`Error: ${response.status}`);
        }
      })
      .then(data => {
        if (data && data.data.length > 0) {
          const existing = data.data.map(attendance => ({
            id: attendance.id,
            studentId: attendance.student_id,
            status: attendance.was_present 
              ? (attendance.was_late ? 'Late' : 'Present') 
              : 'Absent'
          }));
          setAttendances(existing);
          setExistingAttendances(existing);
          setLessonTopic(selectedEvent.description || '');
        } else {
          const initialAttendances = selectedEvent.students.map(student => ({
            studentId: student.id,
            status: 'Present',
          }));
          setAttendances(initialAttendances);
          setExistingAttendances(null);
          setLessonTopic(selectedEvent.description || '');
        }
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
    }
  }, [isOpen, selectedEvent, token]);

  if (!selectedEvent) return null;

  const handleRadioChange = (studentId, selectedStatus) => {
    setAttendances((prevAttendances) =>
      prevAttendances.map((attendance) =>
        attendance.studentId === studentId
          ? { ...attendance, status: selectedStatus }
          : attendance
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    if (!selectedEvent || !selectedEvent.id) {
      setError('Invalid lesson ID. Please try again.');
      setLoading(false);
      return;
    }
  
    const processedAttendances = attendances.map((attendance) => {
      switch (attendance.status) {
        case 'Present':
          return { 
            id: attendance.id, 
            studentId: attendance.studentId, 
            wasPresent: true, 
            wasLate: false 
          };
        case 'Late':
          return { 
            id: attendance.id,
            studentId: attendance.studentId, 
            wasPresent: true, 
            wasLate: true 
          };
        case 'Absent':
        default:
          return { 
            id: attendance.id,
            studentId: attendance.studentId, 
            wasPresent: false, 
            wasLate: false 
          };
      }
    })
  
    for (const attendance of processedAttendances) {
      if (!attendance.wasPresent && attendance.wasLate) {
        setError(`Nieprawidłowy status obecności dla studenta ID: ${attendance.studentId}`);
        setLoading(false);
        return;
      }
    }
  
    try {
      await handleLessonUpdate({
        lessonId: selectedEvent.id,
        lessonTopic: lessonTopic, 
      });
  
      if (existingAttendances) {
        await Promise.all(processedAttendances.map(attendance => 
          fetch(`http://localhost:3000/attendance/${attendance.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              wasPresent: attendance.wasPresent,
              wasLate: attendance.wasLate,
            }),
          })
        ));
      } else {

        await handleSaveAttendance({
          lessonId: selectedEvent.id,
          attendances: processedAttendances,
        });
      }
  
      fetchLessons(selectedClass); 
  
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedEvent) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-xl w-3xl max-h-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Add Information</h2>
        <X size={24} className="hover:cursor-pointer" onClick={onClose} />
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-textBg-900 font-medium mb-2">Lesson Topic</label>
            <input
              type="text"
              value={lessonTopic}
              onChange={(e) => setLessonTopic(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Set lesson topic"
              required
              disabled={userRole !== UserRoles.Teacher && userRole !== UserRoles.Administrator}
            />
          </div>

          <div className="mb-4">
            <label className="block text-textBg-900 font-medium mb-2">Attendance</label>
            <div className="w-full flex mb-2">
              <div className="w-2/5">
                <p className="text-textBg-700 font-medium">First and Last Name</p>
              </div>
              <div className="flex justify-evenly w-[calc(60%-18px)]">
                <p className="text-textBg-700 font-medium">Present</p>
                <p className="text-textBg-700 font-medium">Late</p>
                <p className="text-textBg-700 font-medium">Absent</p>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {selectedEvent.students.map((student) => (
                <div className="w-full flex mb-2" key={student.id}>
                  <div className="w-2/5">
                    <p className="text-base text-textBg-500">
                      {student.first_name} {student.last_name}
                    </p>
                  </div>
                  <div className="flex items-center justify-evenly w-3/5">
                    <input
                      type="radio"
                      id={`present-${student.id}`}
                      name={`attendance-${student.id}`}
                      value="Present"
                      checked={attendances.find(a => a.studentId === student.id)?.status === 'Present'}
                      onChange={() => handleRadioChange(student.id, 'Present')}
                      className="mr-2"
                    />
                    <input
                      type="radio"
                      id={`late-${student.id}`}
                      name={`attendance-${student.id}`}
                      value="Late"
                      checked={attendances.find(a => a.studentId === student.id)?.status === 'Late'}
                      onChange={() => handleRadioChange(student.id, 'Late')}
                      className="mr-2"
                    />
                    <input
                      type="radio"
                      id={`absent-${student.id}`}
                      name={`attendance-${student.id}`}
                      value="Absent"
                      checked={attendances.find(a => a.studentId === student.id)?.status === 'Absent'}
                      onChange={() => handleRadioChange(student.id, 'Absent')}
                      className="mr-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="mt-6 flex justify-end gap-4">
            <Button text="Close" type="secondary" onClick={onClose} />
            <Button type="primary" text={loading ? "Saving..." : "Save"} disabled={loading} />
          </div>
        </form>
      )}
    </Modal>
  );
};

export default AddAttendanceForm;
