const Application = require("../models/Application");
const Internship = require("../models/Internship");
const Company = require("../models/Company");

/* ===========================
   STUDENT MODULE
=========================== */

// Student applies for internship
exports.applyInternship = async (req, res) => {
  try {
    const { internshipId } = req.body;

    if (!internshipId) {
      return res.status(400).json({
        message: "Internship ID is required"
      });
    }

    // Prevent duplicate applications
    const alreadyApplied = await Application.findOne({
      studentId: req.user.id,
      internshipId
    });

    if (alreadyApplied) {
      return res.status(400).json({
        message: "Already applied for this internship"
      });
    }

    const application = await Application.create({
      studentId: req.user.id,
      internshipId,
      status: "Applied"
    });

    res.status(201).json({
      message: "Internship applied successfully",
      application
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Student views own applications
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      studentId: req.user.id
    })
      .populate("internshipId", "title duration stipend status")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===========================
   COMPANY MODULE
=========================== */

// Company views applicants for its internships
exports.getApplicantsForCompany = async (req, res) => {
  try {
    // Find company using logged-in user
    const company = await Company.findOne({ userId: req.user.id });

    if (!company) {
      return res.status(404).json({
        message: "Company not found"
      });
    }

    // Find internships posted by this company
    const internships = await Internship.find({
      companyId: company._id
    });

    if (internships.length === 0) {
      return res.json({
        message: "No internships posted yet",
        applications: []
      });
    }

    const internshipIds = internships.map(i => i._id);

    // Find applications for those internships
    const applications = await Application.find({
      internshipId: { $in: internshipIds }
    })
      .populate("studentId", "name email")
      .populate("internshipId", "title")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Company updates application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = ["Shortlisted", "Rejected", "Approved"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value"
      });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    res.json({
      message: "Application status updated successfully",
      application
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
