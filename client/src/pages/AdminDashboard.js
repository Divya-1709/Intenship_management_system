import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const AdminDashboard = () => {
  const { themeName } = useTheme();
  const [stats, setStats] = useState({});
  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      navigate("/");
      return;
    }
    loadAllData();
  }, [navigate]);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchCompanies(),
      fetchStudents(),
      fetchApplications()
    ]);
    setLoading(false);
  };

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
      setCompanies(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch companies", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await API.get("/admin/students");
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await API.get("/admin/applications");
      setApplications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch applications", err);
    }
  };

  const verifyCompany = async (id, status) => {
    try {
      await API.put(`/company/verify/${id}`, { status });
      fetchCompanies();
      fetchStats();
    } catch (err) {
      alert("Failed to update company status");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.headerTitle}>Platform Admin Hub</h2>
          <p style={styles.headerSubtitle}>Monitor system metrics, companies, and transactions</p>
        </div>
        <div style={styles.headerActions}>
          <Link to="/settings">
            <button style={styles.settingsBtn}>⚙️ Settings</button>
          </Link>
          <button onClick={handleLogout} style={styles.logoutBtn}>Sign Out</button>
        </div>
      </div>

      {/* Modern Tab Navigation */}
      <nav style={styles.tabNav}>
        {[
          { id: "overview", label: "📊 Overview", color: "#6366f1" },
          { id: "companies", label: "🏢 Companies", color: "#059669" },
          { id: "students", label: "👨‍🎓 Students", color: "#2563eb" },
          { id: "applications", label: "📑 Applications", color: "#e11d48" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tabBtn,
              ...(activeTab === tab.id ? {
                backgroundColor: tab.color,
                color: "white",
                boxShadow: `0 4px 14px ${tab.color}40`,
                transform: "translateY(-1px)"
              } : {
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-color)"
              })
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content Area */}
      <div style={styles.contentArea}>
        {loading ? (
          <div style={styles.loadingState}>
            <div style={styles.spinner} />
            <p>Gathering platform metrics...</p>
          </div>
        ) : (
          <>
            {/* Overview / Stats View */}
            {activeTab === "overview" && (
              <div>
                <h3 style={styles.sectionHeading}>Financial Metrics</h3>
                <div style={styles.statsGrid}>
                  <PremiumStatCard
                    icon="💰"
                    title="Platform Revenue"
                    value={`₹${(stats.totalRevenue || 0).toLocaleString()}`}
                    gradient="linear-gradient(135deg, #10b981, #059669)"
                    text="Total collected fees"
                  />
                  <PremiumStatCard
                    icon="💸"
                    title="Stipends Disbursed"
                    value={`₹${(stats.stipendsPaid || 0).toLocaleString()}`}
                    gradient="linear-gradient(135deg, #6366f1, #4f46e5)"
                    text="Total stipends paid to students"
                  />
                </div>

                <h3 style={{ ...styles.sectionHeading, marginTop: "2rem" }}>User & Content Metrics</h3>
                <div style={styles.statsGrid}>
                  <StatCard icon="👨‍🎓" title="Total Students" value={stats.totalStudents || 0} />
                  <StatCard icon="🏢" title="Total Companies" value={stats.totalCompanies || 0} />
                  <StatCard icon="✅" title="Verified Companies" value={stats.verifiedCompanies || 0} />
                  <StatCard icon="💼" title="Active Internships" value={stats.totalInternships || 0} />
                  <StatCard icon="📝" title="Total Applications" value={stats.totalApplications || 0} />
                </div>
              </div>
            )}

            {/* Manage Companies View */}
            {activeTab === "companies" && (
              <div>
                <div style={styles.flexBetween}>
                  <h3 style={styles.sectionHeading}>Company Verifications</h3>
                  <span style={styles.countBadge}>{companies.length} Total</span>
                </div>
                
                <div style={styles.dataGrid}>
                  {companies.map((company) => (
                    <div key={company._id} style={styles.card}>
                      <div style={styles.cardHeader}>
                        <div>
                          <h4 style={styles.cardTitle}>{company.companyName}</h4>
                          <p style={styles.cardSubtitle}>{company.email}</p>
                        </div>
                        <span style={styles.statusBadge(company.status)}>{company.status}</span>
                      </div>
                      
                      <div style={styles.cardBody}>
                        <div style={styles.infoRow}>
                          <span style={styles.infoLabel}>Registration No:</span>
                          <span style={styles.infoValue}>{company.registrationNumber}</span>
                        </div>
                        {company.documents && (
                          <a href={company.documents} target="_blank" rel="noreferrer" style={styles.docLink}>
                            📄 View Verification Documents
                          </a>
                        )}
                      </div>

                      <div style={styles.cardFooter}>
                        {company.status !== "Verified" && (
                          <button onClick={() => verifyCompany(company._id, "Verified")} style={styles.verifyBtn}>
                            Approve
                          </button>
                        )}
                        {company.status !== "Rejected" && (
                          <button onClick={() => verifyCompany(company._id, "Rejected")} style={styles.rejectBtn}>
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {companies.length === 0 && <EmptyState message="No companies registered yet." />}
              </div>
            )}

            {/* Students View */}
            {activeTab === "students" && (
              <div>
                <div style={styles.flexBetween}>
                  <h3 style={styles.sectionHeading}>Student Directory</h3>
                  <span style={styles.countBadge}>{students.length} Students</span>
                </div>
                <div style={styles.dataGrid}>
                  {students.map((student) => (
                    <div key={student._id} style={{ ...styles.card, padding: "1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={styles.avatarPlaceholder}>
                          {student.name ? student.name.charAt(0).toUpperCase() : "S"}
                        </div>
                        <div>
                          <h4 style={{ ...styles.cardTitle, margin: 0 }}>{student.name}</h4>
                          <p style={{ ...styles.cardSubtitle, margin: 0 }}>{student.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {students.length === 0 && <EmptyState message="No students registered yet." />}
              </div>
            )}

            {/* Applications View */}
            {activeTab === "applications" && (
              <div>
                <div style={styles.flexBetween}>
                  <h3 style={styles.sectionHeading}>Global Tracking</h3>
                  <span style={styles.countBadge}>{applications.length} Applications</span>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {applications.map((app) => (
                    <div key={app._id} style={styles.listCard}>
                      <div style={{ flex: 1 }}>
                        <h4 style={styles.cardTitle}>{app.studentId?.name} <span style={{ fontWeight: "normal", color: "var(--text-muted)" }}>applied for</span> {app.internshipId?.title}</h4>
                        <p style={styles.cardSubtitle}>
                          Company: {app.internshipId?.companyId?.companyName || "N/A"} • Student: {app.studentId?.email}
                        </p>
                      </div>
                      <span style={styles.statusBadge(app.status)}>{app.status}</span>
                    </div>
                  ))}
                </div>
                {applications.length === 0 && <EmptyState message="No applications submitted yet." />}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// --- Sub Components ---

const PremiumStatCard = ({ icon, title, value, gradient, text }) => (
  <div style={{
    background: gradient,
    padding: "2rem",
    borderRadius: "1rem",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    position: "relative",
    overflow: "hidden"
  }}>
    <div style={{ fontSize: "2.5rem", position: "absolute", right: "1rem", top: "1rem", opacity: 0.3 }}>
      {icon}
    </div>
    <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase", opacity: 0.9 }}>{title}</p>
    <h2 style={{ margin: "1rem 0 0.5rem 0", fontSize: "2.5rem", fontWeight: "800" }}>{value}</h2>
    <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.8 }}>{text}</p>
  </div>
);

const StatCard = ({ icon, title, value }) => (
  <div style={{
    backgroundColor: "var(--bg-secondary)",
    padding: "1.5rem",
    borderRadius: "0.75rem",
    border: "1px solid var(--border-color)",
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
    boxShadow: "var(--card-shadow)"
  }}>
    <div style={{
      width: "3.5rem", height: "3.5rem",
      backgroundColor: "var(--bg-primary)",
      borderRadius: "0.75rem",
      display: "flex", justifyContent: "center", alignItems: "center",
      fontSize: "1.5rem",
      border: "1px solid var(--border-color)"
    }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>{title}</p>
      <h3 style={{ margin: "0.25rem 0 0 0", fontSize: "1.75rem", color: "var(--text-primary)", fontWeight: "700" }}>{value}</h3>
    </div>
  </div>
);

const EmptyState = ({ message }) => (
  <div style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: "var(--bg-secondary)", borderRadius: "1rem", border: "1px dashed var(--border-color)" }}>
    <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>{message}</p>
  </div>
);

// --- Styles ---

const styles = {
  container: {
    padding: "2rem",
    backgroundColor: "var(--bg-primary)",
    minHeight: "100vh",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    transition: "background-color 0.3s ease"
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem"
  },
  headerTitle: {
    fontSize: "2.25rem",
    fontWeight: "800",
    color: "var(--text-primary)",
    margin: 0,
    letterSpacing: "-0.02em"
  },
  headerSubtitle: {
    color: "var(--text-muted)",
    margin: "0.5rem 0 0 0",
    fontSize: "1rem"
  },
  headerActions: {
    display: "flex",
    gap: "1rem"
  },
  settingsBtn: {
    padding: "0.6rem 1.25rem",
    backgroundColor: "var(--bg-secondary)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: "0.5rem",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s"
  },
  logoutBtn: {
    padding: "0.6rem 1.25rem",
    backgroundColor: "#e11d48",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 4px 14px rgba(225, 29, 72, 0.3)"
  },
  tabNav: {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
    overflowX: "auto",
    paddingBottom: "0.5rem"
  },
  tabBtn: {
    padding: "0.75rem 1.5rem",
    borderRadius: "9999px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.95rem",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap"
  },
  contentArea: {
    animation: "fadeIn 0.4s ease"
  },
  sectionHeading: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    marginBottom: "1.5rem"
  },
  flexBetween: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem"
  },
  countBadge: {
    padding: "0.25rem 0.75rem",
    backgroundColor: "var(--bg-secondary)",
    color: "var(--text-secondary)",
    borderRadius: "9999px",
    fontSize: "0.85rem",
    fontWeight: "600",
    border: "1px solid var(--border-color)"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem"
  },
  dataGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "1.5rem"
  },
  listCard: {
    backgroundColor: "var(--bg-secondary)",
    padding: "1.25rem 1.75rem",
    borderRadius: "0.75rem",
    border: "1px solid var(--border-color)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "var(--card-shadow)"
  },
  card: {
    backgroundColor: "var(--bg-secondary)",
    borderRadius: "1rem",
    border: "1px solid var(--border-color)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "var(--card-shadow)"
  },
  cardHeader: {
    padding: "1.25rem",
    borderBottom: "1px solid var(--border-color)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: "0 0 0.25rem 0"
  },
  cardSubtitle: {
    fontSize: "0.85rem",
    color: "var(--text-muted)",
    margin: 0
  },
  cardBody: {
    padding: "1.25rem",
    flex: 1
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem"
  },
  infoLabel: {
    color: "var(--text-muted)",
    fontSize: "0.85rem",
    fontWeight: "500"
  },
  infoValue: {
    color: "var(--text-primary)",
    fontSize: "0.85rem",
    fontWeight: "600"
  },
  docLink: {
    display: "inline-block",
    marginTop: "1rem",
    padding: "0.5rem 1rem",
    backgroundColor: "var(--bg-primary)",
    color: "#4f46e5",
    textDecoration: "none",
    fontSize: "0.85rem",
    fontWeight: "600",
    borderRadius: "0.375rem",
    border: "1px solid var(--border-color)"
  },
  cardFooter: {
    padding: "1rem 1.25rem",
    backgroundColor: "var(--bg-primary)",
    borderTop: "1px solid var(--border-color)",
    display: "flex",
    gap: "0.75rem"
  },
  verifyBtn: {
    flex: 1,
    padding: "0.6rem",
    backgroundColor: "#059669",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    fontWeight: "600",
    cursor: "pointer"
  },
  rejectBtn: {
    flex: 1,
    padding: "0.6rem",
    backgroundColor: "var(--bg-secondary)",
    color: "#dc2626",
    border: "1px solid #fca5a5",
    borderRadius: "0.5rem",
    fontWeight: "600",
    cursor: "pointer"
  },
  avatarPlaceholder: {
    width: "3rem",
    height: "3rem",
    backgroundColor: "#6366f1",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "1.25rem",
    fontWeight: "700",
    borderRadius: "50%"
  },
  loadingState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem",
    color: "var(--text-muted)"
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid var(--border-color)",
    borderTopColor: "#6366f1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "1rem"
  },
  statusBadge: (status) => {
    let bg = "#f3f4f6";
    let color = "#4b5563";
    
    if (status === "Verified" || status === "Approved") { bg = "#d1fae5"; color = "#065f46"; }
    else if (status === "Rejected") { bg = "#fee2e2"; color = "#991b1b"; }
    else if (status === "Pending") { bg = "#fef3c7"; color = "#92400e"; }
    
    return {
      padding: "0.25rem 0.75rem",
      backgroundColor: bg,
      color: color,
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: "700",
      letterSpacing: "0.02em"
    };
  }
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
`;
document.head.appendChild(styleSheet);

export default AdminDashboard;