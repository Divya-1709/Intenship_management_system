import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const StudentProfile = () => {
  const { themeName } = useTheme();
  const [profileData, setProfileData] = useState({
    phone: "",
    college: "",
    degree: "",
    branch: "",
    yearOfStudy: "",
    gpa: "",
    skills: "",
    resume: "",
    linkedin: "",
    github: ""
  });
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "student") {
      navigate("/");
      return;
    }
    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/student/profile");
      if (res.data && res.data.phone) {
        setProfileData(res.data);
        setIsProfileComplete(true);
      }
      setLoading(false);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setIsProfileComplete(false);
      }
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/student/profile", profileData);
      alert("Profile saved successfully!");
      setIsProfileComplete(true);
      navigate("/student");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save profile");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", backgroundColor: "var(--bg-primary)", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", transition: "background-color 0.3s ease" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "var(--text-primary)" }}>
            {isProfileComplete ? "My Profile" : "Complete Your Profile"}
          </h2>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link to="/settings">
              <button style={{ padding: "0.5rem 1rem", backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}>⚙️ Settings</button>
            </Link>
            <Link to="/student">
              <button style={{ padding: "0.5rem 1rem", backgroundColor: "var(--text-muted)", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}>Back</button>
            </Link>
          </div>
        </div>

        {!isProfileComplete && (
          <div style={{ backgroundColor: "#fef3c7", padding: "1rem", borderRadius: "0.5rem", marginBottom: "1.5rem", border: "1px solid #fbbf24" }}>
            <p style={{ color: "#92400e", fontSize: "0.875rem" }}>
              <strong>Note:</strong> Please complete your profile before applying for internships. This information will be shared with companies when you apply.
            </p>
          </div>
        )}

        <div style={{ backgroundColor: "var(--bg-secondary)", padding: "2rem", borderRadius: "0.5rem", boxShadow: "var(--card-shadow)", border: "1px solid var(--border-color)" }}>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.5rem" }}>
            {/* Personal Information Section */}
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#374151", marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "2px solid #e5e7eb" }}>
                Personal Information
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
                    Phone Number *
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="+91 1234567890"
                    value={profileData.phone}
                    onChange={handleChange}
                    required
                    style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
                    LinkedIn Profile
                  </label>
                  <input
                    name="linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={profileData.linkedin}
                    onChange={handleChange}
                    style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }}
                  />
                </div>
              </div>
            </div>

            {/* Academic Information Section */}
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#374151", marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "2px solid #e5e7eb" }}>
                Academic Information
              </h3>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
                    College/University *
                  </label>
                  <input
                    name="college"
                    placeholder="Your College Name"
                    value={profileData.college}
                    onChange={handleChange}
                    required
                    style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
                      Degree *
                    </label>
                    <input
                      name="degree"
                      placeholder="e.g., B.Tech, B.E., BCA"
                      value={profileData.degree}
                      onChange={handleChange}
                      required
                      style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
                      Branch/Specialization *
                    </label>
                    <input
                      name="branch"
                      placeholder="e.g., CSE, IT, ECE"
                      value={profileData.branch}
                      onChange={handleChange}
                      required
                      style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
                      Year of Study *
                    </label>
                    <select
                      name="yearOfStudy"
                      value={profileData.yearOfStudy}
                      onChange={handleChange}
                      required
                      style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box", backgroundColor: "white" }}
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
                      GPA/CGPA *
                    </label>
                    <input
                      name="gpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="e.g., 8.5"
                      value={profileData.gpa}
                      onChange={handleChange}
                      required
                      style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Skills & Documents Section */}
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#374151", marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "2px solid #e5e7eb" }}>
                Skills & Documents
              </h3>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
                    Skills *
                  </label>
                  <textarea
                    name="skills"
                    placeholder="e.g., JavaScript, React, Python, Machine Learning (comma-separated)"
                    value={profileData.skills}
                    onChange={handleChange}
                    required
                    style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", minHeight: "100px", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
                    Resume Link (Google Drive/Cloud Storage) *
                  </label>
                  <input
                    name="resume"
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={profileData.resume}
                    onChange={handleChange}
                    required
                    style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }}
                  />
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                    Make sure the link is publicly accessible
                  </p>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: "500" }}>
                    GitHub Profile (Optional)
                  </label>
                  <input
                    name="github"
                    type="url"
                    placeholder="https://github.com/yourusername"
                    value={profileData.github}
                    onChange={handleChange}
                    style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              style={{
                padding: "0.75rem",
                backgroundColor: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "1rem",
                marginTop: "1rem"
              }}
            >
              {isProfileComplete ? "Update Profile" : "Save Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;