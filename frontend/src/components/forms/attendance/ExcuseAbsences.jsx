import React, { useState } from 'react';
import Modal from '../../Modal';
import Button from '../../Button';

function ExcuseAbsences({ isOpen, onClose, onSubmit, selectedDate }) {
  const [excuseType, setExcuseType] = useState('all');
  const [excuseDate, setExcuseDate] = useState(null);

  const handleSubmit = () => {
    onSubmit({ excuseType, excuseDate: excuseType === 'by-date' ? excuseDate : null });
    setExcuseType('all');
    setExcuseDate(selectedDate);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-md">
      <h2 className="text-xl font-semibold mb-4">Excuse Absences</h2>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="all"
              checked={excuseType === 'all'}
              onChange={() => setExcuseType('all')}
              className="mr-2"
            />
            All Absences
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="by-date"
              checked={excuseType === 'by-date'}
              onChange={() => setExcuseType('by-date')}
              className="mr-2"
            />
            Specific Date
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            text="Cancel"
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600"
            type="secondary"
          />
          <Button
            text="Confirm"
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600"
          />
        </div>
      </div>
    </Modal>
  );
}

export default ExcuseAbsences;
