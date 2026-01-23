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
  status: {
    type: String,
    enum: ["Pending", "Verified", "Rejected"],
    default: "Pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("Company", companySchema);
