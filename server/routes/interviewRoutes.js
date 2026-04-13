const express = require("express");
const router = express.Router();
const Interview = require("../models/Interview");
const Application = require("../models/Application");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const authMiddleware = require("../middleware/authMiddleware");

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Schedule an interview (Company)
router.post("/schedule", authMiddleware, async (req, res) => {
  try {
    const {
      applicationId,
      studentId,
      internshipId,
      scheduledDate,
      scheduledTime,
      duration,
      interviewType,
      meetingLink,
      location,
      instructions
    } = req.body;

    // Validate required fields
    if (!applicationId || !studentId || !internshipId || !scheduledDate || !scheduledTime) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Check if application exists
    const application = await Application.findById(applicationId)
      .populate("studentId", "name email")
      .populate("internshipId", "title");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Create interview
    const interview = new Interview({
      applicationId,
      studentId,
      companyId: req.user.id,
      internshipId,
      scheduledDate,
      scheduledTime,
      duration: duration || 60,
      interviewType: interviewType || "Video Call",
      meetingLink,
      location,
      instructions
    });

    await interview.save();

    // Send email notification to student
    try {
      const emailContent = `
        <h2>Interview Scheduled!</h2>
        <p>Dear ${application.studentId.name},</p>
        <p>Your interview for <strong>${application.internshipId.title}</strong> has been scheduled.</p>
        
        <h3>Interview Details:</h3>
        <ul>
          <li><strong>Date:</strong> ${new Date(scheduledDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
          <li><strong>Time:</strong> ${scheduledTime}</li>
          <li><strong>Duration:</strong> ${duration || 60} minutes</li>
          <li><strong>Type:</strong> ${interviewType || "Video Call"}</li>
          ${meetingLink ? `<li><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></li>` : ''}
          ${location ? `<li><strong>Location:</strong> ${location}</li>` : ''}
        </ul>
        
        ${instructions ? `<p><strong>Instructions:</strong><br>${instructions}</p>` : ''}
        
        <p>Please be prepared and join on time. Good luck!</p>
        <p>You can view and manage your interview in your dashboard.</p>
        
        <p>Best regards,<br>Internship Platform Team</p>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: application.studentId.email,
        subject: `Interview Scheduled - ${application.internshipId.title}`,
        html: emailContent
      });
    } catch (emailErr) {
      console.error("Failed to send interview email:", emailErr);
    }

    res.status(201).json({
      message: "Interview scheduled successfully",
      interview
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all interviews for company
router.get("/company", authMiddleware, async (req, res) => {
  try {
    const interviews = await Interview.find({ companyId: req.user.id })
      .populate("studentId", "name email")
      .populate("internshipId", "title")
      .populate({
        path: "applicationId",
        select: "status"
      })
      .sort({ scheduledDate: 1, scheduledTime: 1 });

    res.json(interviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all interviews for student
router.get("/student", authMiddleware, async (req, res) => {
  try {
    const interviews = await Interview.find({ studentId: req.user.id })
      .populate({
        path: "internshipId",
        select: "title",
        populate: {
          path: "companyId",
          select: "companyName"
        }
      })
      .sort({ scheduledDate: 1, scheduledTime: 1 });

    res.json(interviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Reschedule interview
router.put("/reschedule/:id", authMiddleware, async (req, res) => {
  try {
    const { scheduledDate, scheduledTime, reason } = req.body;

    if (!scheduledDate || !scheduledTime || !reason) {
      return res.status(400).json({ message: "Please provide date, time, and reason" });
    }

    const interview = await Interview.findById(req.params.id)
      .populate("studentId", "name email")
      .populate("companyId", "name email")
      .populate("internshipId", "title");

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Check authorization
    const isStudent = interview.studentId._id.toString() === req.user.id;
    const isCompany = interview.companyId._id.toString() === req.user.id;

    if (!isStudent && !isCompany) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Save reschedule history
    interview.rescheduleHistory.push({
      previousDate: interview.scheduledDate,
      previousTime: interview.scheduledTime,
      reason,
      rescheduledBy: isStudent ? "student" : "company"
    });

    // Update interview
    interview.scheduledDate = scheduledDate;
    interview.scheduledTime = scheduledTime;
    interview.status = "Rescheduled";
    interview.remindersSent = {
      oneDayBefore: false,
      oneHourBefore: false
    };

    await interview.save();

    // Send email notifications
    const recipientEmail = isStudent ? interview.companyId.email : interview.studentId.email;
    const recipientName = isStudent ? interview.companyId.name : interview.studentId.name;
    const rescheduledBy = isStudent ? "student" : "company";

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: `Interview Rescheduled - ${interview.internshipId.title}`,
        html: `
          <h2>Interview Rescheduled</h2>
          <p>Dear ${recipientName},</p>
          <p>The interview for <strong>${interview.internshipId.title}</strong> has been rescheduled by the ${rescheduledBy}.</p>
          
          <h3>New Schedule:</h3>
          <ul>
            <li><strong>Date:</strong> ${new Date(scheduledDate).toLocaleDateString()}</li>
            <li><strong>Time:</strong> ${scheduledTime}</li>
          </ul>
          
          <p><strong>Reason:</strong> ${reason}</p>
          
          <p>Please check your dashboard for updated details.</p>
          
          <p>Best regards,<br>Internship Platform Team</p>
        `
      });
    } catch (emailErr) {
      console.error("Failed to send reschedule email:", emailErr);
    }

    res.json({ message: "Interview rescheduled successfully", interview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Cancel interview
router.put("/cancel/:id", authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Please provide cancellation reason" });
    }

    const interview = await Interview.findById(req.params.id)
      .populate("studentId", "name email")
      .populate("companyId", "name email")
      .populate("internshipId", "title");

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Check authorization
    const isStudent = interview.studentId._id.toString() === req.user.id;
    const isCompany = interview.companyId._id.toString() === req.user.id;

    if (!isStudent && !isCompany) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update interview
    interview.status = "Cancelled";
    interview.cancellationReason = reason;
    interview.cancelledBy = isStudent ? "student" : "company";
    interview.cancelledAt = new Date();

    await interview.save();

    // Send notification
    const recipientEmail = isStudent ? interview.companyId.email : interview.studentId.email;
    const recipientName = isStudent ? interview.companyId.name : interview.studentId.name;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: `Interview Cancelled - ${interview.internshipId.title}`,
        html: `
          <h2>Interview Cancelled</h2>
          <p>Dear ${recipientName},</p>
          <p>The interview for <strong>${interview.internshipId.title}</strong> scheduled on ${new Date(interview.scheduledDate).toLocaleDateString()} has been cancelled.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>Best regards,<br>Internship Platform Team</p>
        `
      });
    } catch (emailErr) {
      console.error("Failed to send cancellation email:", emailErr);
    }

    res.json({ message: "Interview cancelled", interview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Submit interview feedback (Company)
router.put("/feedback/:id", authMiddleware, async (req, res) => {
  try {
    const { rating, comments, strengths, improvements, recommendation } = req.body;

    if (!rating || !recommendation) {
      return res.status(400).json({ message: "Please provide rating and recommendation" });
    }

    const interview = await Interview.findById(req.params.id)
      .populate("studentId", "name email")
      .populate("internshipId", "title");

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Check authorization
    if (interview.companyId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update feedback
    interview.feedback = {
      rating,
      comments,
      strengths,
      improvements,
      recommendation,
      submittedAt: new Date()
    };
    interview.status = "Completed";

    await interview.save();

    // Notify student
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: interview.studentId.email,
        subject: `Interview Feedback - ${interview.internshipId.title}`,
        html: `
          <h2>Interview Feedback Received</h2>
          <p>Dear ${interview.studentId.name},</p>
          <p>Your interview feedback for <strong>${interview.internshipId.title}</strong> has been submitted.</p>
          <p>Please check your dashboard to view the detailed feedback.</p>
          <p>Best regards,<br>Internship Platform Team</p>
        `
      });
    } catch (emailErr) {
      console.error("Failed to send feedback email:", emailErr);
    }

    res.json({ message: "Feedback submitted successfully", interview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark interview as completed or no-show
router.put("/status/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Completed", "No Show"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Only company can update status
    if (interview.companyId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    interview.status = status;
    await interview.save();

    res.json({ message: "Interview status updated", interview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single interview details
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate("studentId", "name email")
      .populate({
        path: "internshipId",
        select: "title",
        populate: {
          path: "companyId",
          select: "companyName"
        }
      })
      .populate("applicationId");

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.json(interview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Send reminder emails (This should be called by a cron job)
router.post("/send-reminders", async (req, res) => {
  try {
    const now = new Date();
    const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    // Find interviews happening in 24 hours that haven't been reminded
    const oneDayInterviews = await Interview.find({
      scheduledDate: {
        $gte: now,
        $lte: oneDayLater
      },
      status: { $in: ["Scheduled", "Rescheduled"] },
      "remindersSent.oneDayBefore": false
    })
      .populate("studentId", "name email")
      .populate("internshipId", "title");

    // Send 24-hour reminders
    for (const interview of oneDayInterviews) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: interview.studentId.email,
          subject: `Interview Reminder - Tomorrow at ${interview.scheduledTime}`,
          html: `
            <h2>Interview Reminder</h2>
            <p>Dear ${interview.studentId.name},</p>
            <p>This is a reminder that you have an interview scheduled for <strong>${interview.internshipId.title}</strong> tomorrow.</p>
            <p><strong>Date:</strong> ${new Date(interview.scheduledDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${interview.scheduledTime}</p>
            ${interview.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${interview.meetingLink}">${interview.meetingLink}</a></p>` : ''}
            <p>Please be prepared and join on time. Good luck!</p>
          `
        });

        interview.remindersSent.oneDayBefore = true;
        await interview.save();
      } catch (emailErr) {
        console.error("Failed to send 24h reminder:", emailErr);
      }
    }

    res.json({
      message: "Reminders processed",
      oneDayReminders: oneDayInterviews.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;