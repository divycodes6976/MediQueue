const { Router } = require("express");
const { login, signup, me } = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth");

const router = Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/me", authenticate, me);

module.exports = router;
