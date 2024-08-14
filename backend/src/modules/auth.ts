import 'dotenv/config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import AuthUser from '../interfaces/authUser.js';
import { Request, Response, NextFunction } from 'express';

const secretKey = process.env.SECRET_KEY;

if (!secretKey) {
    console.error('Missing required environment variables');
    process.exit(1);
}

export const comparePasswords = (password: string, hash: string) => {
    return bcrypt.compare(password, hash);
};

export const hashPassword = (password: string) => {
    return bcrypt.hash(password, 10);
};

export const generateJWT = (authUser: AuthUser) => {
    return jwt.sign(authUser, secretKey);
};

export const protect = (req: Request, res: Response, next: NextFunction) => {
    try {
        const bearer = req.headers.authorization;
        if (!bearer) {
            return res.status(401).json({ message: 'No token provided.' });
        }

        const token = bearer.split(' ')[1].replace(/"/g, '');
        if (!token) {
            return res.status(401).json({ message: 'Invalid token format.' });
        }

        const payload = jwt.verify(token, secretKey);
        req.body.payload = payload;
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ message: 'Invalid token.' });
    }
}

export const authorize = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.body.payload.role;
        if (!roles.includes(userRole)) {
            return res.status(403).json({ message: 'You are not authorized.' });
        }
        next();
    }
}