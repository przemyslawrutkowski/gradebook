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
            return res.status(404).json(createErrorResponse(`Student does not exist.`));
        }

        const existingParent: parents | null = await prisma.parents.findUnique({
            where: {
                id: parentId
            }
        });

        if (!existingParent) {
            return res.status(404).json(createErrorResponse(`Parent does not exist.`));
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
            return res.status(409).json(createErrorResponse(`Parent already assigned to student.`));
        }

        const createdBond = await prisma.students_parents.create({
            data: {
                student_id: studentId,
                parent_id: parentId
            }
        });

        return res.status(200).json(createSuccessResponse(createdBond, `Parent assigned to student successfully.`));
    } catch (err) {
        console.error('Error assigning parent to student', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while assigning parent to student. Please try again later.'));
    }
};

export const unassignParentFromStudent = async (req: Request, res: Response) => {
    try {
        const studentId = Number(req.params.studentId);
        const parentId = Number(req.params.parentId);

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
            return res.status(404).json(createErrorResponse(`Relationship not found.`));
        }

        const removedBond = await prisma.students_parents.delete(criteria);

        return res.status(200).json(createSuccessResponse(removedBond, `Parent unassigned from student successfully.`));
    } catch (err) {
        console.error('Error unassigning parent from student', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while unassigning parent from student. Please try again later.'));
    }
};