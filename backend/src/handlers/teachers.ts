import { Request, Response } from 'express';
import { signUp } from './users';
import { UserType } from '../enums/userTypes';

export const signUpTeacher = (req: Request, res: Response) => {
    return signUp(req, res, UserType.Teacher);
};