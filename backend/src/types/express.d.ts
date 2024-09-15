import { Request } from "express";
import AuthUser from "../interfaces/authUser";

declare module 'express-serve-static-core' {
    interface Request {
        user?: AuthUser;
    }
}