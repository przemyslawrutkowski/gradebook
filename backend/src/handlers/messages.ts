import { Server, Socket } from 'socket.io';
import prisma from '../db';
import { parse as uuidParse } from 'uuid';
import Message from '../interfaces/message';

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

    socket.on('send_message', async (data: Message) => {
        try {
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

            io.to(data.receiverId).emit('receive_message', message);
        } catch (error) {
            console.error('Error saving message:', error);
            socket.emit('error', 'Failed to send message');
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
}
