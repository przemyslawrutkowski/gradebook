import React from 'react';

function Modal({ isOpen, onClose, children, widthHeightClassname }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className={`bg-white p-6 mx-4 sm:mx-0 rounded shadow-lg w-full ${widthHeightClassname} overflow-y-auto custom-scrollbar`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;
