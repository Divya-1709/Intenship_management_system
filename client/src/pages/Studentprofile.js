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
  
  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      alert("Please type DELETE to confirm account deletion.");
      return;
    }

    setIsDeleting(true);
    try {
      await API.delete("/student/delete-account");
      alert("Your account and all associated data have been deleted successfully.");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete account");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[var(--bg-primary)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            {isProfileComplete ? "My Profile" : "Complete Your Profile"}
          </h2>
          <div className="flex gap-3">
            <Link to="/settings" className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-lg font-semibold shadow-sm hover:bg-[var(--bg-hover)] transition-colors">
              ⚙️ Settings
            </Link>
            <Link to="/student" className="px-4 py-2 bg-[var(--text-muted)] text-white hover:bg-[var(--text-secondary)] rounded-lg font-semibold shadow-sm transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </div>

        {!isProfileComplete && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm">
            <div className="flex items-start">
              <span className="text-amber-500 text-xl mr-3">⚠️</span>
              <p className="text-amber-800 text-sm font-medium">
                <strong>Attention:</strong> Please complete your profile before applying for internships. This information is shared with companies during the application process.
              </p>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-[var(--bg-secondary)] p-8 rounded-2xl shadow-[var(--card-shadow)] border border-[var(--border-color)]">
          <form onSubmit={handleSubmit} className="space-y-10">

            {/* Personal Information */}
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
                👤 Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Phone Number <span className="text-red-500">*</span></label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="+91 1234567890"
                    value={profileData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">LinkedIn Profile</label>
                  <input
                    name="linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={profileData.linkedin}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
                🎓 Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">College/University <span className="text-red-500">*</span></label>
                  <input
                    name="college"
                    placeholder="E.g. National Engineering College"
                    value={profileData.college}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Degree <span className="text-red-500">*</span></label>
                  <input
                    name="degree"
                    placeholder="E.g., B.Tech, B.E., BCA"
                    value={profileData.degree}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Branch/Specialization <span className="text-red-500">*</span></label>
                  <input
                    name="branch"
                    placeholder="E.g., CSE, IT, ECE"
                    value={profileData.branch}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Year of Study <span className="text-red-500">*</span></label>
                  <select
                    name="yearOfStudy"
                    value={profileData.yearOfStudy}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">GPA/CGPA <span className="text-red-500">*</span></label>
                  <input
                    name="gpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="E.g., 8.5"
                    value={profileData.gpa}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                  />
                </div>
              </div>
            </div>

            {/* Skills & Documents */}
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
                💻 Skills & Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Skills <span className="text-red-500">*</span></label>
                  <textarea
                    name="skills"
                    placeholder="E.g., JavaScript, React, Python, Machine Learning (comma-separated)"
                    value={profileData.skills}
                    onChange={handleChange}
                    required
                    rows="3"
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-primary transition-shadow resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Resume Link <span className="text-red-500">*</span></label>
                  <input
                    name="resume"
                    type="url"
                    placeholder="Google Drive or cloud URL"
                    value={profileData.resume}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1 ml-1">Make sure the link is publicly accessible</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">GitHub Profile</label>
                  <input
                    name="github"
                    type="url"
                    placeholder="https://github.com/yourusername"
                    value={profileData.github}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-color)] flex justify-end">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-lg"
              >
                {isProfileComplete ? "Update Profile" : "Save Profile"}
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone: Delete Account */}
        <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-2xl border border-red-200 dark:border-red-800/30">
          <h3 className="text-xl font-bold text-red-700 dark:text-red-500 mb-2 flex items-center gap-2">
            ⚠️ Danger Zone
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-6 text-sm">
            Once you delete your account, there is no going back. All of your applications, tasks, payments, profile data, and user account will be permanently destroyed.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
          >
            Delete Account
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[var(--bg-secondary)] max-w-md w-full rounded-2xl p-6 shadow-2xl border border-[var(--border-color)] animate-in fade-in zoom-in duration-200">
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Are you absolutely sure?</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-4">
                This action cannot be undone. This will permanently delete your account and remove all associated data including applications, tasks, and payments from our servers.
              </p>
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Please type <strong>DELETE</strong> to confirm.
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="DELETE"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText("");
                  }}
                  className="px-4 py-2 rounded-lg font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "DELETE" || isDeleting}
                  className={`px-4 py-2 rounded-lg font-medium text-white transition-all ${
                    deleteConfirmText === "DELETE" && !isDeleting
                      ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30"
                      : "bg-red-400 cursor-not-allowed opacity-70"
                  }`}
                >
                  {isDeleting ? "Deleting..." : "Permanently delete account"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;