"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.query = query;
exports.withTransaction = withTransaction;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pg_1 = require("pg");
const databaseUrl_1 = require("./databaseUrl");
function createPool() {
    const connectionString = (0, databaseUrl_1.getDatabaseUrl)();
    return new pg_1.Pool({
        connectionString,
        ssl: (0, databaseUrl_1.usePgSsl)(connectionString) ? { rejectUnauthorized: false } : undefined,
    });
}
const pool = createPool();
exports.pool = pool;
async function query(text, params = [], client) {
    const result = await (client ?? pool).query(text, params);
    return result.rows;
}
async function withTransaction(fn) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await fn(client);
        await client.query("COMMIT");
        return result;
    }
    catch (err) {
        await client.query("ROLLBACK");
        throw err;
    }
    finally {
        client.release();
    }
}
