const User = require("../models/User");
const Company = require("../models/Company");
const Internship = require("../models/Internship");
const Application = require("../models/Application");

/* ===========================
   ADMIN DASHBOARD DATA
=========================== */

// Get overall system summary
exports.getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalCompanies = await User.countDocuments({ role: "company" });
    const verifiedCompanies = await Company.countDocuments({ status: "Verified" });
    const totalInternships = await Internship.countDocuments();
    const totalApplications = await Application.countDocuments();

    res.json({
      totalStudents,
      totalCompanies,
      verifiedCompanies,
      totalInternships,
      totalApplications
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===========================
   VIEW ALL APPLICATIONS
=========================== */

exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("studentId", "name email")
      .populate({
        path: "internshipId",
        select: "title",
        populate: {
          path: "companyId",
          select: "companyName"
        }
      })
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===========================
   VIEW ALL INTERNSHIPS
=========================== */

exports.getAllInternshipsAdmin = async (req, res) => {
  try {
    const internships = await Internship.find()
      .populate("companyId", "companyName status")
      .sort({ createdAt: -1 });

    res.json(internships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
