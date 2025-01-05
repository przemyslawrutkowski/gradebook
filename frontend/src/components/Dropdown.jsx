// components/DropdownMenu.jsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

const DropdownMenu = ({ children, position, onClose }) => {
  const dropdownRoot = document.getElementById('dropdown-root') || createDropdownRoot();

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  function createDropdownRoot() {
    const div = document.createElement('div');
    div.id = 'dropdown-root';
    document.body.appendChild(div);
    return div;
  }

  const style = {
    position: 'absolute',
    top: position.top,
    left: position.left,
    width: '176px', // odpowiada Tailwind klasie w-44
    zIndex: 9999, // zapewnia najwyższy priorytet
  };

  return ReactDOM.createPortal(
    <div
      className="bg-white border border-gray-200 rounded shadow-lg"
      style={style}
    >
      {children}
    </div>,
    dropdownRoot
  );
};

export default DropdownMenu;
