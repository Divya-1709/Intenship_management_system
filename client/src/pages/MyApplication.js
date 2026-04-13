import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const MyApplications = () => {
  const { themeName } = useTheme();
  const [applications, setApplications] = useState([]);
  const [paymentStatuses, setPaymentStatuses] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "student") {
      navigate("/");
      return;
    }
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await API.get("/application/my");
      setApplications(res.data);
      // Fetch payment status for each application
      for (const app of res.data) {
        try {
          const payRes = await API.get(`/payment/status/${app._id}`);
          setPaymentStatuses(prev => ({...prev, [app._id]: payRes.data}));
        } catch (err) {
          // No payment data yet
        }
      }
    } catch (err) {
      alert("Failed to load applications");
    }
  };

  const getPaymentBadge = (app) => {
    const internship = app.internshipId;
    const payStatus = paymentStatuses[app._id];

    if (!internship) return null;

    // FeeRequired internship
    if (internship.internshipType === "FeeRequired") {
      if (payStatus?.registrationFeePaid) {
        return (
          <span style={{
            padding: "0.25rem 0.75rem",
            borderRadius: "9999px",
            fontSize: "0.7rem",
            fontWeight: "600",
            backgroundColor: "#d1fae5",
            color: "#065f46",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem"
          }}>
            ✅ Fee Paid
          </span>
        );
      }
      if (app.status === "Approved") {
        return (
          <span style={{
            padding: "0.25rem 0.75rem",
            borderRadius: "9999px",
            fontSize: "0.7rem",
            fontWeight: "600",
            backgroundColor: "#fef3c7",
            color: "#92400e",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem"
          }}>
            ⏳ Fee Pending — ₹{internship.registrationFee?.toLocaleString()}
          </span>
        );
      }
      return (
        <span style={{
          padding: "0.25rem 0.75rem",
          borderRadius: "9999px",
          fontSize: "0.7rem",
          fontWeight: "600",
          backgroundColor: "#fff7ed",
          color: "#c2410c"
        }}>
          💰 Fee Required — ₹{internship.registrationFee?.toLocaleString()}
        </span>
      );
    }

    // StipendBased internship
    if (internship.internshipType === "StipendBased") {
      const stipendCount = payStatus?.stipendPayments?.length || 0;
      const totalPaid = payStatus?.totalStipendPaid || 0;
      return (
        <span style={{
          padding: "0.25rem 0.75rem",
          borderRadius: "9999px",
          fontSize: "0.7rem",
          fontWeight: "600",
          backgroundColor: "#dbeafe",
          color: "#1e40af",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem"
        }}>
          💵 Stipend: ₹{internship.stipendAmount?.toLocaleString()}/month
          {stipendCount > 0 && ` (${stipendCount} payment${stipendCount > 1 ? 's' : ''} received: ₹${totalPaid.toLocaleString()})`}
        </span>
      );
    }

    return null;
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "var(--bg-primary)", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", transition: "background-color 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "var(--text-primary)" }}>My Applications</h2>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to="/settings">
            <button style={{ padding: "0.5rem 1rem", backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}>⚙️ Settings</button>
          </Link>
          <Link to="/student">
            <button style={{ padding: "0.5rem 1rem", backgroundColor: "var(--accent-primary)", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600" }}>Back</button>
          </Link>
        </div>
      </div>

      {applications.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No applications found</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
          {applications.map((app) => (
            <div
              key={app._id}
              style={{
                backgroundColor: "var(--bg-secondary)",
                padding: "1.5rem",
                borderRadius: "0.75rem",
                boxShadow: "var(--card-shadow)",
                border: "1px solid var(--border-color)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>
                    {app.internshipId?.title}
                  </h3>
                  {/* Internship Type Badge */}
                  {app.internshipId?.internshipType === "FeeRequired" && (
                    <span style={{
                      fontSize: "0.65rem",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "0.25rem",
                      backgroundColor: "#fff7ed",
                      color: "#c2410c",
                      fontWeight: "600",
                      whiteSpace: "nowrap"
                    }}>💰 Paid</span>
                  )}
                  {app.internshipId?.internshipType === "StipendBased" && (
                    <span style={{
                      fontSize: "0.65rem",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "0.25rem",
                      backgroundColor: "#f0fdf4",
                      color: "#15803d",
                      fontWeight: "600",
                      whiteSpace: "nowrap"
                    }}>💵 Stipend</span>
                  )}
                </div>
                <div style={{ marginBottom: "0.75rem" }}>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}><strong>Duration:</strong> {app.internshipId?.duration}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}><strong>Stipend:</strong> {app.internshipId?.stipend}</p>
                </div>

                {/* Payment Badge */}
                <div style={{ marginBottom: "0.75rem" }}>
                  {getPaymentBadge(app)}
                </div>
              </div>

              <div>
                <div style={{ paddingTop: "0.75rem", borderTop: "1px solid var(--border-color)", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Status: </span>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      backgroundColor: app.status === "Approved" ? "#d1fae5" : app.status === "Rejected" ? "#fee2e2" : app.status === "Shortlisted" ? "#ffedd5" : "#dbeafe",
                      color: app.status === "Approved" ? "#065f46" : app.status === "Rejected" ? "#991b1b" : app.status === "Shortlisted" ? "#9a3412" : "#1e40af"
                    }}
                  >
                    {app.status}
                  </span>
                </div>

                {/* Pay Now Button — shows for Approved + FeeRequired + Not yet paid */}
                {app.status === "Approved" &&
                 app.internshipId?.internshipType === "FeeRequired" &&
                 !paymentStatuses[app._id]?.registrationFeePaid && (
                  <Link to={`/payment/${app._id}`} style={{ textDecoration: "none" }}>
                    <button style={{
                      width: "100%",
                      padding: "0.7rem",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      fontWeight: "700",
                      fontSize: "0.9rem",
                      boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      transition: "all 0.2s ease"
                    }}>
                      💳 Pay ₹{app.internshipId?.registrationFee?.toLocaleString()} Now
                    </button>
                  </Link>
                )}

                {/* View Receipt — for already paid */}
                {app.status === "Approved" &&
                 app.internshipId?.internshipType === "FeeRequired" &&
                 paymentStatuses[app._id]?.registrationFeePaid && (
                  <Link to={`/payment/${app._id}`} style={{ textDecoration: "none" }}>
                    <button style={{
                      width: "100%",
                      padding: "0.6rem",
                      backgroundColor: "#d1fae5",
                      color: "#065f46",
                      border: "1px solid #a7f3d0",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "0.85rem"
                    }}>
                      🧾 View Payment Receipt
                    </button>
                  </Link>
                )}

                {/* Stipend payments received */}
                {app.status === "Approved" &&
                 app.internshipId?.internshipType === "StipendBased" &&
                 paymentStatuses[app._id]?.stipendPayments?.length > 0 && (
                  <div style={{
                    marginTop: "0.5rem",
                    padding: "0.75rem",
                    backgroundColor: "var(--bg-primary)",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border-color)"
                  }}>
                    <p style={{ color: "var(--text-primary)", fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                      📊 Stipend History
                    </p>
                    {paymentStatuses[app._id].stipendPayments.map((pmt, idx) => (
                      <div key={idx} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        padding: "0.25rem 0",
                        borderBottom: idx < paymentStatuses[app._id].stipendPayments.length - 1 ? "1px solid var(--border-color)" : "none"
                      }}>
                        <span>{pmt.month || new Date(pmt.paidAt).toLocaleDateString()}</span>
                        <span style={{ color: "#059669", fontWeight: "600" }}>₹{pmt.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
