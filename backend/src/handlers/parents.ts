import { Request, Response } from 'express';
import { signUp } from './users';
import { UserType } from '../enums/userTypes';
import prisma from '../db';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';

export const signUpParent = (req: Request, res: Response) => {
    return signUp(req, res, UserType.Parent);
};

export const getParents = async (req: Request, res: Response) => {
    try {
        const parents = await prisma.parents.findMany();

        const responseData = parents.map(parent => ({
            id: uuidStringify(parent.id),
            email: parent.email,
            first_name: parent.first_name,
            last_name: parent.last_name,
            role: UserType.Parent
        }));

        return res.status(200).json(createSuccessResponse(responseData, `Parents retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving parents', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving parents. Please try again later.'));
    }
};