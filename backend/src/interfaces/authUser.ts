export default interface AuthUserI {
    email: string;
    firstName: string;
    lastName: string;
    role: 'student' | 'teacher' | 'parent' | 'administrator';
}