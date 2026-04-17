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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "student") {
      navigate("/");
      return;
    }
    
    // Load all data
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        checkProfile(),
        fetchInternships(),
        fetchAppliedInternships()
      ]);
      setLoading(false);
    };
    
    loadData();
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
      console.error("Failed to load internships");
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
          message: `This internship is for ${requiredYear}${yearMatch[2]} year and above. You are in ${studentYear}${getYearSuffix(studentYear)} year.`
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[var(--bg-primary)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans transition-colors duration-300">
      
      {/* Navigation Top Bar */}
      <div className="sticky top-0 z-40 bg-[var(--bg-secondary)]/80 backdrop-blur-md border-b border-[var(--border-color)] px-6 py-4 shadow-sm flex flex-wrap justify-between items-center gap-4">
        
        {/* Left Section: Logo & Navigation */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎓</span>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Student Portal
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <Link to="/smart-match">
              <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg font-bold shadow-[0_4px_14px_rgba(99,102,241,0.4)] transform hover:-translate-y-0.5 transition-all flex items-center gap-2">
                <span>🎯</span> Smart Match
              </button>
            </Link>
            <Link to="/my-application">
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                My Applications
              </button>
            </Link>
            <Link to="/tasks">
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
                📝 Tasks
              </button>
            </Link>
            <Link to="/student/interviews">
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                📅 Interviews
              </button>
            </Link>
          </div>
        </div>
        
        {/* Right Section: Utilities */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="hidden md:block h-8 w-px bg-[var(--border-color)] mx-1"></div>
          
          <Link to="/settings">
            <button className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded-full transition-colors" title="Settings">
              ⚙️
            </button>
          </Link>
          <Link to="/profile">
            <button className={`p-2 text-white rounded-full transition-colors shadow-sm ${isProfileComplete ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-500 hover:bg-amber-600 animate-pulse'}`} title="Profile">
              👤
            </button>
          </Link>
          <button onClick={handleLogout} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium ml-2 transition-colors">
            Exit
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Available Opportunities</h2>
            <p className="text-[var(--text-muted)] mt-1">Discover and act on internships that match your abilities.</p>
          </div>
        </div>

        {/* Warning Alert if profile incomplete */}
        {!isProfileComplete && (
          <div className="mb-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-amber-500 text-2xl mr-3">⚠️</span>
                <div>
                  <h3 className="text-amber-800 font-bold">Incomplete Profile</h3>
                  <p className="text-amber-700 text-sm mt-0.5">You cannot apply to any internships until your profile is fully set up.</p>
                </div>
              </div>
              <Link to="/profile" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow-sm transition-colors text-sm">
                Complete Now →
              </Link>
            </div>
          </div>
        )}

        {internships.length === 0 ? (
          <div className="text-center py-20 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm">
            <div className="text-6xl mb-4 opacity-50">📉</div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Internships Yet</h3>
            <p className="text-[var(--text-muted)]">Companies haven't posted any opportunities at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internships.map((internship) => {
              const eligibilityCheck = studentProfile ? checkEligibility(internship) : { eligible: true };
              const isApplied = appliedInternships.has(internship._id);
              
              return (
                <div
                  key={internship._id}
                  className={`bg-[var(--bg-secondary)] rounded-2xl p-6 shadow-[var(--card-shadow)] hover:shadow-lg border flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1 ${
                    !eligibilityCheck.eligible ? "border-rose-300 dark:border-rose-800/50 opacity-90" : "border-[var(--border-color)]"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-[var(--text-primary)] leading-tight">{internship.title}</h3>
                      {!eligibilityCheck.eligible && (
                        <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded flex-shrink-0">
                          Not Eligible
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-[var(--bg-tertiary)] p-1.5 rounded text-sm text-[var(--text-secondary)]">🏢</span>
                      <span className="font-medium text-[var(--text-secondary)]">{internship.companyId?.companyName}</span>
                    </div>
                    
                    <p className="text-[var(--text-muted)] text-sm mb-5 line-clamp-3 leading-relaxed">
                      {internship.description}
                    </p>
                    
                    {/* Internship Type Badges */}
                    {internship.internshipType && internship.internshipType !== "Unpaid" && (
                      <div className="mb-4">
                        {internship.internshipType === "FeeRequired" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200">
                            💰 Fee: ₹{internship.registrationFee?.toLocaleString()}
                          </span>
                        )}
                        {internship.internshipType === "StipendBased" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200">
                            💵 Stipend: ₹{internship.stipendAmount?.toLocaleString()}/mo
                          </span>
                        )}
                      </div>
                    )}

                    <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 mb-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-muted)]">Duration:</span>
                        <span className="font-semibold text-[var(--text-primary)]">{internship.duration}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-muted)]">Stipend:</span>
                        <span className="font-semibold text-[var(--text-primary)]">{internship.stipend}</span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-[var(--border-color)] text-sm">
                        <span className="text-[var(--text-muted)] block mb-1">Eligibility:</span>
                        <span className="font-medium text-[var(--text-secondary)] text-xs leading-snug block">
                          {internship.eligibility || "Open to all"}
                        </span>
                      </div>
                    </div>

                    {/* Alerts */}
                    {eligibilityCheck.warning && (
                      <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg mb-4">
                        <p className="text-amber-800 text-xs font-medium flex items-start gap-1.5">
                          <span className="mt-0.5 text-[0.6rem]">⚠️</span> {eligibilityCheck.warning}
                        </p>
                      </div>
                    )}

                    {!eligibilityCheck.eligible && (
                      <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-lg mb-4">
                        <p className="text-rose-800 text-xs font-medium flex items-start gap-1.5">
                          <span className="mt-0.5 text-[0.6rem]">❌</span> {eligibilityCheck.message}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={() => handleApplyClick(internship)}
                    disabled={isApplied || !isProfileComplete || !eligibilityCheck.eligible}
                    className={`mt-4 w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      isApplied
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200 opacity-90 cursor-default"
                        : !isProfileComplete || !eligibilityCheck.eligible
                        ? "bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-indigo-500/30"
                    }`}
                  >
                    {isApplied 
                      ? (<span>✓ Applied {internship.internshipType === "FeeRequired" && " (Pay Later)"}</span>)
                      : !isProfileComplete
                      ? "Complete Profile to Apply"
                      : !eligibilityCheck.eligible
                      ? "Not Eligible"
                      : "Apply Now →"}
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
    </div>
  );
};

export default StudentDashboard;