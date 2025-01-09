import { Request, Response } from 'express';
import prisma from '../db';
import { surveys } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';
import { Buffer } from 'node:buffer';
import Question from '../interfaces/question';
import { QuestionType } from '../enums/questionTypes';
import QuestionResponse from '../interfaces/questionResponse';

export const createSurvey = async (req: Request, res: Response) => {
    try {
        //survey part
        const name: string = req.body.name;
        const description: string = req.body.description;
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);
        const startTime: string = req.body.startTime;
        const endTime: string = req.body.endTime;
        //questions part
        const questions: Question[] = req.body.questions;

        const questionResponsesToCreate: {
            content: string;
            question_id: Buffer;
        }[] = [];

        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        startDate.setUTCHours(startHour, startMinute, 0, 0);
        endDate.setUTCHours(endHour, endMinute, 0, 0);

        const createdSurvey = await prisma.surveys.create({
            data: {
                name: name,
                description: description,
                start_time: startDate,
                end_time: endDate
            }
        });

        for (var question of questions) {
            const existingQuestionType = await prisma.questions_types.findUnique({
                where: {
                    id: Buffer.from(uuidParse(question.questionTypeId))
                }
            });

            if (!existingQuestionType) {
                return res.status(404).json(createErrorResponse(`Question type does not exist.`));
            }

            const createdQuestion = await prisma.questions.create({
                data: {
                    content: question.content,
                    survey_id: Buffer.from(createdSurvey.id),
                    question_type_id: Buffer.from(existingQuestionType.id)
                }
            });

            if (question.responses) {
                for (var response of question.responses) {
                    questionResponsesToCreate.push({
                        content: response.content,
                        question_id: Buffer.from(createdQuestion.id)
                    });
                }
            }
        }

        if (questionResponsesToCreate.length > 0)
            await prisma.questions_possible_responses.createMany({
                data: questionResponsesToCreate
            });

        const existingQuestions = await prisma.questions.findMany({
            where: {
                survey_id: createdSurvey.id
            },
            include: {
                questions_possible_responses: true
            }
        });

        const processedQuestions = existingQuestions.map(question => ({
            ...question,
            id: uuidStringify(question.id),
            survey_id: uuidStringify(question.survey_id),
            question_type_id: uuidStringify(question.question_type_id),
            questions_possible_responses: question.questions_possible_responses.map(response => ({
                ...response,
                id: uuidStringify(response.id),
                question_id: uuidStringify(response.question_id),
            }))
        }));

        const responseData = {
            ...createdSurvey,
            id: uuidStringify(createdSurvey.id),
            start_time: createdSurvey.start_time.toISOString(),
            end_time: createdSurvey.end_time.toISOString(),
            questions: processedQuestions
        };

        return res.status(200).json(createSuccessResponse(responseData, `Survey created successfully.`));
    } catch (err) {
        console.error('Error creating survey', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating survey. Please try again later.'));
    }
};

export const getSurvey = async (req: Request, res: Response) => {
    try {
        const surveyId: string = req.params.surveyId;

        const existingSurvey = await prisma.surveys.findUnique({
            where: {
                id: Buffer.from(uuidParse(surveyId))
            },
            include: {
                questions: {
                    include: {
                        questions_possible_responses: true
                    }
                }
            }
        });

        if (!existingSurvey) {
            return res.status(404).json(createErrorResponse(`Survey does not exist.`));
        }

        const responseData = {
            ...existingSurvey,
            id: uuidStringify(existingSurvey.id),
            start_time: existingSurvey.start_time.toISOString(),
            end_time: existingSurvey.end_time.toISOString(),
            questions: existingSurvey.questions.map(question => ({
                ...question,
                id: uuidStringify(question.id),
                survey_id: uuidStringify(question.survey_id),
                question_type_id: uuidStringify(question.question_type_id),
                questions_possible_responses: question.questions_possible_responses.map(response => ({
                    ...response,
                    id: uuidStringify(response.id),
                    question_id: uuidStringify(response.question_id)
                }))
            }))
        };

        return res.status(200).json(createSuccessResponse(responseData, `Survey retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving survey', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving survey. Please try again later.'));
    }
};

export const getSurveys = async (req: Request, res: Response) => {
    try {
        const surveys = await prisma.surveys.findMany({
            include: {
                questions: {
                    include: {
                        questions_possible_responses: true
                    }
                }
            }
        });

        const responseData = surveys.map(survey => ({
            ...survey,
            id: uuidStringify(survey.id),
            start_time: survey.start_time.toISOString(),
            end_time: survey.end_time.toISOString(),
            questions: survey.questions.map(question => ({
                ...question,
                id: uuidStringify(question.id),
                survey_id: uuidStringify(question.survey_id),
                question_type_id: uuidStringify(question.question_type_id),
                questions_possible_responses: question.questions_possible_responses.map(response => ({
                    ...response,
                    id: uuidStringify(response.id),
                    question_id: uuidStringify(response.question_id)
                }))
            }))
        }));

        return res.status(200).json(createSuccessResponse(responseData, `Surveys retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving surveys', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving surveys. Please try again later.'));
    }
};

export const updateSurvey = async (req: Request, res: Response) => {
    try {
        const surveyId: string = req.params.surveyId;

        const name: string | undefined = req.body.name;
        const description: string | undefined = req.body.description;

        const startDate: string | undefined = req.body.startDate;
        const endDate: string | undefined = req.body.endDate;
        const startTime: string | undefined = req.body.startTime;
        const endTime: string | undefined = req.body.endTime;

        const questionsToAdd: Question[] | undefined = req.body.questionsToAdd;
        const questionsIdsToRemove: string[] | undefined = req.body.questionsIdsToRemove;

        const questionResponsesToCreate: {
            content: string;
            question_id: Buffer;
        }[] = [];

        const existingSurvey: surveys | null = await prisma.surveys.findUnique({
            where: {
                id: Buffer.from(uuidParse(surveyId))
            }
        });

        if (!existingSurvey) {
            return res.status(404).json(createErrorResponse(`Survey does not exist.`));
        }

        if (questionsIdsToRemove && questionsIdsToRemove.length > 0)
            for (var id of questionsIdsToRemove) {
                const existingQuestion = await prisma.questions.findUnique({
                    where: {
                        id: Buffer.from(uuidParse(id)),
                        survey_id: Buffer.from(existingSurvey.id)
                    }
                });

                if (!existingQuestion) {
                    return res.status(404).json(createErrorResponse(`Question does not exist.`));
                }
            }

        const data: {
            name?: string,
            description?: string,
            start_time?: Date,
            end_time?: Date
        } = {
            name: name ? name : undefined,
            description: description ? description : undefined,
        };

        //If one of startDate, endDate, startTime, endTime exist then 4 of them exist
        if (startDate && endDate && startTime && endTime) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            const [startHour, startMinute] = startTime.split(':').map(Number);
            const [endHour, endMinute] = endTime.split(':').map(Number);

            start.setUTCHours(startHour, startMinute, 0, 0);
            end.setUTCHours(endHour, endMinute, 0, 0);

            data.start_time = start;
            data.end_time = end;
        }

        const updatedSurvey = await prisma.surveys.update({
            where: {
                id: Buffer.from(uuidParse(surveyId))
            },
            data: data
        });

        if (questionsToAdd && questionsToAdd.length > 0) {
            for (var question of questionsToAdd) {
                const existingQuestionType = await prisma.questions_types.findUnique({
                    where: {
                        id: Buffer.from(uuidParse(question.questionTypeId))
                    }
                });

                if (!existingQuestionType) {
                    return res.status(404).json(createErrorResponse(`Question type does not exist.`));
                }

                const createdQuestion = await prisma.questions.create({
                    data: {
                        content: question.content,
                        survey_id: Buffer.from(updatedSurvey.id),
                        question_type_id: Buffer.from(existingQuestionType.id)
                    }
                });

                if (question.responses) {
                    for (var response of question.responses) {
                        questionResponsesToCreate.push({
                            content: response.content,
                            question_id: Buffer.from(createdQuestion.id)
                        });
                    }
                }
            }

            if (questionResponsesToCreate.length > 0)
                await prisma.questions_possible_responses.createMany({
                    data: questionResponsesToCreate
                });
        }

        if (questionsIdsToRemove && questionsIdsToRemove.length > 0) {
            await prisma.questions.deleteMany({
                where: {
                    survey_id: Buffer.from(updatedSurvey.id),
                    id: {
                        in: questionsIdsToRemove.map(id => Buffer.from(uuidParse(id)))
                    }
                }
            });
        }

        const existingQuestions = await prisma.questions.findMany({
            where: {
                survey_id: existingSurvey.id
            },
            include: {
                questions_possible_responses: true
            }
        });

        const processedQuestions = existingQuestions.map(question => ({
            ...question,
            id: uuidStringify(question.id),
            survey_id: uuidStringify(question.survey_id),
            question_type_id: uuidStringify(question.question_type_id),
            questions_possible_responses: question.questions_possible_responses.map(response => ({
                ...response,
                id: uuidStringify(response.id),
                question_id: uuidStringify(response.question_id),
            }))
        }));

        const responseData = {
            ...updatedSurvey,
            id: uuidStringify(updatedSurvey.id),
            start_time: updatedSurvey.start_time.toISOString(),
            end_time: updatedSurvey.end_time.toISOString(),
            questions: processedQuestions
        };

        return res.status(200).json(createSuccessResponse(responseData, `Survey updated successfully.`));
    } catch (err) {
        console.error('Error updating survey', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while updating survey. Please try again later.'));
    }
};

export const deleteSurvey = async (req: Request, res: Response) => {
    try {
        const surveyId: string = req.params.surveyId;

        const existingSurvey: surveys | null = await prisma.surveys.findUnique({
            where: {
                id: Buffer.from(uuidParse(surveyId))
            }
        });

        if (!existingSurvey) {
            return res.status(404).json(createErrorResponse(`Survey does not exist.`));
        }

        const deletedSurvey = await prisma.surveys.delete({
            where: {
                id: Buffer.from(uuidParse(surveyId))
            }
        });

        const responseData = {
            ...deletedSurvey,
            id: uuidStringify(deletedSurvey.id),
            start_time: deletedSurvey.start_time.toISOString(),
            end_time: deletedSurvey.end_time.toISOString()
        };

        return res.status(200).json(createSuccessResponse(responseData, `Survey deleted successfully.`));
    } catch (err) {
        console.error('Error deleting survey', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while deleting survey. Please try again later.'));
    }
};

export const sendSurvey = async (req: Request, res: Response) => {
    try {
        const studentId: string = req.body.studentId;
        const surveyId: string = req.body.surveyId;
        const responses: QuestionResponse[] = req.body.responses;

        const existingStudent = await prisma.students.findUnique({
            where: {
                id: Buffer.from(uuidParse(studentId))
            }
        });

        if (!existingStudent) {
            return res.status(404).json(createErrorResponse(`Student does not exist.`));
        }

        const existingSurvey = await prisma.surveys.findUnique({
            where: {
                id: Buffer.from(uuidParse(surveyId))
            },
            include: {
                questions: {
                    include: {
                        questions_possible_responses: true
                    }
                }
            }
        });

        if (!existingSurvey) {
            return res.status(404).json(createErrorResponse(`Survey does not exist.`));
        }

        const surveyQuestions = await prisma.questions.findMany({
            where: {
                survey_id: Buffer.from(surveyId)
            }
        });

        if (surveyQuestions.length !== responses.length) {
            return res.status(404).json(createErrorResponse(`Survey is not complete.`));
        }

        const responsesToCreate: {
            content: string;
            student_id: Buffer,
            question_id: Buffer
        }[] = [];

        for (var response of responses) {
            const existingQuestion = await prisma.questions.findUnique({
                where: {
                    id: Buffer.from(uuidParse(response.questionId))
                },
                include: {
                    questions_types: true
                }
            });

            if (!existingQuestion) {
                return res.status(404).json(createErrorResponse(`Question does not exist.`));
            }

            if (existingQuestion.questions_types.name === QuestionType.Closed) {
                const possibleResponses = await prisma.questions_possible_responses.findMany({
                    where: {
                        question_id: existingQuestion.id
                    }
                });

                let answerExist = false;

                for (var possibleResponse of possibleResponses) {
                    if (possibleResponse.content === response.content) {
                        answerExist = true;
                        break;
                    }
                }

                if (!answerExist) {
                    return res.status(404).json(createErrorResponse(`Answer does not exist.`));
                }
            }

            responsesToCreate.push({
                content: response.content,
                student_id: Buffer.from(existingStudent.id),
                question_id: Buffer.from(existingQuestion.id),
            })
        }

        const payload = await prisma.questions_responses.createMany({
            data: responsesToCreate
        });

        return res.status(200).json(createSuccessResponse(payload.count, `Survey submitted successfully.`));
    } catch (err) {
        console.error('Error submitting survey', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while submitting survey. Please try again later.'));
    }
};