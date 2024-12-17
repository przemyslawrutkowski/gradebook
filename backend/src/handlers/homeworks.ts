import { Request, Response } from 'express';
import prisma from '../db';
import { homeworks, lessons, students, teachers } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';
import { Buffer } from 'node:buffer';

export const createHomework = async (req: Request, res: Response) => {
    try {
        const description: string = req.body.description;
        const deadline: string = req.body.deadline;
        const lessonId: string = req.body.lessonId;

        const existingLesson = await prisma.lessons.findUnique({
            where: {
                id: Buffer.from(uuidParse(lessonId))
            }
        });

        if (!existingLesson) {
            return res.status(404).json(createErrorResponse('Lesson does not exist.'));
        }

        const existingHomework = await prisma.homeworks.findUnique({
            where: {
                lesson_id: Buffer.from(uuidParse(lessonId))
            }
        });

        if (existingHomework) {
            return res.status(409).json(createErrorResponse('Homework already exists.'));
        }


        const createdHomework = await prisma.homeworks.create({
            data: {
                description,
                deadline: new Date(deadline),
                lesson_id: Buffer.from(uuidParse(lessonId))
            }
        });

        const responseData = {
            ...createdHomework,
            id: uuidStringify(createdHomework.id),
            deadline: createdHomework.deadline.toISOString(),
            lesson_id: uuidStringify(createdHomework.lesson_id)
        };

        return res.status(200).json(createSuccessResponse(responseData, 'Homework created successfully.'));
    } catch (err) {
        console.error('Error creating homework', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while creating homework. Please try again later.'));
    }
};

export const getHomework = async (req: Request, res: Response) => {
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

        const homework = await prisma.homeworks.findUnique({
            where: {
                lesson_id: Buffer.from(uuidParse(lessonId))
            }
        });

        let responseData: {
            id: string,
            description: string,
            deadline: string,
            lesson_id: string,
        } | null = null;

        if (homework) {
            responseData = {
                ...homework,
                id: uuidStringify(homework.id),
                deadline: homework.deadline.toISOString(),
                lesson_id: uuidStringify(homework.lesson_id)
            };
        }

        return res.status(200).json(createSuccessResponse(responseData, 'Homework retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving homework', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving homework. Please try again later.'));
    }
};

export const getLatestHomework = async (req: Request, res: Response) => {
    try {
        const studentId: string = req.params.studentId;

        const existingStudent: students | null = await prisma.students.findUnique({
            where: {
                id: Buffer.from(uuidParse(studentId))
            }
        });

        if (!existingStudent) {
            return res.status(404).json(createErrorResponse('Student does not exist.'));
        }

        if (!existingStudent.class_id) {
            return res.status(404).json(createErrorResponse('Student is not assigned to any class.'));
        }

        const latestHomework = await prisma.homeworks.findFirst({
            where: {
                lessons: {
                    class_id: existingStudent.class_id
                }
            },
            orderBy: {
                deadline: 'asc'
            }
        });

        let responseData: {
            id: string,
            description: string,
            deadline: string,
            lesson_id: string,
        } | null = null;

        if (latestHomework) {
            responseData = {
                ...latestHomework,
                id: uuidStringify(latestHomework.id),
                deadline: latestHomework.deadline.toISOString(),
                lesson_id: uuidStringify(latestHomework.lesson_id)
            }
        }

        return res.status(200).json(createSuccessResponse(responseData, 'Homework retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving homework', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving homework. Please try again later.'));
    }
};

export const updateHomework = async (req: Request, res: Response) => {
    try {
        const homeworkId: string = req.params.homeworkId;
        const description: string | undefined = req.body.description;
        const deadline: string | undefined = req.body.deadline;

        const existingHomework = await prisma.homeworks.findUnique({
            where: {
                id: Buffer.from(uuidParse(homeworkId))
            }
        });

        if (!existingHomework) {
            return res.status(404).json(createErrorResponse('Homework does not exist.'));
        }

        const data: { description?: string, deadline?: Date } = {};

        if (description) {
            data.description = description;
        }

        if (deadline) {
            data.deadline = new Date(deadline);
        }

        const updatedHomework = await prisma.homeworks.update({
            where: {
                id: Buffer.from(uuidParse(homeworkId))
            },
            data: data
        });

        const responseData = {
            ...updatedHomework,
            id: uuidStringify(updatedHomework.id),
            deadline: updatedHomework.deadline.toISOString(),
            lesson_id: uuidStringify(updatedHomework.lesson_id)
        };

        return res.status(200).json(createSuccessResponse(responseData, 'Homework updated successfully.'));
    } catch (err) {
        console.error('Error updating homework', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while updating homework. Please try again later.'));
    }
};

export const deleteHomework = async (req: Request, res: Response) => {
    try {
        const homeworkId: string = req.params.homeworkId;

        const existingHomework = await prisma.homeworks.findUnique({
            where: {
                id: Buffer.from(uuidParse(homeworkId))
            }
        });

        if (!existingHomework) {
            return res.status(404).json(createErrorResponse('Homework does not exist.'));
        }

        const deletedHomework = await prisma.homeworks.delete({
            where: {
                id: Buffer.from(uuidParse(homeworkId))
            }
        });

        const responseData = {
            ...deletedHomework,
            id: uuidStringify(deletedHomework.id),
            deadline: deletedHomework.deadline.toISOString(),
            lesson_id: uuidStringify(deletedHomework.lesson_id)
        };

        return res.status(200).json(createSuccessResponse(responseData, 'Homework deleted successfully.'));
    } catch (err) {
        console.error('Error deleting homework', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while deleting the homework. Please try again later.'));
    }
};