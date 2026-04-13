import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MyApplications from "./pages/MyApplication";
import StudentProfile from "./pages/Studentprofile";
import StudentTasks from "./pages/StudentTasks";
import CompanyInterviews from "./pages/CompanyInterviews";
import StudentInterviews from "./pages/StudentInterviews";
import LandingPage from "./pages/LandingPage";
import InternshipMatcher from "./pages/InternshipMatcher";
import Settings from "./pages/Settings";
import PaymentPage from "./pages/PaymentPage";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/company" element={<CompanyDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/my-application" element={<MyApplications />} />
          <Route path="/profile" element={<StudentProfile />} />
          <Route path="/tasks" element={<StudentTasks />} />
          <Route path="/company/interviews" element={<CompanyInterviews />} />
          <Route path="/student/interviews" element={<StudentInterviews />} />
          <Route path="/smart-match" element={<InternshipMatcher />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/payment/:applicationId" element={<PaymentPage />} />
          <Route path="/landing" element={<LandingPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;