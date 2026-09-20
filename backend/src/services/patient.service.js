const { query } = require("../config/db");

const createPatient = async ({ name, age, phone }, client) => {
  if (!name || !age || !phone) {
    throw new Error("Name, age, and phone are required");
  }

  const result = await query(
    `INSERT INTO patients (name, age, phone)
     VALUES ($1, $2, $3)
     RETURNING id, name, age, phone`,
    [name, age, phone],
    client
  );

  return result[0];
};

module.exports = {
  createPatient,
};
