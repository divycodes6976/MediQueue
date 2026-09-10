"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseUrl = getDatabaseUrl;
exports.usePgSsl = usePgSsl;
/** Render Postgres requires SSL; append sslmode when missing. */
function getDatabaseUrl() {
    const raw = process.env.DATABASE_URL?.trim();
    if (!raw) {
        throw new Error("DATABASE_URL is not set");
    }
    const needsSsl = raw.includes("render.com") ||
        raw.includes("sslmode=require") ||
        process.env.PGSSLMODE === "require";
    if (needsSsl && !raw.includes("sslmode=")) {
        return raw.includes("?") ? `${raw}&sslmode=require` : `${raw}?sslmode=require`;
    }
    return raw;
}
function usePgSsl(connectionString) {
    return (connectionString.includes("sslmode=require") ||
        connectionString.includes("render.com"));
}
