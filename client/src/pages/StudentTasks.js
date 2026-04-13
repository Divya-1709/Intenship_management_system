import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const StudentTasks = () => {
  const { themeName } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    submissionLink: "",
    submissionNotes: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "student") {
      navigate("/");
      return;
    }
    fetchTasks();
  }, [navigate]);

  const fetchTasks = async () => {
    try {
      const res = await API.get("/student/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await API.put(`/student/task-status/${taskId}`, { status });
      fetchTasks();
    } catch (err) {
      alert("Failed to update task status");
    }
  };

  const handleSubmitClick = (task) => {
    setSelectedTask(task);
    setShowSubmitModal(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/student/submit-task/${selectedTask._id}`, submissionData);
      alert("Task submitted successfully!");
      setShowSubmitModal(false);
      setSubmissionData({ submissionLink: "", submissionNotes: "" });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit task");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Assigned":
        return { bg: "#dbeafe", text: "#1e40af" };
      case "In Progress":
        return { bg: "#fef3c7", text: "#92400e" };
      case "Completed":
        return { bg: "#d1fae5", text: "#065f46" };
      case "Reviewed":
        return { bg: "#e0e7ff", text: "#4338ca" };
      default:
        return { bg: "#f3f4f6", text: "#374151" };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return { bg: "#fee2e2", text: "#991b1b" };
      case "Medium":
        return { bg: "#ffedd5", text: "#9a3412" };
      case "Low":
        return { bg: "#dbeafe", text: "#1e40af" };
      default:
        return { bg: "#f3f4f6", text: "#374151" };
    }
  };

  const isOverdue = (deadline, status) => {
    if (status === "Completed" || status === "Reviewed") return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "var(--bg-primary)", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", transition: "background-color 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "var(--text-primary)" }}>My Tasks</h2>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to="/settings">
            <button style={{ padding: "0.5rem 1rem", backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}>⚙️ Settings</button>
          </Link>
          <Link to="/student">
            <button style={{ padding: "0.5rem 1rem", backgroundColor: "var(--text-muted)", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}>Back</button>
          </Link>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div style={{ backgroundColor: "var(--bg-secondary)", padding: "3rem", borderRadius: "0.5rem", textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "1.125rem" }}>No tasks assigned yet</p>
          <p style={{ color: "#9ca3af", fontSize: "0.875rem", marginTop: "0.5rem" }}>
            Tasks will appear here when companies assign them to you
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {tasks.map((task) => {
            const statusColor = getStatusColor(task.status);
            const priorityColor = getPriorityColor(task.priority);
            const overdue = isOverdue(task.deadline, task.status);

            return (
              <div
                key={task._id}
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  padding: "1.5rem",
                  borderRadius: "0.5rem",
                  boxShadow: "var(--card-shadow)",
                  border: overdue ? "2px solid var(--error-border)" : "1px solid var(--border-color)"
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1f2937", margin: 0 }}>
                        {task.title}
                      </h3>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          backgroundColor: priorityColor.bg,
                          color: priorityColor.text
                        }}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                      <strong>Company:</strong> {task.internshipId?.companyId?.companyName}
                    </p>
                    <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                      <strong>Internship:</strong> {task.internshipId?.title}
                    </p>
                  </div>
                  <span
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "9999px",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      backgroundColor: statusColor.bg,
                      color: statusColor.text
                    }}
                  >
                    {task.status}
                  </span>
                </div>

                {/* Description */}
                <div style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "0.375rem" }}>
                  <p style={{ color: "#374151", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                    {task.description}
                  </p>
                </div>

                {/* Deadline */}
                <div style={{ marginBottom: "1rem" }}>
                  <p style={{ fontSize: "0.875rem", color: overdue ? "#dc2626" : "#374151" }}>
                    <strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}
                    {overdue && <span style={{ marginLeft: "0.5rem", fontWeight: "600" }}>⚠️ OVERDUE</span>}
                  </p>
                  {task.submittedAt && (
                    <p style={{ fontSize: "0.875rem", color: "#059669", marginTop: "0.25rem" }}>
                      <strong>Submitted:</strong> {new Date(task.submittedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Submission Info */}
                {task.submissionLink && (
                  <div style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "#eff6ff", borderRadius: "0.375rem", border: "1px solid #bfdbfe" }}>
                    <p style={{ fontSize: "0.875rem", color: "#1e40af", marginBottom: "0.5rem" }}>
                      <strong>Your Submission:</strong>
                    </p>
                    <a
                      href={task.submissionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#4f46e5", textDecoration: "underline", fontSize: "0.875rem" }}
                    >
                      View Submission
                    </a>
                    {task.submissionNotes && (
                      <p style={{ fontSize: "0.875rem", color: "#374151", marginTop: "0.5rem" }}>
                        <strong>Notes:</strong> {task.submissionNotes}
                      </p>
                    )}
                  </div>
                )}

                {/* Feedback */}
                {task.feedback && (
                  <div style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "#f0fdf4", borderRadius: "0.375rem", border: "1px solid #86efac" }}>
                    <p style={{ fontSize: "0.875rem", color: "#065f46", marginBottom: "0.5rem" }}>
                      <strong>Company Feedback:</strong>
                    </p>
                    <p style={{ fontSize: "0.875rem", color: "#374151", lineHeight: "1.6" }}>
                      {task.feedback}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {task.status === "Assigned" && (
                    <button
                      onClick={() => updateTaskStatus(task._id, "In Progress")}
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
                      Start Working
                    </button>
                  )}
                  {(task.status === "Assigned" || task.status === "In Progress") && (
                    <button
                      onClick={() => handleSubmitClick(task)}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#4f46e5",
                        color: "white",
                        border: "none",
                        borderRadius: "0.375rem",
                        cursor: "pointer",
                        fontWeight: "500",
                        fontSize: "0.875rem"
                      }}
                    >
                      Submit Task
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Task Modal */}
      {showSubmitModal && selectedTask && (
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
                  Submit Task
                </h2>
                <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                  {selectedTask.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setSubmissionData({ submissionLink: "", submissionNotes: "" });
                }}
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

            <form onSubmit={handleSubmitTask} style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
                  Submission Link (Google Drive, GitHub, etc.) *
                </label>
                <input
                  type="url"
                  value={submissionData.submissionLink}
                  onChange={(e) => setSubmissionData({ ...submissionData, submissionLink: e.target.value })}
                  required
                  placeholder="https://drive.google.com/... or https://github.com/..."
                  style={{
                    padding: "0.75rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #d1d5db",
                    width: "100%",
                    boxSizing: "border-box"
                  }}
                />
                <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                  Make sure the link is publicly accessible
                </p>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={submissionData.submissionNotes}
                  onChange={(e) => setSubmissionData({ ...submissionData, submissionNotes: e.target.value })}
                  placeholder="Any additional information about your submission..."
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

              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowSubmitModal(false);
                    setSubmissionData({ submissionLink: "", submissionNotes: "" });
                  }}
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
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTasks;