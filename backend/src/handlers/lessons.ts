import { Request, Response } from 'express';
import prisma from '../db';
import { teachers, classes, subjects, lessons, semesters } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import LessonSchedule from '../interfaces/lessonSchedule';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';
import { Buffer } from 'node:buffer';

export const createLessons = async (req: Request, res: Response) => {
    try {
        // startDate and endDate are the same values as these that are present in specific semester
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);

        const lessonSchedules: LessonSchedule[] = req.body.lessonSchedules;

        const teacherId: string = req.body.teacherId;
        const classId: string = req.body.classId;
        const subjectId: string = req.body.subjectId;
        const semesterId: string = req.body.semesterId;

        const existingTeacher: teachers | null = await prisma.teachers.findUnique({
            where: {
                id: Buffer.from(uuidParse(teacherId))
            }
        });

        if (!existingTeacher) {
            return res.status(404).json(createErrorResponse(`Teacher does not exist.`));
        }

        const existingClass: classes | null = await prisma.classes.findUnique({
            where: {
                id: Buffer.from(uuidParse(classId))
            }
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse(`Class does not exist.`));
        }

        const existingSubject: subjects | null = await prisma.subjects.findUnique({
            where: {
                id: Buffer.from(uuidParse(subjectId))
            }
        });

        if (!existingSubject) {
            return res.status(404).json(createErrorResponse(`Subject does not exist.`));
        }

        const existingSemester: semesters | null = await prisma.semesters.findUnique({
            where: {
                id: Buffer.from(uuidParse(semesterId))
            }
        });

        if (!existingSemester) {
            return res.status(404).json(createErrorResponse(`Semester does not exist.`));
        }

        const existingLesson: lessons | null = await prisma.lessons.findFirst({
            where: {
                teacher_id: Buffer.from(uuidParse(teacherId)),
                class_id: Buffer.from(uuidParse(classId)),
                subject_id: Buffer.from(uuidParse(subjectId)),
                semester_id: Buffer.from(uuidParse(semesterId))
            }
        });

        if (existingLesson) {
            return res.status(409).json(createErrorResponse(`Lessons already exists.`));
        }

        const dayMilliseconds = 24 * 60 * 60 * 1000;
        const weekMilliseconds = 7 * dayMilliseconds;

        const lessonsToCreate: {
            date: Date;
            start_time: Date;
            end_time: Date;
            is_completed: boolean;
            teacher_id: Buffer;
            class_id: Buffer;
            subject_id: Buffer;
            semester_id: Buffer;
        }[] = [];

        lessonSchedules.forEach((schedule: LessonSchedule) => {
            let currentDate = new Date(startDate.getTime() + dayMilliseconds);

            while (currentDate < endDate) {
                const dayOfWeek = currentDate.getDay();

                if (dayOfWeek !== schedule.dayOfWeek) {
                    const daysUntilNextLesson = (schedule.dayOfWeek + 7 - dayOfWeek) % 7;
                    currentDate = new Date(currentDate.getTime() + daysUntilNextLesson * dayMilliseconds);
                }

                if (currentDate < endDate) {
                    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
                    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
                    const lessonStartTime = new Date(currentDate);
                    const lessonEndTime = new Date(currentDate);

                    lessonStartTime.setHours(startHour, startMinute, 0, 0);
                    lessonEndTime.setHours(endHour, endMinute, 0, 0);

                    lessonsToCreate.push({
                        date: currentDate,
                        start_time: lessonStartTime,
                        end_time: lessonEndTime,
                        is_completed: false,
                        teacher_id: Buffer.from(uuidParse(teacherId)),
                        class_id: Buffer.from(uuidParse(classId)),
                        subject_id: Buffer.from(uuidParse(subjectId)),
                        semester_id: Buffer.from(uuidParse(semesterId))
                    });
                }

                currentDate = new Date(currentDate.getTime() + (schedule.frequency * weekMilliseconds));
            }
        });

        const payload = await prisma.lessons.createMany({
            data: lessonsToCreate
        });

        res.status(200).json(createSuccessResponse(payload.count, `Lessons generated successfully.`));
    } catch (err) {
        console.error('Error generating lessons', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while generating lessons. Please try again later.'));
    }
};

export const getLessons = async (req: Request, res: Response) => {
    try {
        const classId: string = req.params.classId;
        const subjectId: string = req.params.subjectId;

        const existingClass: classes | null = await prisma.classes.findUnique({
            where: {
                id: Buffer.from(uuidParse(classId))
            }
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse(`Class does not exist.`));
        }

        const existingSubject: subjects | null = await prisma.subjects.findUnique({
            where: {
                id: Buffer.from(uuidParse(subjectId))
            }
        });

        if (!existingSubject) {
            return res.status(404).json(createErrorResponse(`Subject does not exist.`));
        }

        const lessons = await prisma.lessons.findMany({
            where: {
                class_id: Buffer.from(uuidParse(classId)),
                subject_id: Buffer.from(uuidParse(subjectId)),
            }
        });

        const responseData = lessons.map(lesson => ({
            ...lesson,
            id: uuidStringify(lesson.id),
            date: lesson.date.toISOString(),
            start_time: lesson.start_time.toISOString(),
            end_time: lesson.end_time.toISOString(),
            teacher_id: uuidStringify(lesson.teacher_id),
            class_id: uuidStringify(lesson.class_id),
            subject_id: uuidStringify(lesson.subject_id),
            semester_id: uuidStringify(lesson.semester_id)
        }));

        return res.status(200).json(createSuccessResponse(responseData, `Lessons retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving lessons', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving lessons. Please try again later.'));
    }
};

export const updateLesson = async (req: Request, res: Response) => {
    try {
        const lessonId: string = req.params.lessonId;
        const description: string = req.body.description;

        const existingLesson: lessons | null = await prisma.lessons.findUnique({
            where: {
                id: Buffer.from(uuidParse(lessonId))
            }
        });

        if (!existingLesson) {
            return res.status(404).json(createErrorResponse(`Lesson does not exist.`));
        }

        const updatedLesson = await prisma.lessons.update({
            where: {
                id: Buffer.from(uuidParse(lessonId))
            }, data: {
                description: description,
                is_completed: true
            }
        });

        const responseData = {
            ...updatedLesson,
            id: uuidStringify(updatedLesson.id),
            date: updatedLesson.date.toISOString(),
            start_time: updatedLesson.start_time.toISOString(),
            end_time: updatedLesson.end_time.toISOString(),
            teacher_id: uuidStringify(updatedLesson.teacher_id),
            class_id: uuidStringify(updatedLesson.class_id),
            subject_id: uuidStringify(updatedLesson.subject_id),
            semester_id: uuidStringify(updatedLesson.semester_id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Lesson updated successfully.`));
    } catch (err) {
        console.error('Error updating lesson', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while updating lesson. Please try again later.'));
    }
};

export const deleteLessons = async (req: Request, res: Response) => {
    try {
        const classId: string = req.params.classId;
        const subjectId: string = req.params.subjectId;

        const existingClass: classes | null = await prisma.classes.findUnique({
            where: {
                id: Buffer.from(uuidParse(classId))
            }
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse(`Class does not exist.`));
        }

        const existingSubject: subjects | null = await prisma.subjects.findUnique({
            where: {
                id: Buffer.from(uuidParse(subjectId))
            }
        });

        if (!existingSubject) {
            return res.status(404).json(createErrorResponse(`Subject does not exist.`));
        }

        const payload = await prisma.lessons.deleteMany({
            where: {
                class_id: Buffer.from(uuidParse(classId)),
                subject_id: Buffer.from(uuidParse(subjectId)),
            }
        });

        res.status(200).json(createSuccessResponse(payload.count, `Lessons deleted successfully.`));
    } catch (err) {
        console.error('Error deleting lessons', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while deleting lessons. Please try again later.'));
    }
};

export const getAllLessons = async (req: Request, res: Response) => {
    try {
        const lessons = await prisma.lessons.findMany();

        const responseData = lessons.map(lesson => ({
            ...lesson,
            id: uuidStringify(lesson.id),
            date: lesson.date.toISOString(),
            start_time: lesson.start_time.toISOString(),
            end_time: lesson.end_time.toISOString(),
            teacher_id: uuidStringify(lesson.teacher_id),
            class_id: uuidStringify(lesson.class_id),
            subject_id: uuidStringify(lesson.subject_id),
            semester_id: uuidStringify(lesson.semester_id)
        }));

        return res.status(200).json(createSuccessResponse(responseData, `All lessons retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving all lessons', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving lessons. Please try again later.'));
    }
};

export const getLessonsByClass = async (req: Request, res: Response) => {
    try {
        const classId: string = req.params.classId;

        if (!classId) {
            return res.status(400).json(createErrorResponse('Invalid classId format.'));
        }

        const existingClass: classes | null = await prisma.classes.findUnique({
            where: {
                id: Buffer.from(uuidParse(classId))
            },
            include: {
                students: true
            }
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse(`Class with ID ${classId} does not exist.`));
        }

        const lessons = await prisma.lessons.findMany({
            where: {
                class_id: Buffer.from(uuidParse(classId)),
            },
            include: {
                teachers: true,  
                subjects: true,  
                semesters: true, 
                classes: {
                    include: {
                        students: true
                    }
                }
            },
            orderBy: [
                { date: 'asc' },
                { start_time: 'asc' }
            ]
        });

        const responseData = lessons.map(lesson => ({
            ...lesson,
            id: uuidStringify(lesson.id),
            date: lesson.date.toISOString(),
            start_time: lesson.start_time.toISOString(),
            end_time: lesson.end_time.toISOString(),
            teacher_id: uuidStringify(lesson.teacher_id),
            class_id: uuidStringify(lesson.class_id),
            subject_id: uuidStringify(lesson.subject_id),
            semester_id: uuidStringify(lesson.semester_id),
            teachers: {
                ...lesson.teachers,
                id: uuidStringify(lesson.teachers.id),
            },
            subjects: {
                ...lesson.subjects,
                id: uuidStringify(lesson.subjects.id),
            },
            semesters: {
                ...lesson.semesters,
                id: uuidStringify(lesson.semesters.id),
                school_year_id: uuidStringify(lesson.semesters.school_year_id), 
            },
            students: lesson.classes.students.map(student => ({
                ...student,
                id: uuidStringify(student.id),
                class_id: student.class_id ? uuidStringify(student.class_id) : null,
            })), 
        }));

        return res.status(200).json(createSuccessResponse(responseData, `Lessons for class ${classId} retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving lessons by class', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving lessons. Please try again later.'));
    }
};

export const deleteSingleLesson = async (req: Request, res: Response) => {
  try {
    const lessonId: string = req.params.lessonId;

    const existingLesson = await prisma.lessons.findUnique({
      where: {
        id: Buffer.from(uuidParse(lessonId))
      }
    });

    if (!existingLesson) {
      return res.status(404).json(createErrorResponse(`Lesson does not exist.`));
    }

    await prisma.lessons.delete({
      where: {
        id: Buffer.from(uuidParse(lessonId))
      }
    });

    return res.status(200).json(createSuccessResponse(null, `Lesson deleted successfully.`));
  } catch (err) {
    console.error('Error deleting lesson', err);
    return res.status(500).json(createErrorResponse('An unexpected error occurred while deleting the lesson. Please try again later.'));
  }
};