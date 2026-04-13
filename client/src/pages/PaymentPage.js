import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useTheme } from "../context/ThemeContext";

const PaymentPage = () => {
  const { themeName } = useTheme();
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "student") {
      navigate("/");
      return;
    }
    loadData();
    loadRazorpayScript();
  }, [applicationId]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const loadData = async () => {
    try {
      const appRes = await API.get("/application/my");
      const app = appRes.data.find((a) => a._id === applicationId);
      if (!app) {
        setError("Application not found");
        setLoading(false);
        return;
      }
      setApplication(app);

      // Check payment status
      const payRes = await API.get(`/payment/status/${applicationId}`);
      setPaymentStatus(payRes.data);

      if (payRes.data.registrationFeePaid) {
        setPaymentSuccess(true);
        setTransactionId(payRes.data.registrationFeePayment?.razorpayPaymentId || "");
      }
    } catch (err) {
      console.error("Load data error:", err);
      setError("Failed to load payment details");
    }
    setLoading(false);
  };

  const handlePayNow = async () => {
    setProcessing(true);
    setError("");

    try {
      // Create order
      const orderRes = await API.post("/payment/create-order", { applicationId });
      const { orderId, amount, currency, keyId, internshipTitle, companyName, paymentId } = orderRes.data;

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: companyName,
        description: `Registration Fee - ${internshipTitle}`,
        order_id: orderId,
        handler: async function (response) {
          // Verify payment on backend
          try {
            const verifyRes = await API.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: paymentId
            });
            setPaymentSuccess(true);
            setTransactionId(verifyRes.data.transactionId);
            setProcessing(false);
          } catch (verifyErr) {
            setError("Payment verification failed. Please contact support.");
            setProcessing(false);
          }
        },
        prefill: {
          name: localStorage.getItem("userName") || "",
          email: localStorage.getItem("userEmail") || ""
        },
        theme: {
          color: "#6366f1"
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setError(`Payment failed: ${response.error.description}`);
        setProcessing(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Payment error from Backend:", err.response?.data || err);
      setError(err.response?.data?.error || err.response?.data?.message || err.message || "Failed to initiate payment");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingWrapper}>
          <div style={styles.spinner} />
          <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error && !application) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <span style={{ fontSize: "3rem" }}>⚠️</span>
          <h2 style={{ color: "#dc2626", margin: "1rem 0 0.5rem" }}>{error}</h2>
          <Link to="/my-application">
            <button style={styles.backBtn}>← Back to Applications</button>
          </Link>
        </div>
      </div>
    );
  }

  // Payment Success Screen
  if (paymentSuccess) {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="40" fill="#059669" />
              <path d="M24 40L34 50L56 28" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 style={{ color: "#059669", fontSize: "1.75rem", fontWeight: "700", margin: "1.5rem 0 0.5rem" }}>
            Payment Successful! 🎉
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", marginBottom: "1.5rem" }}>
            Your registration fee has been paid successfully.
          </p>
          <div style={styles.receiptCard}>
            <div style={styles.receiptRow}>
              <span style={styles.receiptLabel}>Internship</span>
              <span style={styles.receiptValue}>{application?.internshipId?.title}</span>
            </div>
            <div style={styles.receiptDivider} />
            <div style={styles.receiptRow}>
              <span style={styles.receiptLabel}>Amount Paid</span>
              <span style={{ ...styles.receiptValue, color: "#059669", fontWeight: "700", fontSize: "1.25rem" }}>
                ₹{application?.internshipId?.registrationFee?.toLocaleString()}
              </span>
            </div>
            <div style={styles.receiptDivider} />
            <div style={styles.receiptRow}>
              <span style={styles.receiptLabel}>Transaction ID</span>
              <span style={{ ...styles.receiptValue, fontFamily: "monospace", fontSize: "0.8rem" }}>{transactionId}</span>
            </div>
            <div style={styles.receiptDivider} />
            <div style={styles.receiptRow}>
              <span style={styles.receiptLabel}>Status</span>
              <span style={styles.paidBadge}>✅ Completed</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
            <Link to="/my-application">
              <button style={styles.primaryBtn}>← My Applications</button>
            </Link>
            <Link to="/student">
              <button style={styles.secondaryBtn}>🏠 Dashboard</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Payment Checkout Screen
  return (
    <div style={styles.container}>
      <div style={styles.checkoutCard}>
        {/* Header */}
        <div style={styles.checkoutHeader}>
          <div style={styles.headerIcon}>💳</div>
          <h2 style={styles.checkoutTitle}>Registration Fee Payment</h2>
          <p style={styles.checkoutSubtitle}>Complete your payment to confirm your internship</p>
        </div>

        {/* Internship Details */}
        <div style={styles.detailsSection}>
          <h3 style={styles.sectionTitle}>Internship Details</h3>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>📋 Internship</span>
            <span style={styles.detailValue}>{application?.internshipId?.title}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>🏢 Company</span>
            <span style={styles.detailValue}>{application?.internshipId?.companyId?.companyName || "Company"}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>⏱ Duration</span>
            <span style={styles.detailValue}>{application?.internshipId?.duration}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>📊 Status</span>
            <span style={{ ...styles.detailValue, color: "#059669", fontWeight: "600" }}>✅ Approved</span>
          </div>
        </div>

        {/* Amount */}
        <div style={styles.amountSection}>
          <p style={styles.amountLabel}>Amount to Pay</p>
          <p style={styles.amountValue}>₹{application?.internshipId?.registrationFee?.toLocaleString()}</p>
          <p style={styles.amountNote}>Registration / Processing Fee (One-time)</p>
        </div>

        {/* Payment Info */}
        <div style={styles.paymentInfo}>
          <div style={styles.infoItem}>
            <span>🔒</span>
            <span>Secured by Razorpay</span>
          </div>
          <div style={styles.infoItem}>
            <span>💳</span>
            <span>Cards, UPI, Net Banking, Wallets</span>
          </div>
          <div style={styles.infoItem}>
            <span>🧾</span>
            <span>Instant receipt on success</span>
          </div>
        </div>

        {error && (
          <div style={styles.errorMsg}>
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Pay Button */}
        <button
          onClick={handlePayNow}
          disabled={processing}
          style={{
            ...styles.payButton,
            opacity: processing ? 0.7 : 1,
            cursor: processing ? "not-allowed" : "pointer"
          }}
        >
          {processing ? (
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
              <div style={styles.miniSpinner} />
              Processing...
            </span>
          ) : (
            `💳 Pay ₹${application?.internshipId?.registrationFee?.toLocaleString()} Now`
          )}
        </button>

        <Link to="/my-application" style={{ display: "block", textAlign: "center", marginTop: "1rem" }}>
          <button style={styles.cancelBtn}>← Back to Applications</button>
        </Link>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "var(--bg-primary)",
    padding: "2rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    fontFamily: "'Segoe UI', sans-serif",
    transition: "background-color 0.3s ease"
  },
  loadingWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "50vh"
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid #e5e7eb",
    borderTopColor: "#6366f1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  miniSpinner: {
    width: "18px",
    height: "18px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  errorCard: {
    backgroundColor: "var(--bg-secondary)",
    borderRadius: "1rem",
    padding: "3rem",
    textAlign: "center",
    maxWidth: "500px",
    width: "100%",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
  },
  successCard: {
    backgroundColor: "var(--bg-secondary)",
    borderRadius: "1rem",
    padding: "3rem",
    textAlign: "center",
    maxWidth: "550px",
    width: "100%",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    marginTop: "2rem"
  },
  successIcon: {
    display: "flex",
    justifyContent: "center"
  },
  receiptCard: {
    backgroundColor: "var(--bg-primary)",
    borderRadius: "0.75rem",
    padding: "1.5rem",
    textAlign: "left",
    border: "1px solid var(--border-color)"
  },
  receiptRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 0"
  },
  receiptLabel: {
    color: "var(--text-muted)",
    fontSize: "0.875rem"
  },
  receiptValue: {
    color: "var(--text-primary)",
    fontWeight: "600",
    fontSize: "0.9rem"
  },
  receiptDivider: {
    height: "1px",
    backgroundColor: "var(--border-color)",
    margin: "0.25rem 0"
  },
  paidBadge: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.8rem",
    fontWeight: "600"
  },
  checkoutCard: {
    backgroundColor: "var(--bg-secondary)",
    borderRadius: "1rem",
    padding: "0",
    maxWidth: "520px",
    width: "100%",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    overflow: "hidden",
    marginTop: "2rem"
  },
  checkoutHeader: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)",
    padding: "2rem",
    textAlign: "center",
    color: "white"
  },
  headerIcon: {
    fontSize: "3rem",
    marginBottom: "0.5rem"
  },
  checkoutTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    margin: 0
  },
  checkoutSubtitle: {
    fontSize: "0.9rem",
    opacity: 0.9,
    marginTop: "0.5rem"
  },
  detailsSection: {
    padding: "1.5rem 2rem"
  },
  sectionTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "var(--text-primary)",
    marginBottom: "1rem"
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.6rem 0",
    borderBottom: "1px solid var(--border-color)"
  },
  detailLabel: {
    color: "var(--text-muted)",
    fontSize: "0.875rem"
  },
  detailValue: {
    color: "var(--text-primary)",
    fontWeight: "500",
    fontSize: "0.9rem",
    textAlign: "right",
    maxWidth: "60%"
  },
  amountSection: {
    background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
    padding: "1.5rem 2rem",
    textAlign: "center",
    margin: "0 2rem",
    borderRadius: "0.75rem",
    border: "1px solid #bbf7d0"
  },
  amountLabel: {
    color: "#15803d",
    fontSize: "0.8rem",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: 0
  },
  amountValue: {
    color: "#059669",
    fontSize: "2.5rem",
    fontWeight: "800",
    margin: "0.25rem 0"
  },
  amountNote: {
    color: "#16a34a",
    fontSize: "0.8rem",
    margin: 0
  },
  paymentInfo: {
    padding: "1.5rem 2rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    color: "var(--text-muted)",
    fontSize: "0.85rem"
  },
  errorMsg: {
    margin: "0 2rem",
    padding: "0.75rem",
    backgroundColor: "#fee2e2",
    borderRadius: "0.5rem",
    color: "#dc2626",
    fontSize: "0.85rem",
    textAlign: "center",
    border: "1px solid #fca5a5"
  },
  payButton: {
    width: "calc(100% - 4rem)",
    margin: "1rem 2rem",
    padding: "1rem",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "white",
    border: "none",
    borderRadius: "0.75rem",
    fontSize: "1.1rem",
    fontWeight: "700",
    boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
    transition: "all 0.2s ease"
  },
  cancelBtn: {
    background: "none",
    border: "none",
    color: "var(--text-muted)",
    fontSize: "0.9rem",
    cursor: "pointer",
    padding: "0.5rem 1rem",
    marginBottom: "1.5rem"
  },
  primaryBtn: {
    padding: "0.75rem 1.5rem",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "0.9rem"
  },
  secondaryBtn: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "var(--bg-primary)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: "0.5rem",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "0.9rem"
  },
  backBtn: {
    marginTop: "1rem",
    padding: "0.75rem 1.5rem",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    fontWeight: "600",
    cursor: "pointer"
  }
};

// Inject keyframes for spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(styleSheet);

export default PaymentPage;
