import { Router } from "express";
import { listAlerts, listAllWaiting, searchDirectory } from "../controllers/search.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, searchDirectory);
router.get("/alerts", authenticate, listAlerts);
router.get("/waiting", authenticate, authorize("admin"), listAllWaiting);

export default router;
