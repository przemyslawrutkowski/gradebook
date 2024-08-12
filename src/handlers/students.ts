import { Request, Response } from 'express';
import prisma from "../db";
import RegisterCredentialsI from "../interfaces/registerCredentials";
import { hashPassword } from '../modules/auth';
import { students } from '@prisma/client';

export const signUpStudent = async (req: Request, res: Response) => {
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

        const students: students[] | null = await prisma.students.findMany({
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
        });

        if (students.length > 0) {
            return res.status(409).json({ message: 'Student with specified details already exists.' });
        }

        const hashedPassword = await hashPassword(credentials.password);
        const createdStudent = await prisma.students.create({
            data: {
                pesel: credentials.pesel,
                email: credentials.email,
                phone_number: credentials.phoneNumber,
                password: hashedPassword,
                first_name: credentials.firstName,
                last_name: credentials.lastName,
            }
        });

        return res.json(createdStudent.id);
    } catch (err) {
        console.error('Error signing up', err);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};