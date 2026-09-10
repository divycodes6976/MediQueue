

// reception based routes 

const express = require("express");
const { suggestTriage, registerPatient } = require("../controllers/patient.controller");
const authMiddleware = require("../middleware/auth");
const { authenticate, receptionAuthorize } = authMiddleware;



const receptionRouter = express.Router();

receptionRouter.post("/triage-suggest", authenticate, receptionAuthorize, suggestTriage);
receptionRouter.post("/register", authenticate, receptionAuthorize, registerPatient);

module.exports = receptionRouter;
