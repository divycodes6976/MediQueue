"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = __importDefault(require("pg"));
dotenv_1.default.config();
async function main() {
    const client = new pg_1.default.Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(`ALTER TABLE patients ADD COLUMN IF NOT EXISTS chief_complaint varchar(500)`);
    console.log("chief_complaint column ready");
    await client.end();
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
