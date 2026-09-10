const {query} = require("../config/db");
const bcrypt = require("bcrypt");

const createUser = async ({ name, email, password, role, department }) => {
  if (!name || !email || !password || !role) {
    throw new Error("Name, email, password, and role are required");
  }

  const existing = await query(
    `SELECT id FROM users WHERE email = $1 LIMIT 1`,
    [email]
  );

  if (existing.length > 0) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if (role === "doctor") {
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, department)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, department`,
      [name, email, hashedPassword, role, department]
    );

    return result[0];
  }

  const result = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role`,
    [name, email, hashedPassword, role]
  );

  return result[0];
};

const listDoctors = async () => {
  const result = await query(` select * from users where role ='doctor' and status='active' `);

   return result.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        department: row.department,
        status: row.status,
    }));
};

const updateUserStatus = async (id, status) => {
    const user = await query(`SELECT * FROM users WHERE id = $1`, [id]);
    if (user.length === 0) {
        throw new Error("User not found");
    }
    await query(`update users set status = $1 where id = $2`, [status, id]);
    return { message: `User status updated to ${status}` };
};

const getUserById = async (id) => {
    const user = await query(`SELECT * FROM users WHERE id = $1`, [id]);
    if (user.length === 0) {
        throw new Error("User not found");
    }
    return user[0];
};


module.exports = {
  createUser,
  listDoctors,
  updateUserStatus,
  getUserById,
};