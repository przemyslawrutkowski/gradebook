import { Request, Response } from 'express';
import { signUp } from './users';
import prisma from '../db';
import { students, parents, students_parents } from '@prisma/client';

export const signUpStudent = (req: Request, res: Response) => {
    return signUp(req, res, 'students');
};

export const signUpTeacher = (req: Request, res: Response) => {
    return signUp(req, res, 'teachers');
};

export const signUpParent = (req: Request, res: Response) => {
    return signUp(req, res, 'parents');
};

export const signUpAdministrator = (req: Request, res: Response) => {
    return signUp(req, res, 'administrators');
};

export const assignParentToStudent = async (req: Request, res: Response) => {
    try {
        const studentId = Number(req.body.studentId);
        const parentId = Number(req.body.parentId);

        const student: students | null = await prisma.students.findUnique({
            where: {
                id: studentId
            }
        });

        if (!student) {
            return res.status(404).json({ message: 'A student with the specified id does not exist.' });
        }

        const parent: parents | null = await prisma.parents.findUnique({
            where: {
                id: parentId
            }
        });

        if (!parent) {
            return res.status(404).json({ message: 'A parent with the specified id does not exist.' });
        }

        const entry: students_parents | null = await prisma.students_parents.findUnique({
            where: {
                student_id_parent_id: {
                    student_id: studentId,
                    parent_id: parentId
                }
            }
        });

        if (entry) {
            return res.status(409).json({ message: 'A parent with the specified id is already assigned to a student with the specified id.' })
        }

        const createdBond = await prisma.students_parents.create({
            data: {
                student_id: studentId,
                parent_id: parentId
            }
        });

        return res.status(200).json(createdBond);
    } catch (err) {
        console.error('Error assigning parent to student', err);
        return res.status(500).json({ message: 'Internal Server Error.' });
    }
};

export const unassignParentFromStudent = async (req: Request, res: Response) => {
    try {
        const studentId = Number(req.body.studentId);
        const parentId = Number(req.body.parentId);

        const studentAndParentIds: students_parents | null = await prisma.students_parents.findUnique({
            where: {
                student_id_parent_id: {
                    student_id: studentId,
                    parent_id: parentId
                }
            }
        });

        if (!studentAndParentIds) {
            return res.status(404).json({ message: 'No relationship was found between specific student and parent identifiers.' });
        }

        const removedBond = await prisma.students_parents.delete({
            where: {
                student_id_parent_id: {
                    student_id: studentId,
                    parent_id: parentId
                }
            }
        });

        return res.status(200).json(removedBond);
    } catch (err) {
        console.error('Error unassigning parent from student', err);
        return res.status(500).json({ message: 'Internal Server Error.' });
    }
};