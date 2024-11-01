import { UserType } from "../enums/userTypes";

export const administrator1 = {
    pesel: '11111111111',
    email: 'administrator1@administrator.com',
    phoneNumber: '601234567',
    password: 'password',
    passwordConfirm: 'password',
    firstName: 'Administrator',
    lastName: 'Administrator'
};

export const administrator2 = {
    pesel: '22222222222',
    email: 'administrator2@administrator.com',
    phoneNumber: '601234568',
    password: 'password',
    passwordConfirm: 'password',
    firstName: 'Administrator',
    lastName: 'Administrator'
};

export const teacher1 = {
    pesel: '33333333333',
    email: 'teacher1@teacher.com',
    phoneNumber: '601234569',
    password: 'password',
    passwordConfirm: 'password',
    firstName: 'Teacher',
    lastName: 'Teacher'
};

export const teacher2 = {
    pesel: '44444444444',
    email: 'teacher2@teacher.com',
    phoneNumber: '601234570',
    password: 'password',
    passwordConfirm: 'password',
    firstName: 'Teacher',
    lastName: 'Teacher'
};

export const parent1 = {
    pesel: '55555555555',
    email: 'parent1@parent.com',
    phoneNumber: '601234571',
    password: 'password',
    passwordConfirm: 'password',
    firstName: 'Parent',
    lastName: 'Parent'
};

export const parent2 = {
    pesel: '66666666666',
    email: 'parent2@parent.com',
    phoneNumber: '601234572',
    password: 'password',
    passwordConfirm: 'password',
    firstName: 'Parent',
    lastName: 'Parent'
};

export const student1 = {
    pesel: '77777777777',
    email: 'student1@student.com',
    phoneNumber: '601234573',
    password: 'password',
    passwordConfirm: 'password',
    firstName: 'Student',
    lastName: 'Student'
};

export const student2 = {
    pesel: '88888888888',
    email: 'student2@student.com',
    phoneNumber: '601234574',
    password: 'password',
    passwordConfirm: 'password',
    firstName: 'Student',
    lastName: 'Student'
};

export const invalidUser = {
    pesel: '',
    email: '',
    phoneNumber: '',
    password: 'a',
    passwordConfirm: 'b',
    firstName: '1',
    lastName: '1'
};

export const class1 = {
    name: 'IA',
    yearbook: '2024/2025'
};

export const class2 = {
    name: 'IIA',
    yearbook: '2024/2025'
};

export const invalidClass = {
    name: '',
    yearbook: ''
};

export const invalidClassUpdate = {
    name: '',
    yearbook: '',
    teacherId: ''
};

export const subject1 = {
    name: 'Math'
};

export const subject2 = {
    name: 'Geography'
};

export const invalidSubject = {
    name: ''
};

export const lessonsData = {
    startDate: '2024-10-01',
    endDate: '2024-11-01',
    lessonSchedules: [
        {
            dayOfWeek: 2,
            startTime: '12:00',
            endTime: '13:00',
            frequency: 1
        }, {
            dayOfWeek: 5,
            startTime: '15:00',
            endTime: '16:00',
            frequency: 2
        }
    ],
};

export const invalidLessonsData = {
    startDate: '',
    endDate: '',
    teacherId: '',
    classId: '',
    subjectId: '',
    lessonSchedules: [
        {
            dayOfWeek: 7,
            startTime: '',
            endTime: '',
            frequency: ''
        }
    ],
};

export const invalidLessonUpdate = {
    description: ''
};

export const messageData = {
    subject: "Subject",
    content: "Content",
};

export const userType1 = {
    name: UserType.Student
};

export const userType2 = {
    name: UserType.Parent
};

export const userType3 = {
    name: UserType.Teacher
};

export const userType4 = {
    name: UserType.Administrator
};

export const invalidUserType = {
    name: ''
};

export const nonExistentId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';
export const invalidIdUrl = '%20';
export const invalidIdBody = '';
export const nonExistentPassword = 'nonexistentpassword';
export const nonExistentEmail = 'user@user.com';
export const newPassword = 'newpassword';
export const newDescription = 'newdescription';