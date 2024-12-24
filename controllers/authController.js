const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  createUser,
  findUserByEmail,
  findUserByUsername,
} = require("../models/userModel");
const Joi = require("joi");

// Validasi Register
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Validasi Login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const register = async (req, res) => {
  const { username, email, password } = req.body;

  const { error } = registerSchema.validate({ username, email, password });
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    // Periksa apakah username sudah terdaftar
    const existingUsername = await findUserByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Periksa apakah email sudah terdaftar
    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Hash password dan buat pengguna baru
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(username, email, hashedPassword);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Error registering user", error });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const { error } = loginSchema.validate({ email, password });
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      userId: user.id,
      username: user.username,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

module.exports = { register, login };
