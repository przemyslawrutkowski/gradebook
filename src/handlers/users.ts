import { Request, Response } from 'express';
import LoginCredentialsI from "../interfaces/loginCredentials.js";
import RegisterCredentialsI from '../interfaces/registerCredentials.js';
import prisma from '../db.js';
import { students, teachers, parents } from '@prisma/client';
import { comparePasswords, generateJWT } from '../modules/auth';
import UserI from '../interfaces/user.js';

export const signIn = async (req: Request, res: Response) => {
    try {
        const credentials: LoginCredentialsI = {
            email: req.body.email,
            password: req.body.password
        };

        if (!credentials.email || !credentials.password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        let user: students | teachers | parents | null = await prisma.students.findUnique({
            where: {
                email: credentials.email
            }
        });

        if (!user) {
            user = await prisma.teachers.findUnique({
                where: {
                    email: credentials.email
                }
            });
        }

        if (!user) {
            user = await prisma.parents.findUnique({
                where: {
                    email: credentials.email
                }
            });
        }

        if (!user) {
            return res.status(404).json({ message: 'Invalid credentials.' });
        }

        const isValid = await comparePasswords(credentials.password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }


        const jwt = generateJWT(user as UserI);

        return res.json(jwt);
    } catch (err) {
        console.error('Error signing in', err);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};