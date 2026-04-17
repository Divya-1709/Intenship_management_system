const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Company = require("../models/Company");
const User = require("../models/User");
const StudentProfile = require("../models/Studentprofilemodel");
const Task = require("../models/Task");
const Application = require("../models/Application");
const nodemailer = require("nodemailer");
const authMiddleware = require("../middleware/authMiddleware");

// Multer storage config for company images
const uploadDir = path.join(__dirname, "..", "uploads", "company-images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error("Only image files are allowed"));
  }
});

// Register company details
router.post("/register", authMiddleware, async (req, res) => {
  try {
    const { companyName, email, registrationNumber, documents } = req.body;

    let company = await Company.findOne({ userId: req.user.id });

    if (company) {
      return res.status(400).json({ message: "Company details already submitted" });
    }

    company = new Company({
      userId: req.user.id,
      companyName,
      email,
      registrationNumber,
      documents,
      status: "Pending"
    });

    await company.save();
    res.status(201).json({ message: "Company details submitted for verification", company });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all companies (for admin)
router.get("/all", async (req, res) => {
  try {
    const companies = await Company.find().populate("userId", "email");
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Verify company (admin only)
router.put("/verify/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Verified", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ message: "Company status updated", company });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all registered students with profiles
router.get("/students", authMiddleware, async (req, res) => {
  try {
    // Get all users with role 'student'
    const students = await User.find({ role: "student" }).select("-password");
    
    // Get profiles for all students
    const studentIds = students.map(s => s._id);
    const profiles = await StudentProfile.find({ userId: { $in: studentIds } });
    
    // Create a map of profiles by userId
    const profileMap = {};
    profiles.forEach(profile => {
      profileMap[profile.userId.toString()] = profile;
    });
    
    // Combine student data with profiles
    const studentsWithProfiles = students.map(student => ({
      _id: student._id,
      name: student.name,
      email: student.email,
      role: student.role,
      profile: profileMap[student._id.toString()] || null
    }));
    
    res.json(studentsWithProfiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Send email notification to student when shortlisted/approved
router.post("/notify-student", authMiddleware, async (req, res) => {
  try {
    const { applicationId, status } = req.body;
    
    const application = await Application.findById(applicationId)
      .populate("studentId", "name email")
      .populate("internshipId", "title")
      .populate({
        path: "internshipId",
        populate: {
          path: "companyId",
          select: "companyName"
        }
      });
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    // Configure email transporter (using Gmail as example)
    // IMPORTANT: Set up environment variables for email credentials
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    let subject = "";
    let message = "";
    
    if (status === "Shortlisted") {
      subject = `Congratulations! You've been shortlisted for ${application.internshipId.title}`;
      message = `
        <h2>Congratulations ${application.studentId.name}!</h2>
        <p>We're pleased to inform you that you've been <strong>shortlisted</strong> for the <strong>${application.internshipId.title}</strong> internship at <strong>${application.internshipId.companyId.companyName}</strong>.</p>
        <p>This is an important step forward in your application process. We were impressed by your application and would like to proceed to the next stage.</p>
        <h3>What's Next?</h3>
        <ul>
          <li>You may receive task assignments to evaluate your skills</li>
          <li>Keep an eye on your dashboard for updates</li>
          <li>Be prepared for potential interviews or further assessments</li>
        </ul>
        <p>We'll be in touch soon with more details.</p>
        <p>Best regards,<br>${application.internshipId.companyId.companyName} Team</p>
      `;
    } else if (status === "Approved") {
      subject = `🎉 Congratulations! Your internship application has been approved`;
      message = `
        <h2>Excellent News ${application.studentId.name}!</h2>
        <p>We're thrilled to inform you that your application for the <strong>${application.internshipId.title}</strong> internship at <strong>${application.internshipId.companyId.companyName}</strong> has been <strong>approved</strong>!</p>
        <h3>Welcome to the Team!</h3>
        <p>We were very impressed with your qualifications and enthusiasm, and we're excited to have you join us.</p>
        <h3>Next Steps:</h3>
        <ul>
          <li>Check your dashboard for onboarding information</li>
          <li>Complete any pending documentation</li>
          <li>Prepare for your internship start date</li>
        </ul>
        <p>We'll send you more details about the onboarding process shortly.</p>
        <p>Congratulations once again!</p>
        <p>Best regards,<br>${application.internshipId.companyId.companyName} Team</p>
      `;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: application.studentId.email,
      subject: subject,
      html: message
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    res.json({ message: "Notification sent successfully" });
  } catch (err) {
    console.error("Email notification error:", err);
    // Don't fail the request if email fails
    res.status(200).json({ message: "Status updated but email notification failed" });
  }
});

// Assign task to student
router.post("/assign-task", authMiddleware, async (req, res) => {
  try {
    const {
      applicationId,
      studentId,
      internshipId,
      title,
      description,
      deadline,
      priority
    } = req.body;
    
    if (!title || !description || !deadline) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }
    
    const task = new Task({
      companyId: req.user.id,
      studentId,
      internshipId,
      applicationId,
      title,
      description,
      deadline,
      priority: priority || "Medium"
    });
    
    await task.save();
    
    // Send email notification to student about new task
    try {
      const student = await User.findById(studentId);
      const application = await Application.findById(applicationId)
        .populate("internshipId")
        .populate({
          path: "internshipId",
          populate: {
            path: "companyId",
            select: "companyName"
          }
        });
      
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: `New Task Assigned: ${title}`,
        html: `
          <h2>New Task Assignment</h2>
          <p>Hello ${student.name},</p>
          <p>You have been assigned a new task for your <strong>${application.internshipId.title}</strong> internship at <strong>${application.internshipId.companyId.companyName}</strong>.</p>
          <h3>Task Details:</h3>
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>Deadline:</strong> ${new Date(deadline).toLocaleDateString()}</p>
          <p><strong>Priority:</strong> ${priority}</p>
          <p>Please log in to your dashboard to view full details and submit your work.</p>
          <p>Good luck!</p>
          <p>Best regards,<br>${application.internshipId.companyId.companyName} Team</p>
        `
      };
      
      await transporter.sendMail(mailOptions);
    } catch (emailErr) {
      console.error("Task notification email failed:", emailErr);
    }
    
    res.status(201).json({ message: "Task assigned successfully", task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all tasks assigned by company
router.get("/tasks", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ companyId: req.user.id })
      .populate("studentId", "name email")
      .populate("internshipId", "title")
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Review submitted task
router.put("/review-task/:taskId", authMiddleware, async (req, res) => {
  try {
    const { feedback, status } = req.body;
    
    if (!["Completed", "Reviewed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    if (task.companyId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    task.feedback = feedback;
    task.status = status;
    task.reviewedAt = new Date();
    
    await task.save();
    
    res.json({ message: "Task reviewed successfully", task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get current company's profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ message: "Company profile not found" });
    }
    res.json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update company profile (description, website, industry, logo, banner)
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { description, website, industry, companyLogo, companyBanner } = req.body;
    const company = await Company.findOne({ userId: req.user.id });
    
    if (!company) {
      return res.status(404).json({ message: "Company profile not found" });
    }
    
    if (description !== undefined) company.description = description;
    if (website !== undefined) company.website = website;
    if (industry !== undefined) company.industry = industry;
    if (companyLogo !== undefined) company.companyLogo = companyLogo;
    if (companyBanner !== undefined) company.companyBanner = companyBanner;
    
    await company.save();
    res.json({ message: "Profile updated successfully", company });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Upload company image (logo or banner)
router.post("/upload-image", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }
    
    const imageUrl = `/uploads/company-images/${req.file.filename}`;
    const imageType = req.body.type || "logo"; // "logo" or "banner"
    
    const company = await Company.findOne({ userId: req.user.id });
    if (company) {
      if (imageType === "banner") {
        company.companyBanner = imageUrl;
      } else {
        company.companyLogo = imageUrl;
      }
      await company.save();
    }
    
    res.json({ message: "Image uploaded successfully", imageUrl, imageType });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload image" });
  }
});

module.exports = router;