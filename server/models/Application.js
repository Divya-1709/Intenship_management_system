const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
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
    enum: ["Applied", "Shortlisted", "Rejected", "Approved"],
    default: "Applied"
  }
}, { timestamps: true });

module.exports = mongoose.model("Application", applicationSchema);
