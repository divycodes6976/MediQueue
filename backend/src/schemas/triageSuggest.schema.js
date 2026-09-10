"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triageSuggestSchema = exports.PRIORITIES = exports.DEPARTMENTS = void 0;
const zod_1 = require("zod");
exports.DEPARTMENTS = ["DENT", "ORTH", "CARD", "NEUR", "GEN"];
exports.PRIORITIES = ["NORMAL", "SENIOR", "EMERGENCY"];
exports.triageSuggestSchema = zod_1.z.object({
    department: zod_1.z
        .enum(exports.DEPARTMENTS)
        .describe("OPD department code only: DENT, ORTH, CARD, NEUR, or GEN."),
    priority: zod_1.z
        .enum(exports.PRIORITIES)
        .describe("Queue priority only: NORMAL, SENIOR, or EMERGENCY."),
    reason: zod_1.z
        .string()
        .max(200)
        .describe("One short line for reception staff. Routing hint, not a diagnosis."),
});
