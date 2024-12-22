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
    description: 'Activity during the lesson'
};

export const grade2 = {
    grade: 6,
    description: 'Graphing geometry shadows in axonometry'
};

export const homework1 = {
    description: 'Homework short description',
    deadline: '2025-01-10'
}

export const homework2 = {
    description: 'Homework long description',
    deadline: '2025-01-10'
}

export const nonExistentId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';
export const invalidIdUrl = '%20';
export const emptyString = '';

export const nonExistentPassword = 'nonexistentpassword';
export const nonExistentEmail = 'user@user.com';
export const newPassword = 'newpassword';
export const newDescription = 'newdescription';