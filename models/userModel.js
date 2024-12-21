const pool = require("../db/connection");

const createUser = async (fullName, email, hashedPassword) => {
  const result = await pool.query(
    "INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3) RETURNING *",
    [fullName, email, hashedPassword]
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
};

module.exports = { createUser, findUserByEmail };
