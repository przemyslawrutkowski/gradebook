import 'dotenv/config';
import express from 'express';
import router from './router.js';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api', router);

app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

export default app;