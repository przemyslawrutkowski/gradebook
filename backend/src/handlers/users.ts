import { Request, Response } from 'express';
import prisma from '../db.js';
import { students, teachers, parents, administrators } from '@prisma/client';
import { comparePasswords, generateJWT, hashPassword } from '../modules/auth';
import AuthUser from '../interfaces/authUser.js';
import nodemailer from 'nodemailer';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces.js';
import { SMTP_USER, SMTP_PASS } from '../modules/validateEnv.js';
import { stringify as uuidStringify } from 'uuid';
import { UserType } from '../enums/userTypes.js';

function isStudent(user: students | teachers | parents | administrators): user is students {
    return (user as students).class_id !== undefined;
}

export const signIn = async (req: Request, res: Response) => {
    try {
        const email: string = req.body.email;
        const password: string = req.body.password;

        const criteria = {
            where: {
                email: email
            }
        };

        let existingUser: students | teachers | parents | administrators | null = null;
        let role: UserType = UserType.Unknown;

        if (!existingUser) {
            existingUser = await prisma.students.findUnique(criteria);
            if (existingUser) {
                role = UserType.Student;
            }
        }

        if (!existingUser) {
            existingUser = await prisma.teachers.findUnique(criteria);
            if (existingUser) {
                role = UserType.Teacher;
            }
        }

        if (!existingUser) {
            existingUser = await prisma.parents.findUnique(criteria);
            if (existingUser) {
                role = UserType.Parent;
            }
        }

        if (!existingUser) {
            existingUser = await prisma.administrators.findUnique(criteria);
            if (existingUser) {
                role = UserType.Administrator;
            }
        }

        if (!existingUser) {
            return res.status(404).json(createErrorResponse('Invalid credentials.'));
        }

        const isValid = await comparePasswords(password, existingUser.password);
        if (!isValid) {
            return res.status(401).json(createErrorResponse('Invalid credentials.'));
        }

        const authUser: AuthUser = {
            id: uuidStringify(existingUser.id),
            email: existingUser.email,
            firstName: existingUser.first_name,
            lastName: existingUser.last_name,
            role: role
        };

        const responseData = {
            jwt: generateJWT(authUser),
            id: uuidStringify(existingUser.id)
        };

        return res.status(200).json(createSuccessResponse(responseData, 'Signed in successfully.'));
    } catch (err) {
        console.error('Error signing in', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while signing in. Please try again later.'));
    }
};

export const signUp = async (req: Request, res: Response, role: UserType) => {
    try {
        if (role === UserType.Unknown) {
            return res.status(422).json(createErrorResponse('Invalid user type.'));
        }

        const pesel: string = req.body.pesel;
        const email: string = req.body.email;
        const phoneNumber: string = req.body.phoneNumber;
        const password: string = req.body.password;
        const firstName: string = req.body.firstName;
        const lastName: string = req.body.lastName;

        const criteria = {
            where: {
                OR: [
                    {
                        pesel: pesel
                    },
                    {
                        email: email
                    },
                    {
                        phone_number: phoneNumber
                    }
                ],
            }
        }

        let existingUsers: students[] | teachers[] | parents[] | administrators[] | null = null;

        switch (role) {
            case UserType.Student:
                existingUsers = await prisma.students.findMany(criteria);
                break;
            case UserType.Teacher:
                existingUsers = await prisma.teachers.findMany(criteria);
                break;
            case UserType.Parent:
                existingUsers = await prisma.parents.findMany(criteria);
                break;
            case UserType.Administrator:
                existingUsers = await prisma.administrators.findMany(criteria);
                break;
        }

        if (existingUsers.length > 0) {
            return res.status(409).json(createErrorResponse('User already exists.'));
        }

        const hashedPassword = await hashPassword(password);
        const dataToCreate = {
            data: {
                pesel: pesel,
                email: email,
                phone_number: phoneNumber,
                password: hashedPassword,
                first_name: firstName,
                last_name: lastName,
            }
        }

        let createdUser: students | teachers | parents | administrators;
        switch (role) {
            case UserType.Student:
                createdUser = await prisma.students.create(dataToCreate);
                break;
            case UserType.Teacher:
                createdUser = await prisma.teachers.create(dataToCreate);
                break;
            case UserType.Parent:
                createdUser = await prisma.parents.create(dataToCreate);
                break;
            case UserType.Administrator:
                createdUser = await prisma.administrators.create(dataToCreate);
                break;
        }

        return res.status(200).json(createSuccessResponse(uuidStringify(createdUser.id), 'Signed up successfully.'));
    } catch (err) {
        console.error('Error signing up', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while signing up. Please try again later.'));
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const email: string = req.body.email;

        const criteria = {
            where: {
                email: email
            }
        }

        let existingUser: students | teachers | parents | administrators | null = null;
        let role: UserType = UserType.Unknown;

        if (!existingUser) {
            existingUser = await prisma.students.findUnique(criteria);
            if (existingUser) {
                role = UserType.Student;
            }
        }

        if (!existingUser) {
            existingUser = await prisma.teachers.findUnique(criteria);
            if (existingUser) {
                role = UserType.Teacher;
            }
        }

        if (!existingUser) {
            existingUser = await prisma.parents.findUnique(criteria);
            if (existingUser) {
                role = UserType.Parent;
            }
        }

        if (!existingUser) {
            existingUser = await prisma.administrators.findUnique(criteria);
            if (existingUser) {
                role = UserType.Administrator;
            }
        }

        if (!existingUser) {
            return res.status(404).json(createErrorResponse('Invalid credential.'));
        }

        const authUser: AuthUser = {
            id: uuidStringify(existingUser.id),
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
            case UserType.Student:
                updatedUser = await prisma.students.update(dataToUpdate);
                break;
            case UserType.Teacher:
                updatedUser = await prisma.teachers.update(dataToUpdate);
                break;
            case UserType.Parent:
                updatedUser = await prisma.parents.update(dataToUpdate);
                break;
            case UserType.Administrator:
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
        res.status(500).json('An unexpected error occurred while recovering password. Please try again later.');
    }
}

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const user: AuthUser = req.user as AuthUser;
        const password: string = req.body.password;

        if (user.role === UserType.Unknown) {
            return res.status(422).json(createErrorResponse('Invalid user type.'));
        }

        const criteria = {
            where: {
                email: user.email
            }
        }

        let existingUser: students | teachers | parents | administrators | null = null;

        if (!existingUser) {
            existingUser = await prisma.students.findUnique(criteria);
        }

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
            return res.status(400).json(createErrorResponse('Invalid or expired token.'));
        }

        const hashedPassword = await hashPassword(password);

        const dataToUpdate = {
            where: {
                email: user.email
            },
            data: {
                password: hashedPassword,
                reset_password_token: null,
                reset_password_expires: null
            }
        };

        let updatedUser: students | teachers | parents | administrators;
        switch (user.role) {
            case UserType.Student:
                updatedUser = await prisma.students.update(dataToUpdate);
                break;
            case UserType.Teacher:
                updatedUser = await prisma.teachers.update(dataToUpdate);
                break;
            case UserType.Parent:
                updatedUser = await prisma.parents.update(dataToUpdate);
                break;
            case UserType.Administrator:
                updatedUser = await prisma.administrators.update(dataToUpdate);
                break;
        }

        const responseData = {
            ...updatedUser,
            id: uuidStringify(updatedUser.id),
            class_id: isStudent(updatedUser) && updatedUser.class_id ? uuidStringify(updatedUser.class_id) : undefined
        }

        return res.status(200).json(createSuccessResponse(responseData, `Password reset successfully.`))

    } catch (err) {
        console.error('Error resetting password', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while resetting password. Please try again later.'));
    }
}