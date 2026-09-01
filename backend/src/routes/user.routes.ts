import { Router } from "express";
import { getDoctors, getUser, patchUserStatus, registerUser } from "../controllers/user.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.post("/register", authenticate, authorize("admin"), registerUser);
router.get("/doctors", authenticate, authorize("admin", "doctor"), getDoctors);
router.patch("/:id/status", authenticate, authorize("admin"), patchUserStatus);
router.get("/:id", authenticate, authorize("admin"), getUser);

export default router;
