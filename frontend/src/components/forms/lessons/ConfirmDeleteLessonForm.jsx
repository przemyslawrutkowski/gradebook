import React, { useState } from 'react';
import Modal from '../../Modal';
import Button from '../../Button';

export default function ConfirmDeletionForm({ isOpen, onClose, onConfirm, title, description }) {
  const [deletionType, setDeletionType] = useState('single');

  const handleChange = (e) => {
    setDeletionType(e.target.value);
  };

  const handleConfirm = () => {
    onConfirm(deletionType);
    setDeletionType('single');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-md">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-textBg-700">{title}</h2>
        <p className="text-sm text-textBg-600 my-4">{description}</p>
        
        <div className='text-left'>
            <div className="mb-4">
            <label className="inline-flex items-center mr-4">
                <input
                type="radio"
                className="form-radio"
                value="single"
                checked={deletionType === 'single'}
                onChange={handleChange}
                />
                <span className="ml-2">Delete Only This Lesson</span>
            </label>
            <label className="inline-flex items-center">
                <input
                type="radio"
                className="form-radio"
                value="all"
                checked={deletionType === 'all'}
                onChange={handleChange}
                />
                <span className="ml-2">Delete All Lessons for This Class and Subject</span>
            </label>
            </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="secondary" text="Cancel" onClick={onClose} />
          <Button type="danger" text="Confirm" onClick={handleConfirm} />
        </div>
      </div>
    </Modal>
  );
}
