import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const StudentInterviews = () => {
  const { themeName } = useTheme();
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "student") {
      navigate("/");
      return;
    }
    fetchInterviews();
  }, [navigate]);

  const fetchInterviews = async () => {
    try {
      const res = await API.get("/interview/student");
      setInterviews(res.data);
    } catch (err) {
      console.error("Failed to fetch interviews", err);
    }
  };

  const upcomingInterviews = interviews.filter(i => 
    new Date(i.scheduledDate) >= new Date() && ["Scheduled", "Rescheduled"].includes(i.status)
  );

  const pastInterviews = interviews.filter(i => 
    new Date(i.scheduledDate) < new Date() || ["Completed", "Cancelled", "No Show"].includes(i.status)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
        return { bg: "#dbeafe", text: "#1e40af" };
      case "Rescheduled":
        return { bg: "#fef3c7", text: "#92400e" };
      case "Completed":
        return { bg: "#d1fae5", text: "#065f46" };
      case "Cancelled":
        return { bg: "#fee2e2", text: "#991b1b" };
      case "No Show":
        return { bg: "#f3f4f6", text: "#6b7280" };
      default:
        return { bg: "#f3f4f6", text: "#374151" };
    }
  };

  const handleCancelInterview = async (interviewId) => {
    const reason = prompt("Please enter cancellation reason:");
    if (!reason) return;

    try {
      await API.put(`/interview/cancel/${interviewId}`, { reason });
      alert("Interview cancelled successfully");
      fetchInterviews();
    } catch (err) {
      alert("Failed to cancel interview");
    }
  };

  const handleRequestReschedule = (interview) => {
    setSelectedInterview(interview);
    setShowRescheduleModal(true);
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "var(--bg-primary)", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", transition: "background-color 0.3s ease" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "var(--text-primary)" }}>My Interviews</h2>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link to="/settings">
              <button style={{ padding: "0.5rem 1rem", backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}>⚙️ Settings</button>
            </Link>
            <Link to="/student">
              <button style={{ padding: "0.5rem 1rem", backgroundColor: "var(--text-muted)", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}>Back</button>
            </Link>
          </div>
        </div>

        {/* Upcoming Interviews */}
        {upcomingInterviews.length > 0 && (
          <div style={{ marginBottom: "3rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#374151", marginBottom: "1rem" }}>
              📅 Upcoming Interviews ({upcomingInterviews.length})
            </h3>
            <div style={{ display: "grid", gap: "1rem" }}>
              {upcomingInterviews.map((interview) => (
                <StudentInterviewCard
                  key={interview._id}
                  interview={interview}
                  getStatusColor={getStatusColor}
                  onCancel={handleCancelInterview}
                  onRequestReschedule={handleRequestReschedule}
                />
              ))}
            </div>
          </div>
        )}

        {/* Past Interviews */}
        {pastInterviews.length > 0 && (
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#374151", marginBottom: "1rem" }}>
              📋 Past Interviews ({pastInterviews.length})
            </h3>
            <div style={{ display: "grid", gap: "1rem" }}>
              {pastInterviews.map((interview) => (
                <StudentInterviewCard
                  key={interview._id}
                  interview={interview}
                  getStatusColor={getStatusColor}
                  isPast={true}
                />
              ))}
            </div>
          </div>
        )}

        {interviews.length === 0 && (
          <div style={{ backgroundColor: "var(--bg-secondary)", padding: "3rem", borderRadius: "0.5rem", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "1.125rem" }}>No interviews scheduled yet</p>
            <p style={{ color: "#9ca3af", fontSize: "0.875rem", marginTop: "0.5rem" }}>
              Interviews will appear here when companies schedule them
            </p>
          </div>
        )}
      </div>

      {/* Reschedule Request Modal */}
      {showRescheduleModal && selectedInterview && (
        <RescheduleRequestModal
          interview={selectedInterview}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedInterview(null);
          }}
          onSubmit={() => {
            fetchInterviews();
            setShowRescheduleModal(false);
            setSelectedInterview(null);
          }}
        />
      )}
    </div>
  );
};

// Student Interview Card Component
const StudentInterviewCard = ({ interview, getStatusColor, onCancel, onRequestReschedule, isPast }) => {
  const statusColor = getStatusColor(interview.status);
  const interviewDate = new Date(interview.scheduledDate);
  const isToday = interviewDate.toDateString() === new Date().toDateString();
  const hoursUntil = Math.floor((interviewDate - new Date()) / (1000 * 60 * 60));

  return (
    <div style={{
      backgroundColor: "var(--bg-secondary)",
      padding: "1.5rem",
      borderRadius: "0.5rem",
      boxShadow: "var(--card-shadow)",
      border: isToday ? "2px solid var(--accent-primary)" : "1px solid var(--border-color)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
            <h4 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1f2937", margin: 0 }}>
              {interview.internshipId?.title}
            </h4>
            <span style={{
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: "600",
              backgroundColor: statusColor.bg,
              color: statusColor.text
            }}>
              {interview.status}
            </span>
            {isToday && (
              <span style={{
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontWeight: "600",
                backgroundColor: "#4f46e5",
                color: "white"
              }}>
                TODAY
              </span>
            )}
          </div>
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
            <strong>Company:</strong> {interview.internshipId?.companyId?.companyName}
          </p>
        </div>
      </div>

      {/* Countdown Timer */}
      {!isPast && isToday && hoursUntil >= 0 && (
        <div style={{
          padding: "1rem",
          backgroundColor: "#fef3c7",
          borderRadius: "0.375rem",
          border: "1px solid #fbbf24",
          marginBottom: "1rem"
        }}>
          <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "#92400e", margin: 0 }}>
            ⏰ Interview starts in {hoursUntil === 0 ? "less than an hour" : `${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}`}
          </p>
        </div>
      )}

      {/* Interview Details */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "1rem",
        padding: "1rem",
        backgroundColor: "#f9fafb",
        borderRadius: "0.375rem"
      }}>
        <div>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.25rem" }}>Date & Time</p>
          <p style={{ fontSize: "0.875rem", color: "#374151", fontWeight: "500" }}>
            📅 {interviewDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <p style={{ fontSize: "0.875rem", color: "#374151", fontWeight: "500" }}>
            🕐 {interview.scheduledTime}
          </p>
        </div>
        <div>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.25rem" }}>Type & Duration</p>
          <p style={{ fontSize: "0.875rem", color: "#374151", fontWeight: "500" }}>
            {interview.interviewType}
          </p>
          <p style={{ fontSize: "0.875rem", color: "#374151" }}>
            {interview.duration} minutes
          </p>
        </div>
        {interview.meetingLink && (
          <div>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.25rem" }}>Meeting Link</p>
            <a
              href={interview.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                padding: "0.5rem 1rem",
                backgroundColor: "#4f46e5",
                color: "white",
                textDecoration: "none",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginTop: "0.25rem"
              }}
            >
              Join Meeting 🔗
            </a>
          </div>
        )}
        {interview.location && (
          <div>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.25rem" }}>Location</p>
            <p style={{ fontSize: "0.875rem", color: "#374151" }}>
              📍 {interview.location}
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      {interview.instructions && (
        <div style={{
          marginBottom: "1rem",
          padding: "1rem",
          backgroundColor: "#eff6ff",
          borderRadius: "0.375rem",
          border: "1px solid #bfdbfe"
        }}>
          <p style={{ fontSize: "0.75rem", color: "#1e40af", fontWeight: "600", marginBottom: "0.5rem" }}>
            📋 Special Instructions:
          </p>
          <p style={{ fontSize: "0.875rem", color: "#374151", whiteSpace: "pre-wrap" }}>
            {interview.instructions}
          </p>
        </div>
      )}

      {/* Feedback Display */}
      {interview.feedback && interview.feedback.rating && (
        <div style={{
          marginBottom: "1rem",
          padding: "1rem",
          backgroundColor: "#f0fdf4",
          borderRadius: "0.375rem",
          border: "1px solid #86efac"
        }}>
          <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "#065f46", marginBottom: "0.5rem" }}>
            Interview Feedback
          </p>
          <p style={{ fontSize: "0.875rem", color: "#374151", marginBottom: "0.5rem" }}>
            ⭐ Rating: {interview.feedback.rating}/5
          </p>
          <p style={{ fontSize: "0.875rem", color: "#374151", marginBottom: "0.5rem" }}>
            <strong>Recommendation:</strong> {interview.feedback.recommendation}
          </p>
          {interview.feedback.comments && (
            <p style={{ fontSize: "0.875rem", color: "#374151", marginTop: "0.5rem" }}>
              <strong>Comments:</strong> {interview.feedback.comments}
            </p>
          )}
          {interview.feedback.strengths && (
            <p style={{ fontSize: "0.875rem", color: "#374151", marginTop: "0.5rem" }}>
              <strong>Strengths:</strong> {interview.feedback.strengths}
            </p>
          )}
          {interview.feedback.improvements && (
            <p style={{ fontSize: "0.875rem", color: "#374151", marginTop: "0.5rem" }}>
              <strong>Areas for Improvement:</strong> {interview.feedback.improvements}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      {!isPast && ["Scheduled", "Rescheduled"].includes(interview.status) && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            onClick={() => onRequestReschedule(interview)}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#d97706",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "0.875rem"
            }}
          >
            🔄 Request Reschedule
          </button>
          <button
            onClick={() => onCancel(interview._id)}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "0.875rem"
            }}
          >
            ✗ Cancel Interview
          </button>
        </div>
      )}

      {/* Reschedule History */}
      {interview.rescheduleHistory && interview.rescheduleHistory.length > 0 && (
        <div style={{
          marginTop: "1rem",
          padding: "0.75rem",
          backgroundColor: "#fef3c7",
          borderRadius: "0.375rem",
          border: "1px solid #fbbf24"
        }}>
          <p style={{ fontSize: "0.75rem", fontWeight: "600", color: "#92400e", marginBottom: "0.5rem" }}>
            Reschedule History:
          </p>
          {interview.rescheduleHistory.map((history, index) => (
            <p key={index} style={{ fontSize: "0.75rem", color: "#374151", marginBottom: "0.25rem" }}>
              • {new Date(history.previousDate).toLocaleDateString()} at {history.previousTime} - {history.reason}
            </p>
          ))}
        </div>
      )}

      {/* Cancellation Info */}
      {interview.status === "Cancelled" && interview.cancellationReason && (
        <div style={{
          marginTop: "1rem",
          padding: "0.75rem",
          backgroundColor: "#fee2e2",
          borderRadius: "0.375rem",
          border: "1px solid #fca5a5"
        }}>
          <p style={{ fontSize: "0.75rem", fontWeight: "600", color: "#991b1b", marginBottom: "0.25rem" }}>
            Cancellation Reason:
          </p>
          <p style={{ fontSize: "0.875rem", color: "#374151" }}>
            {interview.cancellationReason}
          </p>
        </div>
      )}
    </div>
  );
};

// Reschedule Request Modal
const RescheduleRequestModal = ({ interview, onClose, onSubmit }) => {
  const [rescheduleData, setRescheduleData] = useState({
    scheduledDate: "",
    scheduledTime: "",
    reason: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/interview/reschedule/${interview._id}`, rescheduleData);
      alert("Reschedule request submitted successfully!");
      onSubmit();
    } catch (err) {
      alert("Failed to submit reschedule request");
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      padding: "1rem"
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "0.5rem",
        maxWidth: "600px",
        width: "100%",
        maxHeight: "90vh",
        overflow: "auto",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{
          padding: "1.5rem",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start"
        }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827", marginBottom: "0.5rem" }}>
              Request Reschedule
            </h2>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              {interview.internshipId?.title}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "0.5rem",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "1.5rem",
              color: "#6b7280",
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
          {/* Current Schedule Info */}
          <div style={{
            padding: "1rem",
            backgroundColor: "#f9fafb",
            borderRadius: "0.375rem"
          }}>
            <p style={{ fontSize: "0.875rem", color: "#374151", marginBottom: "0.5rem" }}>
              <strong>Current Schedule:</strong>
            </p>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              {new Date(interview.scheduledDate).toLocaleDateString()} at {interview.scheduledTime}
            </p>
          </div>

          {/* New Date */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
              Preferred New Date *
            </label>
            <input
              type="date"
              value={rescheduleData.scheduledDate}
              onChange={(e) => setRescheduleData({ ...rescheduleData, scheduledDate: e.target.value })}
              required
              min={new Date().toISOString().split('T')[0]}
              style={{
                padding: "0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                width: "100%",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* New Time */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
              Preferred New Time *
            </label>
            <input
              type="time"
              value={rescheduleData.scheduledTime}
              onChange={(e) => setRescheduleData({ ...rescheduleData, scheduledTime: e.target.value })}
              required
              style={{
                padding: "0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                width: "100%",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* Reason */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
              Reason for Rescheduling *
            </label>
            <textarea
              value={rescheduleData.reason}
              onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
              required
              placeholder="Please explain why you need to reschedule..."
              style={{
                padding: "0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                width: "100%",
                minHeight: "100px",
                boxSizing: "border-box",
                fontFamily: "inherit"
              }}
            />
          </div>

          {/* Info */}
          <div style={{
            padding: "1rem",
            backgroundColor: "#eff6ff",
            borderRadius: "0.375rem",
            border: "1px solid #bfdbfe"
          }}>
            <p style={{ fontSize: "0.875rem", color: "#1e40af", margin: 0 }}>
              💡 The company will be notified of your reschedule request and will confirm the new time.
            </p>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "0.75rem",
                backgroundColor: "#f3f4f6",
                color: "#374151",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: "0.75rem",
                backgroundColor: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentInterviews;