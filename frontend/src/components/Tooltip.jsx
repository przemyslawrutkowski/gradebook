import React, { useState } from 'react';

function Tooltip({ children, content, position = 'top', width = 'auto' }) {
  const [visible, setVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  return (
    <div
      className="relative flex flex-col items-center w-fit"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={`absolute ${positionClasses[position]} flex flex-col items-center`}
          style={{ width: width }}
        >
          <div
            className="bg-textBg-700 text-white text-xs py-1 px-2 rounded shadow-lg z-10"
            style={{ width: width === 'auto' ? 'max-content' : width }}
          >
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

export default Tooltip;
