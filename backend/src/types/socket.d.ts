import { AuthUser } from '../interfaces/authUser';

declare module 'socket.io' {
    interface Socket {
        user: AuthUser;
    }
}
