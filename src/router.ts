import { Router } from "express";
import { protect } from "./modules/auth.js";
import { signIn } from "./handlers/users.js";
import { signUpStudent } from "./handlers/students.js";

const router = Router();

router.post('/signin', signIn);
router.post('/signupstudent', signUpStudent);

export default router;