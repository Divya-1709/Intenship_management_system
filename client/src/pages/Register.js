import React, { useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student" // default role
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", formData);
      alert("Registration successful! Please login.");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f3f4f6", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ backgroundColor: "white", padding: "2.5rem", borderRadius: "0.5rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", width: "100%", maxWidth: "400px" }}>
        <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#111827", marginBottom: "1.5rem", textAlign: "center" }}>Register</h2>
        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            required
            style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
            style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
            style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box" }}
          />
          <select name="role" onChange={handleChange} style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box", backgroundColor: "white" }}>
            <option value="student">Student</option>
            <option value="company">Company</option>
          </select>
          <button type="submit" style={{ padding: "0.75rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: "600", marginTop: "0.5rem" }}>Register</button>
        </form>
        <p style={{ marginTop: "1.5rem", textAlign: "center", color: "#6b7280" }}>Already have an account? <Link to="/" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: "500" }}>Login</Link></p>
      </div>
    </div>
  );
};

export default Register;