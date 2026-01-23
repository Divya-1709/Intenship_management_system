import React, { useEffect, useState } from "react";
import API from "../api/axios";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await API.get("/application/my");
      setApplications(res.data);
    } catch (err) {
      alert("Failed to load applications");
    }
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f9fafb", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>
      <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#111827", marginBottom: "2rem" }}>My Applications</h2>

      {applications.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No applications found</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {applications.map((app) => (
            <div
              key={app._id}
              style={{
                backgroundColor: "white",
                padding: "1.5rem",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
              }}
            >
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1f2937", marginBottom: "0.5rem" }}>{app.internshipId?.title}</h3>
              <div style={{ marginBottom: "1rem" }}>
                <p style={{ color: "#4b5563", fontSize: "0.875rem" }}><strong>Duration:</strong> {app.internshipId?.duration}</p>
                <p style={{ color: "#4b5563", fontSize: "0.875rem" }}><strong>Stipend:</strong> {app.internshipId?.stipend}</p>
              </div>

              <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
                <span style={{ fontSize: "0.875rem", color: "#374151" }}>Status: </span>
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "9999px",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    backgroundColor: app.status === "Approved" ? "#d1fae5" : app.status === "Rejected" ? "#fee2e2" : app.status === "Shortlisted" ? "#ffedd5" : "#dbeafe",
                    color: app.status === "Approved" ? "#065f46" : app.status === "Rejected" ? "#991b1b" : app.status === "Shortlisted" ? "#9a3412" : "#1e40af"
                  }}
                >
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
