import React from 'react';
import Button from '../../Button';
import { X } from 'lucide-react';
import Modal from '../../Modal';
import UserRoles from '../../../data/userRoles';

const AddAttendanceForm = ({ isOpen, onClose, selectedEvent, userRole, handleAttendanceChange }) => {
  if (!selectedEvent) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-xl max-h-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Add Attendance</h2>
        <X size={24} className="hover:cursor-pointer" onClick={onClose} />
      </div>
      <div>
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
                  checked={student.attendance === 'Present'}
                  onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                  className="h-4 w-4 accent-blueAccent-500 hover:cursor-pointer"
                  disabled={userRole !== UserRoles.Teacher}
                />
                <input
                  type="radio"
                  name={`attendance-${student.id}`}
                  value="Late"
                  checked={student.attendance === 'Late'}
                  onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                  className="form-radio h-4 w-4 accent-blueAccent-500 hover:cursor-pointer"
                  disabled={userRole !== UserRoles.Teacher}
                />
                <input
                  type="radio"
                  name={`attendance-${student.id}`}
                  value="Absent"
                  checked={student.attendance === 'Absent'}
                  onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                  className="form-radio h-4 w-4 accent-blueAccent-500 hover:cursor-pointer"
                  disabled={userRole !== UserRoles.Teacher}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button text="Close" type="secondary" onClick={onClose} />
          <Button text="Add" type="primary"  />
        </div>
      </div>
    </Modal>
  );
};

export default AddAttendanceForm;