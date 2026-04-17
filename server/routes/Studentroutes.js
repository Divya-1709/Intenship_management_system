const express = require("express");
const router = express.Router();
const StudentProfile = require("../models/Studentprofilemodel");
const authMiddleware = require("../middleware/authMiddleware");

// Get student profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create or update student profile
router.post("/profile", authMiddleware, async (req, res) => {
  try {
    const {
      phone,
      college,
      degree,
      branch,
      yearOfStudy,
      gpa,
      skills,
      resume,
      linkedin,
      github
    } = req.body;

    // Validate required fields
    if (!phone || !college || !degree || !branch || !yearOfStudy || !gpa || !skills || !resume) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Validate GPA
    if (gpa < 0 || gpa > 10) {
      return res.status(400).json({ message: "GPA must be between 0 and 10" });
    }

    // Validate year of study
    if (yearOfStudy < 1 || yearOfStudy > 4) {
      return res.status(400).json({ message: "Year of study must be between 1 and 4" });
    }

    // Check if profile already exists
    let profile = await StudentProfile.findOne({ userId: req.user.id });

    if (profile) {
      // Update existing profile
      profile.phone = phone;
      profile.college = college;
      profile.degree = degree;
      profile.branch = branch;
      profile.yearOfStudy = yearOfStudy;
      profile.gpa = gpa;
      profile.skills = skills;
      profile.resume = resume;
      profile.linkedin = linkedin;
      profile.github = github;

      await profile.save();
      return res.json({ message: "Profile updated successfully", profile });
    } else {
      // Create new profile
      profile = new StudentProfile({
        userId: req.user.id,
        phone,
        college,
        degree,
        branch,
        yearOfStudy,
        gpa,
        skills,
        resume,
        linkedin,
        github
      });

      await profile.save();
      return res.status(201).json({ message: "Profile created successfully", profile });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// At the end of the file, before module.exports
const Task = require("../models/Task");

// Get all tasks assigned to student
router.get("/tasks", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ studentId: req.user.id })
      .populate("internshipId", "title")
      .populate({
        path: "internshipId",
        populate: {
          path: "companyId",
          select: "companyName"
        }
      })
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Submit task
router.put("/submit-task/:taskId", authMiddleware, async (req, res) => {
  try {
    const { submissionLink, submissionNotes } = req.body;
    
    if (!submissionLink) {
      return res.status(400).json({ message: "Submission link is required" });
    }
    
    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    if (task.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    task.submissionLink = submissionLink;
    task.submissionNotes = submissionNotes;
    task.status = "Completed";
    task.submittedAt = new Date();
    
    await task.save();
    
    res.json({ message: "Task submitted successfully", task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update task status
router.put("/task-status/:taskId", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!["In Progress", "Assigned"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    if (task.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    task.status = status;
    await task.save();
    
    res.json({ message: "Task status updated", task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

const User = require("../models/User");
const Application = require("../models/Application");
const Payment = require("../models/Payment");

// Delete student account and all related data
router.delete("/delete-account", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Delete profile
    await StudentProfile.deleteOne({ userId });
    
    // Delete applications
    await Application.deleteMany({ studentId: userId });
    
    // Delete tasks
    await Task.deleteMany({ studentId: userId });
    
    // Delete payments
    await Payment.deleteMany({ studentId: userId });
    
    // Delete user account
    await User.findByIdAndDelete(userId);
    
    res.json({ message: "Account and associated data successfully deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during account deletion" });
  }
});

module.exports = router;