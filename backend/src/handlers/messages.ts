import { Server, Socket } from 'socket.io';
import { Request, Response } from 'express';
import prisma from '../db';
import Message from '../interfaces/message';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { stringify as uuidStringify, parse as uuidParse, } from 'uuid';
import AuthUser from '../interfaces/authUser';
import { UserType } from '../enums/userTypes';
import { administrators, teachers, parents, students, user_types } from '@prisma/client';

export function messagesHandler(io: Server, socket: Socket) {
    const user: AuthUser = socket.user;

    socket.join(user.id);
    console.log(`User ${user.id} joined rooms ${user.id}`);

    socket.on('send_message', async (data: Message) => {
        try {
            if (
                !data.subject ||
                !data.content ||
                !data.senderId ||
                !data.receiverId ||
                !data.senderTypeId ||
                !data.receiverTypeId
            ) {
                throw new Error("Invalid message data");
            }

            if (data.senderId.toString() !== user.id) {
                throw new Error('Sender ID mismatch');
            }

            const message = await prisma.messages.create({
                data: {
                    subject: data.subject,
                    content: data.content,
                    date_time: new Date(),
                    was_read: false,
                    sender_id: Buffer.from(uuidParse(data.senderId)),
                    sender_type_id: Buffer.from(uuidParse(data.senderTypeId)),
                    receiver_id: Buffer.from(uuidParse(data.receiverId)),
                    receiver_type_id: Buffer.from(uuidParse(data.receiverTypeId)),
                },
            });

            io.to([data.senderId, data.receiverId]).emit('receive_message', {
                ...message,
                id: uuidStringify(message.id),
                date_time: message.date_time.toISOString(),
                sender_id: data.senderId,
                sender_type_id: data.senderTypeId,
                receiver_id: data.receiverId,
                receiver_type_id: data.receiverTypeId,
            });

        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("error", "Failed to send message");
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
};

export const getUnreadMessages = async (req: Request, res: Response) => {
    try {
        const user: AuthUser = req.user as AuthUser;

        const unreadMessages = await prisma.messages.findMany({
            where: {
                receiver_id: Buffer.from(uuidParse(user.id)),
                was_read: false,
            },
        });

        const responseData = unreadMessages.map(message => ({
            ...message,
            id: uuidStringify(message.id),
            date_time: message.date_time.toISOString(),
            sender_id: uuidStringify(message.sender_id),
            sender_type_id: uuidStringify(message.sender_type_id),
            receiver_id: uuidStringify(message.receiver_id),
            receiver_type_id: uuidStringify(message.receiver_type_id),
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Unread messages retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving unread messages:', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving unread messages. Please try again later.'));
    }
};

export const getMessagesBetweenUsers = async (req: Request, res: Response) => {
    try {
        const user: AuthUser = req.user as AuthUser;
        const interlocutorId: string = req.params.interlocutorId;

        const criteria = {
            where: {
                id: Buffer.from(uuidParse(user.id))
            }
        }

        let existingUser: students | teachers | parents | administrators | null = null;

        if (!existingUser) {
            existingUser = await prisma.administrators.findUnique(criteria);
        }

        if (!existingUser) {
            existingUser = await prisma.teachers.findUnique(criteria);
        }

        if (!existingUser) {
            existingUser = await prisma.parents.findUnique(criteria);
        }

        if (!existingUser) {
            existingUser = await prisma.students.findUnique(criteria);
        }

        if (!existingUser) {
            return res.status(404).json(createErrorResponse(`Interlocutor does not exist.`));
        }

        const messages = await prisma.messages.findMany({
            where: {
                OR: [
                    {
                        sender_id: Buffer.from(uuidParse(user.id)),
                        receiver_id: Buffer.from(uuidParse(interlocutorId))
                    },
                    {
                        sender_id: Buffer.from(uuidParse(interlocutorId)),
                        receiver_id: Buffer.from(uuidParse(user.id)),
                    },
                ],
            },
            orderBy: {
                date_time: 'asc',
            },
        });

        const responseData = messages.map(message => ({
            ...message,
            id: uuidStringify(message.id),
            date_time: message.date_time.toISOString(),
            sender_id: uuidStringify(message.sender_id),
            sender_type_id: uuidStringify(message.sender_type_id),
            receiver_id: uuidStringify(message.receiver_id),
            receiver_type_id: uuidStringify(message.receiver_type_id),
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Messages retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving messages', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving messages. Please try again later.'));
    }
};

export const getRecentConversations = async (req: Request, res: Response) => {
    try {
        const user: AuthUser = req.user as AuthUser;

        const userBuffer = Buffer.from(uuidParse(user.id));

        const uniquePairs = new Set<string>();
        const filteredMessages = [];

        let pageSize = 500;
        let skip = 0;

        while (uniquePairs.size < 10) {
            const messages = await prisma.messages.findMany({
                where: {
                    OR: [
                        { sender_id: userBuffer },
                        { receiver_id: userBuffer }
                    ]
                },
                orderBy: {
                    date_time: 'desc'
                },
                take: pageSize,
                skip: skip
            });

            if (messages.length === 0) {
                break;
            }

            for (const message of messages) {
                const sender = uuidStringify(message.sender_id);
                const receiver = uuidStringify(message.receiver_id);
                const pairKey = [sender, receiver].sort().join('|');

                if (!uniquePairs.has(pairKey)) {
                    uniquePairs.add(pairKey);
                    filteredMessages.push({
                        ...message,
                        id: uuidStringify(message.id),
                        date_time: message.date_time.toISOString(),
                        sender_id: sender,
                        sender_type_id: uuidStringify(message.sender_type_id),
                        receiver_id: receiver,
                        receiver_type_id: uuidStringify(message.receiver_type_id),
                    });

                    if (uniquePairs.size === 10) {
                        break;
                    }
                }
            }

            if (uniquePairs.size < 10) {
                skip += pageSize;
            } else {
                break;
            }
        }

        return res.status(200).json(
            createSuccessResponse(filteredMessages, 'Recent conversations retrieved successfully.')
        );
    } catch (err) {
        console.error('Error retrieving recent conversations:', err);
        return res.status(500).json(
            createErrorResponse('An unexpected error occurred while retrieving recent conversations. Please try again later.')
        );
    }
};