import { Request, Response } from 'express';
import prisma from '../db';
import { problem_types } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';
import { Buffer } from 'node:buffer';

export const createProblemType = async (req: Request, res: Response) => {
    try {
        const name: string = req.body.name;

        const existingProblemType: problem_types | null = await prisma.problem_types.findUnique({
            where: {
                name: name
            }
        });

        if (existingProblemType) {
            return res.status(409).json(createErrorResponse(`Problem type already exists.`));
        }

        const createdProblemType = await prisma.problem_types.create({
            data: {
                name: name
            }
        });

        const responseData = {
            ...createdProblemType,
            id: uuidStringify(createdProblemType.id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Problem type created successfully.`));
    } catch (err) {
        console.error('Error creating problem type', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating problem type. Please try again later.'));
    }
}

export const getProblemTypes = async (req: Request, res: Response) => {
    try {
        const problemTypes = await prisma.problem_types.findMany();

        const responseData = problemTypes.map(problemType => ({
            id: uuidStringify(problemType.id),
            name: problemType.name,
        }));

        return res.status(200).json(createSuccessResponse(responseData, `Problem types retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving problem types', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving problem types. Please try again later.'));
    }
};

export const updateProblemType = async (req: Request, res: Response) => {
    try {
        const problemTypeId: string = req.params.problemTypeId;
        const name: string = req.body.name;

        const existingProblemType: problem_types | null = await prisma.problem_types.findUnique({
            where: {
                id: Buffer.from(uuidParse(problemTypeId))
            }
        });

        if (!existingProblemType) {
            return res.status(404).json(createErrorResponse('Problem type does not exist.'));
        }

        const updatedProblemType = await prisma.problem_types.update({
            where: {
                id: Buffer.from(uuidParse(problemTypeId))
            },
            data: {
                name: name
            }
        });

        const responseData = {
            ...updatedProblemType,
            id: uuidStringify(updatedProblemType.id)
        };

        return res.status(200).json(createSuccessResponse(responseData, 'Problem type updated successfully.'));
    } catch (err) {
        console.error('Error updating problem type', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while updating the problem type. Please try again later.'));
    }
};

export const deleteProblemType = async (req: Request, res: Response) => {
    try {
        const problemTypeId: string = req.params.problemTypeId;

        const existingProblemType: problem_types | null = await prisma.problem_types.findUnique({
            where: {
                id: Buffer.from(uuidParse(problemTypeId))
            }
        });

        if (!existingProblemType) {
            return res.status(404).json(createErrorResponse(`Problem type does not exist.`));
        }

        const deletedProblemType = await prisma.problem_types.delete({
            where: {
                id: Buffer.from(uuidParse(problemTypeId))
            }
        });

        const responseData = {
            ...deletedProblemType,
            id: uuidStringify(deletedProblemType.id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Problem type deleted successfully.`));
    } catch (err) {
        console.error('Error deleting problem type', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while deleting problem type. Please try again later.'));
    }
}