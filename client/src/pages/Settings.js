import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme, themes } from "../context/ThemeContext";

const Settings = () => {
  const { themeName, changeTheme } = useTheme();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const role = localStorage.getItem("role");

  const handleThemeChange = (name) => {
    changeTheme(name);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleBack = () => {
    if (role === "student") navigate("/student");
    else if (role === "company") navigate("/company");
    else if (role === "admin") navigate("/admin");
    else navigate("/");
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg-primary)",
      padding: "2rem",
      fontFamily: "'Segoe UI', 'Inter', sans-serif",
      transition: "background-color 0.3s ease"
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2.5rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={handleBack}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-color)",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.2s ease",
              boxShadow: "var(--card-shadow)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
            }}
          >
            ← Back
          </button>
          <div>
            <h1 style={{
              fontSize: "2rem",
              fontWeight: "800",
              color: "var(--text-primary)",
              margin: 0,
              letterSpacing: "-0.02em",
            }}>
              ⚙️ Settings
            </h1>
            <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
              Customize your experience
            </p>
          </div>
        </div>

        {saved && (
          <div style={{
            padding: "0.625rem 1.25rem",
            backgroundColor: "var(--success-bg)",
            color: "var(--success-text)",
            borderRadius: "0.5rem",
            fontWeight: "600",
            fontSize: "0.875rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            animation: "fadeIn 0.3s ease",
          }}>
            ✓ Theme applied!
          </div>
        )}
      </div>

      {/* Settings Card */}
      <div style={{
        maxWidth: "900px",
        margin: "0 auto",
      }}>
        {/* Appearance Section */}
        <div style={{
          backgroundColor: "var(--bg-secondary)",
          borderRadius: "1rem",
          padding: "2rem",
          boxShadow: "var(--card-shadow)",
          border: "1px solid var(--border-color)",
          marginBottom: "1.5rem",
        }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{
              fontSize: "1.25rem",
              fontWeight: "700",
              color: "var(--text-primary)",
              margin: "0 0 0.25rem",
            }}>
              🎨 Appearance
            </h2>
            <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.875rem" }}>
              Choose a theme that reflects your style
            </p>
          </div>

          {/* Theme Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "1rem",
          }}>
            {Object.entries(themes).map(([key, themeData]) => {
              const isActive = themeName === key;
              return (
                <ThemeCard
                  key={key}
                  themeKey={key}
                  themeData={themeData}
                  isActive={isActive}
                  onClick={() => handleThemeChange(key)}
                />
              );
            })}
          </div>
        </div>

        {/* Current Theme Details */}
        <div style={{
          backgroundColor: "var(--bg-secondary)",
          borderRadius: "1rem",
          padding: "2rem",
          boxShadow: "var(--card-shadow)",
          border: "1px solid var(--border-color)",
          marginBottom: "1.5rem",
        }}>
          <h2 style={{
            fontSize: "1.25rem",
            fontWeight: "700",
            color: "var(--text-primary)",
            margin: "0 0 1rem",
          }}>
            📊 Current Theme Preview
          </h2>
          <ThemePreview />
        </div>

        {/* Account Info Section */}
        <div style={{
          backgroundColor: "var(--bg-secondary)",
          borderRadius: "1rem",
          padding: "2rem",
          boxShadow: "var(--card-shadow)",
          border: "1px solid var(--border-color)",
        }}>
          <h2 style={{
            fontSize: "1.25rem",
            fontWeight: "700",
            color: "var(--text-primary)",
            margin: "0 0 1rem",
          }}>
            👤 Account
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}>
            <InfoItem label="Role" value={role ? role.charAt(0).toUpperCase() + role.slice(1) : "—"} icon="🏷️" />
            <InfoItem label="Theme" value={themes[themeName]?.name || "Light"} icon={themes[themeName]?.emoji || "☀️"} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Sub-components ───────────────────────────── */

const ThemeCard = ({ themeKey, themeData, isActive, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const vars = themeData.vars;

  return (
    <button
      id={`theme-card-${themeKey}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "0",
        border: isActive
          ? "2.5px solid var(--accent-primary)"
          : `2px solid ${hovered ? vars["--accent-primary"] : vars["--border-color"]}`,
        borderRadius: "0.875rem",
        cursor: "pointer",
        background: vars["--bg-primary"],
        overflow: "hidden",
        transition: "all 0.25s ease",
        transform: hovered && !isActive ? "translateY(-3px)" : isActive ? "translateY(-2px)" : "none",
        boxShadow: isActive
          ? `0 0 0 3px ${vars["--accent-primary"]}33, 0 8px 20px rgba(0,0,0,0.15)`
          : hovered
          ? "0 6px 20px rgba(0,0,0,0.12)"
          : "0 2px 6px rgba(0,0,0,0.06)",
        position: "relative",
        textAlign: "left",
      }}
    >
      {/* Mini preview of the theme */}
      <div style={{
        height: "80px",
        background: vars["--gradient-hero"],
        position: "relative",
      }}>
        {/* Fake navbar strip */}
        <div style={{
          height: "24px",
          backgroundColor: vars["--nav-bg"],
          display: "flex",
          alignItems: "center",
          padding: "0 8px",
          gap: "4px",
        }}>
          {["dot1","dot2","dot3"].map(d => (
            <div key={d} style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: vars["--text-inverse"],
              opacity: 0.7,
            }} />
          ))}
        </div>
        {/* Fake cards */}
        <div style={{
          display: "flex",
          gap: "4px",
          padding: "6px",
          justifyContent: "center",
        }}>
          {[1,2,3].map(i => (
            <div key={i} style={{
              flex: 1,
              backgroundColor: vars["--bg-secondary"],
              borderRadius: "3px",
              height: "28px",
              opacity: 0.9,
            }} />
          ))}
        </div>
        {/* Active badge */}
        {isActive && (
          <div style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            backgroundColor: vars["--accent-primary"],
            color: vars["--text-inverse"],
            borderRadius: "50%",
            width: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: "bold",
          }}>
            ✓
          </div>
        )}
      </div>

      {/* Label */}
      <div style={{
        padding: "0.625rem 0.75rem",
        backgroundColor: vars["--bg-secondary"],
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "2px" }}>
          <span style={{ fontSize: "14px" }}>{themeData.emoji}</span>
          <span style={{
            fontWeight: "700",
            fontSize: "0.85rem",
            color: vars["--text-primary"],
          }}>
            {themeData.name}
          </span>
        </div>
        <p style={{
          fontSize: "0.7rem",
          color: vars["--text-muted"],
          margin: 0,
        }}>
          {themeData.description}
        </p>
      </div>
    </button>
  );
};

const ThemePreview = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
    {/* Color palette row */}
    <div>
      <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Color Palette
      </p>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {[
          { label: "Primary", color: "var(--accent-primary)" },
          { label: "Secondary", color: "var(--accent-secondary)" },
          { label: "Danger", color: "var(--accent-danger)" },
          { label: "Warning", color: "var(--accent-warning)" },
          { label: "Purple", color: "var(--accent-purple)" },
          { label: "BG", color: "var(--bg-tertiary)" },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "0.5rem",
              backgroundColor: color,
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              border: "1px solid var(--border-color)",
            }} />
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "500" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Sample UI elements */}
    <div>
      <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        UI Preview
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <button style={{
          padding: "0.5rem 1.25rem",
          backgroundColor: "var(--accent-primary)",
          color: "var(--text-inverse)",
          border: "none",
          borderRadius: "0.5rem",
          fontWeight: "600",
          fontSize: "0.875rem",
          cursor: "pointer",
        }}>
          Primary Button
        </button>
        <button style={{
          padding: "0.5rem 1.25rem",
          backgroundColor: "var(--accent-secondary)",
          color: "var(--text-inverse)",
          border: "none",
          borderRadius: "0.5rem",
          fontWeight: "600",
          fontSize: "0.875rem",
          cursor: "pointer",
        }}>
          Secondary
        </button>
        <span style={{
          padding: "0.35rem 0.75rem",
          backgroundColor: "var(--tag-bg)",
          color: "var(--tag-color)",
          borderRadius: "9999px",
          fontWeight: "600",
          fontSize: "0.75rem",
        }}>
          Tag Badge
        </span>
        <input
          placeholder="Sample input..."
          readOnly
          style={{
            padding: "0.5rem 0.875rem",
            border: "1px solid var(--border-color)",
            borderRadius: "0.5rem",
            backgroundColor: "var(--input-bg)",
            color: "var(--text-primary)",
            fontSize: "0.875rem",
            outline: "none",
          }}
        />
      </div>
    </div>
  </div>
);

const InfoItem = ({ label, value, icon }) => (
  <div style={{
    padding: "1rem",
    backgroundColor: "var(--bg-tertiary)",
    borderRadius: "0.75rem",
    border: "1px solid var(--border-color)",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  }}>
    <span style={{ fontSize: "1.5rem" }}>{icon}</span>
    <div>
      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      <p style={{ margin: "0.15rem 0 0", fontSize: "1rem", color: "var(--text-primary)", fontWeight: "700" }}>{value}</p>
    </div>
  </div>
);

export default Settings;
