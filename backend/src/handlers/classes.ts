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
            return res.status(409).json(createErrorResponse(`Class with the name '${name}' and yearbook '${yearbook}' already exists.`));
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
            return res.status(404).json(createErrorResponse(`Class with ID '${id}' does not exist.`));
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
            return res.status(404).json(createErrorResponse(`Class with ID '${id}' does not exist.`));
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

export const assignStudent = async (req: Request, res: Response) => {
    try {
        const classId = Number(req.params.classId);
        const studentId = Number(req.body.studentId);

        const existingClass: classes | null = await prisma.classes.findUnique({
            where: {
                id: classId
            }
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse(`Class with ID '${classId}' does not exist.`));
        }

        const existingStudent: students | null = await prisma.students.findUnique({
            where: {
                id: studentId
            }
        });

        if (!existingStudent) {
            return res.status(404).json(createErrorResponse(`Student with ID '${studentId}' does not exist.`));
        }

        const patchedStudent = await prisma.students.update({
            where: {
                id: studentId
            },
            data: {
                class_id: classId
            },
        });

        return res.status(200).json(createSuccessResponse(patchedStudent.id, `Student with ID '${studentId}' successfully assigned to class with ID '${classId}'.`));
    } catch (err) {
        console.error('Error assigning student to class', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while assigning the student to the class. Please try again later.'));
    }
}

export const getStudents = async (req: Request, res: Response) => {
    try {
        const classId = Number(req.params.id);

        const existingClass: classes | null = await prisma.classes.findUnique({
            where: {
                id: classId,
            }
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse(`Class with ID '${classId}' does not exist.`));
        }

        const students = await prisma.students.findMany({
            where: {
                class_id: classId
            }
        });

        return res.status(200).json(createSuccessResponse(students, `Successfully fetched students from class with ID '${classId}'.`));
    } catch (err) {
        console.error('Error getting students', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while getting the students. Please try again later.'));
    }
}