"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEED_STAFF_PASSWORD = void 0;
exports.runSeed = runSeed;
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const auth_service_1 = require("./services/auth.service");
dotenv_1.default.config();
/** Demo staff password for local/interview login. */
exports.SEED_STAFF_PASSWORD = "Password123";
const SEED_USERS = [
    { name: "Dr. Rohan Kapoor", email: "rohan@mediqueue.local", role: "doctor", department: "DENT" },
    { name: "Dr. Ravi Patel", email: "ravi@mediqueue.local", role: "doctor", department: "ORTH" },
    { name: "Dr. Nisha Verma", email: "nisha@mediqueue.local", role: "doctor", department: "CARD" },
    { name: "Reception Desk", email: "reception@mediqueue.local", role: "reception", department: null },
];
const SEED_PATIENTS = [
    { name: "Reshma Kumar", age: 45, phone: "+91 91234 56789" },
    { name: "Divy Prakash Pandey", age: 31, phone: "+91 91234 56780" },
    { name: "Amit Singh", age: 52, phone: "+91 76543 21098" },
    { name: "Ananya Verma", age: 29, phone: "+91 99887 65432" },
    { name: "Rahul Mehta", age: 34, phone: "+91 88761 23456" },
    { name: "Kritika Sharma", age: 41, phone: "+91 88761 23457" },
    { name: "Suresh Yadav", age: 63, phone: "+91 70000 00001" },
    { name: "Meera Joshi", age: 27, phone: "+91 70000 00002" },
    { name: "Farhan Ali", age: 38, phone: "+91 70000 00003" },
    { name: "Priya Nair", age: 56, phone: "+91 70000 00004" },
    // Extra 10 (new) patients for additional token rows
    { name: "Neha Gupta", age: 33, phone: "+91 70000 00005" },
    { name: "Vikram Shah", age: 47, phone: "+91 70000 00006" },
    { name: "Ishita Roy", age: 24, phone: "+91 70000 00007" },
    { name: "Karan Malhotra", age: 39, phone: "+91 70000 00008" },
    { name: "Ayesha Khan", age: 61, phone: "+91 70000 00009" },
    { name: "Manish Tiwari", age: 28, phone: "+91 70000 00010" },
    { name: "Pooja Srivastava", age: 52, phone: "+91 70000 00011" },
    { name: "Rajat Bansal", age: 36, phone: "+91 70000 00012" },
    { name: "Sana Ansari", age: 44, phone: "+91 70000 00013" },
    { name: "Deepak Chauhan", age: 58, phone: "+91 70000 00014" },
];
const SEED_TOKENS = [
    {
        tokenNumber: "DENT-001",
        patientPhone: "+91 91234 56789",
        department: "DENT",
        status: "waiting",
        priority: "NORMAL",
    },
    {
        tokenNumber: "DENT-002",
        patientPhone: "+91 91234 56780",
        department: "DENT",
        status: "IN_PROGRESS",
        priority: "SENIOR",
    },
    {
        tokenNumber: "DENT-003",
        patientPhone: "+91 76543 21098",
        department: "DENT",
        status: "waiting",
        priority: "EMERGENCY",
    },
    {
        tokenNumber: "ORTH-001",
        patientPhone: "+91 99887 65432",
        department: "ORTH",
        status: "waiting",
        priority: "NORMAL",
    },
    {
        tokenNumber: "CARD-001",
        patientPhone: "+91 88761 23456",
        department: "CARD",
        status: "waiting",
        priority: "SENIOR",
    },
    {
        tokenNumber: "CARD-002",
        patientPhone: "+91 88761 23457",
        department: "CARD",
        status: "SKIPPED",
        priority: "NORMAL",
    },
    {
        tokenNumber: "DENT-004",
        patientPhone: "+91 70000 00002",
        department: "DENT",
        status: "waiting",
        priority: "NORMAL",
    },
    {
        tokenNumber: "ORTH-002",
        patientPhone: "+91 70000 00001",
        department: "ORTH",
        status: "waiting",
        priority: "SENIOR",
    },
    {
        tokenNumber: "CARD-003",
        patientPhone: "+91 70000 00003",
        department: "CARD",
        status: "waiting",
        priority: "EMERGENCY",
    },
    {
        tokenNumber: "CARD-004",
        patientPhone: "+91 70000 00004",
        department: "CARD",
        status: "waiting",
        priority: "NORMAL",
    },
    // Extra 10 (new) token rows
    {
        tokenNumber: "DENT-010",
        patientPhone: "+91 70000 00005",
        department: "DENT",
        status: "waiting",
        priority: "SENIOR",
    },
    {
        tokenNumber: "DENT-011",
        patientPhone: "+91 70000 00006",
        department: "DENT",
        status: "waiting",
        priority: "NORMAL",
    },
    {
        tokenNumber: "ORTH-010",
        patientPhone: "+91 70000 00007",
        department: "ORTH",
        status: "waiting",
        priority: "EMERGENCY",
    },
    {
        tokenNumber: "ORTH-011",
        patientPhone: "+91 70000 00008",
        department: "ORTH",
        status: "waiting",
        priority: "NORMAL",
    },
    {
        tokenNumber: "CARD-010",
        patientPhone: "+91 70000 00009",
        department: "CARD",
        status: "waiting",
        priority: "SENIOR",
    },
    {
        tokenNumber: "CARD-011",
        patientPhone: "+91 70000 00010",
        department: "CARD",
        status: "waiting",
        priority: "NORMAL",
    },
    {
        tokenNumber: "DENT-012",
        patientPhone: "+91 70000 00011",
        department: "DENT",
        status: "waiting",
        priority: "EMERGENCY",
    },
    {
        tokenNumber: "ORTH-012",
        patientPhone: "+91 70000 00012",
        department: "ORTH",
        status: "waiting",
        priority: "SENIOR",
    },
    {
        tokenNumber: "CARD-012",
        patientPhone: "+91 70000 00013",
        department: "CARD",
        status: "waiting",
        priority: "EMERGENCY",
    },
    {
        tokenNumber: "CARD-013",
        patientPhone: "+91 70000 00014",
        department: "CARD",
        status: "waiting",
        priority: "NORMAL",
    },
];
async function ensureUser(u) {
    const passwordHash = await (0, auth_service_1.hashPassword)(exports.SEED_STAFF_PASSWORD);
    const email = u.email.trim().toLowerCase();
    const byEmail = await (0, db_1.query)(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [email]);
    if (byEmail.length > 0) {
        await (0, db_1.query)(`UPDATE users SET name = $1, role = $2, department = $3, password_hash = $4 WHERE id = $5`, [u.name, u.role, u.department, passwordHash, byEmail[0].id]);
        return { created: false };
    }
    const byName = await (0, db_1.query)(`SELECT id FROM users WHERE name = $1 AND role = $2 LIMIT 1`, [u.name, u.role]);
    if (byName.length > 0) {
        await (0, db_1.query)(`UPDATE users SET email = $1, password_hash = $2, department = $3 WHERE id = $4`, [email, passwordHash, u.department, byName[0].id]);
        return { created: false };
    }
    await (0, db_1.query)(`INSERT INTO users (name, email, password_hash, role, department)
     VALUES ($1, $2, $3, $4, $5)`, [u.name, email, passwordHash, u.role, u.department]);
    return { created: true };
}
async function ensurePatient(p) {
    const existing = await (0, db_1.query)(`SELECT id FROM patients WHERE phone = $1 LIMIT 1`, [p.phone]);
    if (existing.length > 0)
        return { created: false, id: existing[0].id };
    const inserted = await (0, db_1.query)(`INSERT INTO patients (name, age, phone) VALUES ($1, $2, $3) RETURNING id`, [p.name, p.age, p.phone]);
    return { created: true, id: inserted[0].id };
}
async function ensureToken(t, patientId) {
    const existing = await (0, db_1.query)(`SELECT id FROM tokens WHERE token_number = $1 LIMIT 1`, [t.tokenNumber]);
    if (existing.length > 0)
        return { created: false };
    await (0, db_1.query)(`INSERT INTO tokens (token_number, patient_id, department, status, priority)
     VALUES ($1, $2, $3, $4, $5)`, [t.tokenNumber, patientId, t.department, t.status, t.priority]);
    return { created: true };
}
async function runSeed() {
    let createdUsers = 0;
    let createdPatients = 0;
    let createdTokens = 0;
    for (const u of SEED_USERS) {
        const res = await ensureUser(u);
        if (res.created)
            createdUsers += 1;
    }
    const patientPhoneToId = new Map();
    for (const p of SEED_PATIENTS) {
        const res = await ensurePatient(p);
        if (res.created)
            createdPatients += 1;
        patientPhoneToId.set(p.phone, res.id);
    }
    for (const t of SEED_TOKENS) {
        const patientId = patientPhoneToId.get(t.patientPhone);
        if (!patientId)
            continue;
        const res = await ensureToken(t, patientId);
        if (res.created)
            createdTokens += 1;
    }
    console.log(`Seed complete. Inserted users ${createdUsers}/${SEED_USERS.length}, patients ${createdPatients}/${SEED_PATIENTS.length}, tokens ${createdTokens}/${SEED_TOKENS.length}.`);
}
if (require.main === module) {
    runSeed().catch((err) => {
        console.error("Seed failed:", err);
        process.exitCode = 1;
    });
}
