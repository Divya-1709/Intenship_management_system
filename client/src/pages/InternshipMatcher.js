import React, { useEffect, useState, useCallback } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import InternshipApplicationModal from "../components/InternshipApplicationModal";
import { useTheme } from "../context/ThemeContext";

// ─── Animated Circular Score Dial ───────────────────────────────────────────
const ScoreDial = ({ score, size = 100 }) => {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let frame;
    let current = 0;
    const step = () => {
      current = Math.min(current + 2, score);
      setDisplayed(current);
      if (current < score) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayed / 100) * circumference;
  const color =
    score >= 80 ? "#10b981" : score >= 60 ? "#6366f1" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.02s linear" }}
      />
      <text
        x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        style={{ transform: "rotate(90deg)", transformOrigin: "center", fill: "white", fontSize: size * 0.22, fontWeight: "700", fontFamily: "'Inter', sans-serif" }}
      >
        {displayed}%
      </text>
    </svg>
  );
};

// ─── Score Breakdown Bar ─────────────────────────────────────────────────────
const BreakdownBar = ({ label, score, weight, color }) => (
  <div style={{ marginBottom: "10px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
      <span>{label} <span style={{ color: "#64748b", fontSize: "11px" }}>({weight}%)</span></span>
      <span style={{ color: "white", fontWeight: "600" }}>{score}%</span>
    </div>
    <div style={{ height: "6px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${score}%`, borderRadius: "999px",
        background: `linear-gradient(90deg, ${color}88, ${color})`,
        transition: "width 1s cubic-bezier(0.22,1,0.36,1)"
      }} />
    </div>
  </div>
);

// ─── Tier Badge ──────────────────────────────────────────────────────────────
const TierBadge = ({ tier }) => {
  const config = {
    Excellent: { bg: "rgba(16,185,129,0.2)", color: "#10b981", border: "rgba(16,185,129,0.4)", emoji: "🌟" },
    Good: { bg: "rgba(99,102,241,0.2)", color: "#818cf8", border: "rgba(99,102,241,0.4)", emoji: "✨" },
    Fair: { bg: "rgba(245,158,11,0.2)", color: "#fbbf24", border: "rgba(245,158,11,0.4)", emoji: "⚡" },
    Low: { bg: "rgba(239,68,68,0.15)", color: "#f87171", border: "rgba(239,68,68,0.3)", emoji: "📌" },
  };
  const c = config[tier] || config.Fair;
  return (
    <span style={{
      padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "700",
      background: c.bg, color: c.color, border: `1px solid ${c.border}`
    }}>
      {c.emoji} {tier}
    </span>
  );
};

// ─── Profile Strength Gauge ──────────────────────────────────────────────────
const StrengthGauge = ({ profileStrength }) => {
  const score = profileStrength?.completenessScore || 0;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#6366f1" : "#f59e0b";
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))",
      borderRadius: "16px", border: "1px solid rgba(99,102,241,0.25)", padding: "20px",
      marginBottom: "24px"
    }}>
      <h3 style={{ color: "white", fontSize: "15px", fontWeight: "700", marginBottom: "16px" }}>
        🧠 Profile Strength
      </h3>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "14px" }}>
        <ScoreDial score={score} size={80} />
        <div>
          <div style={{ color: "white", fontSize: "20px", fontWeight: "800" }}>{score}%</div>
          <div style={{ color: "#94a3b8", fontSize: "12px" }}>Complete</div>
        </div>
      </div>
      <div style={{ display: "grid", gap: "6px" }}>
        {[
          { label: "GitHub", done: profileStrength?.hasGitHub, tip: "Add GitHub (+25%)" },
          { label: "LinkedIn", done: profileStrength?.hasLinkedIn, tip: "Add LinkedIn (+25%)" },
          { label: "Resume", done: profileStrength?.hasResume, tip: "Add resume link (+10%)" },
          { label: `Skills (${profileStrength?.skillCount || 0} added)`, done: (profileStrength?.skillCount || 0) >= 3, tip: "Add 3+ skills for best results" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
            <span style={{ color: item.done ? "#10b981" : "#f87171" }}>{item.done ? "✅" : "❌"}</span>
            <span style={{ color: item.done ? "#a3e7c9" : "#f8a4a4" }}>
              {item.done ? item.label : item.tip}
            </span>
          </div>
        ))}
      </div>
      <Link to="/profile">
        <button style={{
          marginTop: "14px", width: "100%", padding: "8px", borderRadius: "8px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none",
          color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer"
        }}>
          ✏️ Improve Profile
        </button>
      </Link>
    </div>
  );
};

// ─── Internship Match Card ───────────────────────────────────────────────────
const MatchCard = ({ result, index, onApply }) => {
  const [expanded, setExpanded] = useState(false);
  const [showImprovements, setShowImprovements] = useState(false);
  const { internship, totalScore, tier, breakdown, matchReasons, improvements, alreadyApplied } = result;

  const barColors = {
    skills: "#6366f1",
    gpa: "#10b981",
    branch: "#f59e0b",
    year: "#ec4899",
    profile: "#3b82f6",
    degree: "#8b5cf6",
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.8))",
        border: `1px solid ${totalScore >= 80 ? "rgba(16,185,129,0.4)" : totalScore >= 60 ? "rgba(99,102,241,0.35)" : "rgba(148,163,184,0.2)"}`,
        borderRadius: "18px",
        overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
        animation: `fadeSlideIn 0.4s ease ${index * 0.07}s both`,
        cursor: "default",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.4)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Card Header */}
      <div style={{ padding: "20px 20px 16px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
        {/* Score Dial */}
        <div style={{ flexShrink: 0 }}>
          <ScoreDial score={totalScore} size={88} />
        </div>

        {/* Title + company + badges */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
            <TierBadge tier={tier} />
            {alreadyApplied && (
              <span style={{ fontSize: "11px", background: "rgba(99,102,241,0.2)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "999px", padding: "2px 8px" }}>
                ✓ Applied
              </span>
            )}
            <span style={{ fontSize: "11px", color: "#64748b" }}>#{index + 1} match</span>
          </div>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "white", marginBottom: "4px", lineHeight: 1.3 }}>
            {internship.title}
          </h3>
          <div style={{ fontSize: "13px", color: "#94a3b8" }}>
            🏢 {internship.companyId?.companyName || "Company"} &nbsp;·&nbsp;
            ⏱ {internship.duration} &nbsp;·&nbsp;
            💰 {internship.stipend || "Unpaid"}
          </div>
          {internship.location && (
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>📍 {internship.location}</div>
          )}
        </div>
      </div>

      {/* Match Reasons Row */}
      {matchReasons.length > 0 && (
        <div style={{ padding: "0 20px 12px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {matchReasons.slice(0, 3).map((r, i) => (
              <span key={i} style={{
                fontSize: "11.5px", background: "rgba(16,185,129,0.12)",
                color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: "8px", padding: "4px 10px"
              }}>
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Details */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "0" }}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            width: "100%", padding: "10px 20px", background: "transparent", border: "none",
            color: "#94a3b8", fontSize: "12px", cursor: "pointer", textAlign: "left",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}
        >
          <span>📊 Score Breakdown</span>
          <span style={{ transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
        </button>

        {expanded && (
          <div style={{ padding: "0 20px 16px" }}>
            {/* Description */}
            <p style={{ color: "#94a3b8", fontSize: "12px", lineHeight: 1.6, marginBottom: "14px" }}>
              {internship.description?.slice(0, 200)}{internship.description?.length > 200 ? "..." : ""}
            </p>

            {/* Breakdown bars */}
            <BreakdownBar label="Skills Match" score={breakdown.skills.score} weight={breakdown.skills.weight} color={barColors.skills} />
            <BreakdownBar label="GPA / Academic" score={breakdown.gpa.score} weight={breakdown.gpa.weight} color={barColors.gpa} />
            <BreakdownBar label="Branch Relevance" score={breakdown.branch.score} weight={breakdown.branch.weight} color={barColors.branch} />
            <BreakdownBar label="Year of Study" score={breakdown.year.score} weight={breakdown.year.weight} color={barColors.year} />
            <BreakdownBar label="Profile Completeness" score={breakdown.profile.score} weight={breakdown.profile.weight} color={barColors.profile} />
            <BreakdownBar label="Degree Match" score={breakdown.degree.score} weight={breakdown.degree.weight} color={barColors.degree} />

            {/* Matched skills */}
            {breakdown.skills.matched.length > 0 && (
              <div style={{ marginTop: "12px" }}>
                <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "6px" }}>MATCHED SKILLS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {breakdown.skills.matched.map((s) => (
                    <span key={s} style={{ fontSize: "11px", background: "rgba(99,102,241,0.2)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "6px", padding: "2px 8px" }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements */}
            {improvements.length > 0 && (
              <div style={{ marginTop: "14px" }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowImprovements(!showImprovements); }}
                  style={{
                    background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)",
                    color: "#fbbf24", borderRadius: "8px", padding: "6px 12px", fontSize: "12px",
                    cursor: "pointer", fontWeight: "600"
                  }}
                >
                  💡 {showImprovements ? "Hide" : "Show"} Improvement Tips ({improvements.length})
                </button>
                {showImprovements && (
                  <div style={{ marginTop: "10px", display: "grid", gap: "6px" }}>
                    {improvements.map((tip, i) => (
                      <div key={i} style={{
                        background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
                        borderRadius: "8px", padding: "8px 12px", fontSize: "12px", color: "#fcd34d"
                      }}>
                        {tip}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: "10px" }}>
        <button
          onClick={() => !alreadyApplied && onApply(internship)}
          disabled={alreadyApplied}
          style={{
            flex: 1, padding: "10px", borderRadius: "10px", border: "none",
            background: alreadyApplied
              ? "rgba(148,163,184,0.1)"
              : totalScore >= 80
              ? "linear-gradient(135deg, #10b981, #059669)"
              : totalScore >= 60
              ? "linear-gradient(135deg, #6366f1, #4f46e5)"
              : "linear-gradient(135deg, #f59e0b, #d97706)",
            color: alreadyApplied ? "#64748b" : "white",
            fontSize: "13px", fontWeight: "700", cursor: alreadyApplied ? "not-allowed" : "pointer",
            transition: "opacity 0.2s"
          }}
          onMouseEnter={(e) => !alreadyApplied && (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {alreadyApplied ? "✓ Already Applied" : "🚀 Apply Now"}
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const InternshipMatcher = () => {
  const { themeName } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTier, setFilterTier] = useState("All");
  const [sortBy, setSortBy] = useState("score");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/match/recommendations");
      setData(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("profile_missing");
      } else {
        setError(err.response?.data?.message || "Failed to load matches");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "student") { navigate("/"); return; }
    fetchMatches();
  }, [navigate, fetchMatches]);

  const handleApply = (internship) => {
    setSelectedInternship(internship);
    setShowModal(true);
  };

  const handleApplicationSubmit = async (applicationData) => {
    try {
      await API.post("/application/apply", { internshipId: selectedInternship._id, ...applicationData });
      setShowModal(false);
      setSelectedInternship(null);
      fetchMatches(); // refresh scores
    } catch (err) {
      alert(err.response?.data?.message || "Application failed");
    }
  };

  // Filter + sort
  const visibleResults = (data?.results || [])
    .filter((r) => filterTier === "All" || r.tier === filterTier)
    .filter((r) =>
      !searchTerm ||
      r.internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.internship.companyId?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "score") return b.totalScore - a.totalScore;
      if (sortBy === "stipend") {
        const n = (s) => parseInt((s || "0").replace(/\D/g, "")) || 0;
        return n(b.internship.stipend) - n(a.internship.stipend);
      }
      if (sortBy === "newest") return new Date(b.internship.createdAt) - new Date(a.internship.createdAt);
      return 0;
    });

  const tierCounts = (data?.results || []).reduce((acc, r) => {
    acc[r.tier] = (acc[r.tier] || 0) + 1;
    return acc;
  }, {});

  // ── Keyframe injection ──────────────────────────────────────────────────
  if (!document.getElementById("matcher-styles")) {
    const style = document.createElement("style");
    style.id = "matcher-styles";
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(24px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      @keyframes gradientShift {
        0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%}
      }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: #0f172a; }
      ::-webkit-scrollbar-thumb { background: #334155; border-radius: 999px; }
    `;
    document.head.appendChild(style);
  }

  // Theme-aware backgrounds
  const isDark = themeName === "dark";
  const pageBg = isDark
    ? "#0f172a"
    : themeName === "ocean"
    ? "#0c4a6e"
    : themeName === "sunset"
    ? "#431407"
    : themeName === "forest"
    ? "#052e16"
    : "#1e1b4b"; // light uses indigo-dark feel
  const headerBg = isDark
    ? "linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1a0a2e 100%)"
    : themeName === "ocean"
    ? "linear-gradient(135deg, #0c4a6e 0%, #075985 100%)"
    : themeName === "sunset"
    ? "linear-gradient(135deg, #431407 0%, #7c2d12 100%)"
    : themeName === "forest"
    ? "linear-gradient(135deg, #052e16 0%, #14532d 100%)"
    : "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)";

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: pageBg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ width: "56px", height: "56px", border: "4px solid rgba(99,102,241,0.2)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.9s linear infinite", marginBottom: "20px" }} />
        <p style={{ color: "#94a3b8", fontSize: "16px" }}>Analysing your profile & scoring matches…</p>
      </div>
    );
  }

  // ── Error / Profile Missing ─────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: pageBg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", padding: "24px" }}>
        <div style={{ fontSize: "64px", marginBottom: "20px" }}>{error === "profile_missing" ? "👤" : "⚠️"}</div>
        <h2 style={{ color: "white", fontSize: "22px", fontWeight: "700", marginBottom: "12px" }}>
          {error === "profile_missing" ? "Complete Your Profile First" : "Something went wrong"}
        </h2>
        <p style={{ color: "#94a3b8", textAlign: "center", maxWidth: "420px", marginBottom: "24px" }}>
          {error === "profile_missing"
            ? "We need your skills, GPA, branch, and other details to calculate personalized match scores."
            : error}
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link to="/profile">
            <button style={{ padding: "12px 24px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: "10px", color: "white", fontWeight: "700", cursor: "pointer" }}>
              Complete Profile
            </button>
          </Link>
          <Link to="/student">
            <button style={{ padding: "12px 24px", background: "rgba(148,163,184,0.1)", border: "1px solid rgba(148,163,184,0.2)", borderRadius: "10px", color: "#94a3b8", fontWeight: "700", cursor: "pointer" }}>
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: pageBg, fontFamily: "'Inter', sans-serif", transition: "background 0.3s ease" }}>
      {/* ── Hero Header ── */}
      <div style={{
        background: headerBg,
        backgroundSize: "200% 200%",
        borderBottom: "1px solid rgba(99,102,241,0.2)",
        padding: "28px 32px 24px"
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={{ fontSize: "28px" }}>🎯</span>
                <h1 style={{ fontSize: "26px", fontWeight: "900", color: "white", margin: 0 }}>
                  Smart Match
                </h1>
                <span style={{
                  fontSize: "11px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white", borderRadius: "999px", padding: "2px 10px", fontWeight: "700"
                }}>
                  AI-Powered
                </span>
              </div>
              <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
                Ranked by multi-factor compatibility score — skills, GPA, branch, year & more
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Link to="/settings">
                <button style={{ padding: "9px 18px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                  ⚙️ Settings
                </button>
              </Link>
              <Link to="/student">
                <button style={{ padding: "9px 18px", background: "rgba(148,163,184,0.1)", border: "1px solid rgba(148,163,184,0.2)", borderRadius: "10px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                  ← Dashboard
                </button>
              </Link>
              <button onClick={fetchMatches} style={{ padding: "9px 18px", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "10px", color: "#a5b4fc", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: "16px", marginTop: "20px", flexWrap: "wrap" }}>
            {[
              { label: "Total Matches", val: data?.results?.length || 0, color: "#6366f1" },
              { label: "🌟 Excellent", val: tierCounts.Excellent || 0, color: "#10b981" },
              { label: "✨ Good", val: tierCounts.Good || 0, color: "#818cf8" },
              { label: "⚡ Fair", val: tierCounts.Fair || 0, color: "#fbbf24" },
              { label: "Top Score", val: `${data?.results?.[0]?.totalScore || 0}%`, color: "#f472b6" },
            ].map((stat) => (
              <div key={stat.label} style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px", padding: "12px 18px", textAlign: "center"
              }}>
                <div style={{ fontSize: "22px", fontWeight: "800", color: stat.color }}>{stat.val}</div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px 32px", display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px", alignItems: "start" }}>

        {/* ── Left Sidebar ── */}
        <div style={{ position: "sticky", top: "24px" }}>
          {/* Profile Strength */}
          <StrengthGauge profileStrength={data?.profileStrength} />

          {/* Filters */}
          <div style={{
            background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.8))",
            border: "1px solid rgba(148,163,184,0.1)", borderRadius: "16px", padding: "20px"
          }}>
            <h3 style={{ color: "white", fontSize: "14px", fontWeight: "700", marginBottom: "16px" }}>🔍 Filter & Sort</h3>

            {/* Search */}
            <div style={{ marginBottom: "16px" }}>
              <input
                placeholder="Search by title or company…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(148,163,184,0.15)", borderRadius: "10px",
                  color: "white", fontSize: "13px", outline: "none", boxSizing: "border-box"
                }}
              />
            </div>

            {/* Tier Filter */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Match Tier</div>
              {["All", "Excellent", "Good", "Fair", "Low"].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterTier(t)}
                  style={{
                    display: "block", width: "100%", textAlign: "left", padding: "8px 12px",
                    marginBottom: "4px", borderRadius: "8px", border: "none",
                    background: filterTier === t ? "rgba(99,102,241,0.25)" : "transparent",
                    color: filterTier === t ? "#a5b4fc" : "#94a3b8",
                    fontSize: "13px", cursor: "pointer", fontWeight: filterTier === t ? "700" : "400",
                    transition: "all 0.15s"
                  }}
                >
                  {t === "All" ? "🔎 All" : t === "Excellent" ? "🌟 Excellent" : t === "Good" ? "✨ Good" : t === "Fair" ? "⚡ Fair" : "📌 Low"}
                  {t !== "All" && tierCounts[t] ? (
                    <span style={{ float: "right", fontSize: "11px", background: "rgba(255,255,255,0.08)", padding: "1px 6px", borderRadius: "999px" }}>
                      {tierCounts[t]}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div>
              <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sort By</div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: "100%", padding: "9px 12px", background: "rgba(15,23,42,0.9)",
                  border: "1px solid rgba(148,163,184,0.15)", borderRadius: "10px",
                  color: "white", fontSize: "13px", outline: "none", cursor: "pointer"
                }}
              >
                <option value="score">Match Score (High → Low)</option>
                <option value="stipend">Stipend (High → Low)</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {/* Profile snapshot */}
          {data?.studentProfile && (
            <div style={{
              background: "rgba(15,23,42,0.6)", border: "1px solid rgba(148,163,184,0.08)",
              borderRadius: "16px", padding: "20px", marginTop: "16px"
            }}>
              <h3 style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "600", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Your Profile</h3>
              <div style={{ display: "grid", gap: "8px" }}>
                {[
                  { icon: "🎓", label: data.studentProfile.degree },
                  { icon: "🌿", label: data.studentProfile.branch },
                  { icon: "📅", label: `Year ${data.studentProfile.yearOfStudy}` },
                  { icon: "⭐", label: `GPA: ${data.studentProfile.gpa}` },
                  { icon: "🏫", label: data.studentProfile.college },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", gap: "8px", fontSize: "12px", color: "#cbd5e1" }}>
                    <span>{item.icon}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
                  </div>
                ))}
              </div>
              {data.studentProfile.skills && (
                <div style={{ marginTop: "12px" }}>
                  <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "6px" }}>SKILLS</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {data.studentProfile.skills.split(/[,;\n]+/).slice(0, 8).map((s) => (
                      <span key={s} style={{ fontSize: "10px", background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "5px", padding: "2px 6px" }}>
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Results Grid ── */}
        <div>
          {/* Toolbar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ color: "#64748b", fontSize: "13px" }}>
              Showing <strong style={{ color: "white" }}>{visibleResults.length}</strong> of {data?.results?.length || 0} internships
              {filterTier !== "All" && ` · ${filterTier} tier`}
            </span>
          </div>

          {visibleResults.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 24px", color: "#475569" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
              <p style={{ fontSize: "16px" }}>No matches found for the selected filter.</p>
              <button onClick={() => { setFilterTier("All"); setSearchTerm(""); }} style={{ marginTop: "16px", padding: "10px 20px", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "10px", color: "#a5b4fc", cursor: "pointer", fontWeight: "600" }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" }}>
              {visibleResults.map((result, index) => (
                <MatchCard key={result.internship._id} result={result} index={index} onApply={handleApply} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Application Modal ── */}
      {showModal && selectedInternship && (
        <InternshipApplicationModal
          internship={selectedInternship}
          studentProfile={data?.studentProfile}
          onClose={() => { setShowModal(false); setSelectedInternship(null); }}
          onSubmit={handleApplicationSubmit}
        />
      )}
    </div>
  );
};

export default InternshipMatcher;
