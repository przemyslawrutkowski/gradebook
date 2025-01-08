import express from 'express';
import cors from 'cors';
import http from 'http';
import { Request, Response, NextFunction } from 'express';
import { Server, Socket } from 'socket.io';
import authRouter from './routers/authRouter';
import studentsParentsRouter from './routers/studentsParentsRouter';
import classesRouter from './routers/classesRouter';
import studentsRouter from './routers/studentsRouter';
import lessonsRouter from './routers/lessonsRouter';
import subjectsRouter from './routers/subjectsRouter';
import attendancesRouter from './routers/attendancesRouter';
import userTypesRouter from './routers/userTypesRouter';
import schoolYearsRouter from './routers/schoolYearsRouter';
import semestersRouter from './routers/semestersRouter';
import gradesRouter from './routers/gradesRouter';
import classNamesRouter from './routers/classNamesRouter';
import { messagesHandler } from './handlers/messages';
import parentsRouter from './routers/parentsRouter';
import teachersRouter from './routers/teachersRouter';
import administratorsRouter from './routers/administratorsRouter';
import messagesRouter from './routers/messagesRouter';
import homeworksRouter from './routers/homeworksRouter';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from './modules/validateEnv';
import AuthUser from './interfaces/authUser';
import schoolEventsRouter from './routers/schoolEventsRouter';
import eventTypesRouter from './routers/eventTypesRouter';
import examsRouter from './routers/examsRouter';
import problemsRouter from './routers/problemsRouter';
import statusesRouter from './routers/statusesRouter';
import problemTypesRouter from './routers/problemTypesRouter';
import updatesRouter from './routers/updatesRouter';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
    },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/auth', authRouter);
app.use('/student-parent', studentsParentsRouter);
app.use('/class', classesRouter);
app.use('/administrator', administratorsRouter);
app.use('/teacher', teachersRouter);
app.use('/parent', parentsRouter);
app.use('/student', studentsRouter);
app.use('/lesson', lessonsRouter);
app.use('/subject', subjectsRouter);
app.use('/attendance', attendancesRouter);
app.use('/user-type', userTypesRouter);
app.use('/school-year', schoolYearsRouter);
app.use('/semester', semestersRouter);
app.use('/grade', gradesRouter);
app.use('/class-name', classNamesRouter)
app.use('/message', messagesRouter);
app.use('/homework', homeworksRouter);
app.use('/school-event', schoolEventsRouter);
app.use('/event-type', eventTypesRouter);
app.use('/exam', examsRouter);
app.use('/problem', problemsRouter);
app.use('/status', statusesRouter);
app.use('/problem-type', problemTypesRouter)
app.use('/update', updatesRouter)

io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        console.error('Authentication error: No token provided');
        return next(new Error('Authentication error: No token provided'));
    }

    try {
        const payload = jwt.verify(token, SECRET_KEY) as AuthUser;
        socket.user = payload;
        next();
    } catch (err) {
        console.error('Authentication error:', err);
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket: Socket) => {
    const user = socket.user;
    console.log(`User connected: ${user.id}, Socket ID: ${socket.id}`);

    messagesHandler(io, socket);

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${user.id}, Socket ID: ${socket.id}`);
    });
});

app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

export { app, server };