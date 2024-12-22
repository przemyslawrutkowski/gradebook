import { Request, Response } from 'express';
import prisma from '../db';
import { school_years, semesters } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';
import { Buffer } from 'node:buffer';

export const createSchoolYear = async (req: Request, res: Response) => {
    try {
        const name: string = req.body.name;
        const startDate: Date = new Date(req.body.startDate);
        const endDate: Date = new Date(req.body.endDate);

        const existingSchoolYear: school_years | null = await prisma.school_years.findUnique({
            where: {
                name: name
            }
        });

        if (existingSchoolYear) {
            return res.status(409).json(createErrorResponse('School year already exists.'));
        }

        if (startDate >= endDate) {
            return res.status(400).json(createErrorResponse('Start date must be before end date.'));
        }

        const createdSchoolYear = await prisma.school_years.create({
            data: {
                name: name,
                start_date: startDate,
                end_date: endDate
            }
        });

        const responseData = {
            ...createdSchoolYear,
            id: uuidStringify(createdSchoolYear.id),
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
        };

        return res.status(200).json(createSuccessResponse(responseData, `School year created successfully.`));
    } catch (err) {
        console.error('Error creating school year', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating school year. Please try again later.'));
    }
}

export const getSchoolYears = async (req: Request, res: Response) => {
    try {
        const schoolYears = await prisma.school_years.findMany();

        const responseData = schoolYears.map(schoolYear => ({
            ...schoolYear,
            id: uuidStringify(schoolYear.id),
            start_date: schoolYear.start_date.toISOString(),
            end_date: schoolYear.end_date.toISOString()
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'School years retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving school years', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving school years. Please try again later.'));
    }
}

export const updateSchoolYear = async (req: Request, res: Response) => {
    try {
        const schoolYearId: string = req.params.schoolYearId;
        const name: string | undefined = req.body.name;
        const startDate: string | undefined = req.body.startDate;
        const endDate: string | undefined = req.body.endDate;

        const existingSchoolYear: school_years | null = await prisma.school_years.findUnique({
            where: {
                id: Buffer.from(uuidParse(schoolYearId))
            }
        });

        if (!existingSchoolYear) {
            return res.status(404).json(createErrorResponse(`School year does not exist.`));
        }

        const data: { name?: string, start_date?: Date, end_date?: Date } = {};

        if (name) data.name = name;
        if (startDate) data.start_date = new Date(startDate);
        if (endDate) data.end_date = new Date(endDate);

        const updatedSchoolYear = await prisma.school_years.update({
            where: {
                id: Buffer.from(uuidParse(schoolYearId))
            },
            data: data
        });

        const responseData = {
            ...updatedSchoolYear,
            id: uuidStringify(updatedSchoolYear.id),
            start_date: updatedSchoolYear.start_date.toISOString(),
            end_date: updatedSchoolYear.end_date.toISOString()
        };

        return res.status(200).json(createSuccessResponse(responseData, `School year successfully updated.`));
    } catch (err) {
        console.error('Error updating school year', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while updating school year. Please try again later.'));
    }
}

export const deleteSchoolYear = async (req: Request, res: Response) => {
    try {
        const schoolYearId: string = req.params.schoolYearId;

        const existingSchoolYear: school_years | null = await prisma.school_years.findUnique({
            where: {
                id: Buffer.from(uuidParse(schoolYearId))
            }
        });

        if (!existingSchoolYear) {
            return res.status(404).json(createErrorResponse(`School year does not exist.`));
        }

        const deletedSchoolYear = await prisma.school_years.delete({
            where: {
                id: Buffer.from(uuidParse(schoolYearId))
            }
        });

        const responseData = {
            ...deletedSchoolYear,
            id: uuidStringify(deletedSchoolYear.id),
            start_date: deletedSchoolYear.start_date.toISOString(),
            end_date: deletedSchoolYear.end_date.toISOString()
        };

        return res.status(200).json(createSuccessResponse(responseData, `School year deleted successfully.`));
    } catch (err) {
        console.error('Error deleting school year', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while deleting school year. Please try again later.'));
    }
}

export const getSchoolYearById = async (req: Request, res: Response) => {
    try {
        const schoolYearId: string = req.params.schoolYearId;

        if (!uuidParse(schoolYearId)) {
            return res.status(400).json(createErrorResponse('Invalid UUID format for schoolYearId.'));
        }

        const schoolYearIdBuffer = Buffer.from(uuidParse(schoolYearId));

        const schoolYearWithSemesters = await prisma.school_years.findUnique({
            where: {
                id: schoolYearIdBuffer
            },
            include: {
                semesters: true
            }
        });

        if (!schoolYearWithSemesters) {
            return res.status(404).json(createErrorResponse(`School year with ID ${schoolYearId} does not exist.`));
        }

        const responseData = {
            ...schoolYearWithSemesters,
            id: uuidStringify(schoolYearWithSemesters.id),
            start_date: schoolYearWithSemesters.start_date.toISOString(),
            end_date: schoolYearWithSemesters.end_date.toISOString(),
            semesters: schoolYearWithSemesters.semesters.map((semester: semesters) => ({
                ...semester,
                id: uuidStringify(semester.id),
                school_year_id: uuidStringify(semester.school_year_id),
                start_date: semester.start_date.toISOString(),
                end_date: semester.end_date.toISOString()
            }))
        };

        return res.status(200).json(createSuccessResponse(responseData, `School year details retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving school year details', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving school year details. Please try again later.'));
    }
};

