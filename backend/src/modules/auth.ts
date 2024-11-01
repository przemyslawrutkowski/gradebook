import { SECRET_KEY } from './validateEnv.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import AuthUser from '../interfaces/authUser.js';
import { Request, Response, NextFunction } from 'express';
import { createErrorResponse } from '../interfaces/responseInterfaces.js';
import { UserType } from '../enums/userTypes.js';

export const comparePasswords = (password: string, hash: string) => {
    return bcrypt.compare(password, hash);
};

export const hashPassword = (password: string) => {
    return bcrypt.hash(password, 10);
};

export const generateJWT = (authUser: AuthUser) => {
    return jwt.sign(authUser, SECRET_KEY);
};

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const bearer = req.headers.authorization;
        if (!bearer) {
            return res.status(401).json(createErrorResponse('No token provided.'));
        }

        const token = bearer.split(' ')[1].replace(/"/g, '');
        if (!token) {
            return res.status(401).json(createErrorResponse('Invalid token format.'));
        }

        const payload = jwt.verify(token, SECRET_KEY);
        req.user = payload as AuthUser;
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json(createErrorResponse('Invalid token.'));
    }
}

export const authorize = (roles: UserType[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.user?.role;
        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json(createErrorResponse('Not authorized.'));
        }
        next();
    }
}