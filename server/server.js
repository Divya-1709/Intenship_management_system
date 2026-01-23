const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("Internship Verification Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

const companyRoutes = require("./routes/companyRoutes");
app.use("/api/company", companyRoutes);

const internshipRoutes = require("./routes/internshipRoutes");
app.use("/api/internship", internshipRoutes);

const applicationRoutes = require("./routes/applicationRoutes");
app.use("/api/application", applicationRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);
