const { query } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authCookieOptions } = require("../utils/authCookie");

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function loginwithEmailAndPassword(req,res) {

  const { email, password } = req.body;
  if(!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });

  }

  const rows = await query(`SELECT * FROM users WHERE email = $1`, [email]);
  if (!rows || rows.length === 0) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const matches = await bcrypt.compare(password, rows[0].password_hash);
  if (!matches) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { userId: rows[0].id, role: rows[0].role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.cookie("token", token, authCookieOptions());

  res.status(200).json({ message: 'Login successful', token });


}

module.exports = {
  loginwithEmailAndPassword,
  hashPassword,
};