import { Request, Response } from 'express';
import prisma from '../db';
import { students, classes, teachers } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';
import { Buffer } from 'node:buffer';

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

        const responseData = {
            ...createdClass,
            id: uuidStringify(createdClass.id),
            teacher_id: createdClass.teacher_id ? uuidStringify(createdClass.teacher_id) : null
        };

        return res.status(200).json(createSuccessResponse(responseData, `Class created successfully.`));
    } catch (err) {
        console.error('Error creating class', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating class. Please try again later.'));
    }
};

export const getClasses = async (req: Request, res: Response) => {
    try {
        const classes = await prisma.classes.findMany();

        const responseData = classes.map(cls => ({
            ...cls,
            id: uuidStringify(cls.id),
            teacher_id: cls.teacher_id ? uuidStringify(cls.teacher_id) : null
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Classes retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving classes', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving classes. Please try again later.'));
    }
};

export const getStudents = async (req: Request, res: Response) => {
    try {
        const classId: string = req.params.classId;

        const existingClass: classes | null = await prisma.classes.findUnique({
            where: {
                id: Buffer.from(uuidParse(classId))
            }
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse(`Class does not exist.`));
        }

        const students = await prisma.students.findMany({
            where: {
                class_id: Buffer.from(uuidParse(classId))
            }
        });

        const responseData = students.map(student => ({
            ...student,
            id: uuidStringify(student.id),
            class_id: student.class_id ? uuidStringify(student.class_id) : null
        }));

        return res.status(200).json(createSuccessResponse(responseData, `Students retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving students', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving students. Please try again later.'));
    }
};

export const updateClass = async (req: Request, res: Response) => {
    try {
        const classId: string = req.params.classId;
        const name: string = req.body.name;
        const yearbook: string = req.body.yearbook;
        const teacherId: string = req.body.teacherId;

        const existingClass: classes | null = await prisma.classes.findUnique({
            where: {
                id: Buffer.from(uuidParse(classId))
            }
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse(`Class does not exist.`));
        }

        const existingTeacher: teachers | null = await prisma.teachers.findUnique({
            where: {
                id: Buffer.from(uuidParse(teacherId))
            }
        });

        if (!existingTeacher) {
            return res.status(404).json(createErrorResponse(`Teacher does not exist.`));
        }

        const data: { name?: string, yearbook?: string, teacher_id?: Buffer } = {};

        if (name) data.name = name;
        if (yearbook) data.yearbook = yearbook;
        if (teacherId) data.teacher_id = Buffer.from(uuidParse(teacherId));

        const updatedClass = await prisma.classes.update({
            where: {
                id: Buffer.from(uuidParse(classId))
            },
            data: data
        });

        const responseData = {
            ...updatedClass,
            id: uuidStringify(updatedClass.id),
            teacher_id: updatedClass.teacher_id ? uuidStringify(updatedClass.teacher_id) : null
        };

        return res.status(200).json(createSuccessResponse(responseData, `Class updated successfully.`));
    } catch (err) {
        console.error('Error updating class', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while updating class. Please try again later.'));
    }
};

export const assignStudent = async (req: Request, res: Response) => {
    try {
        const classId: string = req.params.classId;
        const studentId: string = req.body.studentId;

        const existingClass: classes | null = await prisma.classes.findUnique({
            where: {
                id: Buffer.from(uuidParse(classId))
            }
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse(`Class does not exist.`));
        }

        const existingStudent: students | null = await prisma.students.findUnique({
            where: {
                id: Buffer.from(uuidParse(studentId))
            }
        });

        if (!existingStudent) {
            return res.status(404).json(createErrorResponse(`Student does not exist.`));
        }

        const updatedStudent = await prisma.students.update({
            where: {
                id: Buffer.from(uuidParse(studentId))
            },
            data: {
                class_id: Buffer.from(uuidParse(classId))
            }
        });

        const responseData = {
            ...updatedStudent,
            id: uuidStringify(updatedStudent.id),
            class_id: updatedStudent.class_id ? uuidStringify(updatedStudent.class_id) : null
        };

        return res.status(200).json(createSuccessResponse(responseData, `Student assigned to class successfully.`));
    } catch (err) {
        console.error('Error assigning student to class', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while assigning student to class. Please try again later.'));
    }
};

export const deleteClass = async (req: Request, res: Response) => {
    try {
        const id: string = req.params.classId;

        const existingClass: classes | null = await prisma.classes.findUnique({
            where: {
                id: Buffer.from(uuidParse(id))
            }
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse(`Class does not exist.`));
        }

        const deletedClass = await prisma.classes.delete({
            where: {
                id: Buffer.from(uuidParse(id))
            }
        });

        const responseData = {
            ...deletedClass,
            id: uuidStringify(deletedClass.id),
            teacher_id: deletedClass.teacher_id ? uuidStringify(deletedClass.teacher_id) : null
        };

        return res.status(200).json(createSuccessResponse(responseData, `Class deleted successfully.`));
    } catch (err) {
        console.error('Error deleting class', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while deleting class. Please try again later.'));
    }
};