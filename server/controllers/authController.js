const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
  try {
    console.log("Register request:", req.body);
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (userExists) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    console.log("User created:", user.email);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log("Register error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    console.log("Login request:", req.body);
    const { email, password } = req.body;

    console.log("Searching for email:", email);
    console.log("User model:", User.collection.name);
    const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
    console.log("User found:", user ? user.email : "null");
    console.log("All users in DB:", await User.find({}, 'email role'));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("Login successful for:", user.email);
    res.status(200).json({
      token,
      role: user.role,
      userId: user._id
    });
  } catch (error) {
    console.log("Login error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
