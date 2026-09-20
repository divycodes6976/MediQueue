const { query } = require("../config/db");



const createToken = async (patientId, department, priority, client) => {

    const normalizedDepartment = department.trim().toUpperCase();
    const normalizedPriority = priority.trim().toUpperCase();

    // 1. Last token find karo
    if (patientId == null || Number.isNaN(Number(patientId))) {
        throw new Error("patientId is required to create a token");
    }

    const lastToken = await query(
        `SELECT token_number AS "tokenNumber"
         FROM tokens
         WHERE department = $1
         ORDER BY id DESC
         LIMIT 1`,
        [normalizedDepartment],
        client
    );

    // 2. Next number
    let nextNumber = 1;

    if (lastToken.length > 0) {
        const parsed = Number.parseInt(
            lastToken[0].tokenNumber.split("-")[1] ?? "0",
            10
        );

        nextNumber = Number.isNaN(parsed) ? 1 : parsed + 1;
    }

    // Token number banao
    const tokenNumber =
        `${normalizedDepartment}-${String(nextNumber).padStart(3, "0")}`;

    //  Token database mein insert karo
    const result = await query(
        `INSERT INTO tokens
         (token_number, patient_id, department, priority, status)
         VALUES ($1, $2, $3, $4, 'waiting')
         RETURNING
           id,
           token_number AS "tokenNumber",
           patient_id AS "patientId",
           department,
           status,
           priority,
           created_at AS "createdAt"`,
        [
            tokenNumber,
            Number(patientId),
            normalizedDepartment,
            normalizedPriority
        ],
        client
    );

    // 5. Created token return karo
    return result[0];
};
 
module.exports = {
    createToken,
};