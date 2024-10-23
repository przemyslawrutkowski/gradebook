import { Request, Response } from 'express';
import prisma from '../db';
import { teachers, classes, subjects, lessons } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import LessonSchedule from '../interfaces/lessonSchedule';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';
import { Buffer } from 'node:buffer';

export const generateLessons = async (req: Request, res: Response) => {
    try {
        const startDate = new Date(req.body.startDate as string);
        const endDate = new Date(req.body.endDate as string);

        const lessonSchedules: LessonSchedule[] = req.body.lessonSchedules;

        const teacherId: string = req.body.teacherId;
        const classId: string = req.body.classId;
        const subjectId: string = req.body.subjectId;

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
                        subject_id: Buffer.from(uuidParse(subjectId))
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
            teacher_id: uuidStringify(lesson.teacher_id),
            class_id: uuidStringify(lesson.class_id),
            subject_id: uuidStringify(lesson.subject_id)
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
            teacher_id: uuidStringify(updatedLesson.teacher_id),
            class_id: uuidStringify(updatedLesson.class_id),
            subject_id: uuidStringify(updatedLesson.subject_id)
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