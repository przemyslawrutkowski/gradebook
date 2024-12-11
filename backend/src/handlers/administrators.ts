import { Request, Response } from 'express';
import { signUp } from './users';
import { UserType } from '../enums/userTypes';
import prisma from '../db';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { stringify as uuidStringify, parse as uuidParse, } from 'uuid';

export const signUpAdministrator = (req: Request, res: Response) => {
    return signUp(req, res, UserType.Administrator);
};

export const getAdministrators = async (req: Request, res: Response) => {
    try {
        const administrators = await prisma.administrators.findMany();

        const responseData = administrators.map(administrator => ({
            id: uuidStringify(administrator.id),
            email: administrator.email,
            first_name: administrator.first_name,
            last_name: administrator.last_name,
            role: UserType.Administrator
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Administrators retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving administrators', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving administrators. Please try again later.'));
    }
};