export function formatDateToInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  }
  
  export function formatTimeToInput(timeString) {
    if (!timeString) return '';
    const date = new Date(timeString);
    const hours = (`0${date.getUTCHours()}`).slice(-2);
    const minutes = (`0${date.getUTCMinutes()}`).slice(-2);
    return `${hours}:${minutes}`;
  }

  export function formatTime(timeString) {
    const date = new Date(timeString);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };