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
  status: {
    type: String,
    enum: ["Open", "Closed"],
    default: "Open"
  }
}, { timestamps: true });

module.exports = mongoose.model("Internship", internshipSchema);
