import { Request, Response } from 'express';
import prisma from '../db';
import { teachers, classes, subjects, lessons } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import LessonSchedule from '../interfaces/lessonSchedule';

export const generateLessons = async (req: Request, res: Response) => {
    try {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);

        const lessonSchedules: LessonSchedule[] = req.body.lessonSchedules;

        const teacherId = Number(req.body.teacherId);
        const classId = Number(req.body.classId);
        const subjectId = Number(req.body.subjectId);

        const existingTeacher: teachers | null = await prisma.teachers.findUnique({
            where: {
                id: teacherId
            }
        });

        if (!existingTeacher) {
            return res.status(409).json(createErrorResponse(`Teacher with ID '${teacherId}' does not exist.`));
        }

        const existingClass: classes | null = await prisma.classes.findUnique({
            where: {
                id: classId
            }
        });

        if (!existingClass) {
            return res.status(409).json(createErrorResponse(`Class with ID '${classId}' does not exist.`));
        }

        const existingSubject: subjects | null = await prisma.classes.findUnique({
            where: {
                id: classId
            }
        });

        if (!existingSubject) {
            return res.status(409).json(createErrorResponse(`Subject with ID '${subjectId}' does not exist.`));
        }

        const createdLessonsSeries = await prisma.lessons_series.create({
            data: {
                key: `${teacherId}/${classId}/${subjectId}`,
                date_time: new Date()
            }
        });

        const dayMilliseconds = 24 * 60 * 60 * 1000;
        const weekMilliseconds = 7 * dayMilliseconds;

        const lessonsToCreate: {
            date: Date;
            start_time: Date;
            end_time: Date;
            is_completed: boolean;
            series_id: number;
            teacher_id: number;
            class_id: number;
            subject_id: number;
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
                        series_id: createdLessonsSeries.id,
                        teacher_id: teacherId,
                        class_id: classId,
                        subject_id: subjectId
                    });
                }

                currentDate = new Date(currentDate.getTime() + (schedule.frequency * weekMilliseconds));
            }
        });

        const payload = await prisma.lessons.createMany({
            data: lessonsToCreate
        });

        res.status(200).json(createSuccessResponse({
            series: createdLessonsSeries,
            lessonsCreated: payload.count
        }, `Series with ID '${createdLessonsSeries.id}' and associated lessons successfully generated.`));
    } catch (err) {
        console.error('Error generating lessons', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while generating lessons. Please try again later.'));
    }
};

export const patchLesson = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const description = req.body.description;

        const existingLesson: lessons | null = await prisma.lessons.findUnique({
            where: {
                id: id
            }
        });

        if (!existingLesson) {
            return res.status(404).json(createErrorResponse(`Lesson with ID '${id}' does not exist.`));
        }

        const patchedLesson = await prisma.lessons.update({
            where: {
                id: id
            }, data: {
                description: description,
                is_completed: true
            }
        });

        return res.status(200).json(createSuccessResponse(patchedLesson.id, `Lesson with ID '${patchedLesson.id}' successfully patched.`));
    } catch (err) {
        console.error('Error patching lesson', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while patching the lesson. Please try again later.'));

    }
};

export const deleteLessonsSeries = async (req: Request, res: Response) => {
    try {
        const seriesId = Number(req.params.seriesId);

        const existingSeries = await prisma.lessons_series.findUnique({
            where: { id: seriesId }
        });

        if (!existingSeries) {
            return res.status(404).json(createErrorResponse(`Series with ID '${seriesId}' does not exist.`));
        }

        const payload = await prisma.lessons.deleteMany({
            where: { series_id: seriesId }
        });

        const deletedSeries = await prisma.lessons_series.delete({
            where: { id: seriesId }
        });

        res.status(200).json(createSuccessResponse({
            series: deletedSeries,
            lessonsDeleted: payload.count
        }, `Series with ID '${deletedSeries.id}' and associated lessons successfully deleted.`));
    } catch (err) {
        console.error('Error deleting lessons series', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while deleting the lessons series. Please try again later.'));
    }
};