import { Request, Response } from 'express';
import prisma from '../db';
import { students, classes } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';

export const createClass = async (req: Request, res: Response) => {
    try {
        const name = req.body.name;
        const yearbook = req.body.yearbook;

        const existingClass: classes | null = await prisma.classes.findFirst({
            where: {
                name: name,
                yearbook: yearbook
            }
        });

        if (existingClass) {
            return res.status(409).json(createErrorResponse(`A class with the name '${name}' and yearbook '${yearbook}' already exists.`));
        }

        const createdClass = await prisma.classes.create({
            data: {
                name: name,
                yearbook: yearbook
            }
        });

        return res.status(200).json(createSuccessResponse(createdClass.id, `Class '${name}' for yearbook '${yearbook}' created successfully with ID ${createdClass.id}.`));
    } catch (err) {
        console.error('Error creating class', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating the class. Please try again later.'));
    }
}

export const deleteClass = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        const existingClass: classes | null = await prisma.classes.findUnique({
            where: {
                id: id
            }
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse(`A class with ID '${id}' does not exist.`));
        }

        const deletedClass = await prisma.classes.delete({
            where: {
                id: id
            }
        });

        return res.status(200).json(createSuccessResponse(deletedClass.id, `Class with ID '${deletedClass.id}' successfully deleted.`));
    } catch (err) {
        console.error('Error deleting class', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while deleting the class. Please try again later.'));
    }
}

export const patchClass = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const name = req.body.name;
        const yearbook = req.body.yearbook;

        const existingClass: classes | null = await prisma.classes.findUnique({
            where: {
                id: id
            }
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse(`A class with ID '${id}' does not exist.`));
        }

        const data: { name?: string, yearbook?: string } = {};
        const updatedFields: string[] = [];

        if (name) {
            data.name = name;
            updatedFields.push(`name: '${name}'`);
        }
        if (yearbook) {
            data.yearbook = yearbook;
            updatedFields.push(`yearbook: '${yearbook}'`);
        }

        const patchedClass = await prisma.classes.update({
            where: {
                id: id
            },
            data: data
        });

        return res.status(200).json(createSuccessResponse(patchedClass.id, `Class with ID '${patchedClass.id}' successfully patched.Patched fields: ${updatedFields.join(', ')}.`));
    } catch (err) {
        console.error('Error patching class', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while patching the class. Please try again later.'));
    }
}

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