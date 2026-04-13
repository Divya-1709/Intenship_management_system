const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  internshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Internship",
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 60 // Duration in minutes
  },
  interviewType: {
    type: String,
    enum: ["Video Call", "Phone Call", "In-Person", "Technical Round", "HR Round"],
    default: "Video Call"
  },
  meetingLink: {
    type: String // Zoom/Google Meet link
  },
  location: {
    type: String // For in-person interviews
  },
  status: {
    type: String,
    enum: ["Scheduled", "Rescheduled", "Completed", "Cancelled", "No Show"],
    default: "Scheduled"
  },
  instructions: {
    type: String // Special instructions for the interview
  },
  // Feedback after interview
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    strengths: String,
    improvements: String,
    recommendation: {
      type: String,
      enum: ["Highly Recommended", "Recommended", "Maybe", "Not Recommended"]
    },
    submittedAt: Date
  },
  // Reminders
  remindersSent: {
    oneDayBefore: {
      type: Boolean,
      default: false
    },
    oneHourBefore: {
      type: Boolean,
      default: false
    }
  },
  // Reschedule history
  rescheduleHistory: [{
    previousDate: Date,
    previousTime: String,
    reason: String,
    rescheduledBy: String, // 'student' or 'company'
    rescheduledAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Cancellation
  cancellationReason: String,
  cancelledBy: String, // 'student' or 'company'
  cancelledAt: Date
}, { timestamps: true });

// Index for efficient queries
InterviewSchema.index({ studentId: 1, scheduledDate: 1 });
InterviewSchema.index({ companyId: 1, scheduledDate: 1 });
InterviewSchema.index({ status: 1 });

module.exports = mongoose.model("Interview", InterviewSchema);