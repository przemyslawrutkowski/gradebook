import React, { useState, useEffect } from 'react';
import Button from '../../Button';
import { X } from 'lucide-react';
import Modal from '../../Modal';
import UserRoles from '../../../data/userRoles';
import { getToken } from '../../../utils/UserRoleUtils'; // Zakładam, że masz funkcję do pobierania tokenu

const AddAttendanceForm = ({ isOpen, onClose, selectedEvent, userRole, handleSaveAttendance, handleLessonUpdate }) => {
  const [lessonTopic, setLessonTopic] = useState(selectedEvent?.description || '');
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = getToken(); // Pobieranie tokenu do autoryzacji

  useEffect(() => {
    if (selectedEvent) {
      // Inicjalizacja stanu obecności na podstawie wybranego wydarzenia
      const initialAttendances = selectedEvent.students.map(student => ({
        studentId: student.id,
        status: student.attendance || 'Absent', // Domyślnie 'Absent'
      }));
      setAttendances(initialAttendances);
      setLessonTopic(selectedEvent.description || '');
    }
  }, [selectedEvent]);

  if (!selectedEvent) return null;

  const handleStatusChange = (studentId, status) => {
    setAttendances(prevAttendances =>
      prevAttendances.map(attendance =>
        attendance.studentId === studentId ? { ...attendance, status } : attendance
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
  
    const attendanceData = attendances.map(attendance => ({
      studentId: attendance.studentId,
      wasPresent: attendance.status === 'Present',
      wasLate: attendance.status === 'Late',
    }));
  
    try {
      await handleLessonUpdate({
        lessonId: selectedEvent.id,
        lessonTopic: lessonTopic, 
      });
  
      await handleSaveAttendance({
        lessonId: selectedEvent.id,
        attendances: attendanceData,
      });
    } catch (err) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-xl max-h-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Add Information</h2>
        <X size={24} className="hover:cursor-pointer" onClick={onClose} />
      </div>
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
                    name={`attendance-${student.id}`}
                    value="Present"
                    checked={attendances.find(a => a.studentId === student.id)?.status === 'Present'}
                    onChange={(e) => handleStatusChange(student.id, e.target.value)}
                    className="h-4 w-4 accent-blueAccent-500 hover:cursor-pointer"
                    disabled={userRole !== UserRoles.Teacher && userRole !== UserRoles.Administrator}
                  />
                  <input
                    type="radio"
                    name={`attendance-${student.id}`}
                    value="Late"
                    checked={attendances.find(a => a.studentId === student.id)?.status === 'Late'}
                    onChange={(e) => handleStatusChange(student.id, e.target.value)}
                    className="form-radio h-4 w-4 accent-blueAccent-500 hover:cursor-pointer"
                    disabled={userRole !== UserRoles.Teacher && userRole !== UserRoles.Administrator}
                  />
                  <input
                    type="radio"
                    name={`attendance-${student.id}`}
                    value="Absent"
                    checked={attendances.find(a => a.studentId === student.id)?.status === 'Absent'}
                    onChange={(e) => handleStatusChange(student.id, e.target.value)}
                    className="form-radio h-4 w-4 accent-blueAccent-500 hover:cursor-pointer"
                    disabled={userRole !== UserRoles.Teacher && userRole !== UserRoles.Administrator}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mt-6 flex justify-end gap-4">
          <Button text="Close" type="secondary" onClick={onClose} />
          <Button type="primary" text={loading ? "Saving..." : "Save"} disabled={loading} 
            onClick={handleLessonUpdate}
          />
        </div>
      </form>
    </Modal>
  );
};

export default AddAttendanceForm;
