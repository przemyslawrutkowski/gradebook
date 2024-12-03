import { Request, Response } from 'express';
import { signUp } from './users';
import { UserType } from '../enums/userTypes';
import prisma from '../db';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';
import { Buffer } from 'node:buffer';

export const signUpParent = (req: Request, res: Response) => {
    return signUp(req, res, UserType.Parent);
};

export const getAvailableParents = async (req: Request, res: Response) => {
    try {
        const availableParents = await prisma.parents.findMany({
            where: {
                students_parents: {
                    none: {}
                }
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone_number: true,
            },
        });

        const responseData = availableParents.map(parent => ({
            id: uuidStringify(parent.id),
            first_name: parent.first_name,
            last_name: parent.last_name,
            email: parent.email,
            phone_number: parent.phone_number,
        }));

        return res.status(200).json(createSuccessResponse(responseData, `Dostępni rodzice pobrani pomyślnie.`));
    } catch (err) {
        console.error('Error fetching available parents', err);
        return res.status(500).json(createErrorResponse('Wystąpił nieoczekiwany błąd podczas pobierania dostępnych rodziców. Spróbuj ponownie później.'));
    }
};