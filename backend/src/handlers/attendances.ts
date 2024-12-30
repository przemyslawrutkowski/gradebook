import { Request, Response } from 'express';
import prisma from '../db';
import Attendance from '../interfaces/attendance';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { Buffer } from 'node:buffer';
import { attendances, lessons, students } from '@prisma/client';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';
import MonthlyAttendance from '../interfaces/MonthlyAttendance';
import { Month } from '../enums/months';

export const createAttendances = async (req: Request, res: Response) => {
    try {
        const lessonId: string = req.body.lessonId;
        const attendances: Attendance[] = req.body.attendances;

        const existingLesson: lessons | null = await prisma.lessons.findUnique({
            where: {
                id: Buffer.from(uuidParse(lessonId))
            }
        });

        if (!existingLesson) {
            return res.status(404).json(createErrorResponse(`Lesson does not exist.`));
        }

        for (const attendance of attendances) {
            const existingStudent = await prisma.students.findUnique({
                where: {
                    id: Buffer.from(uuidParse(attendance.studentId))
                }
            });

            if (!existingStudent) {
                return res.status(404).json(createErrorResponse(`Student with ID ${attendance.studentId} does not exist.`));
            }

            if (!attendance.wasPresent && attendance.wasLate) {
                return res.status(422).json(createErrorResponse(`Invalid attendance status: cannot be marked as late if student with ID '${attendance.studentId}' is absent'.`));
            }
        }

        const existingAttendance: attendances | null = await prisma.attendances.findFirst({
            where: {
                lesson_id: Buffer.from(uuidParse(lessonId))
            }
        });

        if (existingAttendance) {
            return res.status(409).json(createErrorResponse(`Attendances already exists.`));
        }

        const payload = await prisma.attendances.createMany({
            data: attendances.map((attendance) => {
                return {
                    date_time: new Date(),
                    was_present: attendance.wasPresent,
                    was_late: attendance.wasLate,
                    student_id: Buffer.from(uuidParse(attendance.studentId)),
                    lesson_id: Buffer.from(uuidParse(lessonId))
                };
            })
        });

        return res.status(200).json(createSuccessResponse(payload.count, `Attendances list created successfully.`));
    } catch (err) {
        console.error('Error creating attendances list', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating attendances list. Please try again later.'));
    }
};

export const getLessonAttendances = async (req: Request, res: Response) => {
    try {
        const lessonId: string = req.params.lessonId;

        const existingLesson: lessons | null = await prisma.lessons.findUnique({
            where: {
                id: Buffer.from(uuidParse(lessonId))
            }
        });

        if (!existingLesson) {
            return res.status(404).json(createErrorResponse(`Lesson does not exist.`));
        }

        const attendances = await prisma.attendances.findMany({
            where: {
                lesson_id: Buffer.from(uuidParse(lessonId))
            }
        });

        const responseData = attendances.map(attendance => ({
            ...attendance,
            id: uuidStringify(attendance.id),
            date_time: attendance.date_time.toISOString(),
            student_id: uuidStringify(attendance.student_id),
            lesson_id: uuidStringify(attendance.lesson_id)
        }));

        return res.status(200).json(createSuccessResponse(responseData, `Attendances retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving attendances', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving attendances. Please try again later.'));
    }
};

export const getAttendancesStatistics = async (req: Request, res: Response) => {
    try {
        const studentId: string = req.params.studentId;
        const currentYear: number = new Date().getUTCFullYear();

        const existingStudent: students | null = await prisma.students.findUnique({
            where: {
                id: Buffer.from(uuidParse(studentId))
            }
        });

        if (!existingStudent) {
            return res.status(404).json(createErrorResponse(`Student does not exist.`));
        }

        const attendances = await prisma.attendances.findMany({
            where: {
                lessons: {
                    semesters: {
                        school_years: {
                            name: `${currentYear}/${currentYear + 1}`
                        }
                    }
                }
            }
        });

        const responseData: Record<Month, MonthlyAttendance> = {
            [Month.January]: { present: 0, late: 0, absent: 0 },
            [Month.February]: { present: 0, late: 0, absent: 0 },
            [Month.March]: { present: 0, late: 0, absent: 0 },
            [Month.April]: { present: 0, late: 0, absent: 0 },
            [Month.May]: { present: 0, late: 0, absent: 0 },
            [Month.June]: { present: 0, late: 0, absent: 0 },
            [Month.July]: { present: 0, late: 0, absent: 0 },
            [Month.August]: { present: 0, late: 0, absent: 0 },
            [Month.September]: { present: 0, late: 0, absent: 0 },
            [Month.October]: { present: 0, late: 0, absent: 0 },
            [Month.November]: { present: 0, late: 0, absent: 0 },
            [Month.December]: { present: 0, late: 0, absent: 0 }
        };

        for (const attendance of attendances) {
            if (uuidStringify(attendance.student_id) !== studentId) continue;
            const monthIndex: number = attendance.date_time.getUTCMonth();
            const monthName: Month = Object.values(Month)[monthIndex] as Month;

            if (attendance.was_present) {
                if (attendance.was_late) {
                    responseData[monthName].late += 1;
                } else {
                    responseData[monthName].present += 1;
                }
            } else {
                responseData[monthName].absent += 1;
            }
        }

        return res.status(200).json(createSuccessResponse(responseData, `Attendances statistics retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving attendances statistics', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving attendances statistics. Please try again later.'));
    }
};

export const getStudentAttendances = async (req: Request, res: Response) => {
    try {
        const studentId: string = req.params.studentId;

        const existingStudent = await prisma.students.findUnique({
            where: {
                id: Buffer.from(uuidParse(studentId))
            }
        });

        if (!existingStudent) {
            return res.status(404).json(createErrorResponse('Student does not exist.'));
        }

        const attendances = await prisma.attendances.findMany({
            where: {
                student_id: Buffer.from(uuidParse(studentId))
            },
            include: {
                lessons: {
                    include: {
                        subjects: true
                    },
                },
            },
            orderBy: {
                date_time: 'asc'
            }
        });

        const responseData = attendances.map(attendance => ({
            ...attendance,
            id: uuidStringify(attendance.id),
            date_time: attendance.date_time.toISOString(),
            student_id: uuidStringify(attendance.student_id),
            lesson_id: uuidStringify(attendance.lesson_id),
            lesson: attendance.lessons ? {
                ...attendance.lessons,
                id: uuidStringify(attendance.lessons.id),
                date: attendance.lessons.date.toISOString(),
                start_time: attendance.lessons.start_time.toISOString(),
                end_time: attendance.lessons.end_time.toISOString(),
                teacher_id: uuidStringify(attendance.lessons.teacher_id),
                class_id: uuidStringify(attendance.lessons.class_id),
                subject_id: uuidStringify(attendance.lessons.subject_id),
                semester_id: uuidStringify(attendance.lessons.semester_id),
                subject: {
                    ...attendance.lessons.subjects,
                    id: uuidStringify(attendance.lessons.subjects.id)
                }
            } : null
        }));

        return res.status(200).json(createSuccessResponse(responseData, `Attendances retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving attendances', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving attendances. Please try again later.'));
    }
};


export const getClassAttendances = async (req: Request, res: Response) => {
    try {
        const classId: string = req.params.classId;

        const existingClass = await prisma.classes.findUnique({
            where: {
                id: Buffer.from(uuidParse(classId))
            }
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse('Class does not exist.'));
        }

        const existingStudents = await prisma.students.findMany({
            where: {
                class_id: existingClass.id
            }
        });

        const attendances = await prisma.attendances.findMany({
            where: {
                student_id: {
                    in: existingStudents.map(student => student.id),
                },
            },
            include: {
                students: true,
                lessons: {
                    include: {
                        subjects: true
                    },
                }
            },
            orderBy: {
                date_time: 'asc'
            }
        });

        const responseData = attendances.map(attendance => ({
            ...attendance,
            id: uuidStringify(attendance.id),
            date_time: attendance.date_time.toISOString(),
            student_id: uuidStringify(attendance.student_id),
            lesson_id: uuidStringify(attendance.lesson_id),
            student: {
                ...attendance.students,
                id: uuidStringify(attendance.students.id),
                reset_password_token: null,
                reset_password_expires: null,
                class_id: attendance.students.class_id ? uuidStringify(attendance.students.class_id) : null
            },
            lesson: attendance.lessons ? {
                ...attendance.lessons,
                id: uuidStringify(attendance.lessons.id),
                date: attendance.lessons.date.toISOString(),
                start_time: attendance.lessons.start_time.toISOString(),
                end_time: attendance.lessons.end_time.toISOString(),
                teacher_id: uuidStringify(attendance.lessons.teacher_id),
                class_id: uuidStringify(attendance.lessons.class_id),
                subject_id: uuidStringify(attendance.lessons.subject_id),
                semester_id: uuidStringify(attendance.lessons.semester_id),
                subject: {
                    ...attendance.lessons.subjects,
                    id: uuidStringify(attendance.lessons.subjects.id)
                }
            } : null
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Attendances retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving class attendances', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving attendances. Please try again later.'));
    }
};

export const getStudentAttendancesByDate = async (req: Request, res: Response) => {
    try {
        const studentId: string = req.params.studentId;
        const date = new Date(req.params.date);

        const existingStudent = await prisma.students.findUnique({
            where: {
                id: Buffer.from(uuidParse(studentId)),
            },
        });

        if (!existingStudent) {
            return res.status(404).json(createErrorResponse('Student does not exist.'));
        }

        const attendances = await prisma.attendances.findMany({
            where: {
                student_id: Buffer.from(uuidParse(studentId)),
                lessons: {
                    date: {
                        gte: date,
                        lte: date
                    }
                },
            },
            include: {
                lessons: {
                    include: {
                        subjects: true
                    },
                },
            },
            orderBy: {
                lessons: {
                    start_time: 'asc',
                }
            },
        });

        const responseData = attendances.map(attendance => ({
            ...attendance,
            id: uuidStringify(attendance.id),
            date_time: attendance.date_time.toISOString(),
            student_id: uuidStringify(attendance.student_id),
            lesson_id: uuidStringify(attendance.lesson_id),
            lesson: attendance.lessons ? {
                ...attendance.lessons,
                id: uuidStringify(attendance.lessons.id),
                date: attendance.lessons.date.toISOString(),
                start_time: attendance.lessons.start_time.toISOString(),
                end_time: attendance.lessons.end_time.toISOString(),
                teacher_id: uuidStringify(attendance.lessons.teacher_id),
                class_id: uuidStringify(attendance.lessons.class_id),
                subject_id: uuidStringify(attendance.lessons.subject_id),
                semester_id: uuidStringify(attendance.lessons.semester_id),
                subject: {
                    ...attendance.lessons.subjects,
                    id: uuidStringify(attendance.lessons.subjects.id)
                }
            } : null
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Student attendances for the specified date successfully retrieved.'));
    } catch (err) {
        console.error('Error retrieving student attendances by date', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving attendances by date. Please try again later.'));
    }
};

export const updateAttendance = async (req: Request, res: Response) => {
    try {
        const attendanceId: string = req.params.attendanceId;
        const wasPresent: boolean = req.body.wasPresent;
        const wasLate: boolean = req.body.wasLate;

        if (!wasPresent && wasLate) {
            return res.status(422).json(createErrorResponse('Invalid attendance status: cannot be marked as late if student is absent'));
        }

        const attendance = await prisma.attendances.findUnique({
            where: {
                id: Buffer.from(uuidParse(attendanceId))
            }
        });

        if (!attendance) {
            return res.status(404).json(createErrorResponse(`Attendance does not exist.`));
        }

        const updatedAttendance = await prisma.attendances.update({
            where: {
                id: Buffer.from(uuidParse(attendanceId))

            },
            data: {
                was_present: wasPresent,
                was_late: wasLate
            }
        });

        return res.status(200).json(createSuccessResponse(updatedAttendance, `Attendance updated successfully.`));
    } catch (err) {
        console.error('Error updating attendance', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while updating attendance. Please try again later.'));
    }
<<<<<<< HEAD
};

export const getStudentAttendances = async (req: Request, res: Response) => {
    try {
        const studentId: string = req.params.studentId;

        const existingStudent = await prisma.students.findUnique({
            where: {
                id: Buffer.from(uuidParse(studentId))
            }
        });

        if (!existingStudent) {
            return res.status(404).json(createErrorResponse('Student does not exist.'));
        }

        const attendances = await prisma.attendances.findMany({
            where: {
                student_id: Buffer.from(uuidParse(studentId))
            },
            include: {
                lessons: {
                    select: {
                        subjects: {
                            select: {
                                name: true
                            }
                        },
                        date: true,
                        start_time: true,
                        end_time: true
                    }
                }
            },
            orderBy: {
                lessons:{
                    start_time: 'asc',
                } 
            },
        });

        const responseData = attendances.map(attendance => ({
            id: uuidStringify(attendance.id),
            was_present: attendance.was_present,
            was_late: attendance.was_late,
            lesson: attendance.lessons ? {
                subject_name: attendance.lessons.subjects.name,
                date: attendance.lessons.date.toISOString().split('T')[0],
                start_time: attendance.lessons.start_time.toISOString().split('T')[1].substr(0, 5),
                end_time: attendance.lessons.end_time.toISOString().split('T')[1].substr(0, 5),
            } : null
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Student attendances have been successfully retrieved.'));
    } catch (err) {
        console.error('Error retrieving student attendances', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving attendances. Please try again later.'));
    }
};


export const getClassAttendances = async (req: Request, res: Response) => {
    try {
        const classId: string = req.params.classId;

        const existingClass = await prisma.classes.findUnique({
            where: {
                id: Buffer.from(uuidParse(classId))
            },
            include: {
                students: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true
                    },
                },
            },
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse('Class does not exist.'));
        }

        const attendances = await prisma.attendances.findMany({
            where: {
                student_id: {
                    in: existingClass.students.map(student => student.id),
                },
            },
            include: {
                students: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true
                    },
                },
                lessons: {
                    select: {
                        id: true,
                        date: true,
                        start_time: true,
                        end_time: true,
                        subjects: {
                            select: {
                                name: true
                            }
                        }
                    },
                },
            },
            orderBy: {
                lessons:{
                    start_time: 'asc',
                } 
            },
        });

        const responseData = attendances.map(attendance => ({
            attendanceId: uuidStringify(attendance.id),
            was_present: attendance.was_present,
            was_late: attendance.was_late,
            student: {
                id: uuidStringify(attendance.student_id),
                first_name: attendance.students.first_name,
                last_name: attendance.students.last_name,
            },
            lesson: {
                subject_name: attendance.lessons.subjects.name,
                date: attendance.lessons.date.toISOString().split('T')[0],
                start_time: attendance.lessons.start_time.toISOString().split('T')[1].substr(0, 5),
                end_time: attendance.lessons.end_time.toISOString().split('T')[1].substr(0, 5),
            },
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Attendances retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving class attendances', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving attendances. Please try again later.'));
    }
};

export const getStudentAttendancesByDate = async (req: Request, res: Response) => {
    try {
        const studentId: string = req.params.studentId;
        const dateString: string = req.query.date as string;

        if (!dateString) {
            return res.status(400).json(createErrorResponse('Date query parameter is required.'));
        }

        const attendanceDate = new Date(dateString);
        if (isNaN(attendanceDate.getTime())) {
            return res.status(400).json(createErrorResponse('Invalid date format. Expected ISO format: YYYY-MM-DDTHH:mm:ss.sssZ.'));
        }

        const startOfDay = new Date(Date.UTC(attendanceDate.getUTCFullYear(), attendanceDate.getUTCMonth(), attendanceDate.getUTCDate()));
        const endOfDay = new Date(Date.UTC(attendanceDate.getUTCFullYear(), attendanceDate.getUTCMonth(), attendanceDate.getUTCDate() + 1));

        const existingStudent = await prisma.students.findUnique({
            where: {
                id: Buffer.from(uuidParse(studentId)),
            },
        });

        if (!existingStudent) {
            return res.status(404).json(createErrorResponse('Student does not exist.'));
        }

        const attendances = await prisma.attendances.findMany({
            where: {
                student_id: Buffer.from(uuidParse(studentId)),
                lessons: {
                    date: {
                        gte: startOfDay,
                        lt: endOfDay,
                    }
                },
            },
            include: {
                lessons: {
                    select: {
                        subjects: {
                            select: {
                                name: true,
                            },
                        },
                        date: true,
                        start_time: true,
                        end_time: true,
                    },
                },
            },
            orderBy: {
                lessons: {
                    start_time: 'asc',
                }
            },
        });

        const responseData = attendances.map(attendance => ({
            id: uuidStringify(attendance.id),
            was_present: attendance.was_present,
            was_late: attendance.was_late,
            lesson: attendance.lessons ? {
                subject_name: attendance.lessons.subjects.name,
                date: attendance.lessons.date.toISOString().split('T')[0],
                start_time: attendance.lessons.start_time.toISOString().split('T')[1].substr(0, 5),
                end_time: attendance.lessons.end_time.toISOString().split('T')[1].substr(0, 5),
            } : null,
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Student attendances for the specified date have been successfully retrieved.'));
    } catch (err) {
        console.error('Error retrieving student attendances by date', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving attendances. Please try again later.'));
    }
=======
>>>>>>> 505531f (Code refactore, tests)
};