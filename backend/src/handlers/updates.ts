import { Request, Response } from 'express';
import prisma from '../db';
import { statuses, updates } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';
import { Buffer } from 'node:buffer';

export const createUpdate = async (req: Request, res: Response) => {
    try {
        const description: string = req.body.description;
        const version: string = req.body.version;

        const existingUpdate: updates | null = await prisma.updates.findUnique({
            where: {
                version: version
            }
        });

        if (existingUpdate) {
            return res.status(409).json(createErrorResponse(`Update already exists.`));
        }

        const createdUpdate = await prisma.updates.create({
            data: {
                description: description,
                version: version,
                release_time: new Date()
            }
        });

        const responseData = {
            ...createdUpdate,
            id: uuidStringify(createdUpdate.id),
            release_time: createdUpdate.release_time.toISOString()
        };

        return res.status(200).json(createSuccessResponse(responseData, `Update created successfully.`));
    } catch (err) {
        console.error('Error creating update', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating update. Please try again later.'));
    }
}

export const getUpdates = async (req: Request, res: Response) => {
    try {
        const updates = await prisma.updates.findMany();

        const responseData = updates.map(status => ({
            id: uuidStringify(status.id),
            release_time: status.release_time.toISOString()
        }));

        return res.status(200).json(createSuccessResponse(responseData, `Updates retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving updates', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving updates. Please try again later.'));
    }
};

export const updateUpdate = async (req: Request, res: Response) => {
    try {
        const updateId: string = req.params.updateId;
        const description: string = req.body.description;
        const version: string = req.body.version

        const existingUpdate: updates | null = await prisma.updates.findUnique({
            where: {
                id: Buffer.from(uuidParse(updateId))
            }
        });

        if (!existingUpdate) {
            return res.status(404).json(createErrorResponse(`Update does not exist.`));
        }

        const updatedUpdate = await prisma.updates.update({
            where: {
                id: Buffer.from(uuidParse(updateId))
            },
            data: {
                description: description,
                version: version
            }
        });

        const responseData = {
            ...updatedUpdate,
            id: uuidStringify(updatedUpdate.id),
            release_time: updatedUpdate.release_time.toISOString()
        };

        return res.status(200).json(createSuccessResponse(responseData, `Update updated successfully.`));
    } catch (err) {
        console.error('Error updating update', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while updating update. Please try again later.'));
    }
};

export const deleteUpdate = async (req: Request, res: Response) => {
    try {
        const updateId: string = req.params.updateId;

        const existingUpdate: updates | null = await prisma.updates.findUnique({
            where: {
                id: Buffer.from(uuidParse(updateId))
            }
        });

        if (!existingUpdate) {
            return res.status(404).json(createErrorResponse(`Update does not exist.`));
        }

        const deletedUpdate = await prisma.updates.delete({
            where: {
                id: Buffer.from(uuidParse(updateId))
            }
        });

        const responseData = {
            ...deletedUpdate,
            id: uuidStringify(deletedUpdate.id),
            release_time: deletedUpdate.release_time.toISOString()
        };

        return res.status(200).json(createSuccessResponse(responseData, `Update deleted successfully.`));
    } catch (err) {
        console.error('Error deleting update', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while deleting update. Please try again later.'));
    }
};