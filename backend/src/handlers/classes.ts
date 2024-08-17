import { Request, Response } from 'express';
import prisma from '../db';
import { classes } from '@prisma/client';

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
            return res.status(409).json({ message: 'Class with the specified name and yearbook already exists.' });
        }

        const createdClass = await prisma.classes.create({
            data: {
                name: name,
                yearbook: yearbook
            }
        });

        return res.status(200).json(createdClass.id);
    } catch (err) {
        console.error('Error signing up', err);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
}