import { Router } from "express";
import { generateToken, getTokenTrack } from "../controllers/token.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/track/:tokenNumber", getTokenTrack);
router.post("/generate", authenticate, authorize("reception"), generateToken);

export default router;
