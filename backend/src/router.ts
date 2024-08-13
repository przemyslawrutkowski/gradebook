import { Router } from "express";
import { protect } from "./modules/auth.js";
import { signIn } from "./handlers/users.js";
import { signUpStudent } from "./handlers/students.js";
import { signUpTeacher } from "./handlers/teachers.js";
import { signUpParent } from "./handlers/parents.js";

const router = Router();

router.post('/signin', signIn);
router.post('/signupstudent', signUpStudent);
router.post('/signupteacher', signUpTeacher);
router.post('/signupparent', signUpParent);

export default router;