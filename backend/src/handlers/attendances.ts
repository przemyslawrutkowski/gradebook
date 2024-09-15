import { Request, Response } from 'express';
import prisma from '../db';
import Attendance from '../interfaces/attendance';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';

export const createAttendances = async (req: Request, res: Response) => {
    try {
        const attendances: Attendance[] = req.body.attendances;

        const payload = await prisma.attendances.createMany({
            data: attendances.map((attendance) => {
                return {
                    was_present: attendance.wasPresent,
                    student_id: attendance.studentId,
                    lesson_id: attendance.lessonId
                };
            })
        });

        return res.status(200).json(createSuccessResponse(payload.count, `Attendances list created successfully.`));
    } catch (err) {
        console.error('Error creating attendances list', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating attendances list. Please try again later.'));
    }
}

export const getAttendances = async (req: Request, res: Response) => {
    try {
        const lessonId = Number(req.params.lessonId);

        const attendances = await prisma.attendances.findMany({
            where: {
                lesson_id: lessonId
            }
        });

        return res.status(200).json(createSuccessResponse(attendances, `Attendances retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving attendances', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving attendances. Please try again later.'));
    }
}

export const updateAttendance = async (req: Request, res: Response) => {
    try {
        const studentId = Number(req.params.studentId);
        const lessonId = Number(req.params.lessonId);
        const wasPresent: boolean = req.body.wasPresent;

        const attendance = await prisma.attendances.findUnique({
            where: {
                student_id_lesson_id: {
                    student_id: studentId,
                    lesson_id: lessonId
                }
            }
        });

        if (!attendance) {
            return res.status(404).json(createErrorResponse(`Attendance not found.`));
        }

        const updatedAttendance = await prisma.attendances.update({
            where: {
                student_id_lesson_id: {
                    student_id: studentId,
                    lesson_id: lessonId
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
}