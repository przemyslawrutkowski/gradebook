import { Request, Response } from 'express';
import prisma from '../db';
import { students, parents, students_parents } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';

export const assignParentToStudent = async (req: Request, res: Response) => {
    try {
        const studentId = Number(req.body.studentId);
        const parentId = Number(req.body.parentId);

        const existingStudent: students | null = await prisma.students.findUnique({
            where: {
                id: studentId
            }
        });

        if (!existingStudent) {
            return res.status(404).json(createErrorResponse(`Student with ID '${studentId}' does not exist.`));
        }

        const existingParent: parents | null = await prisma.parents.findUnique({
            where: {
                id: parentId
            }
        });

        if (!existingParent) {
            return res.status(404).json(createErrorResponse(`Parent with ID '${parentId}' does not exist.`));
        }

        const existingEntry: students_parents | null = await prisma.students_parents.findUnique({
            where: {
                student_id_parent_id: {
                    student_id: studentId,
                    parent_id: parentId
                }
            }
        });

        if (existingEntry) {
            return res.status(409).json(createErrorResponse(`Parent with ID '${parentId}' is already assigned to student with ID '${studentId}'.`));
        }

        const createdBond = await prisma.students_parents.create({
            data: {
                student_id: studentId,
                parent_id: parentId
            }
        });

        return res.status(200).json(createSuccessResponse(createdBond, `Parent with ID '${parentId}' successfully assigned to student with ID '${studentId}'.`));
    } catch (err) {
        console.error('Error assigning parent to student', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while assigning the parent to the student. Please try again later.'));
    }
};

export const unassignParentFromStudent = async (req: Request, res: Response) => {
    try {
        const studentId = Number(req.body.studentId);
        const parentId = Number(req.body.parentId);

        const criteria = {
            where: {
                student_id_parent_id: {
                    student_id: studentId,
                    parent_id: parentId
                }
            }
        };

        const existingEntry: students_parents | null = await prisma.students_parents.findUnique(criteria);

        if (!existingEntry) {
            return res.status(404).json(createErrorResponse(`No relationship found between student with ID '${studentId}' and parent with ID '${parentId}'.`));
        }

        const removedBond = await prisma.students_parents.delete(criteria);

        return res.status(200).json(createSuccessResponse(removedBond, `Parent with ID '${parentId}' successfully unassigned from student with ID '${studentId}'.`));
    } catch (err) {
        console.error('Error unassigning parent from student', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while unassigning the parent from the student. Please try again later.'));
    }
};