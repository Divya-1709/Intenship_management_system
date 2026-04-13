const mongoose = require("mongoose");

const StudentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  college: {
    type: String,
    required: true
  },
  degree: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  yearOfStudy: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  gpa: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  skills: {
    type: String,
    required: true
  },
  resume: {
    type: String,
    required: true
  },
  linkedin: {
    type: String
  },
  github: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model("StudentProfile", StudentProfileSchema);