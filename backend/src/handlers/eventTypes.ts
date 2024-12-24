import { Request, response, Response } from 'express';
import prisma from '../db';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { Buffer } from 'node:buffer';
import { event_types, lessons, students, school_events } from '@prisma/client';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';

export const createEventType = async (req: Request, res: Response) => {
    try {
        const name: string = req.body.name;

        const existingEventType: event_types | null = await prisma.event_types.findUnique({
            where: {
                name: name
            }
        });

        if (existingEventType) {
            return res.status(409).json(createErrorResponse(`Event type already exist.`));
        }

        const createdEventType = await prisma.event_types.create({
            data: {
                name: name
            }
        });

        const responseData = {
            ...createdEventType,
            id: uuidStringify(createdEventType.id),
        };

        return res.status(200).json(createSuccessResponse(responseData, `Event type created successfully.`));
    } catch (err) {
        console.error('Error creating event type', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating event type. Please try again later.'));
    }
};

export const getEventTypes = async (req: Request, res: Response) => {
    try {
        const eventTypes = await prisma.event_types.findMany();

        const responseData = eventTypes.map(eventType => ({
            ...eventType,
            id: uuidStringify(eventType.id),
        }));

        return res.status(200).json(createSuccessResponse(responseData, `Event types retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving event types', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving event types. Please try again later.'));
    }
};

export const getEventType = async (req: Request, res: Response) => {
    try {
        const eventTypeId: string = req.params.eventTypeId;

        const existingEventType: event_types | null = await prisma.event_types.findUnique({
            where: {
                id: Buffer.from(uuidParse(eventTypeId))
            }
        });

        if (!existingEventType) {
            return res.status(404).json(createErrorResponse(`Event type does not exist.`));
        }

        const responseData = {
            ...existingEventType,
            id: uuidStringify(existingEventType.id),
        };

        return res.status(200).json(createSuccessResponse(responseData, `Event type retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving event type', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving event type. Please try again later.'));
    }
};

export const updateEventType = async (req: Request, res: Response) => {
    try {
        const eventTypeId: string = req.params.eventTypeId;
        const name: string = req.body.name;

        const existingEventType: event_types | null = await prisma.event_types.findUnique({
            where: {
                id: Buffer.from(uuidParse(eventTypeId))
            }
        });

        if (!existingEventType) {
            return res.status(404).json(createErrorResponse('Event type does not exist'));
        }

        const updatedEventType = await prisma.event_types.update({
            where: {
                id: Buffer.from(uuidParse(eventTypeId))
            },
            data: {
                name: name
            }
        });

        const responseData = {
            ...updatedEventType,
            id: uuidStringify(existingEventType.id),
        };

        return res.status(200).json(createSuccessResponse(responseData, `Event type updated successfully.`));
    } catch (err) {
        console.error('Error updating event type', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while updating event type. Please try again later.'));
    }
};

export const deleteEventType = async (req: Request, res: Response) => {
    try {
        const eventTypeId: string = req.params.eventTypeId;

        const existingEventType: event_types | null = await prisma.event_types.findUnique({
            where: {
                id: Buffer.from(uuidParse(eventTypeId))
            }
        });

        if (!existingEventType) {
            return res.status(404).json(createErrorResponse('Event type does not exist'));
        }

        const deletedEventType = await prisma.event_types.delete({
            where: {
                id: Buffer.from(uuidParse(eventTypeId))
            }
        });

        const responseData = {
            ...deletedEventType,
            id: uuidStringify(existingEventType.id),
        };

        return res.status(200).json(createSuccessResponse(responseData, `Event type deleted successfully.`));
    } catch (err) {
        console.error('Error deleting event type', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while deleting event type. Please try again later.'));
    }
};