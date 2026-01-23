import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
  const [internships, setInternships] = useState([]);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      const res = await API.get("/internship/all");
      setInternships(res.data);
    } catch (err) {
      alert("Failed to load internships");
    }
  };

  const applyInternship = async (internship) => {
    if (internship.eligibility && !window.confirm(`Eligibility Criteria: ${internship.eligibility}\n\nDo you meet these requirements?`)) {
      return;
    }

    try {
      await API.post("/application/apply", { internshipId: internship._id });
      alert("Applied successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Application failed");
    }
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f9fafb", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#111827" }}>Available Internships</h2>
        <Link to="/my-application">
          <button style={{ padding: "0.5rem 1rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}>View My Applications</button>
        </Link>
      </div>

      {internships.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No internships available</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {internships.map((internship) => (
            <div
              key={internship._id}
              style={{
                backgroundColor: "white",
                padding: "1.5rem",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1f2937", marginBottom: "0.5rem" }}>{internship.title}</h3>
                <p style={{ color: "#4b5563", fontSize: "0.875rem", marginBottom: "1rem" }}>{internship.description}</p>
                <div style={{ marginBottom: "1rem" }}>
                  <p style={{ color: "#374151", fontSize: "0.875rem" }}><strong>Duration:</strong> {internship.duration}</p>
                  <p style={{ color: "#374151", fontSize: "0.875rem" }}><strong>Stipend:</strong> {internship.stipend}</p>
                  <p style={{ color: "#374151", fontSize: "0.875rem" }}><strong>Eligibility:</strong> {internship.eligibility || "N/A"}</p>
                  <p style={{ color: "#374151", fontSize: "0.875rem" }}><strong>Company:</strong> {internship.companyId?.companyName}</p>
                </div>
              </div>

              <button onClick={() => applyInternship(internship)} style={{ width: "100%", padding: "0.5rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "500", marginTop: "1rem" }}>
                Apply Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
