import React, { useState, useRef, useEffect } from 'react';

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

  // Funkcja do sprawdzania, czy urządzenie jest dotykowe
  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  // Obsługa kliknięć poza tooltipem
  useEffect(() => {
    if (visible && isTouchDevice()) {
      const handleOutsideClick = (event) => {
        if (
          tooltipRef.current &&
          !tooltipRef.current.contains(event.target) &&
          containerRef.current &&
          !containerRef.current.contains(event.target)
        ) {
          setVisible(false);
        }
      };

      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);

      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
        document.removeEventListener('touchstart', handleOutsideClick);
      };
    }
  }, [visible]);

  // Obsługa kliknięcia na kontener z zatrzymaniem propagacji
  const handleClick = (e) => {
    if (isTouchDevice()) {
      e.stopPropagation(); // Zatrzymanie propagacji zdarzenia
      setVisible((prev) => !prev);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center w-fit"
      onMouseEnter={() => !isTouchDevice() && setVisible(true)}
      onMouseLeave={() => !isTouchDevice() && setVisible(false)}
      onClick={handleClick}
      onTouchStart={handleClick}
    >
      {children}
      {visible && (
        <div
          ref={tooltipRef}
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
