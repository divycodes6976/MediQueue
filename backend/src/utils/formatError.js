"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatError = formatError;
exports.getDatabaseUrlHint = getDatabaseUrlHint;
/** Safe error text for API responses and logs. */
function formatError(err) {
    if (err instanceof Error) {
        const cause = err.cause;
        const parts = [err.message, cause ? formatError(cause) : ""].filter(Boolean);
        if (parts.length)
            return parts.join(" | ");
        return err.stack ?? err.name ?? "Unknown Error";
    }
    if (typeof err === "object" && err !== null) {
        const o = err;
        const msg = [o.message, o.detail, o.code].filter((x) => typeof x === "string" && x);
        if (msg.length)
            return msg.join(" | ");
        try {
            return JSON.stringify(err);
        }
        catch {
            return String(err);
        }
    }
    return String(err);
}
function getDatabaseUrlHint() {
    const raw = process.env.DATABASE_URL?.trim();
    if (!raw) {
        return { configured: false, host: null };
    }
    try {
        const url = new URL(raw.replace(/^postgresql:\/\//, "http://"));
        return { configured: true, host: url.hostname };
    }
    catch {
        return { configured: true, host: "(unparseable)" };
    }
}
