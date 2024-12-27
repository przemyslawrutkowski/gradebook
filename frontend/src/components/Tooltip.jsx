import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

function Tooltip({ children, content, position = 'top', width = 'auto' }) {
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef(null);
  const containerRef = useRef(null);
  const [tooltipStyles, setTooltipStyles] = useState({});

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  useEffect(() => {
    if (visible && containerRef.current && tooltipRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      let top, left;

      switch (position) {
        case 'top':
          top = containerRect.top - tooltipRect.height - 8;
          left = containerRect.left + (containerRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = containerRect.bottom + 8;
          left = containerRect.left + (containerRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = containerRect.top + (containerRect.height - tooltipRect.height) / 2;
          left = containerRect.left - tooltipRect.width - 8;
          break;
        case 'right':
          top = containerRect.top + (containerRect.height - tooltipRect.height) / 2;
          left = containerRect.right + 8;
          break;
        default:
          top = containerRect.top - tooltipRect.height - 8;
          left = containerRect.left + (containerRect.width - tooltipRect.width) / 2;
      }

      top = Math.max(8, Math.min(top, window.innerHeight - tooltipRect.height - 8));
      left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));

      setTooltipStyles({
        top: `${top}px`,
        left: `${left}px`,
      });
    }
  }, [visible, position]);

  const tooltipContent = visible ? (
    <div
      ref={tooltipRef}
      className={`absolute bg-gray-700 text-white text-xs py-1 px-2 rounded shadow-lg z-50`}
      style={{
        width: width === 'auto' ? 'max-content' : width,
        ...tooltipStyles,
        position: 'fixed',
      }}
    >
      {content}
    </div>
  ) : null;

  return (
    <>
      <div
        ref={containerRef}
        className="relative flex flex-col items-center w-fit"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </div>
      {ReactDOM.createPortal(tooltipContent, document.body)}
    </>
  );
}

export default Tooltip;
