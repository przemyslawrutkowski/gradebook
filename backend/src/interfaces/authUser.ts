import { UserType } from "../enums/userTypes";

export default interface AuthUser {
    email: string;
    firstName: string;
    lastName: string;
    role: UserType;
}