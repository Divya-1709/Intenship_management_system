const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  internshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Internship",
    required: true
  },
  status: {
    type: String,
    enum: ["Applied", "Pending", "Shortlisted", "Approved", "Rejected"],  // Added "Applied"
    default: "Applied"  // Changed default to "Applied"
  },
  // Application details
  coverLetter: {
    type: String,
    required: true
  },
  whyInterested: {
    type: String,
    required: true
  },
  relevantExperience: {
    type: String,
    required: true
  },
  availability: {
    type: String,
    required: true
  },
  expectedStipend: {
    type: String
  },
  portfolioLinks: {
    type: String
  },
  references: {
    type: String
  },
  questionsForCompany: {
    type: String
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Prevent duplicate applications
ApplicationSchema.index({ studentId: 1, internshipId: 1 }, { unique: true });

module.exports = mongoose.model("Application", ApplicationSchema);