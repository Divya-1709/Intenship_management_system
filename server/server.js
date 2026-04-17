const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

const authRoutes = require("./routes/authRoutes");
console.log("Auth routes loaded:", typeof authRoutes);
app.use("/api/auth", authRoutes);
console.log("Auth routes mounted at /api/auth");

const companyRoutes = require("./routes/companyRoutes");
app.use("/api/company", companyRoutes);

const internshipRoutes = require("./routes/internshipRoutes");
app.use("/api/internship", internshipRoutes);

const applicationRoutes = require("./routes/applicationRoutes");
app.use("/api/application", applicationRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

const studentRoutes = require("./routes/Studentroutes");
console.log("Student routes loaded:", typeof studentRoutes);
app.use("/api/student", studentRoutes);
console.log("Student routes mounted at /api/student");

const interviewRoutes = require("./routes/interviewRoutes");

// With other route registrations
app.use("/api/interview", interviewRoutes);

const matchRoutes = require("./routes/matchRoutes");
app.use("/api/match", matchRoutes);

const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payment", paymentRoutes);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // Do not exit, allow server to start with routes mounted
  }
};

connectDB().then(() => {
  // Temporary route to list all users for debugging
  app.get("/api/debug/users", async (req, res) => {
    try {
      const users = await User.find({});
      res.json(users.map(u => ({ email: u.email, role: u.role })));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/", (req, res) => {
    res.send("Internship Verification Backend Running");
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
});

