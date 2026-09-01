import { Router } from "express";
import { registerPatient, suggestTriage } from "../controllers/patient.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.post("/suggest", authenticate, authorize("reception"), suggestTriage);
router.post("/register", authenticate, authorize("reception"), registerPatient);

export default router;
