import { Request, Response } from 'express';
import { signUp } from './users';
import { UserType } from '../enums/userTypes';
import prisma from '../db';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { stringify as uuidStringify, parse as uuidParse, } from 'uuid';

export const signUpStudent = (req: Request, res: Response) => {
    return signUp(req, res, UserType.Student);
};

export const getStudents = async (req: Request, res: Response) => {
    try {
        const students = await prisma.students.findMany({
            include: {
                classes: {
                    include: {
                        class_names: true,
                    }
                }
            }
        });

        const responseData = students.map(student => ({
            id: uuidStringify(student.id),
            email: student.email,
            first_name: student.first_name,
            last_name: student.last_name,
            pesel: student.pesel,
            phone_number: student.phone_number,
            class_name: student.classes?.class_names.name || 'N/A',
            role: UserType.Student
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Students retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving students', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving students. Please try again later.'));
    }
};

export const getStudentById = async (req: Request, res: Response) => {
    const studentId: string = req.params.studentId;

    try {
        const studentData = await prisma.students.findUnique({
            where: {
                id: Buffer.from(uuidParse(studentId)),
            },
            include: {
                classes: {
                    include: {
                        class_names: true,
                    },
                },
                students_parents: {
                    include: {
                        parents: true,
                    },
                },
            },
        });

        if (!studentData) {
            return res.status(404).json(createErrorResponse('Student not found.'));
        }

        const parents = studentData.students_parents.map((sp) => ({
            id: uuidStringify(sp.parents.id),
            first_name: sp.parents.first_name,
            last_name: sp.parents.last_name,
            email: sp.parents.email,
            phone_number: sp.parents.phone_number,
            pesel: sp.parents.pesel,
        }));

        const responseData = {
            id: uuidStringify(studentData.id),
            first_name: studentData.first_name,
            last_name: studentData.last_name,
            phone_number: studentData.phone_number,
            email: studentData.email,
            pesel: studentData.pesel,
            class_name: studentData.classes?.class_names?.name || 'N/A',
            parents: parents,
        };

        return res.status(200).json(createSuccessResponse(responseData, 'Student retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving student', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving the student. Please try again later.'));
    }
};