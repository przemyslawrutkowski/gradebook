import { Request, Response } from 'express';
import { signUp } from './users';
import prisma from '../db';
import { students, classes } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';

export const signUpStudent = (req: Request, res: Response) => {
    return signUp(req, res, 'students');
};

export const assignClassToStudent = async (req: Request, res: Response) => {
    try {
        const studentId = Number(req.body.studentId);
        const classId = Number(req.body.classId);

        const existingStudent: students | null = await prisma.students.findUnique({
            where: {
                id: studentId
            }
        });

        if (!existingStudent) {
            return res.status(404).json(createErrorResponse(`Student with ID '${studentId}' does not exist.`));
        }

        const existingClass: classes | null = await prisma.classes.findUnique({
            where: {
                id: classId
            }
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse(`Class with ID '${classId}' does not exist.`));
        }

        const updatedStudent = await prisma.students.update({
            where: {
                id: studentId
            },
            data: {
                class_id: classId
            },
        });

        return res.status(200).json(createSuccessResponse(updatedStudent.id, `Class with ID '${classId}' successfully assigned to student with ID '${studentId}'.`));
    } catch (err) {
        console.error('Error assigning class to student', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while assigning the class to the student. Please try again later.'));
    }
}