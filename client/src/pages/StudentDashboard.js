import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import InternshipApplicationModal from "../components/InternshipApplicationModal";
import { useTheme } from "../context/ThemeContext";

const StudentDashboard = () => {
  const { themeName, themes } = useTheme();
  const [internships, setInternships] = useState([]);
  const [appliedInternships, setAppliedInternships] = useState(new Set());
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "student") {
      navigate("/");
      return;
    }
    checkProfile();
    fetchInternships();
    fetchAppliedInternships();
  }, [navigate]);

  const checkProfile = async () => {
    try {
      const res = await API.get("/student/profile");
      if (res.data && res.data.phone) {
        setIsProfileComplete(true);
        setStudentProfile(res.data);
      }
    } catch (err) {
      setIsProfileComplete(false);
    }
  };

  const fetchInternships = async () => {
    try {
      const res = await API.get("/internship/all");
      setInternships(res.data);
    } catch (err) {
      alert("Failed to load internships");
    }
  };

  const fetchAppliedInternships = async () => {
    try {
      const res = await API.get("/application/my");
      const appliedIds = new Set(res.data.map((app) => app.internshipId?._id));
      setAppliedInternships(appliedIds);
    } catch (err) {
      console.error("Failed to fetch applied internships");
    }
  };

  const checkEligibility = (internship) => {
    if (!internship.eligibility || !studentProfile) {
      return { eligible: true, message: "" };
    }

    const eligibilityCriteria = internship.eligibility.toLowerCase();
    
    const gpaMatch = eligibilityCriteria.match(/gpa.*?(\d+\.?\d*)/i) || eligibilityCriteria.match(/cgpa.*?(\d+\.?\d*)/i);
    if (gpaMatch) {
      const requiredGPA = parseFloat(gpaMatch[1]);
      const studentGPA = parseFloat(studentProfile.gpa);
      
      if (studentGPA < requiredGPA) {
        return {
          eligible: false,
          message: `Minimum GPA required: ${requiredGPA}. Your GPA: ${studentGPA}`
        };
      }
    }

    const yearMatch = eligibilityCriteria.match(/(\d+)(st|nd|rd|th)\s*year/i);
    if (yearMatch) {
      const requiredYear = parseInt(yearMatch[1]);
      const studentYear = parseInt(studentProfile.yearOfStudy);
      
      if (studentYear < requiredYear) {
        return {
          eligible: false,
          message: `This internship is for ${requiredYear}${yearMatch[2]} year and above students. You are in ${studentYear}${getYearSuffix(studentYear)} year.`
        };
      }
    }

    const branches = ['cse', 'it', 'ece', 'eee', 'mech', 'civil', 'cs', 'information technology', 'computer science'];
    const studentBranch = studentProfile.branch.toLowerCase();
    
    for (const branch of branches) {
      if (eligibilityCriteria.includes(branch) && !studentBranch.includes(branch.substring(0, 2))) {
        return {
          eligible: true,
          warning: `This internship prefers ${branch.toUpperCase()} students. Your branch: ${studentProfile.branch}`,
          message: eligibilityCriteria
        };
      }
    }

    return { eligible: true, message: eligibilityCriteria };
  };

  const getYearSuffix = (year) => {
    if (year === 1) return "st";
    if (year === 2) return "nd";
    if (year === 3) return "rd";
    return "th";
  };

  const handleApplyClick = (internship) => {
    if (!isProfileComplete) {
      const shouldNavigate = window.confirm(
        "Please complete your profile before applying for internships.\n\nClick OK to go to your profile page."
      );
      if (shouldNavigate) {
        navigate("/profile");
      }
      return;
    }

    const eligibilityCheck = checkEligibility(internship);
    
    if (!eligibilityCheck.eligible) {
      alert(`You are not eligible for this internship.\n\n${eligibilityCheck.message}`);
      return;
    }

    if (eligibilityCheck.warning) {
      const proceed = window.confirm(`${eligibilityCheck.warning}\n\nDo you still want to apply?`);
      if (!proceed) return;
    }

    setSelectedInternship(internship);
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = async (applicationData) => {
    try {
      await API.post("/application/apply", {
        internshipId: selectedInternship._id,
        ...applicationData
      });
      
      alert("Application submitted successfully!");
      setAppliedInternships((prev) => new Set(prev).add(selectedInternship._id));
      setShowApplicationModal(false);
      setSelectedInternship(null);
    } catch (err) {
      alert(err.response?.data?.message || "Application failed");
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
        <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "var(--text-primary)" }}>Available Internships</h2>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link to="/profile">
            <button style={{ 
              padding: "0.5rem 1rem", 
              backgroundColor: isProfileComplete ? "#059669" : "#f59e0b", 
              color: "white", 
              border: "none", 
              borderRadius: "0.375rem", 
              cursor: "pointer", 
              fontWeight: "600" 
            }}>
              {isProfileComplete ? "✓ Profile" : "⚠ Complete Profile"}
            </button>
          </Link>
          <Link to="/smart-match">
            <button style={{ 
              padding: "0.5rem 1.25rem", 
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)", 
              color: "white", 
              border: "none", 
              borderRadius: "0.375rem", 
              cursor: "pointer", 
              fontWeight: "700",
              boxShadow: "0 4px 14px rgba(99,102,241,0.4)"
            }}>
              🎯 Smart Match
            </button>
          </Link>
          <Link to="/my-application">
            <button style={{ padding: "0.5rem 1rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}>View My Applications</button>
          </Link>
          <Link to="/tasks">
  <button style={{ 
    padding: "0.5rem 1rem", 
    backgroundColor: "#059669", 
    color: "white", 
    border: "none", 
    borderRadius: "0.375rem", 
    cursor: "pointer", 
    fontWeight: "600" 
  }}>
    My Tasks
  </button>
</Link>
          <Link to="/student/interviews">
  <button style={{ 
    padding: "0.5rem 1rem", 
    backgroundColor: "#8b5cf6", 
    color: "white", 
    border: "none", 
    borderRadius: "0.375rem", 
    cursor: "pointer", 
    fontWeight: "600" 
  }}>
    📅 My Interviews
  </button>
</Link>
          <Link to="/settings">
            <button style={{ padding: "0.5rem 1rem", backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}>⚙️ Settings</button>
          </Link>
          <button onClick={handleLogout} style={{ padding: "0.5rem 1rem", backgroundColor: "var(--accent-danger)", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}>Logout</button>
        </div>
      </div>

      {!isProfileComplete && (
        <div style={{ backgroundColor: "var(--warning-bg)", padding: "1rem", borderRadius: "0.5rem", marginBottom: "1.5rem", border: "1px solid var(--warning-border)" }}>
          <p style={{ color: "var(--warning-text)", fontSize: "0.875rem" }}>
            <strong>Action Required:</strong> Please complete your profile to apply for internships. 
            <Link to="/profile" style={{ color: "#4f46e5", marginLeft: "0.5rem", fontWeight: "600", textDecoration: "underline" }}>
              Complete Profile Now →
            </Link>
          </p>
        </div>
      )}

      {internships.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No internships available</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {internships.map((internship) => {
            const eligibilityCheck = studentProfile ? checkEligibility(internship) : { eligible: true };
            
            return (
              <div
                key={internship._id}
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  padding: "1.5rem",
                  borderRadius: "0.5rem",
                  boxShadow: "var(--card-shadow)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  border: !eligibilityCheck.eligible ? "2px solid var(--error-border)" : "1px solid var(--border-color)"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--text-primary)" }}>{internship.title}</h3>
                    {!eligibilityCheck.eligible && (
                      <span style={{ 
                        fontSize: "0.75rem", 
                        backgroundColor: "#fee2e2", 
                        color: "#991b1b", 
                        padding: "0.25rem 0.5rem", 
                        borderRadius: "0.25rem",
                        fontWeight: "600"
                      }}>
                        Not Eligible
                      </span>
                    )}
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>{internship.description}</p>
                  
                  {/* Internship Type Badge */}
                  {internship.internshipType && internship.internshipType !== "Unpaid" && (
                    <div style={{ marginBottom: "0.75rem" }}>
                      {internship.internshipType === "FeeRequired" && (
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          padding: "0.35rem 0.75rem",
                          borderRadius: "0.5rem",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
                          color: "#c2410c",
                          border: "1px solid #fed7aa"
                        }}>
                          💰 Registration Fee: ₹{internship.registrationFee?.toLocaleString()}
                        </span>
                      )}
                      {internship.internshipType === "StipendBased" && (
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          padding: "0.35rem 0.75rem",
                          borderRadius: "0.5rem",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                          color: "#15803d",
                          border: "1px solid #bbf7d0"
                        }}>
                          💵 Stipend: ₹{internship.stipendAmount?.toLocaleString()}/month
                        </span>
                      )}
                    </div>
                  )}

                  <div style={{ marginBottom: "1rem" }}>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}><strong>Company:</strong> {internship.companyId?.companyName}</p>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}><strong>Duration:</strong> {internship.duration}</p>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}><strong>Stipend:</strong> {internship.stipend}</p>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                      <strong>Eligibility:</strong> {internship.eligibility || "N/A"}
                    </p>
                  </div>

                  {eligibilityCheck.warning && (
                    <div style={{ 
                      backgroundColor: "#fef3c7", 
                      padding: "0.5rem", 
                      borderRadius: "0.375rem", 
                      marginBottom: "0.5rem",
                      border: "1px solid #fbbf24"
                    }}>
                      <p style={{ color: "#92400e", fontSize: "0.75rem", margin: 0 }}>
                        ⚠ {eligibilityCheck.warning}
                      </p>
                    </div>
                  )}

                  {!eligibilityCheck.eligible && (
                    <div style={{ 
                      backgroundColor: "#fee2e2", 
                      padding: "0.5rem", 
                      borderRadius: "0.375rem", 
                      marginBottom: "0.5rem",
                      border: "1px solid #fca5a5"
                    }}>
                      <p style={{ color: "#991b1b", fontSize: "0.75rem", margin: 0 }}>
                        ✗ {eligibilityCheck.message}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleApplyClick(internship)}
                  disabled={appliedInternships.has(internship._id) || !isProfileComplete}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    backgroundColor: appliedInternships.has(internship._id) 
                      ? "#9ca3af" 
                      : !isProfileComplete
                      ? "#d1d5db"
                      : !eligibilityCheck.eligible
                      ? "#9ca3af"
                      : "#4f46e5",
                    color: "white",
                    border: "none",
                    borderRadius: "0.375rem",
                    cursor: appliedInternships.has(internship._id) || !isProfileComplete || !eligibilityCheck.eligible ? "not-allowed" : "pointer",
                    fontWeight: "500",
                    marginTop: "1rem",
                  }}
                >
                  {appliedInternships.has(internship._id) 
                    ? (internship.internshipType === "FeeRequired" ? "Applied (Pay in 'My Applications' after approval)" : "Applied")
                    : !isProfileComplete
                    ? "Complete Profile First"
                    : !eligibilityCheck.eligible
                    ? "Not Eligible"
                    : "Apply Now"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showApplicationModal && selectedInternship && (
        <InternshipApplicationModal
          internship={selectedInternship}
          studentProfile={studentProfile}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedInternship(null);
          }}
          onSubmit={handleApplicationSubmit}
        />
      )}
    </div>
  );
};

export default StudentDashboard;