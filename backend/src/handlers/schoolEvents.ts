import { Request, response, Response } from 'express';
import prisma from '../db';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { Buffer } from 'node:buffer';
import { event_types, school_events } from '@prisma/client';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';

export const createSchoolEvent = async (req: Request, res: Response) => {
    try {
        const name: string = req.body.name;
        const location: string = req.body.location;
        const description: string = req.body.description;
        const date = new Date(req.body.date);
        const startTime: string = req.body.startTime;
        const endTime: string = req.body.endTime;
        const eventTypeId: string = req.body.eventTypeId;

        const existingEventType: event_types | null = await prisma.event_types.findUnique({
            where: {
                id: Buffer.from(uuidParse(eventTypeId))
            }
        });

        if (!existingEventType) {
            return res.status(404).json(createErrorResponse(`Event type does not exist.`));
        }

        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        const startDateTime = new Date(req.body.date);
        startDateTime.setUTCHours(startHour, startMinute, 0, 0);

        const endDateTime = new Date(req.body.date);
        endDateTime.setUTCHours(endHour, endMinute, 0, 0);

        const createdSchoolEvent = await prisma.school_events.create({
            data: {
                name: name,
                location: location,
                description: description,
                date: date,
                start_time: startDateTime,
                end_time: endDateTime,
                event_type_id: Buffer.from(uuidParse(eventTypeId)),
            }
        });

        const responseData = {
            ...createdSchoolEvent,
            id: uuidStringify(createdSchoolEvent.id),
            date: createdSchoolEvent.date.toISOString(),
            start_time: createdSchoolEvent.start_time.toISOString(),
            end_time: createdSchoolEvent.end_time.toISOString(),
            event_type_id: uuidStringify(createdSchoolEvent.event_type_id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `School event created successfully.`));
    } catch (err) {
        console.error('Error creating school event', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating school event. Please try again later.'));
    }
};

export const getSchoolEvents = async (req: Request, res: Response) => {
    try {
        const schoolEvents = await prisma.school_events.findMany();

        const responseData = schoolEvents.map(schoolEvent => ({
            ...schoolEvent,
            id: uuidStringify(schoolEvent.id),
            date: schoolEvent.date.toISOString(),
            start_time: schoolEvent.start_time.toISOString(),
            end_time: schoolEvent.end_time.toISOString(),
            event_type_id: uuidStringify(schoolEvent.event_type_id)
        }));

        return res.status(200).json(createSuccessResponse(responseData, `School events retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving school events', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving school events. Please try again later.'));
    }
};

export const getSchoolEvent = async (req: Request, res: Response) => {
    try {
        const schoolEventId: string = req.params.schoolEventId;

        const existingSchoolEvent: school_events | null = await prisma.school_events.findUnique({
            where: {
                id: Buffer.from(uuidParse(schoolEventId))
            }
        });

        if (!existingSchoolEvent) {
            return res.status(404).json(createErrorResponse(`School event does not exist.`));
        }

        const responseData = {
            ...existingSchoolEvent,
            id: uuidStringify(existingSchoolEvent.id),
            date: existingSchoolEvent.date.toISOString(),
            start_time: existingSchoolEvent.start_time.toISOString(),
            end_time: existingSchoolEvent.end_time.toISOString(),
            event_type_id: uuidStringify(existingSchoolEvent.event_type_id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `School event retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving school event', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving school event. Please try again later.'));
    }
};

export const updateSchoolEvent = async (req: Request, res: Response) => {
    try {
        const schoolEventId: string = req.params.schoolEventId;
        const name: string | undefined = req.body.name;
        const location: string | undefined = req.body.location;
        const description: string | undefined = req.body.description;
        const date: Date | undefined = req.body.date ? new Date(req.body.date) : undefined;
        const startTime: string | undefined = req.body.startTime;
        const endTime: string | undefined = req.body.endTime;
        const eventTypeId: string | undefined = req.body.eventTypeId;

        const existingSchoolEvent: school_events | null = await prisma.school_events.findUnique({
            where: {
                id: Buffer.from(uuidParse(schoolEventId))
            }
        });

        if (!existingSchoolEvent) {
            return res.status(404).json(createErrorResponse('School event does not exist'));
        }

        const data: {
            name?: string,
            location?: string,
            description?: string,
            date?: Date,
            start_time?: Date,
            end_time?: Date,
            event_type_id?: Uint8Array
        } = {};

        if (name) data.name = name;
        if (location) data.location = location;
        if (description) data.description = description;
        if (date) data.date = date;
        if (startTime) {
            const [startHour, startMinute] = startTime.split(':').map(Number);

            const startDateTime = new Date(existingSchoolEvent.date);
            startDateTime.setUTCHours(startHour, startMinute, 0, 0);

            data.start_time = startDateTime;
        }
        if (endTime) {
            const [endHour, endMinute] = endTime.split(':').map(Number);

            const endDateTime = new Date(existingSchoolEvent.date);
            endDateTime.setUTCHours(endHour, endMinute, 0, 0);

            data.end_time = endDateTime;
        }
        if (eventTypeId) {
            const existingEventType: event_types | null = await prisma.event_types.findUnique({
                where: {
                    id: Buffer.from(uuidParse(eventTypeId))
                }
            });

            if (!existingEventType) {
                return res.status(404).json(createErrorResponse(`Event type does not exist.`));
            }

            data.event_type_id = Buffer.from(uuidParse(eventTypeId));
        }

        const updatedSchoolEvent = await prisma.school_events.update({
            where: {
                id: Buffer.from(uuidParse(schoolEventId))
            },
            data: data
        });

        const responseData = {
            ...updatedSchoolEvent,
            id: uuidStringify(existingSchoolEvent.id),
            date: updatedSchoolEvent.date.toISOString(),
            start_time: updatedSchoolEvent.start_time.toISOString(),
            end_time: updatedSchoolEvent.end_time.toISOString(),
            event_type_id: uuidStringify(updatedSchoolEvent.event_type_id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `School event updated successfully.`));
    } catch (err) {
        console.error('Error updating school event', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while updating school event. Please try again later.'));
    }
};

export const deleteSchoolEvent = async (req: Request, res: Response) => {
    try {
        const schoolEventId: string = req.params.schoolEventId;

        const existingSchoolEvent: school_events | null = await prisma.school_events.findUnique({
            where: {
                id: Buffer.from(uuidParse(schoolEventId))
            }
        });

        if (!existingSchoolEvent) {
            return res.status(404).json(createErrorResponse('School event does not exist'));
        }

        const deletedSchoolEvent = await prisma.school_events.delete({
            where: {
                id: Buffer.from(uuidParse(schoolEventId))
            }
        });

        const responseData = {
            ...deletedSchoolEvent,
            id: uuidStringify(existingSchoolEvent.id),
            date: existingSchoolEvent.date.toISOString(),
            start_time: existingSchoolEvent.start_time.toISOString(),
            end_time: existingSchoolEvent.end_time.toISOString(),
            event_type_id: uuidStringify(existingSchoolEvent.event_type_id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `School event deleted successfully.`));
    } catch (err) {
        console.error('Error deleting school event', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while deleting school event. Please try again later.'));
    }
};