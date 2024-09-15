import { Request, Response } from 'express';
import prisma from '../db';
import { subjects } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';

export const createSubject = async (req: Request, res: Response) => {
    try {
        const name: string = req.body.name;

        const existingSubject: subjects | null = await prisma.subjects.findUnique({
            where: {
                name: name
            }
        });

        if (existingSubject) {
            return res.status(409).json(createErrorResponse(`Subject already exists.`));
        }

        const createdSubject = await prisma.subjects.create({
            data: {
                name: name
            }
        });

        return res.status(200).json(createSuccessResponse(createdSubject.id, `Subject created successfully.`));
    } catch (err) {
        console.error('Error creating subject', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating subject. Please try again later.'));
    }
}

export const getSubjects = async (req: Request, res: Response) => {
    try {
        const subjects = await prisma.subjects.findMany();
        return res.status(200).json(createSuccessResponse(subjects, 'Subjects retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving subjects', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving subjects. Please try again later.'));
    }
}

export const updateSubject = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.subjectId);
        const name: string = req.body.name;

        const existingSubject: subjects | null = await prisma.subjects.findUnique({
            where: {
                id: id
            }
        });

        if (!existingSubject) {
            return res.status(404).json(createErrorResponse(`Subject does not exist.`));
        }

        const updatedSubject = await prisma.subjects.update({
            where: {
                id: id
            },
            data: {
                name: name
            }
        });

        return res.status(200).json(createSuccessResponse(updatedSubject.id, `Subject successfully updated.`));
    } catch (err) {
        console.error('Error updating subject', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while updating subject. Please try again later.'));
    }
}

export const deleteSubject = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.subjectId);

        const existingSubject: subjects | null = await prisma.subjects.findUnique({
            where: {
                id: id
            }
        });

        if (!existingSubject) {
            return res.status(404).json(createErrorResponse(`Subject does not exist.`));
        }

        const deletedSubject = await prisma.subjects.delete({
            where: {
                id: id
            }
        });

        return res.status(200).json(createSuccessResponse(deletedSubject.id, `Subject deleted successfully.`));
    } catch (err) {
        console.error('Error deleting subject', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while deleting subject. Please try again later.'));
    }
}