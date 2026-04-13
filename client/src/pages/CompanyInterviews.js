import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const CompanyInterviews = () => {
  const { themeName } = useTheme();
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "company") {
      navigate("/");
      return;
    }
    fetchInterviews();
  }, [navigate]);

  const fetchInterviews = async () => {
    try {
      const res = await API.get("/interview/company");
      setInterviews(res.data);
    } catch (err) {
      console.error("Failed to fetch interviews", err);
    }
  };

  const filteredInterviews = interviews.filter(interview => {
    if (filter === "All") return true;
    return interview.status === filter;
  });

  const upcomingInterviews = filteredInterviews.filter(i => 
    new Date(i.scheduledDate) >= new Date() && ["Scheduled", "Rescheduled"].includes(i.status)
  );

  const pastInterviews = filteredInterviews.filter(i => 
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

  const handleMarkCompleted = async (interviewId) => {
    try {
      await API.put(`/interview/status/${interviewId}`, { status: "Completed" });
      alert("Interview marked as completed");
      fetchInterviews();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleMarkNoShow = async (interviewId) => {
    try {
      await API.put(`/interview/status/${interviewId}`, { status: "No Show" });
      alert("Interview marked as No Show");
      fetchInterviews();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "var(--bg-primary)", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", transition: "background-color 0.3s ease" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "var(--text-primary)" }}>Interview Schedule</h2>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link to="/settings">
              <button style={{ padding: "0.5rem 1rem", backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}>⚙️ Settings</button>
            </Link>
            <button onClick={() => navigate("/company")} style={{ padding: "0.5rem 1rem", backgroundColor: "var(--text-muted)", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}>Back</button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          {["All", "Scheduled", "Rescheduled", "Completed", "Cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.375rem",
                border: "none",
                cursor: "pointer",
                backgroundColor: filter === status ? "#4f46e5" : "#e5e7eb",
                color: filter === status ? "white" : "#374151",
                fontWeight: "600"
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Upcoming Interviews */}
        {upcomingInterviews.length > 0 && (
          <div style={{ marginBottom: "3rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#374151", marginBottom: "1rem" }}>
              📅 Upcoming Interviews ({upcomingInterviews.length})
            </h3>
            <div style={{ display: "grid", gap: "1rem" }}>
              {upcomingInterviews.map((interview) => (
                <InterviewCard
                  key={interview._id}
                  interview={interview}
                  getStatusColor={getStatusColor}
                  onCancel={handleCancelInterview}
                  onMarkCompleted={handleMarkCompleted}
                  onMarkNoShow={handleMarkNoShow}
                  onFeedback={(int) => {
                    setSelectedInterview(int);
                    setShowFeedbackModal(true);
                  }}
                  onReschedule={(int) => {
                    setSelectedInterview(int);
                    setShowRescheduleModal(true);
                  }}
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
                <InterviewCard
                  key={interview._id}
                  interview={interview}
                  getStatusColor={getStatusColor}
                  onCancel={handleCancelInterview}
                  onMarkCompleted={handleMarkCompleted}
                  onMarkNoShow={handleMarkNoShow}
                  onFeedback={(int) => {
                    setSelectedInterview(int);
                    setShowFeedbackModal(true);
                  }}
                  isPast={true}
                />
              ))}
            </div>
          </div>
        )}

        {filteredInterviews.length === 0 && (
          <div style={{ backgroundColor: "var(--bg-secondary)", padding: "3rem", borderRadius: "0.5rem", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "1.125rem" }}>No interviews found</p>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedInterview && (
        <FeedbackModal
          interview={selectedInterview}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedInterview(null);
          }}
          onSubmit={() => {
            fetchInterviews();
            setShowFeedbackModal(false);
            setSelectedInterview(null);
          }}
        />
      )}
    </div>
  );
};

// Interview Card Component
const InterviewCard = ({ interview, getStatusColor, onCancel, onMarkCompleted, onMarkNoShow, onFeedback, onReschedule, isPast }) => {
  const statusColor = getStatusColor(interview.status);
  const interviewDate = new Date(interview.scheduledDate);
  const isToday = interviewDate.toDateString() === new Date().toDateString();
  const isPastDate = interviewDate < new Date();

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
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <h4 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1f2937", margin: 0 }}>
              {interview.studentId?.name}
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
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
            <strong>Position:</strong> {interview.internshipId?.title}
          </p>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
            <strong>Email:</strong> {interview.studentId?.email}
          </p>
        </div>
      </div>

      {/* Interview Details */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "0.375rem" }}>
        <div>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.25rem" }}>Date & Time</p>
          <p style={{ fontSize: "0.875rem", color: "#374151", fontWeight: "500" }}>
            📅 {interviewDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
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
              style={{ fontSize: "0.875rem", color: "#4f46e5", textDecoration: "underline" }}
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
        <div style={{ marginBottom: "1rem", padding: "0.75rem", backgroundColor: "#eff6ff", borderRadius: "0.375rem", border: "1px solid #bfdbfe" }}>
          <p style={{ fontSize: "0.75rem", color: "#1e40af", fontWeight: "500", marginBottom: "0.25rem" }}>Instructions:</p>
          <p style={{ fontSize: "0.875rem", color: "#374151" }}>{interview.instructions}</p>
        </div>
      )}

      {/* Feedback Display */}
      {interview.feedback && interview.feedback.rating && (
        <div style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "#f0fdf4", borderRadius: "0.375rem", border: "1px solid #86efac" }}>
          <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "#065f46", marginBottom: "0.5rem" }}>
            ⭐ Rating: {interview.feedback.rating}/5 - {interview.feedback.recommendation}
          </p>
          {interview.feedback.comments && (
            <p style={{ fontSize: "0.875rem", color: "#374151" }}>{interview.feedback.comments}</p>
          )}
        </div>
      )}

      {/* Actions */}
      {!isPast && interview.status !== "Cancelled" && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {interview.status === "Completed" && !interview.feedback?.rating && (
            <button
              onClick={() => onFeedback(interview)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#059669",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "0.875rem"
              }}
            >
              📝 Add Feedback
            </button>
          )}
          {["Scheduled", "Rescheduled"].includes(interview.status) && (
            <>
              {onReschedule && (
                <button
                  onClick={() => onReschedule(interview)}
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
                  🔄 Reschedule
                </button>
              )}
              <button
                onClick={() => onMarkCompleted(interview._id)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#059669",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "0.875rem"
                }}
              >
                ✓ Mark Complete
              </button>
              <button
                onClick={() => onMarkNoShow(interview._id)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "0.875rem"
                }}
              >
                No Show
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
                ✗ Cancel
              </button>
            </>
          )}
        </div>
      )}

      {/* Reschedule History */}
      {interview.rescheduleHistory && interview.rescheduleHistory.length > 0 && (
        <div style={{ marginTop: "1rem", padding: "0.75rem", backgroundColor: "#fef3c7", borderRadius: "0.375rem", border: "1px solid #fbbf24" }}>
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
    </div>
  );
};

// Feedback Modal Component
const FeedbackModal = ({ interview, onClose, onSubmit }) => {
  const [feedback, setFeedback] = useState({
    rating: 0,
    comments: "",
    strengths: "",
    improvements: "",
    recommendation: "Recommended"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/interview/feedback/${interview._id}`, feedback);
      alert("Feedback submitted successfully!");
      onSubmit();
    } catch (err) {
      alert("Failed to submit feedback");
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
              Interview Feedback
            </h2>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              {interview.studentId?.name}
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
          {/* Rating */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
              Overall Rating *
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedback({ ...feedback, rating: star })}
                  style={{
                    fontSize: "2rem",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: star <= feedback.rating ? "#fbbf24" : "#d1d5db"
                  }}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
              Recommendation *
            </label>
            <select
              value={feedback.recommendation}
              onChange={(e) => setFeedback({ ...feedback, recommendation: e.target.value })}
              style={{
                padding: "0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                width: "100%",
                boxSizing: "border-box",
                backgroundColor: "white"
              }}
            >
              <option value="Highly Recommended">Highly Recommended</option>
              <option value="Recommended">Recommended</option>
              <option value="Maybe">Maybe</option>
              <option value="Not Recommended">Not Recommended</option>
            </select>
          </div>

          {/* Comments */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
              Overall Comments
            </label>
            <textarea
              value={feedback.comments}
              onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
              placeholder="General feedback about the interview..."
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

          {/* Strengths */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
              Strengths
            </label>
            <textarea
              value={feedback.strengths}
              onChange={(e) => setFeedback({ ...feedback, strengths: e.target.value })}
              placeholder="What did the candidate do well?"
              style={{
                padding: "0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                width: "100%",
                minHeight: "80px",
                boxSizing: "border-box",
                fontFamily: "inherit"
              }}
            />
          </div>

          {/* Areas for Improvement */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
              Areas for Improvement
            </label>
            <textarea
              value={feedback.improvements}
              onChange={(e) => setFeedback({ ...feedback, improvements: e.target.value })}
              placeholder="What could be improved?"
              style={{
                padding: "0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                width: "100%",
                minHeight: "80px",
                boxSizing: "border-box",
                fontFamily: "inherit"
              }}
            />
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
              disabled={!feedback.rating}
              style={{
                flex: 1,
                padding: "0.75rem",
                backgroundColor: feedback.rating ? "#4f46e5" : "#d1d5db",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                cursor: feedback.rating ? "pointer" : "not-allowed",
                fontWeight: "600"
              }}
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyInterviews;