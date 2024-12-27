import React, { useState, useRef } from 'react';

function Tooltip({ children, content, position = 'top', width = 'auto' }) {
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef(null);
  const containerRef = useRef(null);

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center w-fit"
      onMouseEnter={() => {
        setVisible(true);
        console.log('Mouse Enter: Tooltip visible');
      }}
      onMouseLeave={() => {
        setVisible(false);
        console.log('Mouse Leave: Tooltip hidden');
      }}
    >
      {children}
      {visible && (
        <div
          ref={tooltipRef}
          className={`absolute ${positionClasses[position]} flex flex-col items-center`}
          style={{ width: width }}
        >
          <div
            className="bg-gray-700 text-white text-xs py-1 px-2 rounded shadow-lg z-10"
            style={{ width: width === 'auto' ? 'max-content' : width }}
          >
            {console.log('Tooltip is visible')}
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

export default Tooltip;
