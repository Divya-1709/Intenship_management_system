const Company = require("../models/Company");
const User = require("../models/User");

// Company submits details
exports.registerCompany = async (req, res) => {
  try {
    const company = await Company.create({
      userId: req.user.id,
      companyName: req.body.companyName,
      email: req.body.email,
      registrationNumber: req.body.registrationNumber,
      documents: req.body.documents
    });

    res.status(201).json({
      message: "Company details submitted for verification",
      company
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin verifies company
exports.verifyCompany = async (req, res) => {
  try {
    const { status } = req.body; // Verified / Rejected

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    // Update user verification status
    await User.findByIdAndUpdate(company.userId, {
      isVerified: status === "Verified"
    });

    res.json({
      message: `Company ${status} successfully`,
      company
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// View all companies (Admin)
exports.getAllCompanies = async (req, res) => {
  const companies = await Company.find().populate("userId", "email role");
  res.json(companies);
};
