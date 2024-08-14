import { Request, Response } from 'express';
import { signUp } from './users';

export const signUpStudent = (req: Request, res: Response) => {
    return signUp(req, res, 'students');
};

export const signUpTeacher = (req: Request, res: Response) => {
    return signUp(req, res, 'teachers');
};

export const signUpParent = (req: Request, res: Response) => {
    return signUp(req, res, 'parents');
};

export const signUpAdministrator = (req: Request, res: Response) => {
    return signUp(req, res, 'administrators');
}