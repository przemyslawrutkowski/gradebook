import { Request, Response } from 'express';
import { signUp } from './users';
import { UserType } from '../enums/userTypes';
import prisma from '../db';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { stringify as uuidStringify, parse as uuidParse, } from 'uuid';

export const signUpTeacher = (req: Request, res: Response) => {
    return signUp(req, res, UserType.Teacher);
};

export const getTeachers = async (req: Request, res: Response) => {
    try {
        const teachers = await prisma.teachers.findMany();

        const responseData = teachers.map(teacher => ({
            id: uuidStringify(teacher.id),
            email: teacher.email,
            first_name: teacher.first_name,
            last_name: teacher.last_name,
            role: UserType.Teacher
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Teachers retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving teachers', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving teachers. Please try again later.'));
    }
};