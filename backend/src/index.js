const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const patientRoutes = require("./routes/patient.routes");
const tokenRoutes = require("./routes/token.routes");
const queueRoutes = require("./routes/queue.routes");
const authRoutes = require("./routes/auth.routes");

const { bootstrapDb } = require("./bootstrapDb");
require("./events/queueSubscriber");

if (!process.stdin.isTTY) {
  process.stdin.resume();
}

const app = express();
app.set("trust proxy", 1);

const extraOrigins = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const allowed =
        extraOrigins.includes(origin) ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        /^https:\/\/[\w.-]+\.vercel\.app$/.test(origin);
      callback(null, allowed);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const port = process.env.PORT || 3001;

app.get("/", (_req, res) => {
  res.send("MediQueue server is running");
});





app.get("/test", (_req, res) => {
  res.json({ message: "MediQueue backend deployed correctly" });
});

app.use("/auth", authRoutes);
app.use("/patient", patientRoutes);
app.use("/token", tokenRoutes);
app.use("/queue", queueRoutes);

async function start() {
  try {
    const result = await bootstrapDb();
    console.log(`[db] startup bootstrap OK (${result.doctors} doctors)`);
  } catch (err) {
    console.error("[db] startup bootstrap FAILED:", err);
    console.error("[db] Fix: set DATABASE_URL on Render (Postgres Internal URL), then open GET /setup-db");
  }
  app.listen(port, () => {
    console.log(`MediQueue server is running on port ${port}`);
  });
}

start();
