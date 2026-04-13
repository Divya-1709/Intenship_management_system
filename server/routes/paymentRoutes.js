const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const Application = require("../models/Application");
const Internship = require("../models/Internship");
const Company = require("../models/Company");
const authMiddleware = require("../middleware/authMiddleware");

// Create a helper to initialize Razorpay dynamically
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay API keys are missing from environment");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

// =============================================
// STUDENT → COMPANY (Registration Fee via Razorpay)
// =============================================

// Create Razorpay order for registration fee payment
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { applicationId } = req.body;

    const application = await Application.findById(applicationId)
      .populate("internshipId");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (application.status !== "Approved") {
      return res.status(400).json({ message: "Application must be approved before payment" });
    }

    const internship = application.internshipId;
    if (internship.internshipType !== "FeeRequired" || !internship.registrationFee) {
      return res.status(400).json({ message: "This internship does not require a registration fee" });
    }

    // Check if already paid
    const existingPayment = await Payment.findOne({
      applicationId,
      paymentType: "RegistrationFee",
      status: "Completed"
    });

    if (existingPayment) {
      return res.status(400).json({ message: "Registration fee already paid" });
    }

    // Check if keys are loaded
    if (!process.env.RAZORPAY_KEY_ID) {
      return res.status(500).json({ message: "Server misconfiguration: RAZORPAY_KEY_ID missing in backend" });
    }

    // Create Razorpay order (amount in paise)
    const amountInPaise = Math.round(Number(internship.registrationFee) * 100);
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${applicationId.substring(0, 8)}_${Date.now().toString().slice(-6)}`, // Max 40 chars
      notes: {
        applicationId: String(applicationId),
        studentId: String(req.user.id),
        internshipTitle: String(internship.title).substring(0, 200) // Keep under 255 chars
      }
    };

    const rzp = getRazorpayInstance();
    const order = await rzp.orders.create(options);

    // Find company for this internship
    const company = await Company.findById(internship.companyId);

    // Create pending payment record
    const payment = new Payment({
      studentId: req.user.id,
      companyId: internship.companyId,
      internshipId: internship._id,
      applicationId: applicationId,
      paymentType: "RegistrationFee",
      direction: "StudentToCompany",
      amount: internship.registrationFee,
      currency: "INR",
      status: "Pending",
      razorpayOrderId: order.id
    });

    await payment.save();

    res.json({
      orderId: order.id,
      amount: amountInPaise,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      internshipTitle: internship.title,
      companyName: company?.companyName || "Company",
      paymentId: payment._id
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Failed to create payment order", error: err.message || err.error?.description || String(err) });
  }
});

// Verify Razorpay payment after checkout
router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Update payment status to failed
      await Payment.findByIdAndUpdate(paymentId, { status: "Failed" });
      return res.status(400).json({ message: "Payment verification failed. Invalid signature." });
    }

    // Update payment record
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: "Completed",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paidAt: new Date()
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    res.json({
      message: "Payment verified successfully",
      payment,
      transactionId: razorpay_payment_id
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

// =============================================
// COMPANY → STUDENT (Stipend Payout)
// =============================================

// Company records a stipend payout
router.post("/payout", authMiddleware, async (req, res) => {
  try {
    const {
      applicationId,
      studentId,
      internshipId,
      amount,
      payoutMode,
      payoutReference,
      month
    } = req.body;

    if (!amount || !payoutMode || !payoutReference) {
      return res.status(400).json({ message: "Amount, payout mode, and reference are required" });
    }

    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Check for duplicate payout for same month
    if (month) {
      const existingPayout = await Payment.findOne({
        applicationId,
        paymentType: "Stipend",
        month,
        status: "Completed"
      });

      if (existingPayout) {
        return res.status(400).json({ message: `Stipend for ${month} already paid` });
      }
    }

    const payment = new Payment({
      studentId,
      companyId: company._id,
      internshipId,
      applicationId,
      paymentType: "Stipend",
      direction: "CompanyToStudent",
      amount,
      currency: "INR",
      status: "Completed",
      payoutMode,
      payoutReference,
      month: month || "",
      paidAt: new Date()
    });

    await payment.save();

    res.status(201).json({
      message: "Stipend payout recorded successfully",
      payment
    });
  } catch (err) {
    console.error("Payout error:", err);
    res.status(500).json({ message: "Failed to record payout" });
  }
});

// =============================================
// QUERY ENDPOINTS
// =============================================

// Student views their payment history (both fees paid and stipends received)
router.get("/my-payments", authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.find({ studentId: req.user.id })
      .populate("internshipId", "title")
      .populate("companyId", "companyName")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Company views all payment records (fees received + stipends paid)
router.get("/company-payments", authMiddleware, async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const payments = await Payment.find({ companyId: company._id })
      .populate("studentId", "name email")
      .populate("internshipId", "title")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get payment status for a specific application
router.get("/status/:applicationId", authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.find({
      applicationId: req.params.applicationId
    }).sort({ createdAt: -1 });

    const registrationFee = payments.find(
      p => p.paymentType === "RegistrationFee" && p.status === "Completed"
    );
    const stipends = payments.filter(
      p => p.paymentType === "Stipend" && p.status === "Completed"
    );

    res.json({
      registrationFeePaid: !!registrationFee,
      registrationFeePayment: registrationFee || null,
      stipendPayments: stipends,
      totalStipendPaid: stipends.reduce((sum, p) => sum + p.amount, 0),
      allPayments: payments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
