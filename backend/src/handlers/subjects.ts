import { Request, Response } from 'express';
import prisma from '../db';
import { subjects } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';

export const createSubject = async (req: Request, res: Response) => {
    try {
        const name = req.body.name;

        const existingSubject: subjects | null = await prisma.subjects.findUnique({
            where: {
                name: name
            }
        });

        if (existingSubject) {
            return res.status(409).json(createErrorResponse(`Subject with the name '${name}' already exists.`));
        }

        const createdSubject = await prisma.subjects.create({
            data: {
                name: name
            }
        });

        return res.status(200).json(createSuccessResponse(createdSubject.id, `Subject '${name}' created successfully with ID ${createdSubject.id}.`));
    } catch (err) {
        console.error('Error creating subject', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating the subject. Please try again later.'));
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

export const deleteSubject = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        const existingSubject: subjects | null = await prisma.subjects.findUnique({
            where: {
                id: id
            }
        });

        if (!existingSubject) {
            return res.status(404).json(createErrorResponse(`Subject with ID '${id}' does not exist.`));
        }

        const deletedSubject = await prisma.subjects.delete({
            where: {
                id: id
            }
        });

        return res.status(200).json(createSuccessResponse(deletedSubject.id, `Subject with ID '${deletedSubject.id}' successfully deleted.`));
    } catch (err) {
        console.error('Error deleting subject', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while deleting the subject. Please try again later.'));
    }
}

export const patchSubject = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const name = req.body.name;

        const existingSubject: subjects | null = await prisma.subjects.findUnique({
            where: {
                id: id
            }
        });

        if (!existingSubject) {
            return res.status(404).json(createErrorResponse(`Subject with ID '${id}' does not exist.`));
        }

        const patchedSubject = await prisma.subjects.update({
            where: {
                id: id
            },
            data: {
                name: name
            }
        });

        return res.status(200).json(createSuccessResponse(patchedSubject.id, `Subject with ID '${patchedSubject.id}' successfully patched.`));
    } catch (err) {
        console.error('Error patching subject', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while patching the subject. Please try again later.'));
    }
}