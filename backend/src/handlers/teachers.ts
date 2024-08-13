import { Request, Response } from 'express';
import { signUp } from './users';

export const signUpTeacher = (req: Request, res: Response) => {
    return signUp(req, res, 'teachers');
};