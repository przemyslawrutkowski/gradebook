export default interface LessonSchedule {
    dayOfWeek: number; // 0 (Sunday) to 6 (Saturday)
    startTime: string; // 'HH:MM' format
    endTime: string; // 'HH:MM' format
    frequency: number; // Every how many weeks the lesson is held
}