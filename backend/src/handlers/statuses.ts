import { Request, Response } from 'express';
import prisma from '../db';
import { statuses } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';
import { Buffer } from 'node:buffer';

export const createStatus = async (req: Request, res: Response) => {
    try {
        const name: string = req.body.name;

        const existingStatus: statuses | null = await prisma.statuses.findUnique({
            where: {
                name: name
            }
        });

        if (existingStatus) {
            return res.status(409).json(createErrorResponse(`Status already exists.`));
        }

        const createdStatus = await prisma.statuses.create({
            data: {
                name: name
            }
        });

        const responseData = {
            ...createdStatus,
            id: uuidStringify(createdStatus.id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Status created successfully.`));
    } catch (err) {
        console.error('Error creating status', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating status. Please try again later.'));
    }
}

export const getStatuses = async (req: Request, res: Response) => {
    try {
        const statuses = await prisma.statuses.findMany();

        const responseData = statuses.map(status => ({
            id: uuidStringify(status.id),
            name: status.name
        }));

        return res.status(200).json(createSuccessResponse(responseData, `Statuses retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving statuses', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving statuses. Please try again later.'));
    }
};

export const updateStatus = async (req: Request, res: Response) => {
    try {
        const statusId: string = req.params.status;
        const name: string = req.body.name;

        const existingStatus: statuses | null = await prisma.statuses.findUnique({
            where: {
                id: Buffer.from(uuidParse(statusId))
            }
        });

        if (!existingStatus) {
            return res.status(404).json(createErrorResponse('Status does not exist.'));
        }

        const updatedStatus = await prisma.statuses.update({
            where: {
                id: Buffer.from(uuidParse(statusId))
            },
            data: {
                name: name
            }
        });

        const responseData = {
            ...updatedStatus,
            id: uuidStringify(updatedStatus.id)
        };

        return res.status(200).json(createSuccessResponse(responseData, 'Status updated successfully.'));
    } catch (err) {
        console.error('Error updating status', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while updating the status. Please try again later.'));
    }
};

export const deleteStatus = async (req: Request, res: Response) => {
    try {
        const statusId: string = req.params.statusId;

        const existingStatus: statuses | null = await prisma.statuses.findUnique({
            where: {
                id: Buffer.from(uuidParse(statusId))
            }
        });

        if (!existingStatus) {
            return res.status(404).json(createErrorResponse(`Status does not exist.`));
        }

        const deletedStatus = await prisma.statuses.delete({
            where: {
                id: Buffer.from(uuidParse(statusId))
            }
        });

        const responseData = {
            ...deletedStatus,
            id: uuidStringify(deletedStatus.id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Status deleted successfully.`));
    } catch (err) {
        console.error('Error deleting status', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while deleting status. Please try again later.'));
    }
}
