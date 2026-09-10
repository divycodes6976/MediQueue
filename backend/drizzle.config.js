"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const databaseUrl_1 = require("./src/config/databaseUrl");
dotenv_1.default.config();
exports.default = {
    schema: "./src/config/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: (0, databaseUrl_1.getDatabaseUrl)(),
    },
};
