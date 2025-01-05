import { Request, Response } from 'express';
import prisma from '../db';
import { students, parents, students_parents } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';
import { Buffer } from 'node:buffer';

export const createStudentParentRelationship = async (req: Request, res: Response) => {
    try {
        const studentId: string = req.body.studentId;
        const parentId: string = req.body.parentId;

        const existingStudent: students | null = await prisma.students.findUnique({
            where: {
                id: Buffer.from(uuidParse(studentId))
            }
        });

        if (!existingStudent) {
            return res.status(404).json(createErrorResponse(`Student does not exist.`));
        }

        const existingParent: parents | null = await prisma.parents.findUnique({
            where: {
                id: Buffer.from(uuidParse(parentId))
            }
        });

        if (!existingParent) {
            return res.status(404).json(createErrorResponse(`Parent does not exist.`));
        }

        const existingEntry: students_parents | null = await prisma.students_parents.findUnique({
            where: {
                student_id_parent_id: {
                    student_id: Buffer.from(uuidParse(studentId)),
                    parent_id: Buffer.from(uuidParse(parentId))
                }
            }
        });

        if (existingEntry) {
            return res.status(409).json(createErrorResponse(`Parent already assigned to student.`));
        }

        const createdBond = await prisma.students_parents.create({
            data: {
                student_id: Buffer.from(uuidParse(studentId)),
                parent_id: Buffer.from(uuidParse(parentId))
            }
        });

        const responseData = {
            student_id: uuidStringify(createdBond.student_id),
            parent_id: uuidStringify(createdBond.parent_id),
        };

        return res.status(200).json(createSuccessResponse(responseData, `Parent assigned to student successfully.`));
    } catch (err) {
        console.error('Error assigning parent to student', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while assigning parent to student. Please try again later.'));
    }
};

export const deleteStudentParentRelationship = async (req: Request, res: Response) => {
    try {
        const studentId: string = req.params.studentId;
        const parentId: string = req.params.parentId;

        const criteria = {
            where: {
                student_id_parent_id: {
                    student_id: Buffer.from(uuidParse(studentId)),
                    parent_id: Buffer.from(uuidParse(parentId))
                }
            }
        };

        const existingStudent: students | null = await prisma.students.findUnique({
            where: {
                id: Buffer.from(uuidParse(studentId))
            }
        });

        if (!existingStudent) {
            return res.status(404).json(createErrorResponse(`Student does not exist.`));
        }

        const existingParent: parents | null = await prisma.parents.findUnique({
            where: {
                id: Buffer.from(uuidParse(parentId))
            }
        });

        if (!existingParent) {
            return res.status(404).json(createErrorResponse(`Parent does not exist.`));
        }

        const existingEntry: students_parents | null = await prisma.students_parents.findUnique(criteria);

        if (!existingEntry) {
            return res.status(404).json(createErrorResponse(`Relationship does not exist.`));
        }

        const removedBond = await prisma.students_parents.delete(criteria);

        const responseData = {
            student_id: uuidStringify(removedBond.student_id),
            parent_id: uuidStringify(removedBond.parent_id),
        };

        return res.status(200).json(createSuccessResponse(responseData, `Parent unassigned from student successfully.`));
    } catch (err) {
        console.error('Error unassigning parent from student', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while unassigning parent from student. Please try again later.'));
    }
};

export const getStudentsForParent = async (req: Request, res: Response) => {
    try {
        const parentId: string = req.params.parentId;

        if (!parentId) {
            return res.status(401).json(createErrorResponse('Parent ID not found.'));
        }

        const existingParent = await prisma.parents.findUnique({
            where: { id: Buffer.from(uuidParse(parentId)) },
        });

        if (!existingParent) {
            return res.status(404).json(createErrorResponse('Parent does not exist.'));
        }

        const studentRelations: students_parents[] = await prisma.students_parents.findMany({
            where: { parent_id: Buffer.from(uuidParse(parentId)) },
            include: { students: true },
        });

        if (studentRelations.length === 0) {
            return res.status(200).json(createSuccessResponse([], 'No students associated with this parent.'));
        }

        const studentIds = studentRelations.map((relation) => uuidStringify(relation.student_id));

        return res.status(200).json(
            createSuccessResponse(studentIds, 'Students retrieved successfully.')
        );
    } catch (err) {
        console.error('Error retrieving students for parent:', err);
        return res.status(500).json(
            createErrorResponse('An unexpected error occurred while retrieving students. Please try again later.')
        );
    }
};