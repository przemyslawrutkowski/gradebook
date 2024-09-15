export default interface AuthUser {
    email: string;
    firstName: string;
    lastName: string;
    role: 'student' | 'teacher' | 'parent' | 'administrator';
}