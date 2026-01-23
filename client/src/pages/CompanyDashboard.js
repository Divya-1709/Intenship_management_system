import React, { useEffect, useState } from "react";
import API from "../api/axios";

const CompanyDashboard = () => {
  const [view, setView] = useState("applicants"); // applicants, post, profile
  const [applicants, setApplicants] = useState([]);
  const [companyDetails, setCompanyDetails] = useState({
    companyName: "",
    email: "",
    registrationNumber: "",
    documents: ""
  });
  const [internshipData, setInternshipData] = useState({
    title: "",
    description: "",
    duration: "",
    stipend: "",
    eligibility: ""
  });

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const res = await API.get("/application/company");
      setApplicants(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      // If 404, it likely means company details aren't registered yet
      if (err.response && err.response.status === 404) {
        alert("Please complete your company profile first.");
        setView("profile");
      }
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/company/register", companyDetails);
      alert("Company details submitted for verification.");
      setView("applicants");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit details");
    }
  };

  const handlePostInternship = async (e) => {
    e.preventDefault();
    try {
      await API.post("/internship/post", internshipData);
      alert("Internship posted successfully!");
      setInternshipData({ title: "", description: "", duration: "", stipend: "", eligibility: "" });
      setView("applicants");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to post internship. Ensure you are verified.");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/application/update/${id}`, { status });
      alert("Status updated");
      fetchApplicants();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f9fafb", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>
      <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#111827", marginBottom: "2rem" }}>Company Dashboard</h2>
      <nav style={{ marginBottom: "2rem", display: "flex", gap: "1rem" }}>
        <button onClick={() => setView("applicants")} style={{ padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none", cursor: "pointer", backgroundColor: view === "applicants" ? "#4f46e5" : "#e5e7eb", color: view === "applicants" ? "white" : "#374151", fontWeight: "600" }}>Applicants</button>
        <button onClick={() => setView("post")} style={{ padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none", cursor: "pointer", backgroundColor: view === "post" ? "#4f46e5" : "#e5e7eb", color: view === "post" ? "white" : "#374151", fontWeight: "600" }}>Post Internship</button>
        <button onClick={() => setView("profile")} style={{ padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none", cursor: "pointer", backgroundColor: view === "profile" ? "#4f46e5" : "#e5e7eb", color: view === "profile" ? "white" : "#374151", fontWeight: "600" }}>Company Profile</button>
      </nav>

      {view === "applicants" && (
        <div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#374151", marginBottom: "1rem" }}>Applicants</h3>
          {applicants.length === 0 ? <p style={{ color: "#6b7280" }}>No applications found.</p> : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {applicants.map((app) => (
                <div key={app._id} style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}>
                  <p style={{ marginBottom: "0.5rem" }}><strong style={{ color: "#374151" }}>Student:</strong> {app.studentId?.name} <span style={{ color: "#6b7280" }}>({app.studentId?.email})</span></p>
                  <p style={{ marginBottom: "0.5rem" }}><strong style={{ color: "#374151" }}>Internship:</strong> {app.internshipId?.title}</p>
                  <p style={{ marginBottom: "1rem" }}><strong style={{ color: "#374151" }}>Status:</strong> <span style={{ fontWeight: "600", color: app.status === 'Approved' ? "#059669" : app.status === 'Rejected' ? "#dc2626" : "#2563eb" }}>{app.status}</span></p>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => updateStatus(app._id, "Shortlisted")} style={{ padding: "0.5rem 1rem", backgroundColor: "#d97706", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "500" }}>Shortlist</button>
                    <button onClick={() => updateStatus(app._id, "Approved")} style={{ padding: "0.5rem 1rem", backgroundColor: "#059669", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "500" }}>Approve</button>
                    <button onClick={() => updateStatus(app._id, "Rejected")} style={{ padding: "0.5rem 1rem", backgroundColor: "#dc2626", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "500" }}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "post" && (
        <div style={{ maxWidth: "600px", backgroundColor: "white", padding: "2rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#374151", marginBottom: "1.5rem" }}>Post New Internship</h3>
          <form onSubmit={handlePostInternship} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input placeholder="Title" value={internshipData.title} onChange={(e) => setInternshipData({...internshipData, title: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }} />
            <textarea placeholder="Description" value={internshipData.description} onChange={(e) => setInternshipData({...internshipData, description: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", minHeight: "100px", boxSizing: "border-box" }} />
            <input placeholder="Duration" value={internshipData.duration} onChange={(e) => setInternshipData({...internshipData, duration: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }} />
            <input placeholder="Stipend" value={internshipData.stipend} onChange={(e) => setInternshipData({...internshipData, stipend: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }} />
            <input placeholder="Eligibility Criteria (e.g. Min GPA 7.5)" value={internshipData.eligibility} onChange={(e) => setInternshipData({...internshipData, eligibility: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }} />
            <button type="submit" style={{ padding: "0.75rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600", marginTop: "0.5rem" }}>Post Internship</button>
          </form>
        </div>
      )}

      {view === "profile" && (
        <div style={{ maxWidth: "600px", backgroundColor: "white", padding: "2rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#374151", marginBottom: "1.5rem" }}>Complete Company Profile</h3>
          <p style={{ marginBottom: "1.5rem", color: "#6b7280" }}>Please provide your official company details for verification. (Your login password was set during sign-up).</p>
          <form onSubmit={handleProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input placeholder="Company Name" value={companyDetails.companyName} onChange={(e) => setCompanyDetails({...companyDetails, companyName: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }} />
            <input placeholder="Official Email" value={companyDetails.email} onChange={(e) => setCompanyDetails({...companyDetails, email: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }} />
            <input placeholder="Registration Number" value={companyDetails.registrationNumber} onChange={(e) => setCompanyDetails({...companyDetails, registrationNumber: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }} />
            <input placeholder="Document Link (Drive/URL)" value={companyDetails.documents} onChange={(e) => setCompanyDetails({...companyDetails, documents: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }} />
            <button type="submit" style={{ padding: "0.75rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600", marginTop: "0.5rem" }}>Submit for Verification</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;