import { Request, Response } from 'express';
import LoginCredentialsI from "../interfaces/loginCredentials.js";
import RegisterCredentialsI from '../interfaces/registerCredentials.js';
import prisma from '../db.js';
import { students, teachers, parents } from '@prisma/client';
import { comparePasswords, generateJWT, hashPassword } from '../modules/auth';
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

export const signUp = async (req: Request, res: Response, targetGroup: 'students' | 'teachers' | 'parents') => {
    try {
        const credentials: RegisterCredentialsI = {
            pesel: req.body.pesel,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        };

        if (!credentials.email || !credentials.password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        if (credentials.password !== credentials.passwordConfirm) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }

        let existingUsers: students[] | teachers[] | parents[] | null = null;

        const criteria = {
            where: {
                OR: [
                    {
                        pesel: credentials.pesel
                    },
                    {
                        email: credentials.email
                    },
                    {
                        phone_number: credentials.phoneNumber
                    },
                ],
            }
        }

        switch (targetGroup) {
            case 'students':
                existingUsers = await prisma.students.findMany(criteria);
                break;
            case 'teachers':
                existingUsers = await prisma.teachers.findMany(criteria);
                break;
            case 'parents':
                existingUsers = await prisma.parents.findMany(criteria);
                break;
        }


        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'User with specified details already exists.' });
        }

        const hashedPassword = await hashPassword(credentials.password);
        const dataToCreate = {
            data: {
                pesel: credentials.pesel,
                email: credentials.email,
                phone_number: credentials.phoneNumber,
                password: hashedPassword,
                first_name: credentials.firstName,
                last_name: credentials.lastName,
            }
        }

        let createdUser: students | teachers | parents;
        switch (targetGroup) {
            case 'students':
                createdUser = await prisma.students.create(dataToCreate);
                break;
            case 'teachers':
                createdUser = await prisma.teachers.create(dataToCreate);
                break;
            case 'parents':
                createdUser = await prisma.parents.create(dataToCreate);
                break;
        }

        return res.json(createdUser.id);
    } catch (err) {
        console.error('Error signing up', err);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};