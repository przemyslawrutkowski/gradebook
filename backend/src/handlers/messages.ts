import { Server, Socket } from 'socket.io';
import { Request, Response } from 'express';
import prisma from '../db';
import Message from '../interfaces/message';
import { createSuccessResponse, createErrorResponse } from '../interfaces/responseInterfaces';
import { stringify as uuidStringify, parse as uuidParse, } from 'uuid';

export function messagesHandler(io: Server, socket: Socket) {
    console.log('User connected:', socket.id);

    socket.on('join', async (userId: string) => {
        socket.join(userId);
        console.log(`User ${userId} joined room ${userId}`);

        try {
            const unreadMessages = await prisma.messages.findMany({
                where: {
                    receiver_id: Buffer.from(uuidParse(userId)),
                    was_read: false
                }
            });
            socket.emit('receive_messages', unreadMessages);
        } catch (error) {
            console.error('Error fetching unread messages:', error);
            socket.emit('error', 'Failed to load unread messages');
        }
    });

    socket.on('send_message', async (data: Message, callback) => {
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
      
          io.to(data.receiverId).emit('receive_message', {
            ...message,
            id: uuidStringify(message.id),
            senderId: data.senderId,
            receiverId: data.receiverId,
            dateTime: message.date_time.toISOString(),
          });
      
          callback({ status: 'ok' });
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("error", "Failed to send message");
          callback({ status: 'error', message: 'Failed to send message' });
        }
      });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
}

export const getMessagesBetweenUsers = async (req: Request, res: Response) => {
    try {
        const studentId: string = req.params.studentId;

        const otherUserId: string = req.params.otherUserId;

        if (!otherUserId) {
            return res.status(400).json(createErrorResponse('The other user ID is required.'));
        }

        const messagesData = await prisma.messages.findMany({
            where: {
                OR: [
                    {
                        sender_id: Buffer.from(uuidParse(studentId)),
                        receiver_id: Buffer.from(uuidParse(otherUserId))
                        ,
                    },
                    {
                        sender_id: Buffer.from(uuidParse(otherUserId)),
                        receiver_id: Buffer.from(uuidParse(studentId)),
                    },
                ],
            },
            orderBy: {
                date_time: 'asc',
            },
        });

        const responseData = messagesData.map(message => ({
            id: uuidStringify(message.id),
            subject: message.subject,
            content: message.content,
            dateTime: message.date_time.toISOString(),
            wasRead: message.was_read,
            senderId: uuidStringify(message.sender_id),
            senderTypeId: uuidStringify(message.sender_type_id),
            receiverId: uuidStringify(message.receiver_id),
            receiverTypeId: uuidStringify(message.receiver_type_id),
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Messages retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving messages', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving messages. Please try again later.'));
    }
};

export const getRecentConversations = async (req: Request, res: Response) => {
    try {
        const studentId: string = req.params.studentId;

        const messagesData = await prisma.$queryRaw<any>`
            SELECT sub.*, 
                CASE 
                    WHEN t.id IS NOT NULL THEN t.first_name 
                    WHEN s.id IS NOT NULL THEN s.first_name 
                END AS first_name,
                CASE 
                    WHEN t.id IS NOT NULL THEN t.last_name 
                    WHEN s.id IS NOT NULL THEN s.last_name 
                END AS last_name
            FROM (
                SELECT m.*,
                    CASE 
                        WHEN m.sender_id = ${Buffer.from(uuidParse(studentId))} THEN m.receiver_id 
                        ELSE m.sender_id 
                    END as other_user_id,
                    ROW_NUMBER() OVER (
                        PARTITION BY CASE 
                            WHEN
                            m.sender_id = ${Buffer.from(uuidParse(studentId))} THEN m.receiver_id 
                            ELSE m.sender_id 
                        END 
                        ORDER BY m.date_time DESC
                    ) as rn
                FROM messages m
                WHERE m.sender_id = ${Buffer.from(uuidParse(studentId))} 
                   OR m.receiver_id = ${Buffer.from(uuidParse(studentId))}
            ) sub
            LEFT JOIN teachers t ON t.id = sub.other_user_id
            LEFT JOIN students s ON s.id = sub.other_user_id
            WHERE sub.rn = 1
            ORDER BY sub.date_time DESC
            LIMIT 10
        `;

        const responseData = messagesData.map((message: any) => ({
            otherUserId: uuidStringify(message.other_user_id),
            firstName: message.first_name,
            lastName: message.last_name,
            lastMessage: {
                id: uuidStringify(message.id),
                subject: message.subject,
                content: message.content,
                dateTime: message.date_time.toISOString(),
                wasRead: message.was_read,
                senderId: uuidStringify(message.sender_id),
                senderTypeId: uuidStringify(message.sender_type_id),
                receiverId: uuidStringify(message.receiver_id),
                receiverTypeId: uuidStringify(message.receiver_type_id),
            },
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Recent conversations retrieved successfully.'));
    } catch (err) {
        console.error('Error retrieving recent conversations:', err);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while retrieving recent conversations. Please try again later.'));
    }
};