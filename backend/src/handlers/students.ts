import { Request, Response } from 'express';
import { signUp } from './users';

export const signUpStudent = (req: Request, res: Response) => {
    return signUp(req, res, 'students');
};