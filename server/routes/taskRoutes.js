const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");

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

// Update task status (mark as in progress)
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

module.exports = router;