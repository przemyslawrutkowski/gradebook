import { QuestionType } from '../enums/questionTypes';
import { UserType } from '../enums/userTypes';

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

export const subject1 = {
    name: 'Math'
};

export const subject2 = {
    name: 'Geography'
};

export const lessonsData1 = {
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

export const lessonsData2 = {
    startDate: '2024-12-22',
    endDate: '2024-12-28',
    lessonSchedules: [
        {
            dayOfWeek: 2,
            startTime: '12:00',
            endTime: '13:00',
            frequency: 1
        }, {
            dayOfWeek: 3,
            startTime: '15:00',
            endTime: '16:00',
            frequency: 2
        }
    ],
};

export const lessonsData3 = {
    startDate: '2024-12-15',
    endDate: '2024-12-21',
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

export const lessonsData4 = {
    startDate: '2025-01-01',
    endDate: '2025-02-01',
    lessonSchedules: [
        {
            dayOfWeek: 5,
            startTime: '13:00',
            endTime: '14:00',
            frequency: 2
        },
        {
            dayOfWeek: 5,
            startTime: '15:00',
            endTime: '16:00',
            frequency: 2
        }
    ],
};

export const messageData = {
    subject: 'Subject',
    content: 'Content',
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

export const schoolYear1 = {
    name: '2024/2025',
    startDate: '2024-10-01',
    endDate: '2025-06-30'
};

export const schoolYear2 = {
    name: '2025/2026',
    startDate: '2025-10-01',
    endDate: '2026-06-30'
};

export const semester1 = {
    semester: 1,
    startDate: '2024-10-01',
    endDate: '2025-02-10'
};

export const semester2 = {
    semester: 2,
    startDate: '2025-02-26',
    endDate: '2025-06-30'
};

export const semester3 = {
    semester: 1,
    startDate: '2025-10-01',
    endDate: '2026-02-10'
};

export const semester4 = {
    semester: 2,
    startDate: '2026-02-26',
    endDate: '2026-06-30'
};

export const className1 = {
    name: 'IA'
};

export const className2 = {
    name: 'IIA'
};

export const grade1 = {
    grade: 3,
    weight: 1,
    description: 'Activity during the lesson'
};

export const grade2 = {
    grade: 6,
    weight: 2,
    description: 'Graphing geometry shadows in axonometry'
};

export const finalGrade1 = {
    grade: 3
};

export const finalGrade2 = {
    grade: 6
};

export const homework1 = {
    description: 'Homework short description',
    deadline: '2025-01-10'
}

export const homework2 = {
    description: 'Homework long description',
    deadline: '2025-01-10'
}

export const eventType1 = {
    name: 'Theme Day'
}

export const eventType2 = {
    name: 'Talent Show'
}

export const schoolEvent1 = {
    name: 'Science Fair',
    location: 'Auditorium',
    description: 'An event showcasing various science projects by students.',
    date: '2024-05-15',
    startTime: '09:00',
    endTime: '15:00'
}

export const schoolEvent2 = {
    name: 'International Day',
    location: 'School Grounds',
    description: 'A day to celebrate and learn about different cultures through performances, food, and exhibitions.',
    date: '2024-06-20',
    startTime: '10:00',
    endTime: '18:00'
}

export const exam1 = {
    topic: 'Introduction to TypeScript',
    scope: 'Overview of types, interfaces, classes, and generics'
};

export const exam2 = {
    topic: 'Advanced SQL Queries',
    scope: 'Inner joins, Outer joins, Subqueries, Window Functions'
};

export const exam3 = {
    topic: 'Node.js Fundamentals',
    scope: 'Event-Driven Architecture, Asynchronous Programming, Middleware, and API Development'
};

export const exam4 = {
    topic: 'Advanced TypeScript',
    scope: 'Generics, Decorators, Module Augmentation, and Advanced Type Manipulation'
};

export const status1 = {
    name: 'Resolved'
};

export const status2 = {
    name: 'Pending'
};

export const problemType1 = {
    name: 'Data Issue'
};

export const problemType2 = {
    name: 'Technical Issues'
};

export const problem1 = {
    description: 'Incorrect Assessment'
};

export const problem2 = {
    description: 'Problems with Page Display'
};

export const update1 = {
    description: 'Initial release with basic features.',
    version: '1.0.0'
};

export const update2 = {
    description: 'Minor bug fixes and performance improvements.',
    version: '1.1.0'
};

export const questionType1 = {
    name: QuestionType.Closed
};

export const questionType2 = {
    name: QuestionType.Open
};

export const survey1 = {
    name: 'Test Survey 1',
    description: 'Test description 1',
    startDate: '2025-01-09',
    endDate: '2025-01-11',
    startTime: '12:00',
    endTime: '15:00',
};

export const survey2 = {
    name: 'Test Survey 2',
    description: 'Test description 2',
    startDate: '2025-01-12',
    endDate: '2025-01-15',
    startTime: '13:00',
    endTime: '14:00',
};

export const closedQuestion1 = {
    content: 'Do You like swimming?'
};

export const closedQuestion2 = {
    content: 'Do You like running?'
};

export const closedQuestionResponse1 = {
    content: 'Yes'
};

export const closedQuestionResponse2 = {
    content: 'No'
};

export const openQuestion1 = {
    content: 'Do You like horse riding?'
};

export const openQuestion2 = {
    content: 'Do You like skating?'
};

export const openQuestionResponse1 = {
    content: 'Yes'
};

export const openQuestionResponse2 = {
    content: 'No'
};

export const nonExistentId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';
export const invalidIdUrl = '%20';
export const emptyString = '';

export const nonExistentPassword = 'nonexistentpassword';
export const nonExistentEmail = 'user@user.com';
export const newPassword = 'newpassword';
export const newDescription = 'newdescription';