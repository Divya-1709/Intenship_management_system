import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import ScheduleInterviewModal from "../components/ScheduleInterviewModel";
import { useTheme } from "../context/ThemeContext";

const CompanyDashboard = () => {
  const { themeName } = useTheme();
  const [view, setView] = useState("applicants");
  const [applicants, setApplicants] = useState([]);
  const [students, setStudents] = useState([]);
  const [myInternships, setMyInternships] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    deadline: "",
    priority: "Medium"
  });
  const navigate = useNavigate();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
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
    eligibility: "",
    internshipType: "Unpaid",
    registrationFee: "",
    stipendAmount: ""
  });
  const [payouts, setPayouts] = useState([]);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutData, setPayoutData] = useState({
    applicationId: "",
    studentId: "",
    internshipId: "",
    amount: "",
    payoutMode: "BankTransfer",
    payoutReference: "",
    month: ""
  });
  const [approvedStipendApplicants, setApprovedStipendApplicants] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "company") {
      navigate("/");
      return;
    }

    if (view === "applicants") fetchApplicants();
    if (view === "internships") fetchMyInternships();
    if (view === "students") fetchStudents();
    if (view === "payouts") { fetchPayouts(); fetchApprovedStipendApplicants(); }
  }, [view, navigate]);

  const fetchApplicants = async () => {
    try {
      const res = await API.get("/application/company");
      setApplicants(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        alert("Please complete your company profile first.");
        setView("profile");
      }
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await API.get("/company/students");
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  const fetchMyInternships = async () => {
    try {
      const res = await API.get("/internship/company");
      setMyInternships(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch internships");
    }
  };

  const fetchPayouts = async () => {
    try {
      const res = await API.get("/payment/company-payments");
      setPayouts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch payouts", err);
    }
  };

  const fetchApprovedStipendApplicants = async () => {
    try {
      const appRes = await API.get("/application/company");
      const apps = Array.isArray(appRes.data) ? appRes.data : [];
      const approved = apps.filter(a => a.status === "Approved" && a.internshipId?.internshipType === "StipendBased");
      setApprovedStipendApplicants(approved);
    } catch (err) {
      console.error("Failed to fetch approved applicants");
    }
  };

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/payment/payout", payoutData);
      alert("Stipend payout recorded successfully!");
      setShowPayoutModal(false);
      setPayoutData({ applicationId: "", studentId: "", internshipId: "", amount: "", payoutMode: "BankTransfer", payoutReference: "", month: "" });
      fetchPayouts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to record payout");
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
      setInternshipData({ title: "", description: "", duration: "", stipend: "", eligibility: "", internshipType: "Unpaid", registrationFee: "", stipendAmount: "" });
      setView("applicants");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to post internship. Ensure you are verified.");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/application/update/${id}`, { status });
      alert(`Status updated to ${status}`);
      
      // Send email notification if shortlisted or approved
      if (status === "Shortlisted" || status === "Approved") {
        try {
          await API.post("/company/notify-student", { applicationId: id, status });
          alert(`Email notification sent to student!`);
        } catch (emailErr) {
          console.error("Email notification failed", emailErr);
          alert("Status updated but email notification failed. Please check email configuration.");
        }
      }
      
      fetchApplicants();
      if (selectedApplication && selectedApplication._id === id) {
        setSelectedApplication({ ...selectedApplication, status });
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const viewApplicationDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const viewStudentProfile = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleAssignTask = (application) => {
    setSelectedApplication(application);
    setShowTaskModal(true);
  };

  const submitTask = async (e) => {
    e.preventDefault();
    try {
      await API.post("/company/assign-task", {
        applicationId: selectedApplication._id,
        studentId: selectedApplication.studentId._id,
        internshipId: selectedApplication.internshipId._id,
        ...taskData
      });
      alert("Task assigned successfully! Student will receive an email notification.");
      setShowTaskModal(false);
      setTaskData({ title: "", description: "", deadline: "", priority: "Medium" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign task");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "var(--bg-primary)", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", transition: "background-color 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "var(--text-primary)" }}>Company Dashboard</h2>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link to="/settings">
            <button style={{ padding: "0.5rem 1rem", backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}>⚙️ Settings</button>
          </Link>
          <button onClick={handleLogout} style={{ padding: "0.5rem 1rem", backgroundColor: "var(--accent-danger)", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}>Logout</button>
        </div>
      </div>
      
      <nav style={{ marginBottom: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <button onClick={() => setView("applicants")} style={{ padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none", cursor: "pointer", backgroundColor: view === "applicants" ? "#4f46e5" : "#e5e7eb", color: view === "applicants" ? "white" : "#374151", fontWeight: "600" }}>Applicants</button>
        <button onClick={() => setView("students")} style={{ padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none", cursor: "pointer", backgroundColor: view === "students" ? "#4f46e5" : "#e5e7eb", color: view === "students" ? "white" : "#374151", fontWeight: "600" }}>All Students</button>
        <button onClick={() => setView("internships")} style={{ padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none", cursor: "pointer", backgroundColor: view === "internships" ? "#4f46e5" : "#e5e7eb", color: view === "internships" ? "white" : "#374151", fontWeight: "600" }}>My Internships</button>
        <button onClick={() => setView("post")} style={{ padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none", cursor: "pointer", backgroundColor: view === "post" ? "#4f46e5" : "#e5e7eb", color: view === "post" ? "white" : "#374151", fontWeight: "600" }}>Post Internship</button>
        <button onClick={() => setView("profile")} style={{ padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none", cursor: "pointer", backgroundColor: view === "profile" ? "#4f46e5" : "#e5e7eb", color: view === "profile" ? "white" : "#374151", fontWeight: "600" }}>Company Profile</button>
        <Link to="/company/interviews">
          <button style={{ 
            padding: "0.5rem 1rem", 
            backgroundColor: "#8b5cf6", 
            color: "white", 
            border: "none", 
            borderRadius: "0.375rem", 
            cursor: "pointer", 
            fontWeight: "600" 
          }}>
            📅 Interviews
          </button>
        </Link>
        <button onClick={() => setView("payouts")} style={{ padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none", cursor: "pointer", backgroundColor: view === "payouts" ? "#059669" : "#e5e7eb", color: view === "payouts" ? "white" : "#374151", fontWeight: "600" }}>💸 Payouts</button>
      </nav>

      {view === "applicants" && (
        <div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#374151", marginBottom: "1rem" }}>Applicants</h3>
          {applicants.length === 0 ? <p style={{ color: "#6b7280" }}>No applications found.</p> : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {applicants.map((app) => (
                <div key={app._id} style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ marginBottom: "0.5rem" }}><strong style={{ color: "#374151" }}>Student:</strong> {app.studentId?.name} <span style={{ color: "#6b7280" }}>({app.studentId?.email})</span></p>
                      <p style={{ marginBottom: "0.5rem" }}><strong style={{ color: "#374151" }}>Internship:</strong> {app.internshipId?.title}</p>
                      <p style={{ marginBottom: "0.5rem" }}><strong style={{ color: "#374151" }}>Applied:</strong> {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</p>
                      <p style={{ marginBottom: "0.5rem" }}><strong style={{ color: "#374151" }}>Status:</strong> <span style={{ fontWeight: "600", color: app.status === 'Approved' ? "#059669" : app.status === 'Rejected' ? "#dc2626" : app.status === 'Shortlisted' ? "#d97706" : "#2563eb" }}>{app.status}</span></p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <button
                        onClick={() => viewApplicationDetails(app)}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "#4f46e5",
                          color: "white",
                          border: "none",
                          borderRadius: "0.375rem",
                          cursor: "pointer",
                          fontWeight: "500",
                          fontSize: "0.875rem",
                          whiteSpace: "nowrap"
                        }}
                      >
                        📄 View Details
                      </button>
                      <button
                        onClick={() => handleAssignTask(app)}
                        disabled={app.status === "Rejected"}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: app.status === "Rejected" ? "#d1d5db" : "#059669",
                          color: "white",
                          border: "none",
                          borderRadius: "0.375rem",
                          cursor: app.status === "Rejected" ? "not-allowed" : "pointer",
                          fontWeight: "500",
                          fontSize: "0.875rem",
                          whiteSpace: "nowrap"
                        }}
                      >
                        ✍️ Assign Task
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApplication(app);
                          setShowScheduleModal(true);
                        }}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "#8b5cf6",
                          color: "white",
                          border: "none",
                          borderRadius: "0.375rem",
                          cursor: "pointer",
                          fontWeight: "500",
                          fontSize: "0.875rem",
                          whiteSpace: "nowrap"
                        }}
                      >
                        📅 Schedule Interview
                      </button>
                    </div>
                  </div>
                  
                  {app.coverLetter && (
                    <div style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "0.375rem" }}>
                      <p style={{ fontSize: "0.875rem", color: "#374151", marginBottom: "0.5rem" }}><strong>Cover Letter Preview:</strong></p>
                      <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                        {app.coverLetter.substring(0, 150)}...
                      </p>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button 
                      onClick={() => updateStatus(app._id, "Shortlisted")} 
                      disabled={app.status === "Shortlisted"}
                      style={{ 
                        padding: "0.5rem 1rem", 
                        backgroundColor: app.status === "Shortlisted" ? "#9ca3af" : "#d97706", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "0.375rem", 
                        cursor: app.status === "Shortlisted" ? "not-allowed" : "pointer", 
                        fontWeight: "500", 
                        fontSize: "0.875rem" 
                      }}>
                      {app.status === "Shortlisted" ? "✓ Shortlisted" : "Shortlist"}
                    </button>
                    <button 
                      onClick={() => updateStatus(app._id, "Approved")} 
                      disabled={app.status === "Approved"}
                      style={{ 
                        padding: "0.5rem 1rem", 
                        backgroundColor: app.status === "Approved" ? "#9ca3af" : "#059669", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "0.375rem", 
                        cursor: app.status === "Approved" ? "not-allowed" : "pointer", 
                        fontWeight: "500", 
                        fontSize: "0.875rem" 
                      }}>
                      {app.status === "Approved" ? "✓ Approved" : "Approve"}
                    </button>
                    <button 
                      onClick={() => updateStatus(app._id, "Rejected")} 
                      disabled={app.status === "Rejected"}
                      style={{ 
                        padding: "0.5rem 1rem", 
                        backgroundColor: app.status === "Rejected" ? "#9ca3af" : "#dc2626", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "0.375rem", 
                        cursor: app.status === "Rejected" ? "not-allowed" : "pointer", 
                        fontWeight: "500", 
                        fontSize: "0.875rem" 
                      }}>
                      {app.status === "Rejected" ? "✓ Rejected" : "Reject"}
                    </button>
                  </div>
                  
                  {/* Info message for shortlisted students */}
                  {app.status === "Shortlisted" && (
                    <div style={{ marginTop: "1rem", padding: "0.75rem", backgroundColor: "#eff6ff", borderRadius: "0.375rem", border: "1px solid #bfdbfe" }}>
                      <p style={{ fontSize: "0.875rem", color: "#1e40af", margin: 0 }}>
                        💡 <strong>Tip:</strong> This student has been shortlisted. You can now assign tasks to evaluate their skills.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "students" && (
        <div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#374151", marginBottom: "1rem" }}>Registered Students</h3>
          {students.length === 0 ? <p style={{ color: "#6b7280" }}>No students found.</p> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
              {students.map((student) => (
                <div key={student._id} style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}>
                  <h4 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1f2937", marginBottom: "0.5rem" }}>{student.name}</h4>
                  <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.5rem" }}>{student.email}</p>
                  {student.profile ? (
                    <div style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
                      <p style={{ color: "#374151", marginBottom: "0.25rem" }}><strong>College:</strong> {student.profile.college}</p>
                      <p style={{ color: "#374151", marginBottom: "0.25rem" }}><strong>GPA:</strong> {student.profile.gpa}</p>
                      <p style={{ color: "#374151", marginBottom: "0.25rem" }}><strong>Branch:</strong> {student.profile.branch}</p>
                      <p style={{ color: "#374151" }}><strong>Year:</strong> {student.profile.yearOfStudy}</p>
                    </div>
                  ) : (
                    <p style={{ color: "#9ca3af", fontSize: "0.875rem", marginTop: "1rem", fontStyle: "italic" }}>
                      Profile not completed
                    </p>
                  )}
                  <button
                    onClick={() => viewStudentProfile(student)}
                    style={{
                      marginTop: "1rem",
                      width: "100%",
                      padding: "0.5rem",
                      backgroundColor: "#4f46e5",
                      color: "white",
                      border: "none",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                      fontWeight: "500"
                    }}
                  >
                    View Full Profile
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "internships" && (
        <div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#374151", marginBottom: "1rem" }}>My Posted Internships</h3>
          {myInternships.length === 0 ? <p style={{ color: "#6b7280" }}>No internships posted yet.</p> : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {myInternships.map((internship) => (
                <div key={internship._id} style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <h4 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1f2937" }}>{internship.title}</h4>
                    {internship.internshipType === "FeeRequired" && (
                      <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem", borderRadius: "9999px", backgroundColor: "#fff7ed", color: "#c2410c", fontWeight: "700", border: "1px solid #fed7aa" }}>💰 Fee: ₹{internship.registrationFee?.toLocaleString()}</span>
                    )}
                    {internship.internshipType === "StipendBased" && (
                      <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem", borderRadius: "9999px", backgroundColor: "#f0fdf4", color: "#15803d", fontWeight: "700", border: "1px solid #bbf7d0" }}>💵 Stipend: ₹{internship.stipendAmount?.toLocaleString()}/mo</span>
                    )}
                    {(!internship.internshipType || internship.internshipType === "Unpaid") && (
                      <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem", borderRadius: "9999px", backgroundColor: "#f3f4f6", color: "#6b7280", fontWeight: "600" }}>🤝 Unpaid</span>
                    )}
                  </div>
                  <p style={{ color: "#4b5563", fontSize: "0.875rem", margin: "0.5rem 0" }}>{internship.description}</p>
                  <p style={{ color: "#374151", fontSize: "0.875rem" }}><strong>Duration:</strong> {internship.duration} | <strong>Stipend:</strong> {internship.stipend}</p>
                  {internship.eligibility && (
                    <p style={{ color: "#374151", fontSize: "0.875rem", marginTop: "0.5rem" }}><strong>Eligibility:</strong> {internship.eligibility}</p>
                  )}
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
            <input placeholder="Duration (e.g., 3 months)" value={internshipData.duration} onChange={(e) => setInternshipData({...internshipData, duration: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }} />
            <input placeholder="Stipend description (e.g., ₹10,000/month)" value={internshipData.stipend} onChange={(e) => setInternshipData({...internshipData, stipend: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }} />
            <input placeholder="Eligibility Criteria (e.g., Min GPA 7.5, 3rd year CSE students)" value={internshipData.eligibility} onChange={(e) => setInternshipData({...internshipData, eligibility: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }} />

            {/* Internship Type Selector */}
            <div style={{ padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
              <label style={{ fontWeight: "600", color: "#374151", marginBottom: "0.75rem", display: "block" }}>💰 Internship Payment Type</label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {["Unpaid", "FeeRequired", "StipendBased"].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setInternshipData({...internshipData, internshipType: type, registrationFee: type !== "FeeRequired" ? "" : internshipData.registrationFee, stipendAmount: type !== "StipendBased" ? "" : internshipData.stipendAmount})}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "0.375rem",
                      border: internshipData.internshipType === type ? "2px solid #4f46e5" : "1px solid #d1d5db",
                      backgroundColor: internshipData.internshipType === type ? "#eef2ff" : "white",
                      color: internshipData.internshipType === type ? "#4f46e5" : "#6b7280",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontSize: "0.85rem"
                    }}
                  >
                    {type === "Unpaid" ? "🤝 Unpaid" : type === "FeeRequired" ? "💰 Student Pays Fee" : "💵 Company Pays Stipend"}
                  </button>
                ))}
              </div>

              {internshipData.internshipType === "FeeRequired" && (
                <div style={{ marginTop: "0.75rem" }}>
                  <label style={{ fontSize: "0.85rem", color: "#374151", display: "block", marginBottom: "0.25rem" }}>Registration/Processing Fee (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g., 500"
                    value={internshipData.registrationFee}
                    onChange={(e) => setInternshipData({...internshipData, registrationFee: e.target.value})}
                    required
                    min="1"
                    style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }}
                  />
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>This amount will be collected from students via Razorpay after approval.</p>
                </div>
              )}

              {internshipData.internshipType === "StipendBased" && (
                <div style={{ marginTop: "0.75rem" }}>
                  <label style={{ fontSize: "0.85rem", color: "#374151", display: "block", marginBottom: "0.25rem" }}>Monthly Stipend Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g., 10000"
                    value={internshipData.stipendAmount}
                    onChange={(e) => setInternshipData({...internshipData, stipendAmount: e.target.value})}
                    required
                    min="1"
                    style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }}
                  />
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>This is the monthly amount you'll pay the student. You can record payouts from the Payouts tab.</p>
                </div>
              )}
            </div>

            <button type="submit" style={{ padding: "0.75rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600", marginTop: "0.5rem" }}>Post Internship</button>
          </form>
        </div>
      )}

      {/* Payouts View */}
      {view === "payouts" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#374151" }}>💸 Stipend Payouts</h3>
          </div>

          {/* Record New Payout */}
          <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)", marginBottom: "2rem" }}>
            <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#374151", marginBottom: "1rem" }}>Record New Stipend Payment</h4>
            {approvedStipendApplicants.length === 0 ? (
              <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>No approved stipend-based applicants found. Post a StipendBased internship and approve applicants first.</p>
            ) : (
              <form onSubmit={handlePayoutSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <select
                  value={payoutData.applicationId}
                  onChange={(e) => {
                    const app = approvedStipendApplicants.find(a => a._id === e.target.value);
                    if (app) {
                      setPayoutData({
                        ...payoutData,
                        applicationId: app._id,
                        studentId: app.studentId?._id,
                        internshipId: app.internshipId?._id,
                        amount: app.internshipId?.stipendAmount || ""
                      });
                    }
                  }}
                  required
                  style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }}
                >
                  <option value="">Select Student & Internship</option>
                  {approvedStipendApplicants.map(app => (
                    <option key={app._id} value={app._id}>
                      {app.studentId?.name} — {app.internshipId?.title} (₹{app.internshipId?.stipendAmount?.toLocaleString()}/mo)
                    </option>
                  ))}
                </select>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <input type="number" placeholder="Amount (₹)" value={payoutData.amount} onChange={(e) => setPayoutData({...payoutData, amount: e.target.value})} required min="1" style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", boxSizing: "border-box" }} />
                  <input type="text" placeholder="Month (e.g., April 2026)" value={payoutData.month} onChange={(e) => setPayoutData({...payoutData, month: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <select value={payoutData.payoutMode} onChange={(e) => setPayoutData({...payoutData, payoutMode: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", boxSizing: "border-box" }}>
                    <option value="BankTransfer">🏦 Bank Transfer</option>
                    <option value="UPI">📱 UPI</option>
                    <option value="Cheque">🧾 Cheque</option>
                  </select>
                  <input type="text" placeholder="UTR / Reference Number" value={payoutData.payoutReference} onChange={(e) => setPayoutData({...payoutData, payoutReference: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", boxSizing: "border-box" }} />
                </div>
                <button type="submit" style={{ padding: "0.75rem", backgroundColor: "#059669", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}>✅ Record Payout</button>
              </form>
            )}
          </div>

          {/* Payout History */}
          <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#374151", marginBottom: "1rem" }}>Payment History</h4>
          {payouts.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No payments recorded yet.</p>
          ) : (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {payouts.map((pmt) => (
                <div key={pmt._id} style={{ backgroundColor: "white", padding: "1rem 1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <p style={{ fontWeight: "600", color: "#374151", marginBottom: "0.25rem" }}>
                      {pmt.direction === "StudentToCompany" ? "⬅️ Received from" : "➡️ Paid to"} {pmt.studentId?.name || "Student"}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                      {pmt.internshipId?.title} {pmt.month ? `• ${pmt.month}` : ""} • {pmt.payoutMode || "Razorpay"}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: "700", fontSize: "1.1rem", color: pmt.direction === "StudentToCompany" ? "#059669" : "#dc2626" }}>
                      {pmt.direction === "StudentToCompany" ? "+" : "-"}₹{pmt.amount?.toLocaleString()}
                    </p>
                    <span style={{
                      fontSize: "0.7rem",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "9999px",
                      backgroundColor: pmt.status === "Completed" ? "#d1fae5" : "#fef3c7",
                      color: pmt.status === "Completed" ? "#065f46" : "#92400e",
                      fontWeight: "600"
                    }}>{pmt.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "profile" && (
        <div style={{ maxWidth: "600px", backgroundColor: "white", padding: "2rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#374151", marginBottom: "1.5rem" }}>Complete Company Profile</h3>
          <p style={{ marginBottom: "1.5rem", color: "#6b7280" }}>Please provide your official company details for verification.</p>
          <form onSubmit={handleProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input placeholder="Company Name" value={companyDetails.companyName} onChange={(e) => setCompanyDetails({...companyDetails, companyName: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }} />
            <input placeholder="Official Email" value={companyDetails.email} onChange={(e) => setCompanyDetails({...companyDetails, email: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }} />
            <input placeholder="Registration Number" value={companyDetails.registrationNumber} onChange={(e) => setCompanyDetails({...companyDetails, registrationNumber: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }} />
            <input placeholder="Document Link (Drive/URL)" value={companyDetails.documents} onChange={(e) => setCompanyDetails({...companyDetails, documents: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }} />
            <button type="submit" style={{ padding: "0.75rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600", marginTop: "0.5rem" }}>Submit for Verification</button>
          </form>
        </div>
      )}

      {/* Application Details Modal */}
      {showDetailsModal && selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedApplication(null);
          }}
          onUpdateStatus={updateStatus}
          onAssignTask={handleAssignTask}
        />
      )}

      {/* Student Profile Modal */}
      {showStudentModal && selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={() => {
            setShowStudentModal(false);
            setSelectedStudent(null);
          }}
        />
      )}

      {/* Task Assignment Modal */}
      {showTaskModal && selectedApplication && (
        <TaskAssignmentModal
          application={selectedApplication}
          taskData={taskData}
          setTaskData={setTaskData}
          onClose={() => {
            setShowTaskModal(false);
            setTaskData({ title: "", description: "", deadline: "", priority: "Medium" });
          }}
          onSubmit={submitTask}
        />
      )}

      {showScheduleModal && selectedApplication && (
        <ScheduleInterviewModal
          application={selectedApplication}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedApplication(null);
          }}
          onSchedule={async (interviewData) => {
            try {
              await API.post("/interview/schedule", {
                applicationId: selectedApplication._id,
                studentId: selectedApplication.studentId._id,
                internshipId: selectedApplication.internshipId._id,
                ...interviewData
              });
              alert("Interview scheduled successfully! Student will receive an email.");
              setShowScheduleModal(false);
              setSelectedApplication(null);
            } catch (err) {
              alert(err.response?.data?.message || "Failed to schedule interview");
            }
          }}
        />
      )}
    </div>
  );
};

// Application Details Modal Component (same as before - keeping for completeness)
const ApplicationDetailsModal = ({ application, onClose, onUpdateStatus, onAssignTask }) => {
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
        maxWidth: "800px",
        width: "100%",
        maxHeight: "90vh",
        overflow: "auto",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
      }}>
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
              Application Details
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

        <div style={{ padding: "1.5rem" }}>
          <div style={{ marginBottom: "2rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>Current Status</p>
                <span style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "9999px",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  backgroundColor: application.status === "Approved" ? "#d1fae5" : application.status === "Rejected" ? "#fee2e2" : application.status === "Shortlisted" ? "#ffedd5" : "#dbeafe",
                  color: application.status === "Approved" ? "#065f46" : application.status === "Rejected" ? "#991b1b" : application.status === "Shortlisted" ? "#9a3412" : "#1e40af"
                }}>
                  {application.status}
                </span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button onClick={() => onUpdateStatus(application._id, "Shortlisted")} style={{ padding: "0.5rem 1rem", backgroundColor: "#d97706", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "500", fontSize: "0.875rem" }}>Shortlist</button>
                <button onClick={() => onUpdateStatus(application._id, "Approved")} style={{ padding: "0.5rem 1rem", backgroundColor: "#059669", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "500", fontSize: "0.875rem" }}>Approve</button>
                <button onClick={() => onUpdateStatus(application._id, "Rejected")} style={{ padding: "0.5rem 1rem", backgroundColor: "#dc2626", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "500", fontSize: "0.875rem" }}>Reject</button>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onAssignTask(application);
              }}
              style={{
                marginTop: "1rem",
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#059669",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              ✍️ Assign Task to Student
            </button>
          </div>

          <div style={{ display: "grid", gap: "1.5rem" }}>
            <Section title="Cover Letter">
              <p style={{ color: "#374151", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{application.coverLetter}</p>
            </Section>

            <Section title="Why Interested in This Role">
              <p style={{ color: "#374151", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{application.whyInterested}</p>
            </Section>

            <Section title="Relevant Experience / Projects">
              <p style={{ color: "#374151", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{application.relevantExperience}</p>
            </Section>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <Section title="Availability">
                <p style={{ color: "#374151" }}>{application.availability}</p>
              </Section>

              {application.expectedStipend && (
                <Section title="Expected Stipend">
                  <p style={{ color: "#374151" }}>{application.expectedStipend}</p>
                </Section>
              )}
            </div>

            {application.portfolioLinks && (
              <Section title="Portfolio / Work Links">
                <a href={application.portfolioLinks} target="_blank" rel="noopener noreferrer" style={{ color: "#4f46e5", textDecoration: "underline" }}>
                  {application.portfolioLinks}
                </a>
              </Section>
            )}

            {application.references && (
              <Section title="References">
                <p style={{ color: "#374151", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{application.references}</p>
              </Section>
            )}

            {application.questionsForCompany && (
              <Section title="Questions for Company">
                <p style={{ color: "#374151", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{application.questionsForCompany}</p>
              </Section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Student Profile Modal Component
const StudentProfileModal = ({ student, onClose }) => {
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
              {student.name}
            </h2>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>{student.email}</p>
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

        <div style={{ padding: "1.5rem" }}>
          {student.profile ? (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              <Section title="Contact Information">
                <p style={{ color: "#374151", marginBottom: "0.5rem" }}><strong>Phone:</strong> {student.profile.phone}</p>
                {student.profile.linkedin && (
                  <p style={{ color: "#374151", marginBottom: "0.5rem" }}>
                    <strong>LinkedIn:</strong>{" "}
                    <a href={student.profile.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "#4f46e5", textDecoration: "underline" }}>
                      View Profile
                    </a>
                  </p>
                )}
                {student.profile.github && (
                  <p style={{ color: "#374151" }}>
                    <strong>GitHub:</strong>{" "}
                    <a href={student.profile.github} target="_blank" rel="noopener noreferrer" style={{ color: "#4f46e5", textDecoration: "underline" }}>
                      View Profile
                    </a>
                  </p>
                )}
              </Section>

              <Section title="Academic Information">
                <p style={{ color: "#374151", marginBottom: "0.5rem" }}><strong>College:</strong> {student.profile.college}</p>
                <p style={{ color: "#374151", marginBottom: "0.5rem" }}><strong>Degree:</strong> {student.profile.degree}</p>
                <p style={{ color: "#374151", marginBottom: "0.5rem" }}><strong>Branch:</strong> {student.profile.branch}</p>
                <p style={{ color: "#374151", marginBottom: "0.5rem" }}><strong>Year:</strong> {student.profile.yearOfStudy}</p>
                <p style={{ color: "#374151" }}><strong>GPA:</strong> {student.profile.gpa}</p>
              </Section>

              <Section title="Skills">
                <p style={{ color: "#374151", lineHeight: "1.6" }}>{student.profile.skills}</p>
              </Section>

              <Section title="Resume">
                <a href={student.profile.resume} target="_blank" rel="noopener noreferrer" style={{ color: "#4f46e5", textDecoration: "underline" }}>
                  View Resume
                </a>
              </Section>
            </div>
          ) : (
            <p style={{ color: "#6b7280" }}>This student hasn't completed their profile yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Task Assignment Modal Component
const TaskAssignmentModal = ({ application, taskData, setTaskData, onClose, onSubmit }) => {
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
              Assign Task
            </h2>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              To: {application.studentId?.name}
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

        <form onSubmit={onSubmit} style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
              Task Title *
            </label>
            <input
              type="text"
              value={taskData.title}
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
              required
              placeholder="e.g., Create Landing Page Design"
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
              Task Description *
            </label>
            <textarea
              value={taskData.description}
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              required
              placeholder="Describe the task requirements, deliverables, and any specific instructions..."
              style={{
                padding: "0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                width: "100%",
                minHeight: "150px",
                boxSizing: "border-box",
                fontFamily: "inherit"
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
                Deadline *
              </label>
              <input
                type="date"
                value={taskData.deadline}
                onChange={(e) => setTaskData({ ...taskData, deadline: e.target.value })}
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
                Priority *
              </label>
              <select
                value={taskData.priority}
                onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                style={{
                  padding: "0.75rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                  width: "100%",
                  boxSizing: "border-box",
                  backgroundColor: "white"
                }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#eff6ff", borderRadius: "0.375rem", border: "1px solid #bfdbfe" }}>
            <p style={{ fontSize: "0.875rem", color: "#1e40af", margin: 0 }}>
              💡 The student will receive an email notification about this task assignment.
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
              Assign Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div>
    <h4 style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {title}
    </h4>
    <div style={{ padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "0.375rem" }}>
      {children}
    </div>
  </div>
);

export default CompanyDashboard;