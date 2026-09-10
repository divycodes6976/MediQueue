"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestTriageWithGemini = suggestTriageWithGemini;
const zod_to_json_schema_1 = require("zod-to-json-schema");
const triageSuggest_schema_1 = require("../../schemas/triageSuggest.schema");
const triageRules_1 = require("../../utils/triageRules");
const gemini_client_1 = require("./gemini.client");
function buildPrompt(complaint, age) {
    const ageLine = age != null && !Number.isNaN(age) ? `Patient age: ${age} years.` : "Patient age: unknown.";
    return `You are an OPD reception routing assistant for an Indian hospital.
${ageLine}
Patient complaint (what they told reception): """${complaint.trim()}"""

TASK: Suggest which OPD department queue and waiting priority. This is NOT medical diagnosis.
- department must be exactly one of: DENT, ORTH, CARD, NEUR, GEN
- priority must be exactly one of: NORMAL, SENIOR, EMERGENCY
- Use EMERGENCY only for likely urgent cases (chest pain, breathing difficulty, unconscious, severe bleeding).
- Use SENIOR when age is 60+ and case is not emergency.
- reason: one short English line for reception staff.`;
}
async function suggestTriageWithGemini(complaint, age) {
    const normalized = complaint.trim();
    if (!normalized) {
        throw new Error("chiefComplaint is required");
    }
    if (!process.env.GEMINI_API_KEY?.trim()) {
        const rules = (0, triageRules_1.suggestTriageByRules)(normalized, age);
        return {
            suggestion: rules,
            source: "rules",
            emergencyWarning: rules.priority === "EMERGENCY",
            seniorHint: age != null && age >= 60 && rules.priority !== "EMERGENCY",
        };
    }
    try {
        const ai = (0, gemini_client_1.getGeminiClient)();
        const response = await ai.models.generateContent({
            model: (0, gemini_client_1.getGeminiModel)(),
            contents: buildPrompt(normalized, age),
            config: {
                temperature: 0.2,
                maxOutputTokens: 256,
                responseMimeType: "application/json",
                responseJsonSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(triageSuggest_schema_1.triageSuggestSchema),
            },
        });
        const text = response.text?.trim();
        if (!text) {
            throw new Error("Empty response from Gemini");
        }
        const parsed = triageSuggest_schema_1.triageSuggestSchema.parse(JSON.parse(text));
        const merged = (0, triageRules_1.mergeSuggestionWithRules)(parsed, normalized, age);
        return {
            suggestion: {
                department: merged.department,
                priority: merged.priority,
                reason: merged.reason,
            },
            source: "ai",
            emergencyWarning: merged.emergencyWarning,
            seniorHint: merged.seniorHint,
        };
    }
    catch (err) {
        console.error("[suggestTriageWithGemini] fallback to rules:", err);
        const rules = (0, triageRules_1.suggestTriageByRules)(normalized, age);
        return {
            suggestion: rules,
            source: "rules",
            emergencyWarning: rules.priority === "EMERGENCY",
            seniorHint: age != null && age >= 60 && rules.priority !== "EMERGENCY",
        };
    }
}
