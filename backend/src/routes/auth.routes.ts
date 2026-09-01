import { Router } from "express";
import { login, me, signup } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/me", authenticate, me);

export default router;
