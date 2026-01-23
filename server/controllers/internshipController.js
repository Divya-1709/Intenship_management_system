const Internship = require("../models/Internship");
const Company = require("../models/Company");

// Company posts internship
exports.postInternship = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });

    if (!company || company.status !== "Verified") {
      return res.status(403).json({
        message: "Company not verified. Cannot post internships."
      });
    }

    const internship = await Internship.create({
      companyId: company._id,
      title: req.body.title,
      description: req.body.description,
      duration: req.body.duration,
      stipend: req.body.stipend
    });

    res.status(201).json({
      message: "Internship posted successfully",
      internship
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Students view internships
exports.getAllInternships = async (req, res) => {
  const internships = await Internship.find({ status: "Open" })
    .populate("companyId", "companyName");
  res.json(internships);
};
