import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

function Tooltip({ children, content, position = 'top', width = 'auto'}) {
  const [visible, setVisible] = useState(false);
  const [locked, setLocked] = useState(false);
  const tooltipRef = useRef(null);
  const containerRef = useRef(null);
  const [tooltipStyles, setTooltipStyles] = useState({});

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target) &&
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setLocked(false);
        setVisible(false);
      }
    };

    if (locked) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [locked]);

  const handleTooltipClick = () => {
    setLocked((prev) => !prev);
    setVisible(true);
  };

  const handleContentClick = () => {
    setVisible(false);
    setLocked(false);
  };

  const tooltipContent = visible ? (
    <div
      ref={tooltipRef}
      className={`${content && 'absolute bg-gray-700 text-white text-xs py-1 px-2 rounded shadow-lg z-50'}`}
      style={{
        width: width === 'auto' ? 'max-content' : width,
        ...tooltipStyles,
        position: 'fixed',
      }}
      onClick={handleContentClick}
    >
      {content}
    </div>
  ) : null;

  return (
    <>
      <div
        ref={containerRef}
        className="relative flex flex-col items-center w-fit"
        onMouseEnter={() => !locked && setVisible(true)}
        onMouseLeave={() => !locked && setVisible(false)}
        onClick={handleTooltipClick}
      >
        {children}
      </div>
      {ReactDOM.createPortal(tooltipContent, document.body)}
    </>
  );
}

export default Tooltip;
