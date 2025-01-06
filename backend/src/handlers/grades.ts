import { Request, Response } from 'express';
import prisma from '../db';
import { grades_gradebook, subjects, classes, students, teachers, final_grades, semesters } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';
import { Buffer } from 'node:buffer';

export const createGrade = async (req: Request, res: Response) => {
    try {
        const description: string = req.body.description;
        const grade: number = req.body.grade;
        const weight: number = req.body.weight;
        const studentId: string = req.body.studentId;
        const subjectId: string = req.body.subjectId;
        const teacherId: string = req.body.teacherId;

        const existingStudent: students | null = await prisma.students.findUnique({
            where: {
                id: Buffer.from(uuidParse(studentId))
            }
        });

        if (!existingStudent) {
            return res.status(404).json(createErrorResponse(`Student does not exist.`));
        }

        const existingSubject: subjects | null = await prisma.subjects.findUnique({
            where: {
                id: Buffer.from(uuidParse(subjectId))
            }
        });

        if (!existingSubject) {
            return res.status(404).json(createErrorResponse(`Subject does not exist.`));
        }

        const existingTeacher: teachers | null = await prisma.teachers.findUnique({
            where: {
                id: Buffer.from(uuidParse(teacherId))
            }
        });

        if (!existingTeacher) {
            return res.status(404).json(createErrorResponse(`Teacher does not exist.`));
        }

        const createdGrade = await prisma.grades_gradebook.create({
            data: {
                description: description,
                grade: grade,
                weight: weight,
                date_given: new Date(),
                student_id: Buffer.from(uuidParse(studentId)),
                subject_id: Buffer.from(uuidParse(subjectId)),
                teacher_id: Buffer.from(uuidParse(teacherId))
            }
        });

        const responseData = {
            ...createdGrade,
            id: uuidStringify(createdGrade.id),
            date_given: createdGrade.date_given.toISOString(),
            student_id: uuidStringify(createdGrade.student_id),
            subject_id: uuidStringify(createdGrade.subject_id),
            teacher_id: uuidStringify(createdGrade.teacher_id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Grade created successfully.`));
    } catch (err) {
        console.error('Error creating grade', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating grade. Please try again later.'));
    }
};

export const createFinalGrade = async (req: Request, res: Response) => {
    try {
        const grade: number = req.body.grade;
        const studentId: string = req.body.studentId;
        const subjectId: string = req.body.subjectId;
        const teacherId: string = req.body.teacherId;
        const semesterId: string = req.body.semesterId;

        const existingStudent: students | null = await prisma.students.findUnique({
            where: {
                id: Buffer.from(uuidParse(studentId))
            }
        });

        if (!existingStudent) {
            return res.status(404).json(createErrorResponse(`Student does not exist.`));
        }

        const existingSubject: subjects | null = await prisma.subjects.findUnique({
            where: {
                id: Buffer.from(uuidParse(subjectId))
            }
        });

        if (!existingSubject) {
            return res.status(404).json(createErrorResponse(`Subject does not exist.`));
        }

        const existingTeacher: teachers | null = await prisma.teachers.findUnique({
            where: {
                id: Buffer.from(uuidParse(teacherId))
            }
        });

        if (!existingTeacher) {
            return res.status(404).json(createErrorResponse(`Teacher does not exist.`));
        }

        const existingSemester: semesters | null = await prisma.semesters.findUnique({
            where: {
                id: Buffer.from(uuidParse(semesterId))
            }
        });

        if (!existingSemester) {
            return res.status(404).json(createErrorResponse(`Semester does not exist.`));
        }

        const existingGrade: final_grades | null = await prisma.final_grades.findFirst({
            where: {
                student_id: Buffer.from(uuidParse(studentId)),
                subject_id: Buffer.from(uuidParse(subjectId)),
                semester_id: Buffer.from(uuidParse(semesterId))
            }
        });

        if (existingGrade) {
            return res.status(404).json(createErrorResponse(`Final grade already exists.`));
        }

        const createdGrade = await prisma.final_grades.create({
            data: {
                grade: grade,
                student_id: Buffer.from(uuidParse(studentId)),
                subject_id: Buffer.from(uuidParse(subjectId)),
                teacher_id: Buffer.from(uuidParse(teacherId)),
                semester_id: Buffer.from(uuidParse(semesterId))
            }
        });

        const responseData = {
            ...createdGrade,
            id: uuidStringify(createdGrade.id),
            student_id: uuidStringify(createdGrade.student_id),
            subject_id: uuidStringify(createdGrade.subject_id),
            teacher_id: uuidStringify(createdGrade.teacher_id),
            semester_id: uuidStringify(createdGrade.semester_id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Final grade created successfully.`));
    } catch (err) {
        console.error('Error creating final grade', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating final grade. Please try again later.'));
    }
};

export const getGrades = async (req: Request, res: Response) => {
    try {
        const studentId: string = req.params.studentId;
        const subjectId: string = req.params.subjectId;

        const existingStudent: students | null = await prisma.students.findUnique({
            where: {
                id: Buffer.from(uuidParse(studentId))
            }
        });

        if (!existingStudent) {
            return res.status(404).json(createErrorResponse(`Student does not exist.`));
        }

        const existingSubject: subjects | null = await prisma.subjects.findUnique({
            where: {
                id: Buffer.from(uuidParse(subjectId))
            }
        });

        if (!existingSubject) {
            return res.status(404).json(createErrorResponse(`Subject does not exist.`));
        }

        const grades = await prisma.grades_gradebook.findMany({
            where: {
                student_id: Buffer.from(uuidParse(studentId)),
                subject_id: Buffer.from(uuidParse(subjectId))
            }
        });

        const responseData = grades.map(grade => ({
            ...grade,
            id: uuidStringify(grade.id),
            date_given: grade.date_given.toISOString(),
            student_id: uuidStringify(grade.student_id),
            subject_id: uuidStringify(grade.subject_id),
            teacher_id: uuidStringify(grade.teacher_id)
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Grades retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving grades', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving grades. Please try again later.'));
    }
};

export const getAllGradesForStudent = async (req: Request, res: Response) => {
    try {
        const studentId: string = req.params.studentId;

        const existingStudent: students | null = await prisma.students.findUnique({
            where: {
                id: Buffer.from(uuidParse(studentId))
            }
        });

        if (!existingStudent) {
            return res.status(404).json(createErrorResponse(`Student with ID ${studentId} does not exist.`));
        }

        const grades = await prisma.grades_gradebook.findMany({
            where: {
                student_id: Buffer.from(uuidParse(studentId)),
            },
            include: {
                subjects: {
                    select: {
                        name: true
                    }
                },
                teachers: {
                    select: {
                        first_name: true,
                        last_name: true
                    }
                }
            }
        });

        const responseData = grades.map(grade => ({
            id: uuidStringify(grade.id),
            description: grade.description,
            grade: grade.grade,
            weight: grade.weight,
            date_given: grade.date_given.toISOString(),
            subject_id: uuidStringify(grade.subject_id),
            teacher_id: uuidStringify(grade.teacher_id),
            subject: grade.subjects.name,
            teacher_first_name: grade.teachers.first_name,
            teacher_last_name: grade.teachers.last_name
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Grades retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving grades', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving grades. Please try again later.'));
    }
};

export const getThreeLatestGrades = async (req: Request, res: Response) => {
    try {
        const studentId: string = req.params.studentId;

        const existingStudent: students | null = await prisma.students.findUnique({
            where: {
                id: Buffer.from(uuidParse(studentId))
            }
        });

        if (!existingStudent) {
            return res.status(404).json(createErrorResponse(`Student does not exist.`));
        }

        const grades = await prisma.grades_gradebook.findMany({
            where: {
                student_id: Buffer.from(uuidParse(studentId))
            },
            orderBy: {
                date_given: 'desc'
            },
            take: 3
        });

        const responseData = grades.map(grade => ({
            ...grade,
            id: uuidStringify(grade.id),
            date_given: grade.date_given.toISOString(),
            student_id: uuidStringify(grade.student_id),
            subject_id: uuidStringify(grade.subject_id),
            teacher_id: uuidStringify(grade.teacher_id)
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Three latest grades retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving three latest grades', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving three latest grades. Please try again later.'));
    }
};

export const getFinalGrades = async (req: Request, res: Response) => {
    try {
        const studentId: string = req.params.studentId;

        const existingStudent: students | null = await prisma.students.findUnique({
            where: {
                id: Buffer.from(uuidParse(studentId))
            }
        });

        if (!existingStudent) {
            return res.status(404).json(createErrorResponse(`Student does not exist.`));
        }

        const grades = await prisma.final_grades.findMany({
            where: {
                student_id: Buffer.from(uuidParse(studentId)),
            }
        });

        const responseData = grades.map(grade => ({
            ...grade,
            id: uuidStringify(grade.id),
            student_id: uuidStringify(grade.student_id),
            subject_id: uuidStringify(grade.subject_id),
            teacher_id: uuidStringify(grade.teacher_id),
            semester_id: uuidStringify(grade.semester_id)
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Final grades retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving final grades', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving final grades. Please try again later.'));
    }
};

export const updateGrade = async (req: Request, res: Response) => {
    try {
        const gradeId: string = req.params.gradeId;
        const description: string = req.body.description;
        const grade: number = req.body.grade;
        const weight: number = req.body.weight;

        const existingGrade: grades_gradebook | null = await prisma.grades_gradebook.findUnique({
            where: {
                id: Buffer.from(uuidParse(gradeId))
            }
        });

        if (!existingGrade) {
            return res.status(404).json(createErrorResponse(`Grade does not exist.`));
        }

        const data: { description?: string, grade?: number, weight?: number } = {};

        if (description) data.description = description;
        if (grade) data.grade = grade;
        if (weight) data.weight = weight;

        const updatedGrade = await prisma.grades_gradebook.update({
            where: {
                id: Buffer.from(uuidParse(gradeId))
            },
            data: data
        });

        const responseData = {
            ...updatedGrade,
            id: uuidStringify(updatedGrade.id),
            date_given: updatedGrade.date_given.toISOString(),
            student_id: uuidStringify(updatedGrade.student_id),
            subject_id: uuidStringify(updatedGrade.subject_id),
            teacher_id: uuidStringify(updatedGrade.teacher_id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Grade updated successfully.`));
    } catch (err) {
        console.error('Error updating grade', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while updating grade. Please try again later.'));
    }
};

export const updateFinalGrade = async (req: Request, res: Response) => {
    try {
        const gradeId: string = req.params.gradeId;
        const grade: number = req.body.grade;

        const existingGrade: final_grades | null = await prisma.final_grades.findUnique({
            where: {
                id: Buffer.from(uuidParse(gradeId))
            }
        });

        if (!existingGrade) {
            return res.status(404).json(createErrorResponse(`Final grade does not exist.`));
        }

        const updatedGrade = await prisma.final_grades.update({
            where: {
                id: Buffer.from(uuidParse(gradeId))
            },
            data: {
                grade: grade
            }
        });

        const responseData = {
            ...updatedGrade,
            id: uuidStringify(updatedGrade.id),
            student_id: uuidStringify(updatedGrade.student_id),
            subject_id: uuidStringify(updatedGrade.subject_id),
            teacher_id: uuidStringify(updatedGrade.teacher_id),
            semester_id: uuidStringify(updatedGrade.semester_id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Final grade updated successfully.`));
    } catch (err) {
        console.error('Error updating final grade', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while updating final grade. Please try again later.'));
    }
};

export const deleteGrade = async (req: Request, res: Response) => {
    try {
        const gradeId: string = req.params.gradeId;

        const existingGrade: grades_gradebook | null = await prisma.grades_gradebook.findUnique({
            where: {
                id: Buffer.from(uuidParse(gradeId))
            }
        });

        if (!existingGrade) {
            return res.status(404).json(createErrorResponse(`Grade does not exist.`));
        }

        const deletedGrade = await prisma.grades_gradebook.delete({
            where: {
                id: Buffer.from(uuidParse(gradeId))
            }
        });

        const responseData = {
            ...deletedGrade,
            id: uuidStringify(deletedGrade.id),
            date_given: deletedGrade.date_given.toISOString(),
            student_id: uuidStringify(deletedGrade.student_id),
            subject_id: uuidStringify(deletedGrade.subject_id),
            teacher_id: uuidStringify(deletedGrade.teacher_id)
        };

        return res.status(200).json(createSuccessResponse(responseData, `Grade deleted successfully.`));
    } catch (err) {
        console.error('Error deleting grade', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while deleting grade. Please try again later.'));
    }
};

export const deleteFinalGrade = async (req: Request, res: Response) => {
    try {
        const gradeId: string = req.params.gradeId;

        const existingGrade: final_grades | null = await prisma.final_grades.findUnique({
            where: {
                id: Buffer.from(uuidParse(gradeId))
            }
        });

        if (!existingGrade) {
            return res.status(404).json(createErrorResponse(`Final grade does not exist.`));
        }

        const deletedGrade = await prisma.final_grades.delete({
            where: {
                id: Buffer.from(uuidParse(gradeId))
            }
        });

        const responseData = {
            ...deletedGrade,
            id: uuidStringify(deletedGrade.id),
            student_id: uuidStringify(deletedGrade.student_id),
            subject_id: uuidStringify(deletedGrade.subject_id),
            teacher_id: uuidStringify(deletedGrade.teacher_id),
            semester_id: uuidStringify(deletedGrade.semester_id),
        };

        return res.status(200).json(createSuccessResponse(responseData, `Final grade deleted successfully.`));
    } catch (err) {
        console.error('Error deleting final grade', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while deleting final grade. Please try again later.'));
    }
};

export const getAllGrades = async (req: Request, res: Response) => {
    try {

        const grades = await prisma.grades_gradebook.findMany({
            include: {
                subjects: {
                    select: {
                        name: true
                    }
                },
                teachers: {
                    select: {
                        first_name: true,
                        last_name: true
                    }
                }
            }
        });

        const responseData = grades.map(grade => ({
            id: uuidStringify(grade.id),
            description: grade.description,
            grade: grade.grade,
            date_given: grade.date_given.toISOString(),
            student_id: uuidStringify(grade.student_id),
            subject_id: uuidStringify(grade.subject_id),
            teacher_id: uuidStringify(grade.teacher_id),
            subject: grade.subjects.name,
            teacher_first_name: grade.teachers.first_name,
            teacher_last_name: grade.teachers.last_name
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Grades retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving grades', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving grades. Please try again later.'));
    }
};