import { Request, Response } from 'express';
import LoginCredentialsI from "../interfaces/loginCredentials.js";
import RegisterCredentialsI from '../interfaces/registerCredentials.js';
import prisma from '../db.js';
import { students, teachers, parents, administrators } from '@prisma/client';
import { comparePasswords, generateJWT, hashPassword } from '../modules/auth';
import AuthUser from '../interfaces/authUser.js';
import nodemailer from 'nodemailer';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces.js';

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

if (!SMTP_USER || !SMTP_PASS) {
    console.error('Missing required environment variables');
    process.exit(1);
}

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

        let existingUser: students | teachers | parents | administrators | null = await prisma.students.findUnique(criteria);
        let role: 'student' | 'teacher' | 'parent' | 'administrator' | 'unknown' = 'unknown';

        if (existingUser) {
            role = 'student';
        } else if (!existingUser) {
            existingUser = await prisma.teachers.findUnique(criteria);
            if (existingUser) {
                role = "teacher";
            }
        }

        if (!existingUser) {
            existingUser = await prisma.parents.findUnique(criteria);
            if (existingUser) {
                role = "parent";
            }
        }

        if (!existingUser) {
            existingUser = await prisma.administrators.findUnique(criteria);
            if (existingUser) {
                role = "administrator";
            }
        }

        if (!existingUser || role === 'unknown') {
            return res.status(404).json(createErrorResponse('Invalid credentials.'));
        }

        const isValid = await comparePasswords(credentials.password, existingUser.password);
        if (!isValid) {
            return res.status(401).json(createErrorResponse('Invalid credentials.'));
        }

        const authUser: AuthUser = {
            email: existingUser.email,
            firstName: existingUser.first_name,
            lastName: existingUser.last_name,
            role: role
        };

        const jwt = generateJWT(authUser);

        return res.status(200).json(createSuccessResponse(jwt, 'User signed in successfully.'));
    } catch (err) {
        console.error('Error signing in', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while signing in. Please try again later.'));
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

        let existingUsers: students[] | teachers[] | parents[] | administrators[] | null = null;

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
            return res.status(409).json(createErrorResponse('User with specified details already exists.'));
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

        return res.status(200).json(createSuccessResponse(createdUser.id, 'User signed up successfully.'));
    } catch (err) {
        console.error('Error signing up', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while signing up. Please try again later.'));
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const email = req.body.email;

        const criteria = {
            where: {
                email: email
            }
        }

        let existingUser: students | teachers | parents | administrators | null = await prisma.students.findUnique(criteria);
        let role: 'student' | 'teacher' | 'parent' | 'administrator' | 'unknown' = 'unknown';

        if (existingUser) {
            role = 'student';
        } else if (!existingUser) {
            existingUser = await prisma.teachers.findUnique(criteria);
            if (existingUser) {
                role = "teacher";
            }
        }

        if (!existingUser) {
            existingUser = await prisma.parents.findUnique(criteria);
            if (existingUser) {
                role = "parent";
            }
        }

        if (!existingUser) {
            existingUser = await prisma.administrators.findUnique(criteria);
            if (existingUser) {
                role = "administrator";
            }
        }

        if (!existingUser || role === 'unknown') {
            return res.status(404).json(createErrorResponse('Invalid credential.'));
        }

        const authUser: AuthUser = {
            email: existingUser.email,
            firstName: existingUser.first_name,
            lastName: existingUser.last_name,
            role: role
        };

        const jwt = generateJWT(authUser);

        const dataToUpdate = {
            where: {
                email: email
            },
            data: {
                reset_password_token: jwt,
                reset_password_expires: new Date(Date.now() + 3600000)
            }
        }

        let updatedUser: students | teachers | parents | administrators;
        switch (role) {
            case 'student':
                updatedUser = await prisma.students.update(dataToUpdate);
                break;
            case 'teacher':
                updatedUser = await prisma.teachers.update(dataToUpdate);
                break;
            case 'parent':
                updatedUser = await prisma.parents.update(dataToUpdate);
                break;
            case 'administrator':
                updatedUser = await prisma.administrators.update(dataToUpdate);
                break;
        }

        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS
            },
        });

        const message = {
            from: "sender@server.com",
            to: "receiver@sender.com",
            subject: "Password Reset",
            text: `Click the following link to reset your password: http://localhost:3000/reset-password/${jwt}`
        };

        transporter.sendMail(message, (err, info) => {
            if (err) {
                return res.status(500).json(createErrorResponse('Error sending email.'));
            }
            return res.status(200).json(createSuccessResponse(info.messageId, 'Password reset email sent successfully.'));
        });
    } catch (err) {
        console.error('Error recovering password', err);
        res.status(500).json('An unexpected error occurred while recovering the password. Please try again later.');
    }
}

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const payload: AuthUser = req.body.payload;
        const password = req.body.password;

        const criteria = {
            where: {
                email: payload.email
            }
        }

        let existingUser: students | teachers | parents | administrators | null = await prisma.students.findUnique(criteria);

        if (!existingUser) {
            existingUser = await prisma.teachers.findUnique(criteria);
        }

        if (!existingUser) {
            existingUser = await prisma.parents.findUnique(criteria);
        }

        if (!existingUser) {
            existingUser = await prisma.administrators.findUnique(criteria);
        }

        if (!existingUser || !existingUser.reset_password_expires || existingUser.reset_password_expires < new Date()) {
            return res.status(400).json(createErrorResponse('Password reset token is invalid or has expired.'));
        }

        const hashedPassword = await hashPassword(password);

        const dataToUpdate = {
            where: {
                email: payload.email
            },
            data: {
                password: hashedPassword,
                reset_password_token: null,
                reset_password_expires: null
            }
        };

        let updatedUser: students | teachers | parents | administrators;
        switch (payload.role) {
            case 'student':
                updatedUser = await prisma.students.update(dataToUpdate);
                break;
            case 'teacher':
                updatedUser = await prisma.teachers.update(dataToUpdate);
                break;
            case 'parent':
                updatedUser = await prisma.parents.update(dataToUpdate);
                break;
            case 'administrator':
                updatedUser = await prisma.administrators.update(dataToUpdate);
                break;
        }

        return res.status(200).json(createSuccessResponse(updatedUser.id, `Successful password reset for user with ID '${updatedUser.id}'.`))

    } catch (err) {
        console.error('Error resetting password', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while resetting the password. Please try again later.'));
    }
}