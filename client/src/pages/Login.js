import React, { useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password, role });

    try {
      console.log("Sending request to /auth/login");
      const res = await API.post("/auth/login", {
        email,
        password,
        role
      });
      console.log("Login response:", res.data);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      if (res.data.role === "student") navigate("/student");
      else if (res.data.role === "company") navigate("/company");
      else navigate("/admin");

    } catch (err) {
      console.log("Login error:", err);
      if (err.response && err.response.status === 404) {
        alert("User not found. Please check your Email and ensure the correct Role is selected.");
      } else {
        alert(err.response?.data?.message || "Login failed");
      }
    }
  };
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f3f4f6", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ backgroundColor: "white", padding: "2.5rem", borderRadius: "0.5rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", width: "100%", maxWidth: "400px" }}>
        <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#111827", marginBottom: "1.5rem", textAlign: "center" }}>Login</h2>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }} />
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box", backgroundColor: "white" }}>
            <option value="student">Student</option>
            <option value="company">Company</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" style={{ padding: "0.75rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600", marginTop: "0.5rem" }}>Login</button>
        </form>
        <p style={{ marginTop: "1.5rem", textAlign: "center", color: "#6b7280" }}>Don't have an account? <Link to="/register" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: "500" }}>Register here</Link></p>
      </div>
    </div>
  );
};

export default Login;
