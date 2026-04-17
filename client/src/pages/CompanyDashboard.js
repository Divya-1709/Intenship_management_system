import React, { useEffect, useState, useRef } from "react";
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

  // Company profile state for hero banner
  const [companyProfile, setCompanyProfile] = useState(null);
  const [showEditBanner, setShowEditBanner] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    description: "",
    website: "",
    industry: ""
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const [bannerHovered, setBannerHovered] = useState(false);

  // Student search & view mode
  const [studentSearch, setStudentSearch] = useState("");
  const [studentViewMode, setStudentViewMode] = useState("grid"); // "grid" or "list"

  const API_BASE = "http://localhost:5000";

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "company") {
      navigate("/");
      return;
    }

    fetchCompanyProfile();

    if (view === "applicants") fetchApplicants();
    if (view === "internships") fetchMyInternships();
    if (view === "students") fetchStudents();
    if (view === "payouts") { fetchPayouts(); fetchApprovedStipendApplicants(); }
  }, [view, navigate]);

  const fetchCompanyProfile = async () => {
    try {
      const res = await API.get("/company/profile");
      setCompanyProfile(res.data);
      setEditProfileData({
        description: res.data.description || "",
        website: res.data.website || "",
        industry: res.data.industry || ""
      });
    } catch (err) {
      // Profile not found yet - user needs to register first
      console.log("Company profile not found yet");
    }
  };

  const handleImageUpload = async (file, type) => {
    if (!file) return;
    const setter = type === "banner" ? setUploadingBanner : setUploadingLogo;
    setter(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("type", type);
      const res = await API.post("/company/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      // Refresh profile
      fetchCompanyProfile();
    } catch (err) {
      alert("Failed to upload image. Please try again.");
    } finally {
      setter(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await API.put("/company/update-profile", editProfileData);
      fetchCompanyProfile();
      setShowEditBanner(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile.");
    }
  };

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
      fetchCompanyProfile();
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

  // Navigation items for the premium nav bar
  const navItems = [
    { key: "applicants", label: "Applicants", icon: "📋" },
    { key: "students", label: "All Students", icon: "🎓" },
    { key: "internships", label: "My Internships", icon: "💼" },
    { key: "post", label: "Post Internship", icon: "📝" },
    { key: "profile", label: "Company Profile", icon: "🏢" },
    { key: "payouts", label: "Payouts", icon: "💸" },
  ];

  // Stat counts for the stats bar
  const totalApplicants = applicants.length;
  const approvedCount = applicants.filter(a => a.status === "Approved").length;
  const shortlistedCount = applicants.filter(a => a.status === "Shortlisted").length;

  return (
    <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh", fontFamily: "'Segoe UI', 'Inter', sans-serif", transition: "background-color 0.3s ease" }}>
      
      {/* ===== HERO BANNER SECTION ===== */}
      <div
        onMouseEnter={() => setBannerHovered(true)}
        onMouseLeave={() => setBannerHovered(false)}
        style={{
          position: "relative",
          width: "100%",
          height: "340px",
          overflow: "hidden",
          background: companyProfile?.companyBanner
            ? `url(${API_BASE}${companyProfile.companyBanner}) center/cover no-repeat`
            : "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 30%, #16213e 60%, #0f3460 100%)",
          borderBottom: "4px solid var(--accent-primary)",
        }}
      >
        {/* Dark overlay for readability */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: companyProfile?.companyBanner
            ? "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)"
            : "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)",
          zIndex: 1,
        }} />

        {/* Animated floating particles effect */}
        <div style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: "radial-gradient(circle at 20% 50%, rgba(79, 70, 229, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
          animation: "pulse 4s ease-in-out infinite",
        }} />

        {/* Banner upload button - positioned at bottom-right to avoid overlapping top bar */}
        {companyProfile && (
          <button
            onClick={() => bannerInputRef.current?.click()}
            style={{
              position: "absolute",
              bottom: "5.5rem",
              right: "1rem",
              zIndex: 4,
              padding: "0.5rem 1rem",
              backgroundColor: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "0.5rem",
              color: "white",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.8rem",
              opacity: bannerHovered ? 1 : 0,
              transition: "opacity 0.3s ease, background-color 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.25)"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)"}
          >
            {uploadingBanner ? "⏳ Uploading..." : "📷 Change Banner"}
          </button>
        )}
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => handleImageUpload(e.target.files[0], "banner")}
        />

        {/* Top bar with actions */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "white",
            fontSize: "0.85rem",
            fontWeight: "600",
            opacity: 0.9,
          }}>
            <span style={{ fontSize: "1.2rem" }}>🏢</span>
            <span>Internship Management</span>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <Link to="/settings">
              <button style={{
                padding: "0.5rem 1rem",
                backgroundColor: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.8rem",
                transition: "all 0.2s ease",
              }}>⚙️ Settings</button>
            </Link>
            <Link to="/company/interviews">
              <button style={{
                padding: "0.5rem 1rem",
                backgroundColor: "rgba(139, 92, 246, 0.3)",
                backdropFilter: "blur(10px)",
                color: "white",
                border: "1px solid rgba(139, 92, 246, 0.4)",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.8rem",
                transition: "all 0.2s ease",
              }}>📅 Interviews</button>
            </Link>
            <button onClick={handleLogout} style={{
              padding: "0.5rem 1rem",
              backgroundColor: "rgba(239, 68, 68, 0.3)",
              backdropFilter: "blur(10px)",
              color: "white",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.8rem",
              transition: "all 0.2s ease",
            }}>🚪 Logout</button>
          </div>
        </div>

        {/* Main hero content */}
        <div style={{
          position: "absolute",
          bottom: "2rem",
          left: "2rem",
          right: "2rem",
          zIndex: 5,
          display: "flex",
          alignItems: "flex-end",
          gap: "1.5rem",
        }}>
          {/* Company Logo */}
          <div
            onClick={() => companyProfile && logoInputRef.current?.click()}
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "1rem",
              backgroundColor: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(20px)",
              border: "2px solid rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: companyProfile ? "pointer" : "default",
              overflow: "hidden",
              flexShrink: 0,
              transition: "all 0.3s ease",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            {uploadingLogo ? (
              <div style={{ color: "white", fontSize: "0.75rem", textAlign: "center" }}>Uploading...</div>
            ) : companyProfile?.companyLogo ? (
              <img
                src={`${API_BASE}${companyProfile.companyLogo}`}
                alt="Company Logo"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.6)" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.2rem" }}>
                  {companyProfile?.companyName?.charAt(0)?.toUpperCase() || "🏢"}
                </div>
                {companyProfile && <div style={{ fontSize: "0.6rem", fontWeight: "500" }}>Click to add logo</div>}
              </div>
            )}
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleImageUpload(e.target.files[0], "logo")}
          />

          {/* Company info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              fontSize: "2.2rem",
              fontWeight: "800",
              color: "white",
              margin: "0 0 0.3rem 0",
              textShadow: "0 2px 8px rgba(0,0,0,0.4)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}>
              {companyProfile ? `Welcome to ${companyProfile.companyName}` : "Company Dashboard"}
            </h1>
            <p style={{
              fontSize: "1rem",
              color: "rgba(255,255,255,0.8)",
              margin: "0 0 0.5rem 0",
              textShadow: "0 1px 4px rgba(0,0,0,0.3)",
              maxWidth: "600px",
            }}>
              {companyProfile?.description || (companyProfile ? "Click edit to add a company description" : "Register your company to get started")}
            </p>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
              {companyProfile?.industry && (
                <span style={{
                  padding: "0.3rem 0.75rem",
                  backgroundColor: "rgba(79, 70, 229, 0.3)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "white",
                  border: "1px solid rgba(79, 70, 229, 0.5)",
                }}>
                  🏭 {companyProfile.industry}
                </span>
              )}
              {companyProfile?.website && (
                <a href={companyProfile.website.startsWith("http") ? companyProfile.website : `https://${companyProfile.website}`} target="_blank" rel="noopener noreferrer" style={{
                  padding: "0.3rem 0.75rem",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.2)",
                  textDecoration: "none",
                }}>
                  🌐 {companyProfile.website}
                </a>
              )}
              {companyProfile?.status && (
                <span style={{
                  padding: "0.3rem 0.75rem",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  backgroundColor: companyProfile.status === "Verified" ? "rgba(5, 150, 105, 0.3)" : companyProfile.status === "Rejected" ? "rgba(220, 38, 38, 0.3)" : "rgba(217, 119, 6, 0.3)",
                  color: "white",
                  border: `1px solid ${companyProfile.status === "Verified" ? "rgba(5, 150, 105, 0.5)" : companyProfile.status === "Rejected" ? "rgba(220, 38, 38, 0.5)" : "rgba(217, 119, 6, 0.5)"}`,
                }}>
                  {companyProfile.status === "Verified" ? "✅" : companyProfile.status === "Rejected" ? "❌" : "⏳"} {companyProfile.status}
                </span>
              )}
            </div>
          </div>

          {/* Edit profile button */}
          {companyProfile && (
            <button
              onClick={() => setShowEditBanner(true)}
              style={{
                padding: "0.6rem 1.2rem",
                backgroundColor: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "0.5rem",
                color: "white",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.85rem",
                flexShrink: 0,
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.22)"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)"}
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* ===== STATS BAR ===== */}
      {companyProfile && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "0",
          backgroundColor: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-color)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          {[
            { label: "Total Applicants", value: totalApplicants, color: "#4f46e5", icon: "📋" },
            { label: "Shortlisted", value: shortlistedCount, color: "#d97706", icon: "⭐" },
            { label: "Approved", value: approvedCount, color: "#059669", icon: "✅" },
            { label: "Internships", value: myInternships.length, color: "#8b5cf6", icon: "💼" },
            { label: "Payouts", value: payouts.length, color: "#ec4899", icon: "💸" },
          ].map((stat, i) => (
            <div key={i} style={{
              flex: 1,
              padding: "1.2rem 1.5rem",
              textAlign: "center",
              borderRight: i < 4 ? "1px solid var(--border-color)" : "none",
              cursor: "default",
              transition: "background-color 0.2s ease",
            }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "0.2rem" }}>{stat.icon}</div>
              <div style={{
                fontSize: "1.5rem",
                fontWeight: "800",
                color: stat.color,
                lineHeight: 1,
                marginBottom: "0.3rem",
              }}>{stat.value}</div>
              <div style={{
                fontSize: "0.7rem",
                fontWeight: "600",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ===== PREMIUM NAVIGATION ===== */}
      <nav style={{
        padding: "0.75rem 2rem",
        backgroundColor: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setView(item.key)}
            style={{
              padding: "0.6rem 1.2rem",
              borderRadius: "0.5rem",
              border: "none",
              cursor: "pointer",
              backgroundColor: view === item.key ? "var(--accent-primary)" : "transparent",
              color: view === item.key ? "white" : "var(--text-secondary)",
              fontWeight: "600",
              fontSize: "0.85rem",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              position: "relative",
            }}
            onMouseOver={(e) => {
              if (view !== item.key) e.currentTarget.style.backgroundColor = "var(--bg-hover)";
            }}
            onMouseOut={(e) => {
              if (view !== item.key) e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <div style={{ padding: "2rem" }}>

      {view === "applicants" && (
        <div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "1rem" }}>Applicants</h3>
          {applicants.length === 0 ? <p style={{ color: "var(--text-muted)" }}>No applications found.</p> : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {applicants.map((app) => (
                <div key={app._id} style={{ backgroundColor: "var(--bg-secondary)", padding: "1.5rem", borderRadius: "0.75rem", boxShadow: "var(--card-shadow)", border: "1px solid var(--border-color)", transition: "box-shadow 0.2s ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ marginBottom: "0.5rem", color: "var(--text-primary)" }}><strong>Student:</strong> {app.studentId?.name} <span style={{ color: "var(--text-muted)" }}>({app.studentId?.email})</span></p>
                      <p style={{ marginBottom: "0.5rem", color: "var(--text-primary)" }}><strong>Internship:</strong> {app.internshipId?.title}</p>
                      <p style={{ marginBottom: "0.5rem", color: "var(--text-primary)" }}><strong>Applied:</strong> {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</p>
                      <p style={{ marginBottom: "0.5rem", color: "var(--text-primary)" }}><strong>Status:</strong> <span style={{ fontWeight: "600", color: app.status === 'Approved' ? "#059669" : app.status === 'Rejected' ? "#dc2626" : app.status === 'Shortlisted' ? "#d97706" : "#2563eb" }}>{app.status}</span></p>
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
                    <div style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "var(--bg-tertiary)", borderRadius: "0.375rem" }}>
                      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}><strong>Cover Letter Preview:</strong></p>
                      <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
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
                    <div style={{ marginTop: "1rem", padding: "0.75rem", backgroundColor: "var(--info-bg)", borderRadius: "0.375rem", border: "1px solid var(--info-border)" }}>
                      <p style={{ fontSize: "0.875rem", color: "var(--info-text)", margin: 0 }}>
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

      {view === "students" && (() => {
        const filteredStudents = students.filter((s) => {
          const q = studentSearch.toLowerCase().trim();
          if (!q) return true;
          const nameMatch = s.name?.toLowerCase().includes(q);
          const collegeMatch = s.profile?.college?.toLowerCase().includes(q);
          return nameMatch || collegeMatch;
        });

        return (
        <div>
          {/* Header row with title, search, and view toggle */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
              🎓 Registered Students
              <span style={{ fontSize: "0.85rem", fontWeight: "500", color: "var(--text-muted)", marginLeft: "0.75rem" }}>
                ({filteredStudents.length} of {students.length})
              </span>
            </h3>

            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              {/* Search input */}
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", fontSize: "1rem", color: "var(--text-muted)", pointerEvents: "none" }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search by name or institution..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  style={{
                    padding: "0.6rem 0.75rem 0.6rem 2.3rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--input-bg)",
                    color: "var(--text-primary)",
                    fontSize: "0.85rem",
                    width: "280px",
                    maxWidth: "100%",
                    outline: "none",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--accent-primary)"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; e.target.style.boxShadow = "none"; }}
                />
                {studentSearch && (
                  <button
                    onClick={() => setStudentSearch("")}
                    style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "var(--text-muted)", padding: "0.2rem", lineHeight: 1 }}
                  >✕</button>
                )}
              </div>

              {/* View toggle */}
              <div style={{
                display: "flex",
                borderRadius: "0.5rem",
                border: "1px solid var(--border-color)",
                overflow: "hidden",
              }}>
                <button
                  onClick={() => setStudentViewMode("grid")}
                  title="Grid View"
                  style={{
                    padding: "0.5rem 0.75rem",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: studentViewMode === "grid" ? "var(--accent-primary)" : "var(--bg-secondary)",
                    color: studentViewMode === "grid" ? "white" : "var(--text-muted)",
                    fontSize: "1rem",
                    display: "flex",
                    alignItems: "center",
                    transition: "all 0.2s ease",
                  }}
                >▦</button>
                <button
                  onClick={() => setStudentViewMode("list")}
                  title="List View"
                  style={{
                    padding: "0.5rem 0.75rem",
                    border: "none",
                    borderLeft: "1px solid var(--border-color)",
                    cursor: "pointer",
                    backgroundColor: studentViewMode === "list" ? "var(--accent-primary)" : "var(--bg-secondary)",
                    color: studentViewMode === "list" ? "white" : "var(--text-muted)",
                    fontSize: "1rem",
                    display: "flex",
                    alignItems: "center",
                    transition: "all 0.2s ease",
                  }}
                >☰</button>
              </div>
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{students.length === 0 ? "📭" : "🔍"}</div>
              <p style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.3rem" }}>
                {students.length === 0 ? "No students found." : "No students match your search."}
              </p>
              {studentSearch && (
                <p style={{ fontSize: "0.85rem" }}>
                  Try a different name or institution. <button onClick={() => setStudentSearch("")} style={{ color: "var(--accent-primary)", background: "none", border: "none", cursor: "pointer", fontWeight: "600", textDecoration: "underline", padding: 0 }}>Clear search</button>
                </p>
              )}
            </div>
          ) : studentViewMode === "grid" ? (
            /* ===== GRID VIEW ===== */
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
              {filteredStudents.map((student) => (
                <div key={student._id} style={{ backgroundColor: "var(--bg-secondary)", padding: "1.5rem", borderRadius: "0.75rem", boxShadow: "var(--card-shadow)", border: "1px solid var(--border-color)", transition: "box-shadow 0.2s ease, transform 0.2s ease" }}
                  onMouseOver={(e) => { e.currentTarget.style.boxShadow = "var(--card-shadow-hover)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.boxShadow = "var(--card-shadow)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    <div style={{
                      width: "42px", height: "42px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontWeight: "700", fontSize: "1rem", flexShrink: 0,
                    }}>{student.name?.charAt(0)?.toUpperCase() || "?"}</div>
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ fontSize: "1.05rem", fontWeight: "600", color: "var(--text-primary)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{student.name}</h4>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{student.email}</p>
                    </div>
                  </div>
                  {student.profile ? (
                    <div style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
                      <p style={{ color: "var(--text-secondary)", marginBottom: "0.25rem" }}><strong>🏫 College:</strong> {student.profile.college}</p>
                      <p style={{ color: "var(--text-secondary)", marginBottom: "0.25rem" }}><strong>📊 GPA:</strong> {student.profile.gpa}</p>
                      <p style={{ color: "var(--text-secondary)", marginBottom: "0.25rem" }}><strong>📚 Branch:</strong> {student.profile.branch}</p>
                      <p style={{ color: "var(--text-secondary)" }}><strong>📅 Year:</strong> {student.profile.yearOfStudy}</p>
                    </div>
                  ) : (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.75rem", fontStyle: "italic", padding: "0.5rem", backgroundColor: "var(--bg-tertiary)", borderRadius: "0.375rem", textAlign: "center" }}>
                      Profile not completed
                    </p>
                  )}
                  <button
                    onClick={() => viewStudentProfile(student)}
                    style={{
                      marginTop: "1rem", width: "100%", padding: "0.6rem",
                      background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                      color: "white", border: "none", borderRadius: "0.5rem",
                      cursor: "pointer", fontWeight: "600", fontSize: "0.85rem",
                      transition: "opacity 0.2s ease",
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
                    onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
                  >
                    View Full Profile
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* ===== LIST VIEW ===== */
            <div style={{ backgroundColor: "var(--bg-secondary)", borderRadius: "0.75rem", border: "1px solid var(--border-color)", overflow: "hidden", boxShadow: "var(--card-shadow)" }}>
              {/* Table header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "2fr 2.5fr 1fr 0.8fr 1.2fr",
                padding: "0.75rem 1.25rem",
                backgroundColor: "var(--bg-tertiary)",
                borderBottom: "1px solid var(--border-color)",
                fontSize: "0.75rem",
                fontWeight: "700",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}>
                <span>Student</span>
                <span>Institution</span>
                <span>GPA</span>
                <span>Year</span>
                <span style={{ textAlign: "right" }}>Action</span>
              </div>

              {/* Table rows */}
              {filteredStudents.map((student, index) => (
                <div
                  key={student._id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 2.5fr 1fr 0.8fr 1.2fr",
                    padding: "0.85rem 1.25rem",
                    borderBottom: index < filteredStudents.length - 1 ? "1px solid var(--border-color)" : "none",
                    alignItems: "center",
                    transition: "background-color 0.15s ease",
                    cursor: "default",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  {/* Name + email */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", minWidth: 0 }}>
                    <div style={{
                      width: "34px", height: "34px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontWeight: "700", fontSize: "0.8rem", flexShrink: 0,
                    }}>{student.name?.charAt(0)?.toUpperCase() || "?"}</div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "0.9rem", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{student.name}</p>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{student.email}</p>
                    </div>
                  </div>

                  {/* Institution */}
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {student.profile?.college || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>—</span>}
                  </span>

                  {/* GPA */}
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: "600" }}>
                    {student.profile?.gpa || <span style={{ color: "var(--text-muted)" }}>—</span>}
                  </span>

                  {/* Year */}
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    {student.profile?.yearOfStudy || <span style={{ color: "var(--text-muted)" }}>—</span>}
                  </span>

                  {/* Action */}
                  <div style={{ textAlign: "right" }}>
                    <button
                      onClick={() => viewStudentProfile(student)}
                      style={{
                        padding: "0.4rem 0.85rem",
                        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                        color: "white", border: "none", borderRadius: "0.375rem",
                        cursor: "pointer", fontWeight: "600", fontSize: "0.78rem",
                        transition: "opacity 0.2s ease",
                      }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
                      onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        );
      })()}

      {view === "internships" && (
        <div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "1rem" }}>My Posted Internships</h3>
          {myInternships.length === 0 ? <p style={{ color: "var(--text-muted)" }}>No internships posted yet.</p> : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {myInternships.map((internship) => (
                <div key={internship._id} style={{ backgroundColor: "var(--bg-secondary)", padding: "1.5rem", borderRadius: "0.75rem", boxShadow: "var(--card-shadow)", border: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <h4 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--text-primary)" }}>{internship.title}</h4>
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
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: "0.5rem 0" }}>{internship.description}</p>
                  <p style={{ color: "var(--text-primary)", fontSize: "0.875rem" }}><strong>Duration:</strong> {internship.duration} | <strong>Stipend:</strong> {internship.stipend}</p>
                  {internship.eligibility && (
                    <p style={{ color: "var(--text-primary)", fontSize: "0.875rem", marginTop: "0.5rem" }}><strong>Eligibility:</strong> {internship.eligibility}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "post" && (
        <div style={{ maxWidth: "600px", backgroundColor: "var(--bg-secondary)", padding: "2rem", borderRadius: "0.75rem", boxShadow: "var(--card-shadow)", border: "1px solid var(--border-color)" }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "1.5rem" }}>Post New Internship</h3>
          <form onSubmit={handlePostInternship} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input placeholder="Title" value={internshipData.title} onChange={(e) => setInternshipData({...internshipData, title: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--border-color)", width: "100%", boxSizing: "border-box", backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }} />
            <textarea placeholder="Description" value={internshipData.description} onChange={(e) => setInternshipData({...internshipData, description: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--border-color)", width: "100%", minHeight: "100px", boxSizing: "border-box", backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }} />
            <input placeholder="Duration (e.g., 3 months)" value={internshipData.duration} onChange={(e) => setInternshipData({...internshipData, duration: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--border-color)", width: "100%", boxSizing: "border-box", backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }} />
            <input placeholder="Stipend description (e.g., ₹10,000/month)" value={internshipData.stipend} onChange={(e) => setInternshipData({...internshipData, stipend: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--border-color)", width: "100%", boxSizing: "border-box", backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }} />
            <input placeholder="Eligibility Criteria (e.g., Min GPA 7.5, 3rd year CSE students)" value={internshipData.eligibility} onChange={(e) => setInternshipData({...internshipData, eligibility: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--border-color)", width: "100%", boxSizing: "border-box", backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }} />

            {/* Internship Type Selector */}
            <div style={{ padding: "1rem", backgroundColor: "var(--bg-tertiary)", borderRadius: "0.5rem", border: "1px solid var(--border-color)" }}>
              <label style={{ fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.75rem", display: "block" }}>💰 Internship Payment Type</label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {["Unpaid", "FeeRequired", "StipendBased"].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setInternshipData({...internshipData, internshipType: type, registrationFee: type !== "FeeRequired" ? "" : internshipData.registrationFee, stipendAmount: type !== "StipendBased" ? "" : internshipData.stipendAmount})}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "0.375rem",
                      border: internshipData.internshipType === type ? "2px solid #4f46e5" : "1px solid var(--border-color)",
                      backgroundColor: internshipData.internshipType === type ? "#eef2ff" : "var(--bg-secondary)",
                      color: internshipData.internshipType === type ? "#4f46e5" : "var(--text-muted)",
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
                  <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>Registration/Processing Fee (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g., 500"
                    value={internshipData.registrationFee}
                    onChange={(e) => setInternshipData({...internshipData, registrationFee: e.target.value})}
                    required
                    min="1"
                    style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--border-color)", width: "100%", boxSizing: "border-box", backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }}
                  />
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>This amount will be collected from students via Razorpay after approval.</p>
                </div>
              )}

              {internshipData.internshipType === "StipendBased" && (
                <div style={{ marginTop: "0.75rem" }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>Monthly Stipend Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g., 10000"
                    value={internshipData.stipendAmount}
                    onChange={(e) => setInternshipData({...internshipData, stipendAmount: e.target.value})}
                    required
                    min="1"
                    style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--border-color)", width: "100%", boxSizing: "border-box", backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }}
                  />
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>This is the monthly amount you'll pay the student. You can record payouts from the Payouts tab.</p>
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
            <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--text-primary)" }}>💸 Stipend Payouts</h3>
          </div>

          {/* Record New Payout */}
          <div style={{ backgroundColor: "var(--bg-secondary)", padding: "1.5rem", borderRadius: "0.75rem", boxShadow: "var(--card-shadow)", border: "1px solid var(--border-color)", marginBottom: "2rem" }}>
            <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "1rem" }}>Record New Stipend Payment</h4>
            {approvedStipendApplicants.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No approved stipend-based applicants found. Post a StipendBased internship and approve applicants first.</p>
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
                  style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--border-color)", width: "100%", boxSizing: "border-box", backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }}
                >
                  <option value="">Select Student & Internship</option>
                  {approvedStipendApplicants.map(app => (
                    <option key={app._id} value={app._id}>
                      {app.studentId?.name} — {app.internshipId?.title} (₹{app.internshipId?.stipendAmount?.toLocaleString()}/mo)
                    </option>
                  ))}
                </select>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <input type="number" placeholder="Amount (₹)" value={payoutData.amount} onChange={(e) => setPayoutData({...payoutData, amount: e.target.value})} required min="1" style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--border-color)", boxSizing: "border-box", backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }} />
                  <input type="text" placeholder="Month (e.g., April 2026)" value={payoutData.month} onChange={(e) => setPayoutData({...payoutData, month: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--border-color)", boxSizing: "border-box", backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <select value={payoutData.payoutMode} onChange={(e) => setPayoutData({...payoutData, payoutMode: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--border-color)", boxSizing: "border-box", backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }}>
                    <option value="BankTransfer">🏦 Bank Transfer</option>
                    <option value="UPI">📱 UPI</option>
                    <option value="Cheque">🧾 Cheque</option>
                  </select>
                  <input type="text" placeholder="UTR / Reference Number" value={payoutData.payoutReference} onChange={(e) => setPayoutData({...payoutData, payoutReference: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--border-color)", boxSizing: "border-box", backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }} />
                </div>
                <button type="submit" style={{ padding: "0.75rem", backgroundColor: "#059669", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}>✅ Record Payout</button>
              </form>
            )}
          </div>

          {/* Payout History */}
          <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "1rem" }}>Payment History</h4>
          {payouts.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No payments recorded yet.</p>
          ) : (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {payouts.map((pmt) => (
                <div key={pmt._id} style={{ backgroundColor: "var(--bg-secondary)", padding: "1rem 1.5rem", borderRadius: "0.75rem", boxShadow: "var(--card-shadow)", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <p style={{ fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                      {pmt.direction === "StudentToCompany" ? "⬅️ Received from" : "➡️ Paid to"} {pmt.studentId?.name || "Student"}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
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
        <div style={{ maxWidth: "600px", backgroundColor: "var(--bg-secondary)", padding: "2rem", borderRadius: "0.75rem", boxShadow: "var(--card-shadow)", border: "1px solid var(--border-color)" }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "1.5rem" }}>Complete Company Profile</h3>
          <p style={{ marginBottom: "1.5rem", color: "var(--text-muted)" }}>Please provide your official company details for verification.</p>
          <form onSubmit={handleProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input placeholder="Company Name" value={companyDetails.companyName} onChange={(e) => setCompanyDetails({...companyDetails, companyName: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--border-color)", width: "100%", boxSizing: "border-box", backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }} />
            <input placeholder="Official Email" value={companyDetails.email} onChange={(e) => setCompanyDetails({...companyDetails, email: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--border-color)", width: "100%", boxSizing: "border-box", backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }} />
            <input placeholder="Registration Number" value={companyDetails.registrationNumber} onChange={(e) => setCompanyDetails({...companyDetails, registrationNumber: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--border-color)", width: "100%", boxSizing: "border-box", backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }} />
            <input placeholder="Document Link (Drive/URL)" value={companyDetails.documents} onChange={(e) => setCompanyDetails({...companyDetails, documents: e.target.value})} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--border-color)", width: "100%", boxSizing: "border-box", backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }} />
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

      {/* Edit Profile Modal */}
      {showEditBanner && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "1rem",
        }}>
          <div style={{
            backgroundColor: "var(--bg-secondary)",
            borderRadius: "1rem",
            maxWidth: "550px",
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            border: "1px solid var(--border-color)",
          }}>
            <div style={{
              padding: "1.5rem",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                  ✏️ Edit Company Profile
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0.3rem 0 0 0" }}>
                  Update your description, website, and industry
                </p>
              </div>
              <button
                onClick={() => setShowEditBanner(false)}
                style={{
                  padding: "0.5rem",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.5rem",
                  color: "var(--text-muted)",
                  lineHeight: 1
                }}
              >×</button>
            </div>

            <form onSubmit={handleUpdateProfile} style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: "600" }}>
                  Company Description
                </label>
                <textarea
                  value={editProfileData.description}
                  onChange={(e) => setEditProfileData({ ...editProfileData, description: e.target.value })}
                  placeholder="Tell students what your company does, your mission, and culture..."
                  style={{
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border-color)",
                    width: "100%",
                    minHeight: "120px",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    fontSize: "0.9rem",
                    backgroundColor: "var(--input-bg)",
                    color: "var(--text-primary)",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: "600" }}>
                    🏭 Industry
                  </label>
                  <input
                    value={editProfileData.industry}
                    onChange={(e) => setEditProfileData({ ...editProfileData, industry: e.target.value })}
                    placeholder="e.g., Technology, Finance"
                    style={{
                      padding: "0.75rem",
                      borderRadius: "0.5rem",
                      border: "1px solid var(--border-color)",
                      width: "100%",
                      boxSizing: "border-box",
                      backgroundColor: "var(--input-bg)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: "600" }}>
                    🌐 Website
                  </label>
                  <input
                    value={editProfileData.website}
                    onChange={(e) => setEditProfileData({ ...editProfileData, website: e.target.value })}
                    placeholder="e.g., www.company.com"
                    style={{
                      padding: "0.75rem",
                      borderRadius: "0.5rem",
                      border: "1px solid var(--border-color)",
                      width: "100%",
                      boxSizing: "border-box",
                      backgroundColor: "var(--input-bg)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              <div style={{
                padding: "1rem",
                backgroundColor: "var(--bg-tertiary)",
                borderRadius: "0.5rem",
                border: "1px solid var(--border-color)",
              }}>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0 0 0.5rem 0", fontWeight: "600" }}>
                  📷 Profile Images
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
                  You can update your company logo and banner directly from the hero section — just hover over the banner or click the logo.
                </p>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowEditBanner(false)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    backgroundColor: "var(--bg-tertiary)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >Cancel</button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    backgroundColor: "#4f46e5",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    fontWeight: "600",
                    transition: "background-color 0.2s ease",
                  }}
                >Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

// Application Details Modal Component
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