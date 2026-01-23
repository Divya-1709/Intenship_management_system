import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MyApplication from "./pages/MyApplication";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/company" element={<CompanyDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/my-application" element={<MyApplication />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
