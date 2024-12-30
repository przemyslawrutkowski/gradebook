import { Request, Response } from 'express';
import prisma from '../db';
import { students, classes, teachers, class_names, school_years } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { parse as uuidParse, stringify as uuidStringify } from 'uuid';
import { Buffer } from 'node:buffer';

export const createClass = async (req: Request, res: Response) => {
    try {
        const classNameId: string = req.body.classNameId;
        const schoolYearId: string = req.body.schoolYearId;

        const existingClassName: class_names | null = await prisma.class_names.findUnique({
            where: {
                id: Buffer.from(uuidParse(classNameId))
            }
        });

        if (!existingClassName) {
            return res.status(404).json(createErrorResponse(`Class name does not exist.`));
        }

        const existingSchoolYear: school_years | null = await prisma.school_years.findUnique({
            where: {
                id: Buffer.from(uuidParse(schoolYearId))
            }
        });

        if (!existingSchoolYear) {
            return res.status(404).json(createErrorResponse(`School year does not exist.`));
        }

        const existingClass: classes | null = await prisma.classes.findUnique({
            where: {
                class_name_id_school_year_id: {
                    class_name_id: Buffer.from(uuidParse(classNameId)),
                    school_year_id: Buffer.from(uuidParse(schoolYearId))
                }
            }
        });

        if (existingClass) {
            return res.status(409).json(createErrorResponse(`Class already exists.`));
        }

        const createdClass = await prisma.classes.create({
            data: {
                class_name_id: Buffer.from(uuidParse(classNameId)),
                school_year_id: Buffer.from(uuidParse(schoolYearId))
            }
        });

        const responseData = {
            ...createdClass,
            id: uuidStringify(createdClass.id),
            class_name_id: uuidStringify(createdClass.class_name_id),
            school_year_id: uuidStringify(createdClass.school_year_id),
        };

        return res.status(200).json(createSuccessResponse(responseData, `Class created successfully.`));
    } catch (err) {
        console.error('Error creating class', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while creating class. Please try again later.'));
    }
};

export const getClasses = async (req: Request, res: Response) => {
    try {
        const classesData: (classes & {
            class_names: class_names;
            school_years: school_years;
            teachers: teachers | null;
            _count: { students: number }
        })[] = await prisma.classes.findMany({
            include: {
                class_names: true,
                school_years: true,
                teachers: true,
                _count: {
                    select: { students: true },
                },
            },
        });

        const responseData = classesData.map(cls => ({
            ...cls,
            id: uuidStringify(cls.id),
            class_name_id: uuidStringify(cls.class_name_id),
            school_year_id: uuidStringify(cls.school_year_id),
            teacher_id: cls.teacher_id ? uuidStringify(cls.teacher_id) : null,
            class_names: {
                ...cls.class_names,
                id: uuidStringify(cls.class_names.id),
            },
            school_years: {
                ...cls.school_years,
                id: uuidStringify(cls.school_years.id),
            },
            teachers: cls.teachers ? {
                ...cls.teachers,
                id: uuidStringify(cls.teachers.id),
            } : null,
            studentCount: cls._count.students,
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Classes retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving classes', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving classes. Please try again later.'));
    }
};

export const getClassById = async (req: Request, res: Response) => {
    try {
        const classId = req.params.classId;

        const existingClass = await prisma.classes.findUnique({
            where: {
                id: Buffer.from(uuidParse(classId))
            },
            include: {
                class_names: true,
                school_years: true,
                teachers: true,
                students: true,
                _count: {
                    select: { students: true },
                }
            },
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse('Class does not exist.'));
        }

        const responseData = {
            ...existingClass,
            id: uuidStringify(existingClass.id),
            class_name_id: uuidStringify(existingClass.class_name_id),
            school_year_id: uuidStringify(existingClass.school_year_id),
            teacher_id: existingClass.teacher_id ? uuidStringify(existingClass.teacher_id) : null,
            class_names: {
                ...existingClass.class_names,
                id: uuidStringify(existingClass.class_names.id),
            },
            school_years: {
                ...existingClass.school_years,
                id: uuidStringify(existingClass.school_years.id),
            },
            teachers: existingClass.teachers ? {
                ...existingClass.teachers,
                id: uuidStringify(existingClass.teachers.id),
                reset_password_token: null,
                reset_password_expires: null
            } : null,
            students: existingClass.students.map(student => ({
                ...student,
                id: uuidStringify(student.id),
                reset_password_token: null,
                reset_password_expires: null,
                class_id: student.class_id ? uuidStringify(student.class_id) : null
            })),
            studentCount: existingClass._count.students
        };

        return res.status(200).json(createSuccessResponse(responseData, 'Class retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving class by ID', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving the class. Please try again later.'));
    }
};

export const getStudents = async (req: Request, res: Response) => {
    try {
        const classId: string = req.params.classId;

        const existingClass: classes | null = await prisma.classes.findUnique({
            where: {
                id: Buffer.from(uuidParse(classId))
            }
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse(`Class does not exist.`));
        }

        const students = await prisma.students.findMany({
            where: {
                class_id: Buffer.from(uuidParse(classId))
            }
        });

        const responseData = students.map(student => ({
            ...student,
            id: uuidStringify(student.id),
            reset_password_token: null,
            reset_password_expires: null,
            class_id: student.class_id ? uuidStringify(student.class_id) : null
        }));

        return res.status(200).json(createSuccessResponse(responseData, `Students retrieved successfully.`));
    } catch (err) {
        console.error('Error retrieving students', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving students. Please try again later.'));
    }
};

export const getStudentClassId = async (req: Request, res: Response) => {
    try {
        const studentId: string = req.params.studentId;

        const existingStudent = await prisma.students.findUnique({
            where: {
                id: Buffer.from(uuidParse(studentId))
            }
        });

        if (!existingStudent) {
            return res.status(404).json(createErrorResponse('Student does not exist.'));
        }

        if (!existingStudent.class_id) {
            return res.status(404).json(createErrorResponse('Student is not assigned to any class.'));
        }

        return res.status(200).json(createSuccessResponse(uuidStringify(existingStudent.class_id), 'Class ID successfully retrieved.'));
    } catch (err) {
        console.error('Error occured while retrieving student\'s class ID', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving student\'s class ID. Please try again later.'));
    }
};

export const updateClass = async (req: Request, res: Response) => {
    try {
        const classId: string = req.params.classId;
        const classNameId: string | undefined = req.body.classNameId;
        const schoolYearId: string | undefined = req.body.schoolYearId;
        const teacherId: string | undefined = req.body.teacherId;

        const existingClass: classes | null = await prisma.classes.findUnique({
            where: {
                id: Buffer.from(uuidParse(classId))
            }
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse(`Class does not exist.`));
        }

        const data: { class_name_id?: Buffer, school_year_id?: Buffer, teacher_id?: Buffer } = {};

        if (classNameId) {
            const existingClassName: class_names | null = await prisma.class_names.findUnique({
                where: {
                    id: Buffer.from(uuidParse(classNameId))
                }
            });

            if (!existingClassName) {
                return res.status(404).json(createErrorResponse(`Class name does not exist.`));
            }

            data.class_name_id = Buffer.from(uuidParse(classNameId));
        }

        if (schoolYearId) {
            const existingSchoolYear: school_years | null = await prisma.school_years.findUnique({
                where: {
                    id: Buffer.from(uuidParse(schoolYearId))
                }
            });

            if (!existingSchoolYear) {
                return res.status(404).json(createErrorResponse(`School year does not exist.`));
            }

            data.school_year_id = Buffer.from(uuidParse(schoolYearId));
        }

        if (teacherId) {
            const existingTeacher: teachers | null = await prisma.teachers.findUnique({
                where: {
                    id: Buffer.from(uuidParse(teacherId))
                }
            });

            if (!existingTeacher) {
                return res.status(404).json(createErrorResponse(`Teacher does not exist.`));
            }

            data.teacher_id = Buffer.from(uuidParse(teacherId));
        }

        const updatedClass = await prisma.classes.update({
            where: {
                id: Buffer.from(uuidParse(classId))
            },
            data: data
        });

        const responseData = {
            ...updatedClass,
            id: uuidStringify(updatedClass.id),
            class_name_id: uuidStringify(updatedClass.class_name_id),
            school_year_id: uuidStringify(updatedClass.school_year_id),
            teacher_id: updatedClass.teacher_id ? uuidStringify(updatedClass.teacher_id) : null
        };

        return res.status(200).json(createSuccessResponse(responseData, `Class updated successfully.`));
    } catch (err) {
        console.error('Error updating class', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while updating class. Please try again later.'));
    }
};

export const assignStudent = async (req: Request, res: Response) => {
    try {
        const classId: string = req.params.classId;
        const studentId: string = req.body.studentId;

        const existingClass: classes | null = await prisma.classes.findUnique({
            where: {
                id: Buffer.from(uuidParse(classId))
            }
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse(`Class does not exist.`));
        }

        const existingStudent: students | null = await prisma.students.findUnique({
            where: {
                id: Buffer.from(uuidParse(studentId))
            }
        });

        if (!existingStudent) {
            return res.status(404).json(createErrorResponse(`Student does not exist.`));
        }

        const updatedStudent = await prisma.students.update({
            where: {
                id: Buffer.from(uuidParse(studentId))
            },
            data: {
                class_id: Buffer.from(uuidParse(classId))
            }
        });

        const responseData = {
            ...updatedStudent,
            id: uuidStringify(updatedStudent.id),
            class_id: updatedStudent.class_id ? uuidStringify(updatedStudent.class_id) : null
        };

        return res.status(200).json(createSuccessResponse(responseData, `Student assigned to class successfully.`));
    } catch (err) {
        console.error('Error assigning student to class', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while assigning student to class. Please try again later.'));
    }
};

export const unassignStudent = async (req: Request, res: Response) => {
    try {
        const classId: string = req.params.classId;
        const studentId: string = req.body.studentId;

        const existingClass = await prisma.classes.findUnique({
            where: { id: Buffer.from(uuidParse(classId)) }
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse(`Class does not exist.`));
        }

        const existingStudent = await prisma.students.findUnique({
            where: { id: Buffer.from(uuidParse(studentId)) }
        });

        if (!existingStudent) {
            return res.status(404).json(createErrorResponse(`Student does not exist.`));
        }

        const updatedStudent = await prisma.students.update({
            where: { id: Buffer.from(uuidParse(studentId)) },
            data: { class_id: null }
        });

        const responseData = {
            ...updatedStudent,
            id: uuidStringify(updatedStudent.id),
            class_id: updatedStudent.class_id
        };

        return res.status(200).json(createSuccessResponse(responseData, `Student unassigned from class successfully.`));
    } catch (err) {
        console.error('Error removing student from class', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while removing the student from the class. Please try again later.'));
    }
};

export const deleteClass = async (req: Request, res: Response) => {
    try {
        const classId: string = req.params.classId;

        const existingClass = await prisma.classes.findUnique({
            where: { id: Buffer.from(uuidParse(classId)) }
        });

        if (!existingClass) {
            return res.status(404).json(createErrorResponse(`Class does not exist.`));
        }

        await prisma.students.updateMany({
            where: { class_id: Buffer.from(uuidParse(classId)) },
            data: { class_id: null }
        });

        const deletedClass = await prisma.classes.delete({
            where: { id: Buffer.from(uuidParse(classId)) }
        });

        const responseData = {
            ...deletedClass,
            id: uuidStringify(deletedClass.id),
            teacher_id: deletedClass.teacher_id ? uuidStringify(deletedClass.teacher_id) : null
        };

        return res.status(200).json(createSuccessResponse(responseData, `Class deleted successfully.`));
    } catch (err) {
        console.error('Error deleting class', err);
        res.status(500).json(createErrorResponse('An unexpected error occurred while deleting the class. Please try again later.'));
    }
};