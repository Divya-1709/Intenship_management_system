const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  registrationNumber: {
    type: String,
    required: true
  },
  documents: {
    type: String   // Cloudinary / file URL
  },
  companyLogo: {
    type: String,
    default: ""
  },
  companyBanner: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  website: {
    type: String,
    default: ""
  },
  industry: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["Pending", "Verified", "Rejected"],
    default: "Pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("Company", companySchema);
