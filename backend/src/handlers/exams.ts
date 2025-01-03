import { Request, Response } from 'express';
import prisma from '../db';
import { grades_gradebook, subjects, classes, students, teachers, lessons, exams } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';
import { Buffer } from 'node:buffer';

function isStudent(user: teachers | students): user is students {
    return (user as students).class_id !== undefined;
}

export const createExam = async (req: Request, res: Response) => {
    try {
        const topic: string = req.body.topic;
        const scope: string = req.body.scope;
        const lessonId: string = req.body.lessonId;

        const existingLesson: lessons | null = await prisma.lessons.findUnique({
            where: {
                id: Buffer.from(uuidParse(lessonId))
            }
        });

        if (!existingLesson) {
            return res.status(404).json(createErrorResponse(`Lesson does not exist.`));
        }

        const createdExam = await prisma.exams.create({
            data: {
                topic: topic,
                scope: scope,
                lesson_id: Buffer.from(uuidParse(lessonId))
            }
        });

        const responseData = {
            ...createdExam,
            id: uuidStringify(createdExam.id),
            lesson_id: uuidStringify(createdExam.lesson_id),
        };

        return res.status(200).json(createSuccessResponse(responseData, `Exam created successfully.`));
    } catch (err) {
        console.error('Error creating exam', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating exam. Please try again later.'));
    }
};

export const getExams = async (req: Request, res: Response) => {
    try {
        const userId: string = req.params.studentId;

        let existingUser: teachers | students | null = await prisma.teachers.findUnique({
            where: {
                id: Buffer.from(uuidParse(userId))
            }
        });

        if (!existingUser) {
            existingUser = await prisma.students.findUnique({
                where: {
                    id: Buffer.from(uuidParse(userId))
                }
            });
        }

        if (!existingUser) {
            return res.status(404).json(createErrorResponse(`User does not exist.`));
        }

        let lessons;

        if (isStudent(existingUser) && existingUser.class_id) {
            lessons = await prisma.lessons.findMany({
                where: {
                    class_id: existingUser.class_id
                }
            });
        } else {
            lessons = await prisma.lessons.findMany({
                where: {
                    teacher_id: existingUser.id,
                }
            });
        }

        const exams = await prisma.exams.findMany({
            where: {
                lesson_id: {
                    in: lessons.map(lesson => lesson.id)
                }
            }
        });

        const responseData = exams.map(exam => ({
            ...exam,
            id: uuidStringify(exam.id),
            lesson_id: uuidStringify(exam.lesson_id)
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Exams retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving exams', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving exams. Please try again later.'));
    }
};

export const getThreeUpcomingExams = async (req: Request, res: Response) => {
    try {
        const userId: string = req.params.studentId;

        let existingUser: teachers | students | null = await prisma.teachers.findUnique({
            where: {
                id: Buffer.from(uuidParse(userId))
            }
        });

        if (!existingUser) {
            existingUser = await prisma.students.findUnique({
                where: {
                    id: Buffer.from(uuidParse(userId))
                }
            });
        }

        if (!existingUser) {
            return res.status(404).json(createErrorResponse(`User does not exist.`));
        }

        let lessons;

        if (isStudent(existingUser) && existingUser.class_id) {
            lessons = await prisma.lessons.findMany({
                where: {
                    class_id: existingUser.class_id
                }
            });
        } else {
            lessons = await prisma.lessons.findMany({
                where: {
                    teacher_id: existingUser.id,
                }
            });
        }

        const now = new Date();

        const exams = await prisma.exams.findMany({
            where: {
                lesson_id: {
                    in: lessons.map(lesson => lesson.id)
                },
                lessons: {
                    date: {
                        gte: now
                    },
                    start_time: {
                        gt: now
                    }
                }
            },
            orderBy: [
                { lessons: { date: 'asc' } },
                { lessons: { start_time: 'asc' } }
            ],
            take: 3
        });

        const responseData = exams.map(exam => ({
            ...exam,
            id: uuidStringify(exam.id),
            lesson_id: uuidStringify(exam.lesson_id)
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Exams retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving exams', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving exams. Please try again later.'));
    }
};

export const updateExam = async (req: Request, res: Response) => {
    try {
        const examId: string = req.params.examId;
        const topic: string = req.body.topic;
        const scope: string = req.body.scope;

        const existingExam: exams | null = await prisma.exams.findUnique({
            where: {
                id: Buffer.from(uuidParse(examId))
            }
        });

        if (!existingExam) {
            return res.status(404).json(createErrorResponse(`Exam does not exist.`));
        }

        const data: { topic?: string, scope?: string } = {};

        if (topic) data.topic = topic;
        if (scope) data.scope = scope;

        const updatedExam = await prisma.exams.update({
            where: {
                id: Buffer.from(uuidParse(examId))
            },
            data: data
        });

        const responseData = {
            ...updatedExam,
            id: uuidStringify(updatedExam.id),
            lesson_id: uuidStringify(updatedExam.lesson_id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Exam updated successfully.`));
    } catch (err) {
        console.error('Error updating exam', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while updating exam. Please try again later.'));
    }
};

export const deleteExam = async (req: Request, res: Response) => {
    try {
        const examId: string = req.params.examId;

        const existingExam: exams | null = await prisma.exams.findUnique({
            where: {
                id: Buffer.from(uuidParse(examId))
            }
        });

        if (!existingExam) {
            return res.status(404).json(createErrorResponse(`Exam does not exist.`));
        }

        const deletedExam = await prisma.exams.delete({
            where: {
                id: Buffer.from(uuidParse(examId))
            }
        });

        const responseData = {
            ...deletedExam,
            id: uuidStringify(deletedExam.id),
            lesson_id: uuidStringify(deletedExam.lesson_id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Exam deleted successfully.`));
    } catch (err) {
        console.error('Error deleting exam', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while deleting exam. Please try again later.'));
    }
};