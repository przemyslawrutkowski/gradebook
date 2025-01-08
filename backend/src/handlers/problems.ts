import { Request, Response } from 'express';
import prisma from '../db';
import { students, teachers, problem_types, user_types, administrators, parents, statuses, problems_gradebook } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';
import { Buffer } from 'node:buffer';
import { UserType } from '../enums/userTypes';
import { Status } from '../enums/statuses';

export const createProblem = async (req: Request, res: Response) => {
    try {
        const description: string = req.body.description;
        const problemTypeId: string = req.body.problemTypeId;
        const reporterId: string = req.body.reporterId;
        const userTypeId: string = req.body.userTypeId;

        const existingProblemType: problem_types | null = await prisma.problem_types.findUnique({
            where: {
                id: Buffer.from(uuidParse(problemTypeId))
            }
        });

        if (!existingProblemType) {
            return res.status(404).json(createErrorResponse(`Problem type does not exist.`));
        }

        const existingUserType: user_types | null = await prisma.user_types.findUnique({
            where: {
                id: Buffer.from(uuidParse(userTypeId))
            }
        });

        if (!existingUserType) {
            return res.status(404).json(createErrorResponse(`User type does not exist.`));
        }

        const existingStatus: statuses | null = await prisma.statuses.findUnique({
            where: {
                name: Status.Pending
            }
        });

        if (!existingStatus) {
            return res.status(404).json(createErrorResponse(`Status does not exist.`));
        }

        let existingUser: administrators | teachers | parents | students | null = null;

        switch (existingUserType.name) {
            case UserType.Administrator:
                existingUser = await prisma.administrators.findUnique({
                    where: {
                        id: Buffer.from(uuidParse(reporterId))
                    }
                });
                break;
            case UserType.Teacher:
                existingUser = await prisma.teachers.findUnique({
                    where: {
                        id: Buffer.from(uuidParse(reporterId))
                    }
                });
                break;
            case UserType.Parent:
                existingUser = await prisma.parents.findUnique({
                    where: {
                        id: Buffer.from(uuidParse(reporterId))
                    }
                });
                break;
            case UserType.Student:
                existingUser = await prisma.students.findUnique({
                    where: {
                        id: Buffer.from(uuidParse(reporterId))
                    }
                });
                break;
        }

        if (!existingUser) {
            return res.status(404).json(createErrorResponse(`User does not exist.`));
        }

        const createdProblem = await prisma.problems_gradebook.create({
            data: {
                description: description,
                reported_time: new Date(),
                problem_type_id: Buffer.from(uuidParse(problemTypeId)),
                reporter_id: Buffer.from(uuidParse(reporterId)),
                user_type_id: Buffer.from(uuidParse(userTypeId)),
                status_id: existingStatus.id
            }
        });

        const responseData = {
            ...createdProblem,
            id: uuidStringify(createdProblem.id),
            reported_time: createdProblem.reported_time.toISOString(),
            problem_type_id: uuidStringify(createdProblem.problem_type_id),
            reporter_id: uuidStringify(createdProblem.reporter_id),
            user_type_id: uuidStringify(createdProblem.user_type_id),
            status_id: uuidStringify(createdProblem.status_id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Problem created successfully.`));
    } catch (err) {
        console.error('Error creating problem', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating problem. Please try again later.'));
    }
};

export const getProblems = async (req: Request, res: Response) => {
    try {
        const problems = await prisma.problems_gradebook.findMany({
            include: {
                problem_types: true,
                user_types: true,
                statuses: true
            },
        });

        const responseData: any[] = [];

        for (const problem of problems) {
            let existingUser: | administrators | teachers | parents | students | null = null;

            switch (problem.user_types.name) {
                case UserType.Administrator:
                    existingUser = await prisma.administrators.findUnique({
                        where: {
                            id: problem.reporter_id,
                        },
                    });
                    break;
                case UserType.Teacher:
                    existingUser = await prisma.teachers.findUnique({
                        where: {
                            id: problem.reporter_id,
                        },
                    });
                    break;
                case UserType.Parent:
                    existingUser = await prisma.parents.findUnique({
                        where: {
                            id: problem.reporter_id,
                        },
                    });
                    break;
                case UserType.Student:
                    existingUser = await prisma.students.findUnique({
                        where: {
                            id: problem.reporter_id,
                        },
                    });
                    break;
            }

            if (!existingUser) {
                return res.status(404).json(createErrorResponse(`User does not exist.`));
            }

            responseData.push({
                ...problem,
                id: uuidStringify(problem.id),
                reported_time: problem.reported_time.toISOString(),
                problem_type_id: uuidStringify(problem.problem_type_id),
                reporter_id: uuidStringify(problem.reporter_id),
                user_type_id: uuidStringify(problem.user_type_id),
                status_id: uuidStringify(problem.status_id),
                problem_types: {
                    ...problem.problem_types,
                    id: uuidStringify(problem.problem_types.id),
                },
                user_types: {
                    ...problem.user_types,
                    id: uuidStringify(problem.user_types.id),
                },
                statuses: {
                    ...problem.statuses,
                    id: uuidStringify(problem.statuses.id),
                },
                reporter: {
                    id: uuidStringify(existingUser.id),
                    pesel: existingUser.pesel,
                    email: existingUser.email,
                    phone_number: existingUser.phone_number,
                    first_name: existingUser.first_name,
                    last_name: existingUser.last_name,
                },
            });
        }

        return res.status(200).json(createSuccessResponse(responseData, 'Problems retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving problems', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving problems. Please try again later.'));
    }
};

export const getProblemsByType = async (req: Request, res: Response) => {
    try {
        const problemTypeId: string = req.params.problemTypeId;

        const existingProblemType: problem_types | null = await prisma.problem_types.findUnique({
            where: {
                id: Buffer.from(uuidParse(problemTypeId))
            }
        });

        if (!existingProblemType) {
            return res.status(404).json(createErrorResponse(`Problem type does not exist.`));
        }

        const problems = await prisma.problems_gradebook.findMany({
            where: {
                problem_type_id: Buffer.from(uuidParse(problemTypeId))
            },
            include: {
                problem_types: true,
                user_types: true,
                statuses: true
            }
        });

        const responseData: any[] = [];

        for (const problem of problems) {
            let existingUser: | administrators | teachers | parents | students | null = null;

            switch (problem.user_types.name) {
                case UserType.Administrator:
                    existingUser = await prisma.administrators.findUnique({
                        where: {
                            id: problem.reporter_id,
                        },
                    });
                    break;
                case UserType.Teacher:
                    existingUser = await prisma.teachers.findUnique({
                        where: {
                            id: problem.reporter_id,
                        },
                    });
                    break;
                case UserType.Parent:
                    existingUser = await prisma.parents.findUnique({
                        where: {
                            id: problem.reporter_id,
                        },
                    });
                    break;
                case UserType.Student:
                    existingUser = await prisma.students.findUnique({
                        where: {
                            id: problem.reporter_id,
                        },
                    });
                    break;
            }

            if (!existingUser) {
                return res.status(404).json(createErrorResponse(`User does not exist.`));
            }

            responseData.push({
                ...problem,
                id: uuidStringify(problem.id),
                reported_time: problem.reported_time.toISOString(),
                problem_type_id: uuidStringify(problem.problem_type_id),
                reporter_id: uuidStringify(problem.reporter_id),
                user_type_id: uuidStringify(problem.user_type_id),
                status_id: uuidStringify(problem.status_id),
                problem_types: {
                    ...problem.problem_types,
                    id: uuidStringify(problem.problem_types.id),
                },
                user_types: {
                    ...problem.user_types,
                    id: uuidStringify(problem.user_types.id),
                },
                statuses: {
                    ...problem.statuses,
                    id: uuidStringify(problem.statuses.id),
                },
                reporter: {
                    id: uuidStringify(existingUser.id),
                    pesel: existingUser.pesel,
                    email: existingUser.email,
                    phone_number: existingUser.phone_number,
                    first_name: existingUser.first_name,
                    last_name: existingUser.last_name,
                },
            });
        }

        return res.status(200).json(createSuccessResponse(responseData, 'Problems retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving problems', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving problems. Please try again later.'));
    }
};

export const updateProblem = async (req: Request, res: Response) => {
    try {
        const problemId: string = req.params.problemId;
        const statusId: string = req.body.statusId;

        const existingProblem: problems_gradebook | null = await prisma.problems_gradebook.findUnique({
            where: {
                id: Buffer.from(uuidParse(problemId))
            }
        });

        if (!existingProblem) {
            return res.status(404).json(createErrorResponse(`Problem does not exist.`));
        }

        const existingStatus: statuses | null = await prisma.statuses.findUnique({
            where: {
                id: Buffer.from(uuidParse(statusId))
            }
        });

        if (!existingStatus) {
            return res.status(404).json(createErrorResponse(`Status does not exist.`));
        }

        const updatedProblem = await prisma.problems_gradebook.update({
            where: {
                id: Buffer.from(uuidParse(problemId))
            },
            data: {
                status_id: Buffer.from(uuidParse(statusId))
            }
        });

        const responseData = {
            ...updatedProblem,
            id: uuidStringify(updatedProblem.id),
            reported_time: updatedProblem.reported_time.toISOString(),
            problem_type_id: uuidStringify(updatedProblem.problem_type_id),
            reporter_id: uuidStringify(updatedProblem.reporter_id),
            user_type_id: uuidStringify(updatedProblem.user_type_id),
            status_id: uuidStringify(updatedProblem.status_id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Problem updated successfully.`));
    } catch (err) {
        console.error('Error updating problem', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while updating problem. Please try again later.'));
    }
};

export const deleteProblem = async (req: Request, res: Response) => {
    try {
        const problemId: string = req.params.problemId;

        const existingProblem: problems_gradebook | null = await prisma.problems_gradebook.findUnique({
            where: {
                id: Buffer.from(uuidParse(problemId))
            }
        });

        if (!existingProblem) {
            return res.status(404).json(createErrorResponse(`Problem does not exist.`));
        }

        const deletedProblem = await prisma.problems_gradebook.delete({
            where: {
                id: Buffer.from(uuidParse(problemId))
            }
        });

        const responseData = {
            ...deletedProblem,
            id: uuidStringify(deletedProblem.id),
            reported_time: deletedProblem.reported_time.toISOString(),
            problem_type_id: uuidStringify(deletedProblem.problem_type_id),
            reporter_id: uuidStringify(deletedProblem.reporter_id),
            user_type_id: uuidStringify(deletedProblem.user_type_id),
            status_id: uuidStringify(deletedProblem.status_id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Problem deleted successfully.`));
    } catch (err) {
        console.error('Error deleting problem', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while deleting problem. Please try again later.'));
    }
};