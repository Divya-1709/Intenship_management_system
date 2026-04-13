const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  stipend: {
    type: String
  },
  // Structured matching fields (optional — matcher falls back to description parsing)
  requiredSkills: {
    type: String,
    default: ""
  },
  eligibility: {
    type: String,
    default: ""
  },
  domain: {
    type: String,
    default: ""
  },
  location: {
    type: String,
    default: "Remote"
  },
  // Payment fields
  internshipType: {
    type: String,
    enum: ["Unpaid", "FeeRequired", "StipendBased"],
    default: "Unpaid"
  },
  registrationFee: {
    type: Number,
    default: 0
  },
  stipendAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["Open", "Closed"],
    default: "Open"
  }
}, { timestamps: true });

module.exports = mongoose.model("Internship", internshipSchema);
