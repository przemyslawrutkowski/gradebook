import { Request, Response } from 'express';
import prisma from '../db';
import { questions } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';
import { Buffer } from 'node:buffer';

export const updateQuestion = async (req: Request, res: Response) => {
    try {
        const questionId: string = req.params.surveyId;
        const content: string = req.body.content;

        const existingQuestion: questions | null = await prisma.questions.findUnique({
            where: {
                id: Buffer.from(uuidParse(questionId))
            }
        });

        if (!existingQuestion) {
            return res.status(404).json(createErrorResponse(`Question does not exist.`));
        }

        const updatedQuestion = await prisma.questions.update({
            where: {
                id: Buffer.from(uuidParse(questionId))
            },
            data: {
                content: content
            }
        });

        const responseData = {
            ...updatedQuestion,
            id: uuidStringify(updatedQuestion.id),
            survey_id: uuidStringify(updatedQuestion.survey_id),
            question_type_id: uuidStringify(updatedQuestion.question_type_id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Question updated successfully.`));
    } catch (err) {
        console.error('Error updating question', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while updating question. Please try again later.'));
    }
};

export const deleteQuestion = async (req: Request, res: Response) => {
    try {
        const questionId: string = req.params.questionId;

        const existingQuestion: questions | null = await prisma.questions.findUnique({
            where: {
                id: Buffer.from(uuidParse(questionId))
            }
        });

        if (!existingQuestion) {
            return res.status(404).json(createErrorResponse(`Question does not exist.`));
        }

        const deletedQuestion = await prisma.questions.delete({
            where: {
                id: Buffer.from(uuidParse(questionId))
            },
            include: {
                questions_possible_responses: true
            }
        });

        const responseData = {
            ...deletedQuestion,
            id: uuidStringify(deletedQuestion.id),
            survey_id: uuidStringify(deletedQuestion.survey_id),
            question_type_id: uuidStringify(deletedQuestion.question_type_id),
            survey_possible_responses: deletedQuestion.questions_possible_responses.map(response => ({
                ...response,
                id: uuidStringify(response.id),
                question_id: uuidStringify(response.question_id)
            }))
        };

        return res.status(200).json(createSuccessResponse(responseData, `Question deleted successfully.`));
    } catch (err) {
        console.error('Error deleting question', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while deleting question. Please try again later.'));
    }
};