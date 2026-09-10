const { Router } = require("express");
const { getTokenTrack, generateToken } = require("../controllers/token.controller");
const { authenticate, authorize } = require("../middleware/auth");

const router = Router();

router.get("/track/:tokenNumber", getTokenTrack);
router.post("/generate", authenticate, authorize("reception"), generateToken);

module.exports = router;
