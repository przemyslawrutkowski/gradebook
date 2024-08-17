import { Request, Response } from 'express';
import LoginCredentialsI from "../interfaces/loginCredentials.js";
import RegisterCredentialsI from '../interfaces/registerCredentials.js';
import prisma from '../db.js';
import { students, teachers, parents, administrators } from '@prisma/client';
import { comparePasswords, generateJWT, hashPassword } from '../modules/auth';
import AuthUser from '../interfaces/authUser.js';

export const signIn = async (req: Request, res: Response) => {
    try {
        const credentials: LoginCredentialsI = {
            email: req.body.email,
            password: req.body.password
        };

        const criteria = {
            where: {
                email: credentials.email
            }
        };

        let user: students | teachers | parents | administrators | null = await prisma.students.findUnique(criteria);
        let role: 'student' | 'teacher' | 'parent' | 'administrator' | 'unknown' = 'unknown';

        if (user) {
            role = 'student';
        } else if (!user) {
            user = await prisma.teachers.findUnique(criteria);
            if (user) {
                role = "teacher";
            }
        }

        if (!user) {
            user = await prisma.parents.findUnique(criteria);
            if (user) {
                role = "parent";
            }
        }

        if (!user) {
            user = await prisma.administrators.findUnique(criteria);
            if (user) {
                role = "administrator";
            }
        }

        if (!user || role === 'unknown') {
            return res.status(404).json({ message: 'Invalid credentials.' });
        }

        const isValid = await comparePasswords(credentials.password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const authUser: AuthUser = {
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: role
        }

        const jwt = generateJWT(authUser);

        return res.json(jwt);
    } catch (err) {
        console.error('Error signing in', err);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

export const signUp = async (req: Request, res: Response, targetGroup: 'students' | 'teachers' | 'parents' | 'administrators') => {
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

        let existingUsers: students[] | teachers[] | parents[] | administrators[] | null = null;

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
            case 'administrators':
                existingUsers = await prisma.administrators.findMany(criteria);
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

        let createdUser: students | teachers | parents | administrators;
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
            case 'administrators':
                createdUser = await prisma.administrators.create(dataToCreate);
                break;
        }

        return res.status(200).json(createdUser.id);
    } catch (err) {
        console.error('Error signing up', err);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};