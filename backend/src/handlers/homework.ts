import { Request, Response } from 'express';
import prisma from '../db';
import { homeworks, lessons, teachers } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';
import { Buffer } from 'node:buffer';

export const createHomework = async (req: Request, res: Response) => {
    try {
        const { description, deadline, lessonId, teacherId } = req.body;

        if (!description || !deadline || !lessonId || !teacherId) {
            return res.status(400).json(createErrorResponse('Missing required fields.'));
        }

        const existingLesson = await prisma.lessons.findUnique({
            where: {
                id: Buffer.from(uuidParse(lessonId))
            }
        });

        if (!existingLesson) {
            return res.status(404).json(createErrorResponse('Lesson does not exist.'));
        }


        const existingTeacher = await prisma.teachers.findUnique({
            where: {
                id: Buffer.from(uuidParse(teacherId))
            }
        });

        if (!existingTeacher) {
            return res.status(404).json(createErrorResponse('Teacher does not exist.'));
        }

        const createdHomework = await prisma.homeworks.create({
            data: {
                description,
                deadline: new Date(deadline),
                lesson_id: Buffer.from(uuidParse(lessonId)),
                teacher_id: Buffer.from(uuidParse(teacherId))
            }
        });

        const responseData = {
            ...createdHomework,
            id: uuidStringify(createdHomework.id),
            lesson_id: uuidStringify(createdHomework.lesson_id),
            teacher_id: uuidStringify(createdHomework.teacher_id),
        };

        return res.status(201).json(createSuccessResponse(responseData, 'Homework created successfully.'));
    } catch (err) {
        console.error('Error creating homework', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while creating homework. Please try again later.'));
    }
};

export const getHomeworks = async (req: Request, res: Response) => {
    try {
        const homeworksData: (homeworks & { 
            lessons: lessons; 
            teachers: teachers; 
        })[] = await prisma.homeworks.findMany({
            include: {
                lessons: true,
                teachers: true,
            },
        });

        const responseData = homeworksData.map(hw => ({
            ...hw,
            id: uuidStringify(hw.id),
            lesson_id: uuidStringify(hw.lesson_id),
            teacher_id: uuidStringify(hw.teacher_id),
            lessons: {
                ...hw.lessons,
                id: uuidStringify(hw.lessons.id),
            },
            teachers: {
                ...hw.teachers,
                id: uuidStringify(hw.teachers.id),
            },
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Homeworks retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving homeworks', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving homeworks. Please try again later.'));
    }
};

export const getHomeworkById = async (req: Request, res: Response) => {
    try {
        const homeworkId = req.params.homeworkId;
        let homeworkIdBuffer: Buffer;
        try {
            homeworkIdBuffer = Buffer.from(uuidParse(homeworkId));
        } catch (parseError) {
            return res.status(400).json(createErrorResponse('Invalid UUID format.'));
        }

        const hw = await prisma.homeworks.findUnique({
            where: { id: homeworkIdBuffer },
            include: {
                lessons: true,
                teachers: true,
            },
        });

        if (!hw) {
            return res.status(404).json(createErrorResponse('Homework not found.'));
        }

        const responseData = {
            ...hw,
            id: uuidStringify(hw.id),
            lesson_id: uuidStringify(hw.lesson_id),
            teacher_id: uuidStringify(hw.teacher_id),
            lessons: {
                ...hw.lessons,
                id: uuidStringify(hw.lessons.id),
            },
            teachers: {
                ...hw.teachers,
                id: uuidStringify(hw.teachers.id),
            },
        };

        return res.status(200).json(createSuccessResponse(responseData, 'Homework details retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving homework by ID', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving the homework. Please try again later.'));
    }
};

export const updateHomework = async (req: Request, res: Response) => {
    try {
        const homeworkId: string = req.params.homeworkId;
        const { description, deadline, lessonId, teacherId } = req.body;

        let homeworkIdBuffer: Buffer;
        try {
            homeworkIdBuffer = Buffer.from(uuidParse(homeworkId));
        } catch (parseError) {
            return res.status(400).json(createErrorResponse('Invalid UUID format.'));
        }

        const existingHomework = await prisma.homeworks.findUnique({
            where: { id: homeworkIdBuffer }
        });

        if (!existingHomework) {
            return res.status(404).json(createErrorResponse('Homework does not exist.'));
        }

        const data: { 
            description?: string, 
            deadline?: Date, 
            lesson_id?: Buffer, 
            teacher_id?: Buffer 
        } = {};

        if (description) {
            data.description = description;
        }

        if (deadline) {
            data.deadline = new Date(deadline);
        }

        if (lessonId) {
            const existingLesson = await prisma.lessons.findUnique({
                where: {
                    id: Buffer.from(uuidParse(lessonId))
                }
            });

            if (!existingLesson) {
                return res.status(404).json(createErrorResponse('Lesson does not exist.'));
            }

            data.lesson_id = Buffer.from(uuidParse(lessonId));
        }

        if (teacherId) {
            const existingTeacher = await prisma.teachers.findUnique({
                where: {
                    id: Buffer.from(uuidParse(teacherId))
                }
            });

            if (!existingTeacher) {
                return res.status(404).json(createErrorResponse('Teacher does not exist.'));
            }

            data.teacher_id = Buffer.from(uuidParse(teacherId));
        }

        const updatedHomework = await prisma.homeworks.update({
            where: { id: homeworkIdBuffer },
            data: data
        });

        const responseData = {
            ...updatedHomework,
            id: uuidStringify(updatedHomework.id),
            lesson_id: uuidStringify(updatedHomework.lesson_id),
            teacher_id: uuidStringify(updatedHomework.teacher_id),
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

        let homeworkIdBuffer: Buffer;
        try {
            homeworkIdBuffer = Buffer.from(uuidParse(homeworkId));
        } catch (parseError) {
            return res.status(400).json(createErrorResponse('Invalid UUID format.'));
        }

        const existingHomework = await prisma.homeworks.findUnique({
            where: { id: homeworkIdBuffer }
        });

        if (!existingHomework) {
            return res.status(404).json(createErrorResponse('Homework does not exist.'));
        }

        const deletedHomework = await prisma.homeworks.delete({
            where: { id: homeworkIdBuffer }
        });

        const responseData = {
            ...deletedHomework,
            id: uuidStringify(deletedHomework.id),
            lesson_id: uuidStringify(deletedHomework.lesson_id),
            teacher_id: uuidStringify(deletedHomework.teacher_id),
        };

        return res.status(200).json(createSuccessResponse(responseData, 'Homework deleted successfully.'));
    } catch (err) {
        console.error('Error deleting homework', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while deleting the homework. Please try again later.'));
    }
};