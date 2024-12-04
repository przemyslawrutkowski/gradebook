import { Request, Response } from 'express';
import { signUp } from './users';
import { UserType } from '../enums/userTypes';
import prisma from '../db';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { stringify as uuidStringify, parse as uuidParse, } from 'uuid';

export const signUpTeacher = (req: Request, res: Response) => {
    return signUp(req, res, UserType.Teacher);
};

export const getAllTeachers = async (req: Request, res: Response) => {
    try {
        const teachersData = await prisma.teachers.findMany({
            include: {
                teachers_subjects: {
                    include: {
                        subjects: true,
                    },
                },
                classes: {
                    include: {
                        class_names: true,
                    },
                },
            },
        });

        const responseData = teachersData.map(teacher => ({
            id: uuidStringify(teacher.id),
            first_name: teacher.first_name,
            last_name: teacher.last_name,
            phone_number: teacher.phone_number,
            email: teacher.email,
            pesel: teacher.pesel,
            subjects: teacher.teachers_subjects.map(ts => ts.subjects.name),
        }));
        return res.status(200).json(createSuccessResponse(responseData, 'Teachers retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving teachers', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving students. Please try again later.'));
    }
};