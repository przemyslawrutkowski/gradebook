import { Request, Response } from 'express';
import { signUp } from './users';

export const signUpAdministrator = (req: Request, res: Response) => {
    return signUp(req, res, 'administrators');
};