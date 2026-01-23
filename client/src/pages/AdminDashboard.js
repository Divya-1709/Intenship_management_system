import React, { useEffect, useState } from "react";
import API from "../api/axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("stats");

  useEffect(() => {
    fetchStats();
    fetchCompanies();
    fetchStudents();
    fetchApplications();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/dashboard");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats");
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await API.get("/company/all");
      setCompanies(res.data);
    } catch (err) {
      console.error("Failed to fetch companies");
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await API.get("/student/all");
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch students");
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await API.get("/application/all");
      setApplications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch applications. Ensure the backend endpoint /application/all is implemented.", err);
    }
  };

  const verifyCompany = async (id, status) => {
    try {
      await API.put(`/company/verify/${id}`, { status });
      alert(`Company ${status}`);
      fetchCompanies();
      fetchStats();
    } catch (err) {
      alert("Failed to update company status");
    }
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f9fafb", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>
      <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#111827", marginBottom: "2rem" }}>Admin Dashboard</h2>
      <div style={{ marginBottom: "2rem", display: "flex", gap: "1rem" }}>
        <button onClick={() => setActiveTab("stats")} style={{ padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none", cursor: "pointer", backgroundColor: activeTab === "stats" ? "#4f46e5" : "#e5e7eb", color: activeTab === "stats" ? "white" : "#374151", fontWeight: "600" }}>Statistics</button>
        <button onClick={() => setActiveTab("companies")} style={{ padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none", cursor: "pointer", backgroundColor: activeTab === "companies" ? "#4f46e5" : "#e5e7eb", color: activeTab === "companies" ? "white" : "#374151", fontWeight: "600" }}>Manage Companies</button>
        <button onClick={() => setActiveTab("students")} style={{ padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none", cursor: "pointer", backgroundColor: activeTab === "students" ? "#4f46e5" : "#e5e7eb", color: activeTab === "students" ? "white" : "#374151", fontWeight: "600" }}>Student Records</button>
        <button onClick={() => setActiveTab("applications")} style={{ padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none", cursor: "pointer", backgroundColor: activeTab === "applications" ? "#4f46e5" : "#e5e7eb", color: activeTab === "applications" ? "white" : "#374151", fontWeight: "600" }}>Internship Tracking</button>
      </div>

      {activeTab === "stats" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
          <StatCard title="Total Students" value={stats.totalStudents} />
          <StatCard title="Total Companies" value={stats.totalCompanies} />
          <StatCard title="Verified Companies" value={stats.verifiedCompanies} />
          <StatCard title="Total Internships" value={stats.totalInternships} />
          <StatCard title="Total Applications" value={stats.totalApplications} />
        </div>
      )}

      {activeTab === "companies" && (
        <div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#374151", marginBottom: "1rem" }}>Company Verifications</h3>
          {companies.map((company) => (
            <div key={company._id} style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h4 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1f2937" }}>{company.companyName}</h4>
                <p style={{ color: "#4b5563", fontSize: "0.875rem", margin: "0.25rem 0" }}>{company.email} • Reg: {company.registrationNumber}</p>
                <p style={{ margin: "0.25rem 0", fontSize: "0.875rem" }}>Status: <span style={{ fontWeight: "600", color: company.status === "Verified" ? "#059669" : company.status === "Rejected" ? "#dc2626" : "#d97706" }}>{company.status}</span></p>
                <a href={company.documents} target="_blank" rel="noreferrer" style={{ color: "#4f46e5", textDecoration: "none", fontSize: "0.875rem", fontWeight: "500" }}>View Documents</a>
              </div>
              
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {company.status !== "Verified" && (
                  <button onClick={() => verifyCompany(company._id, "Verified")} style={{ padding: "0.5rem 1rem", backgroundColor: "#059669", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "500" }}>
                    Verify
                  </button>
                )}
                {company.status !== "Rejected" && (
                  <button onClick={() => verifyCompany(company._id, "Rejected")} style={{ padding: "0.5rem 1rem", backgroundColor: "#dc2626", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "500" }}>
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "students" && (
        <div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#374151", marginBottom: "1rem" }}>Student Records</h3>
          {students.length === 0 ? <p style={{ color: "#6b7280" }}>No students found.</p> : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {students.map((student) => (
                <div key={student._id} style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}>
                  <h4 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1f2937" }}>{student.name}</h4>
                  <p style={{ color: "#4b5563", fontSize: "0.875rem" }}>{student.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "applications" && (
        <div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#374151", marginBottom: "1rem" }}>Internship Tracking</h3>
          {applications.length === 0 ? <p style={{ color: "#6b7280" }}>No applications found.</p> : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {applications.map((app) => (
                <div key={app._id} style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h4 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1f2937" }}>{app.studentId?.name}</h4>
                      <p style={{ color: "#4b5563", fontSize: "0.875rem" }}>{app.studentId?.email}</p>
                    </div>
                    <span style={{ 
                      padding: "0.25rem 0.75rem", 
                      borderRadius: "9999px", 
                      fontSize: "0.75rem", 
                      fontWeight: "600", 
                      backgroundColor: app.status === "Approved" ? "#d1fae5" : app.status === "Rejected" ? "#fee2e2" : "#dbeafe", 
                      color: app.status === "Approved" ? "#065f46" : app.status === "Rejected" ? "#991b1b" : "#1e40af" 
                    }}>
                      {app.status}
                    </span>
                  </div>
                  <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
                    <p style={{ color: "#374151", fontSize: "0.875rem" }}><strong>Internship:</strong> {app.internshipId?.title}</p>
                    <p style={{ color: "#374151", fontSize: "0.875rem" }}><strong>Company:</strong> {app.internshipId?.companyId?.companyName || "N/A"}</p>
                    <p style={{ color: "#374151", fontSize: "0.875rem" }}><strong>Duration:</strong> {app.internshipId?.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)", textAlign: "center" }}>
    <h3 style={{ color: "#6b7280", fontSize: "0.875rem", fontWeight: "500", textTransform: "uppercase" }}>{title}</h3>
    <p style={{ fontSize: "2.25rem", fontWeight: "bold", color: "#111827", marginTop: "0.5rem" }}>{value}</p>
  </div>
);

export default AdminDashboard;