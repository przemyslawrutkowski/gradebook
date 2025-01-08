import { Request, Response } from 'express';
import prisma from '../db';
import { user_types } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';
import { Buffer } from 'node:buffer';

export const createUserType = async (req: Request, res: Response) => {
    try {
        const name: string = req.body.name;

        const existingUserType: user_types | null = await prisma.user_types.findUnique({
            where: {
                name: name
            }
        });

        if (existingUserType) {
            return res.status(409).json(createErrorResponse(`User type already exists.`));
        }

        const createdUserType = await prisma.user_types.create({
            data: {
                name: name
            }
        });

        const responseData = {
            ...createdUserType,
            id: uuidStringify(createdUserType.id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `User type created successfully.`));
    } catch (err) {
        console.error('Error creating user type', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating user type. Please try again later.'));
    }
}

export const getUserTypes = async (req: Request, res: Response) => {
    try {
        const userTypes = await prisma.user_types.findMany();

        const responseData = userTypes.map(userType => ({
            id: uuidStringify(userType.id),
            name: userType.name,
        }));

        return res.status(200).json(createSuccessResponse(responseData, `User types retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving user types', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving user types. Please try again later.'));
    }
};

export const deleteUserType = async (req: Request, res: Response) => {
    try {
        const userTypeId: string = req.params.userTypeId;

        const existingUserType: user_types | null = await prisma.user_types.findUnique({
            where: {
                id: Buffer.from(uuidParse(userTypeId))
            }
        });

        if (!existingUserType) {
            return res.status(404).json(createErrorResponse(`User type does not exist.`));
        }

        const deletedUserType = await prisma.user_types.delete({
            where: {
                id: Buffer.from(uuidParse(userTypeId))
            }
        });

        const responseData = {
            ...deletedUserType,
            id: uuidStringify(deletedUserType.id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `User type deleted successfully.`));
    } catch (err) {
        console.error('Error deleting user type', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while deleting user type. Please try again later.'));
    }
}