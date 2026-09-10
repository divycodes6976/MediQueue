"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenTrackInfo = getTokenTrackInfo;
const db_1 = require("../config/db");
const queue_service_1 = require("./queue.service");
async function getTokenTrackInfo(tokenNumber) {
    const normalized = tokenNumber.trim().toUpperCase();
    if (!normalized) {
        return null;
    }
    const rows = await (0, db_1.query)(`SELECT
       t.id,
       t.token_number AS "tokenNumber",
       t.patient_id AS "patientId",
       t.department,
       t.status,
       t.priority,
       t.created_at AS "createdAt",
       p.name AS "patientName"
     FROM tokens t
     LEFT JOIN patients p ON t.patient_id = p.id
     WHERE upper(t.token_number) = $1
     LIMIT 1`, [normalized]);
    const token = rows[0];
    if (!token) {
        return null;
    }
    const department = token.department.trim().toUpperCase();
    const waitingQueue = await (0, queue_service_1.getQueue)(department);
    const index = waitingQueue.findIndex((t) => t.id === token.id);
    const position = index === -1 ? null : index + 1;
    const patientsAhead = position != null ? Math.max(0, position - 1) : null;
    return {
        token,
        department,
        position,
        patientsAhead,
        waitingCount: waitingQueue.length,
    };
}
