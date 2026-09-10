const { query } = require("../config/db");

const createPatient = async (req, res) => {
  const { name, age, phone } = req.body;

  if (!name || !age || !phone) {
    return res.status(400).json({ message: "Name, age, and phone are required" });
  }

  try {
    const result = await query(
      `INSERT INTO patients (name, age, phone)
       VALUES ($1, $2, $3)
       RETURNING id, name, age, phone`,
      [name, age, phone]
    );

    return res.status(201).json(result[0]);
  } catch (err) {
    return res.status(500).json({
      message: "Error creating patient",
      error: err.message,
    });
  }
};

module.exports = {
  createPatient,
};
