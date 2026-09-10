const Redis = require("ioredis");
const dotenv = require("dotenv");
dotenv.config();

const url = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

const publisher = new Redis(url, {
  maxRetriesPerRequest: null,
});

publisher.on("error", (err) => {
  console.error("[redis publisher]", err.message);
});

module.exports = {
  publisher,
};
