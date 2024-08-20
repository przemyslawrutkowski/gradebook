import { Request, Response } from 'express';
import prisma from '../db';
import { classes } from '@prisma/client';
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