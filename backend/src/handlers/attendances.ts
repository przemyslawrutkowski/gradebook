import { Request, Response } from 'express';
import prisma from '../db';
import Attendance from '../interfaces/attendance';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { parse as uuidParse } from 'uuid';
import { Buffer } from 'node:buffer';

export const createAttendances = async (req: Request, res: Response) => {
    try {
        const attendances: Attendance[] = req.body.attendances;

        const payload = await prisma.attendances.createMany({
            data: attendances.map((attendance) => {
                return {
                    was_present: attendance.wasPresent,
                    student_id: Buffer.from(uuidParse(attendance.studentId)),
                    lesson_id: Buffer.from(uuidParse(attendance.lessonId))
                };
            })
        });

        return res.status(200).json(createSuccessResponse(payload.count, `Attendances list created successfully.`));
    } catch (err) {
        console.error('Error creating attendances list', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating attendances list. Please try again later.'));
    }
};

export const getAttendances = async (req: Request, res: Response) => {
    try {
        const lessonId: string = req.params.lessonId;

        const attendances = await prisma.attendances.findMany({
            where: {
                lesson_id: Buffer.from(uuidParse(lessonId))
            }
        });

        return res.status(200).json(createSuccessResponse(attendances, `Attendances retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving attendances', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving attendances. Please try again later.'));
    }
};

export const updateAttendance = async (req: Request, res: Response) => {
    try {
        const studentId: string = req.params.studentId;
        const lessonId: string = req.params.lessonId;
        const wasPresent: boolean = req.body.wasPresent;

        const attendance = await prisma.attendances.findUnique({
            where: {
                student_id_lesson_id: {
                    student_id: Buffer.from(uuidParse(studentId)),
                    lesson_id: Buffer.from(uuidParse(lessonId))
                }
            }
        });

        if (!attendance) {
            return res.status(404).json(createErrorResponse(`Attendance not found.`));
        }

        const updatedAttendance = await prisma.attendances.update({
            where: {
                student_id_lesson_id: {
                    student_id: Buffer.from(uuidParse(studentId)),
                    lesson_id: Buffer.from(uuidParse(lessonId))
                }
            },
            data: {
                was_present: wasPresent
            }
        });

        return res.status(200).json(createSuccessResponse(updatedAttendance, `Attendance updated successfully.`));
    } catch (err) {
        console.error('Error updating attendance', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while updating attendance. Please try again later.'));
    }
};