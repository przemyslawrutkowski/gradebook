import { Request, Response } from 'express';
import prisma from '../db';
import { students, classes } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';

export const createClass = async (req: Request, res: Response) => {
    try {
        const name: string = req.body.name;
        const yearbook: string = req.body.yearbook;

        const existingClass: classes | null = await prisma.classes.findFirst({
            where: {
                name: name,
                yearbook: yearbook
            }
        });

        if (existingClass) {
            return res.status(409).json(createErrorResponse(`Class already exists.`));
        }

        const createdClass = await prisma.classes.create({
            data: {
                name: name,
                yearbook: yearbook
            }
        });

        return res.status(200).json(createSuccessResponse(createdClass.id, `Class created successfully.`));
    } catch (err) {
        console.error('Error creating class', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating class. Please try again later.'));
    }
};

export const getClasses = async (req: Request, res: Response) => {
    try {
        const classes = await prisma.classes.findMany();
        return res.status(200).json(createSuccessResponse(classes, 'Classes retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving classes', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving classes. Please try again later.'));
    }
};

export const getStudents = async (req: Request, res: Response) => {
    try {
        const classId = Number(req.params.classId);

        const existingClass: classes | null = await prisma.classes.findUnique({
            where: {
                id: classId,
            }
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse(`Class does not exist.`));
        }

        const students = await prisma.students.findMany({
            where: {
                class_id: classId
            }
        });

        return res.status(200).json(createSuccessResponse(students, `Students retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving students', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving students. Please try again later.'));
    }
};

export const updateClass = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.classId);
        const name: string = req.body.name;
        const yearbook: string = req.body.yearbook;

        const existingClass: classes | null = await prisma.classes.findUnique({
            where: {
                id: id
            }
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse(`Class does not exist.`));
        }

        const data: { name?: string, yearbook?: string } = {};

        if (name) data.name = name;
        if (yearbook) data.yearbook = yearbook;

        const updatedClass = await prisma.classes.update({
            where: {
                id: id
            },
            data: data
        });

        return res.status(200).json(createSuccessResponse(updatedClass.id, `Class updated successfully.`));
    } catch (err) {
        console.error('Error updating class', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while updating class. Please try again later.'));
    }
};

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
            return res.status(404).json(createErrorResponse(`Class does not exist.`));
        }

        const existingStudent: students | null = await prisma.students.findUnique({
            where: {
                id: studentId
            }
        });

        if (!existingStudent) {
            return res.status(404).json(createErrorResponse(`Student does not exist.`));
        }

        const updatedStudent = await prisma.students.update({
            where: {
                id: studentId
            },
            data: {
                class_id: classId
            }
        });

        return res.status(200).json(createSuccessResponse(updatedStudent.id, `Student assigned to class successfully.`));
    } catch (err) {
        console.error('Error assigning student to class', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while assigning student to class. Please try again later.'));
    }
};

export const deleteClass = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.classId);

        const existingClass: classes | null = await prisma.classes.findUnique({
            where: {
                id: id
            }
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse(`Class does not exist.`));
        }

        const deletedClass = await prisma.classes.delete({
            where: {
                id: id
            }
        });

        return res.status(200).json(createSuccessResponse(deletedClass.id, `Class deleted successfully.`));
    } catch (err) {
        console.error('Error deleting class', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while deleting class. Please try again later.'));
    }
};