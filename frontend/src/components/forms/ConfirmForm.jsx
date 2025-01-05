import React from 'react';
import Modal from '../Modal';
import Button from '../Button';

function ConfirmForm({ isOpen, onClose, onConfirm, title = "Are you sure?", description = "This action cannot be undone." }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-md">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-textBg-700">{title}</h2>
        <p className="text-sm text-textBg-600 my-4">{description}</p>
        <div className="flex justify-center gap-4 mt-6">
          <Button text="Cancel" type="secondary" onClick={onClose} />
          <Button text="Confirm" type="danger" onClick={onConfirm} />
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmForm;
