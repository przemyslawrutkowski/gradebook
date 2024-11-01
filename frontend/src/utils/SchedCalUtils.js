export const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const displayMonthNames = [
  "September", "October", "November", "December",
  "January", "February", "March", "April", "May", "June"
];

export const monthNumbers = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5];

export const getYearForMonthIndex = (monthIndex, baseYear) => {
    return monthIndex <= 3 ? baseYear : baseYear + 1;
};

export const convertTimeToHours = (time) => {
    const [timeString, modifier] = time.split(' ');
    let [hours, minutes] = timeString.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours + minutes / 60;
  };
  
  export const getCurrentTimePosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return (hours - 7) * 66 + (minutes / 60) * 66;
  };
  
  export const getDaysInMonth = (monthNumber, year) => {
    return new Date(year, monthNumber + 1, 0).getDate();
  };
  
  export const areDatesEqual = (date1, date2) => {
    if (!date1 || !date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };
  
  export const getStartOfWeek = (date) => {
    const day = date.getDay();
    const diff = (day + 6) % 7;
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - diff);
    return startOfWeek;
  };
  
  export const getEndOfWeek = (startOfWeek) => {
    const end = new Date(startOfWeek);
    end.setDate(end.getDate() + 6);
    return end;
  };
  
  export const formatWeekRange = (startOfWeek) => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const endOfWeek = getEndOfWeek(startOfWeek);
    if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
      return `${startOfWeek.getDate()}-${endOfWeek.getDate()} ${monthNames[startOfWeek.getMonth()]}, ${startOfWeek.getFullYear()}`;
    } else {
      return `${startOfWeek.getDate()} ${monthNames[startOfWeek.getMonth()]} - ${endOfWeek.getDate()} ${monthNames[endOfWeek.getMonth()]}, ${startOfWeek.getFullYear()}`;
    }
  };
