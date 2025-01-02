import { Request, Response } from 'express';
import prisma from '../db';
import { school_years, semesters } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';
import { Buffer } from 'node:buffer';

export const createSemester = async (req: Request, res: Response) => {
    try {
        const semester: number = req.body.semester;
        const startDate: Date = new Date(req.body.startDate);
        const endDate: Date = new Date(req.body.endDate);
        const schoolYearId: string = req.body.schoolYearId

        const existingSemester: semesters | null = await prisma.semesters.findUnique({
            where: {
                semester_school_year_id: {
                    semester: semester,
                    school_year_id: Buffer.from(uuidParse(schoolYearId))
                }
            }
        });

        if (existingSemester) {
            return res.status(409).json(createErrorResponse(`Semester already exists.`));
        }

        const existingSchoolYear: school_years | null = await prisma.school_years.findUnique({
            where: {
                id: Buffer.from(uuidParse(schoolYearId))
            }
        });

        if (!existingSchoolYear) {
            return res.status(404).json(createErrorResponse(`School year does not exist.`));
        }

        if (startDate >= endDate) {
            return res.status(400).json(createErrorResponse('Start date must be before end date.'));
        }

        if (startDate < existingSchoolYear.start_date || endDate > existingSchoolYear.end_date) {
            return res.status(400).json(createErrorResponse('Semester dates must be within the school year dates.'));
        }

        const overlappingSemester = await prisma.semesters.findFirst({
            where: {
                school_year_id: Buffer.from(uuidParse(schoolYearId)),
                OR: [
                    {
                        start_date: {
                            lte: endDate
                        },
                        end_date: {
                            gte: startDate
                        }
                    }
                ]
            }
        });

        if (overlappingSemester) {
            return res.status(409).json(createErrorResponse('Semester dates overlap with an existing semester.'));
        }

        const createdSemester = await prisma.semesters.create({
            data: {
                semester: semester,
                start_date: startDate,
                end_date: endDate,
                school_year_id: Buffer.from(uuidParse(schoolYearId))
            }
        });

        const responseData = {
            ...createdSemester,
            id: uuidStringify(createdSemester.id),
            start_date: createdSemester.start_date.toISOString(),
            end_date: createdSemester.end_date.toISOString(),
            school_year_id: uuidStringify(createdSemester.school_year_id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Semester created successfully.`));
    } catch (err) {
        console.error('Error creating semester', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating semester. Please try again later.'));
    }
}

export const getSemesters = async (req: Request, res: Response) => {
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

        const semesters = await prisma.semesters.findMany({
            where: {
                school_year_id: Buffer.from(uuidParse(schoolYearId))
            }
        });

        const responseData = semesters.map(semester => ({
            ...semester,
            id: uuidStringify(semester.id),
            start_date: semester.start_date.toISOString(),
            end_date: semester.end_date.toISOString(),
            school_year_id: uuidStringify(semester.school_year_id)
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Semesters retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving semesters', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving semesters. Please try again later.'));
    }
}

export const updateSemester = async (req: Request, res: Response) => {
    try {
        const semesterId: string = req.params.semesterId;
        const semester: number | undefined = req.body.semester;
        const startDate: string | undefined = req.body.startDate;
        const endDate: string | undefined = req.body.endDate;

        const existingSemester: semesters | null = await prisma.semesters.findUnique({
            where: {
                id: Buffer.from(uuidParse(semesterId))
            }
        });

        if (!existingSemester) {
            return res.status(404).json(createErrorResponse(`Semester does not exist.`));
        }

        const data: { semester?: number, start_date?: Date, end_date?: Date } = {};

        if (semester) data.semester = semester;
        if (startDate) data.start_date = new Date(startDate);
        if (endDate) data.end_date = new Date(endDate);

        const updatedSchoolYear = await prisma.semesters.update({
            where: {
                id: Buffer.from(uuidParse(semesterId))
            },
            data: data
        });

        const responseData = {
            ...updatedSchoolYear,
            id: uuidStringify(updatedSchoolYear.id),
            start_date: updatedSchoolYear.start_date.toISOString(),
            end_date: updatedSchoolYear.end_date.toISOString(),
            school_year_id: uuidStringify(updatedSchoolYear.school_year_id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Semester successfully updated.`));
    } catch (err) {
        console.error('Error updating semester', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while updating semester. Please try again later.'));
    }
}

export const deleteSemester = async (req: Request, res: Response) => {
    try {
        const semesterId: string = req.params.semesterId;

        const existingSemester: semesters | null = await prisma.semesters.findUnique({
            where: {
                id: Buffer.from(uuidParse(semesterId))
            }
        });

        if (!existingSemester) {
            return res.status(404).json(createErrorResponse(`Semester does not exist.`));
        }

        const deletedSemester = await prisma.semesters.delete({
            where: {
                id: Buffer.from(uuidParse(semesterId))
            }
        });

        const responseData = {
            ...deletedSemester,
            id: uuidStringify(deletedSemester.id),
            start_date: deletedSemester.start_date.toISOString(),
            end_date: deletedSemester.end_date.toISOString(),
            school_year_id: uuidStringify(deletedSemester.school_year_id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Semester deleted successfully.`));
    } catch (err) {
        console.error('Error deleting semester', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while deleting semester. Please try again later.'));
    }
}

export const getSemestersBySchoolYearName = async (req: Request, res: Response) => {
    try {
        const currentYear: number = new Date().getUTCFullYear();
        const currentMonth: number = new Date().getUTCMonth();

        let year = null;
        if(currentMonth < 7){
            year = currentYear - 1;
        } else {
            year = currentYear
        }

        const existingSchoolYear = await prisma.school_years.findUnique({
            where: {
                name: `${year}/${year + 1}`
            }
        });

        if (!existingSchoolYear) {
            return res.status(404).json(createErrorResponse(`School year named does not exist.`));
        }

        const semestersList = await prisma.semesters.findMany({
            where: {
                school_year_id: existingSchoolYear.id
            }
        });

        const responseData = semestersList.map((semester: semesters) => ({
            ...semester,
            id: uuidStringify(semester.id),
            name: semester.semester,
            start_date: semester.start_date.toISOString(),
            end_date: semester.end_date.toISOString(),
            school_year_id: uuidStringify(semester.school_year_id)
        }));

        return res.status(200).json(createSuccessResponse(responseData, `Semesters for the school year have been successfully retrieved.`));
    } catch (err) {
        console.error('Error retrieving semesters by school year name', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving semesters. Please try again later.'));
    }
}