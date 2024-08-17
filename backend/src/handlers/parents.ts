import { Request, Response } from 'express';
import { signUp } from './users';

export const signUpParent = (req: Request, res: Response) => {
    return signUp(req, res, 'parents');
};