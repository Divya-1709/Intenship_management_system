const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },
  internshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Internship",
    required: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
    required: true
  },
  paymentType: {
    type: String,
    enum: ["RegistrationFee", "Stipend"],
    required: true
  },
  direction: {
    type: String,
    enum: ["StudentToCompany", "CompanyToStudent"],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "INR"
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed", "Refunded"],
    default: "Pending"
  },
  // Razorpay fields (for Student → Company payments)
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  // For Company → Student payouts
  payoutMode: {
    type: String,
    enum: ["BankTransfer", "UPI", "Cheque", ""],
    default: ""
  },
  payoutReference: {
    type: String,
    default: ""
  },
  paidAt: {
    type: Date
  },
  month: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
