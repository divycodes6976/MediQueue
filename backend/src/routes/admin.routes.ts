import { Router } from "express";
import { getStats, getUsers } from "../controllers/admin.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/stats", authenticate, authorize("admin"), getStats);
router.get("/users", authenticate, authorize("admin"), getUsers);

export default router;
