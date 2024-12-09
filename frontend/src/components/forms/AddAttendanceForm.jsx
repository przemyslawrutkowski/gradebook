import React from 'react';
import Button from '../Button';
import { X } from 'lucide-react';

const AddAttendanceForm = ({
  isOpen,
  onClose,
  event,
  onAttendanceChange,
  onSave,
}) => {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl max-h-xl overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-700">Add Attendance</h2>
          <X size={24} className="hover:cursor-pointer" onClick={onClose} />
        </div>
        <div>
          <div className="w-full flex mb-2">
            <div className="w-2/5">
              <p className="text-gray-700 font-medium">Name</p>
            </div>
            <div className="flex justify-evenly w-[calc(60%-18px)]">
              <p className="text-gray-700 font-medium">Present</p>
              <p className="text-gray-700 font-medium">Late</p>
              <p className="text-gray-700 font-medium">Absent</p>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {event.students.map((student) => (
              <div className="w-full flex mb-2" key={student.id}>
                <div className="w-2/5">
                  <p className="text-base text-gray-500">{student.name}</p>
                </div>
                <div className="flex items-center justify-evenly w-3/5">
                  <input
                    type="radio"
                    name={`attendance-${student.id}`}
                    value="Present"
                    checked={student.attendance === 'Present'}
                    onChange={(e) => onAttendanceChange(student.id, e.target.value)}
                    className="h-4 w-4 accent-blue-500 hover:cursor-pointer"
                  />
                  <input
                    type="radio"
                    name={`attendance-${student.id}`}
                    value="Late"
                    checked={student.attendance === 'Late'}
                    onChange={(e) => onAttendanceChange(student.id, e.target.value)}
                    className="h-4 w-4 accent-blue-500 hover:cursor-pointer"
                  />
                  <input
                    type="radio"
                    name={`attendance-${student.id}`}
                    value="Absent"
                    checked={student.attendance === 'Absent'}
                    onChange={(e) => onAttendanceChange(student.id, e.target.value)}
                    className="h-4 w-4 accent-blue-500 hover:cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <Button text="Close" type="secondary" onClick={onClose} />
            <Button text="Add" type="primary" onClick={onSave} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAttendanceForm;
