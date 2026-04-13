import React, { useState } from "react";

const ScheduleInterviewModal = ({ application, onClose, onSchedule }) => {
  const [interviewData, setInterviewData] = useState({
    scheduledDate: "",
    scheduledTime: "",
    duration: "60",
    interviewType: "Video Call",
    meetingLink: "",
    location: "",
    instructions: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSchedule(interviewData);
  };

  const generateZoomLink = () => {
    // This would integrate with Zoom API in production
    const zoomLink = `https://zoom.us/j/${Math.floor(Math.random() * 10000000000)}`;
    setInterviewData({ ...interviewData, meetingLink: zoomLink });
  };

  const generateGoogleMeetLink = () => {
    // This would integrate with Google Meet API in production
    const meetLink = `https://meet.google.com/${Math.random().toString(36).substring(7)}`;
    setInterviewData({ ...interviewData, meetingLink: meetLink });
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
        maxWidth: "700px",
        width: "100%",
        maxHeight: "90vh",
        overflow: "auto",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
      }}>
        {/* Header */}
        <div style={{
          padding: "1.5rem",
          borderBottom: "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
          backgroundColor: "white",
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start"
        }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827", marginBottom: "0.5rem" }}>
              Schedule Interview
            </h2>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              {application.studentId?.name} • {application.internshipId?.title}
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "grid", gap: "1.5rem" }}>
          {/* Date and Time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
                Interview Date *
              </label>
              <input
                type="date"
                value={interviewData.scheduledDate}
                onChange={(e) => setInterviewData({ ...interviewData, scheduledDate: e.target.value })}
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

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
                Interview Time *
              </label>
              <input
                type="time"
                value={interviewData.scheduledTime}
                onChange={(e) => setInterviewData({ ...interviewData, scheduledTime: e.target.value })}
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
          </div>

          {/* Interview Type and Duration */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
                Interview Type *
              </label>
              <select
                value={interviewData.interviewType}
                onChange={(e) => setInterviewData({ ...interviewData, interviewType: e.target.value })}
                style={{
                  padding: "0.75rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                  width: "100%",
                  boxSizing: "border-box",
                  backgroundColor: "white"
                }}
              >
                <option value="Video Call">Video Call</option>
                <option value="Phone Call">Phone Call</option>
                <option value="In-Person">In-Person</option>
                <option value="Technical Round">Technical Round</option>
                <option value="HR Round">HR Round</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
                Duration (min)
              </label>
              <input
                type="number"
                value={interviewData.duration}
                onChange={(e) => setInterviewData({ ...interviewData, duration: e.target.value })}
                min="15"
                max="180"
                step="15"
                style={{
                  padding: "0.75rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                  width: "100%",
                  boxSizing: "border-box"
                }}
              />
            </div>
          </div>

          {/* Meeting Link */}
          {(interviewData.interviewType === "Video Call" || interviewData.interviewType === "Technical Round") && (
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
                Meeting Link
              </label>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <button
                  type="button"
                  onClick={generateZoomLink}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#2d8cff",
                    color: "white",
                    border: "none",
                    borderRadius: "0.375rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: "500"
                  }}
                >
                  📹 Generate Zoom Link
                </button>
                <button
                  type="button"
                  onClick={generateGoogleMeetLink}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#00897b",
                    color: "white",
                    border: "none",
                    borderRadius: "0.375rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: "500"
                  }}
                >
                  📹 Generate Meet Link
                </button>
              </div>
              <input
                type="url"
                value={interviewData.meetingLink}
                onChange={(e) => setInterviewData({ ...interviewData, meetingLink: e.target.value })}
                placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                style={{
                  padding: "0.75rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                  width: "100%",
                  boxSizing: "border-box"
                }}
              />
              <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                Note: In production, integrate with Zoom/Google Meet API for real links
              </p>
            </div>
          )}

          {/* Location */}
          {interviewData.interviewType === "In-Person" && (
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
                Interview Location *
              </label>
              <input
                type="text"
                value={interviewData.location}
                onChange={(e) => setInterviewData({ ...interviewData, location: e.target.value })}
                required={interviewData.interviewType === "In-Person"}
                placeholder="Office address, room number, etc."
                style={{
                  padding: "0.75rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                  width: "100%",
                  boxSizing: "border-box"
                }}
              />
            </div>
          )}

          {/* Instructions */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
              Special Instructions
            </label>
            <textarea
              value={interviewData.instructions}
              onChange={(e) => setInterviewData({ ...interviewData, instructions: e.target.value })}
              placeholder="Any preparation required, documents to bring, dress code, etc."
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

          {/* Info Box */}
          <div style={{
            padding: "1rem",
            backgroundColor: "#eff6ff",
            borderRadius: "0.375rem",
            border: "1px solid #bfdbfe"
          }}>
            <p style={{ color: "#1e40af", fontSize: "0.875rem", margin: 0 }}>
              📧 The candidate will receive an email with interview details and calendar invitation.
            </p>
          </div>

          {/* Action Buttons */}
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
              Schedule Interview
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleInterviewModal;