const { Router } = require("express");
const { callNextPatient, completeOrSkip } = require("../controllers/queue.controller");
const { authenticate, authorize } = require("../middleware/auth");
const { addClient, removeClient } = require("../utils/sseStore");
const { getQueue } = require("../services/queue.service");

const router = Router();

router.post("/call-next", authenticate, authorize("doctor"), callNextPatient);
router.post("/complete", authenticate, authorize("doctor"), completeOrSkip);

router.get("/waiting/:department", async (req, res) => {
    try {
        const department = req.params.department?.trim().toUpperCase() ?? "";
        if (!department) {
            return res.status(400).json({ message: "department is required" });
        }
        const queue = await getQueue(department);
        return res.json({ department, queue });
    } catch (err) {
        console.error("[queue waiting] failed:", err);
        return res.status(500).json({ message: "Failed to load queue" });
    }
});

router.get("/stream/:department", async (req, res) => {
    const department = req.params.department?.trim().toUpperCase() ?? "";
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    res.write(`data: ${JSON.stringify({ msg: "Connected to stream" })}\n\n`);
    try {
        const queue = await getQueue(department);
        res.write(`data: ${JSON.stringify(queue)}\n\n`);
    } catch (err) {
        console.error("[SSE] initial queue failed:", err);
        res.write(`data: ${JSON.stringify({ error: "Could not load queue" })}\n\n`);
    }
    addClient(department, res);
    req.on("close", () => {
        removeClient(department, res);
    });
});

module.exports = router;
