"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGeminiClient = getGeminiClient;
exports.getGeminiModel = getGeminiModel;
const genai_1 = require("@google/genai");
let client = null;
function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set in environment");
    }
    if (!client) {
        client = new genai_1.GoogleGenAI({ apiKey });
    }
    return client;
}
function getGeminiModel() {
    return process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
}
