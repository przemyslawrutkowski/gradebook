import { Request, Response } from 'express';
import prisma from '../db';
import { questions_types } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';
import { Buffer } from 'node:buffer';

export const createQuestionType = async (req: Request, res: Response) => {
    try {
        const name: string = req.body.name;

        const existingType: questions_types | null = await prisma.questions_types.findUnique({
            where: {
                name: name
            }
        });

        if (existingType) {
            return res.status(409).json(createErrorResponse(`Question type already exists.`));
        }

        const createdType = await prisma.questions_types.create({
            data: {
                name: name
            }
        });

        const responseData = {
            ...createdType,
            id: uuidStringify(createdType.id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Question type created successfully.`));
    } catch (err) {
        console.error('Error creating question type', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating question type. Please try again later.'));
    }
}

export const getQuestionTypes = async (req: Request, res: Response) => {
    try {
        const questionTypes = await prisma.questions_types.findMany();

        const responseData = questionTypes.map(type => ({
            id: uuidStringify(type.id),
            name: type.name
        }));

        return res.status(200).json(createSuccessResponse(responseData, `Question types retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving question types', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving question types. Please try again later.'));
    }
};

export const deleteQuestionType = async (req: Request, res: Response) => {
    try {
        const questionTypeId: string = req.params.questionTypeId;

        const existingType: questions_types | null = await prisma.questions_types.findUnique({
            where: {
                id: Buffer.from(uuidParse(questionTypeId))
            }
        });

        if (!existingType) {
            return res.status(404).json(createErrorResponse(`Question type does not exist.`));
        }

        const deletedQuestionType = await prisma.questions_types.delete({
            where: {
                id: Buffer.from(uuidParse(questionTypeId))
            }
        });

        const responseData = {
            ...deletedQuestionType,
            id: uuidStringify(deletedQuestionType.id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Question type deleted successfully.`));
    } catch (err) {
        console.error('Error deleting question type', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while deleting question type. Please try again later.'));
    }
}
