import { Request, Response } from 'express';
import prisma from '../db';
import { class_names } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';
import { Buffer } from 'node:buffer';

export const createClassName = async (req: Request, res: Response) => {
    try {
        const name: string = req.body.name;

        const existingClassName: class_names | null = await prisma.class_names.findUnique({
            where: {
                name: name
            }
        });

        if (existingClassName) {
            return res.status(409).json(createErrorResponse(`Class name already exists.`));
        }

        const createdClassName = await prisma.class_names.create({
            data: {
                name: name
            }
        });

        const responseData = {
            ...createdClassName,
            id: uuidStringify(createdClassName.id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Class name created successfully.`));
    } catch (err) {
        console.error('Error creating class name', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating class name. Please try again later.'));
    }
}

export const getClassNames = async (req: Request, res: Response) => {
    try {
        const classNames = await prisma.class_names.findMany();

        const responeData = classNames.map(className => ({
            ...className,
            id: uuidStringify(className.id)
        }));

        return res.status(200).json(createSuccessResponse(responeData, 'Class names retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving class names', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving class names. Please try again later.'));
    }
}

export const updateClassName = async (req: Request, res: Response) => {
    try {
        const classNameId: string = req.params.classNameId;
        const name: string = req.body.name;

        const existingClassName: class_names | null = await prisma.class_names.findUnique({
            where: {
                id: Buffer.from(uuidParse(classNameId))
            }
        });

        if (!existingClassName) {
            return res.status(404).json(createErrorResponse(`Class names does not exist.`));
        }

        const updatedClassName = await prisma.class_names.update({
            where: {
                id: Buffer.from(uuidParse(classNameId))
            },
            data: {
                name: name
            }
        });

        const responseData = {
            ...updatedClassName,
            id: uuidStringify(updatedClassName.id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Class name successfully updated.`));
    } catch (err) {
        console.error('Error updating class name', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while updating class name. Please try again later.'));
    }
}

export const deleteClassName = async (req: Request, res: Response) => {
    try {
        const classNameId: string = req.params.classNameId;

        const existingClassName: class_names | null = await prisma.class_names.findUnique({
            where: {
                id: Buffer.from(uuidParse(classNameId))
            }
        });

        if (!existingClassName) {
            return res.status(404).json(createErrorResponse(`Class name does not exist.`));
        }

        const deletedClassName = await prisma.class_names.delete({
            where: {
                id: Buffer.from(uuidParse(classNameId))
            }
        });

        const responseData = {
            ...deletedClassName,
            id: uuidStringify(deletedClassName.id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Class name deleted successfully.`));
    } catch (err) {
        console.error('Error deleting class name', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while deleting class name. Please try again later.'));
    }
}