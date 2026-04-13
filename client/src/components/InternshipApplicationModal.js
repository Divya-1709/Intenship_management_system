import React, { useState } from "react";

const InternshipApplicationModal = ({ internship, studentProfile, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    coverLetter: "",
    whyInterested: "",
    relevantExperience: "",
    availability: "",
    portfolioLinks: "",
    expectedStipend: "",
    references: "",
    questionsForCompany: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "0.5rem",
          padding: "2rem",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1f2937" }}>
            Apply for {internship.title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "0.375rem" }}>
          <p style={{ color: "#374151", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
            <strong>Company:</strong> {internship.companyId?.companyName}
          </p>
          <p style={{ color: "#374151", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
            <strong>Duration:</strong> {internship.duration}
          </p>
          <p style={{ color: "#374151", fontSize: "0.875rem" }}>
            <strong>Stipend:</strong> {internship.stipend}
          </p>
        </div>

        {studentProfile && (
          <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#f0fdf4", borderRadius: "0.375rem", border: "1px solid #bbf7d0" }}>
            <p style={{ color: "#166534", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem" }}>
              Your Profile Information:
            </p>
            <p style={{ color: "#374151", fontSize: "0.875rem" }}>
              Name: {studentProfile.name}
            </p>
            <p style={{ color: "#374151", fontSize: "0.875rem" }}>
              Email: {studentProfile.email}
            </p>
            <p style={{ color: "#374151", fontSize: "0.875rem" }}>
              Phone: {studentProfile.phone}
            </p>
            <p style={{ color: "#374151", fontSize: "0.875rem" }}>
              Branch: {studentProfile.branch}
            </p>
            <p style={{ color: "#374151", fontSize: "0.875rem" }}>
              Year: {studentProfile.yearOfStudy}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="coverLetter"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "0.5rem",
              }}
            >
              Cover Letter *
            </label>
            <textarea
              id="coverLetter"
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleChange}
              required
              rows={4}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                resize: "vertical",
              }}
              placeholder="Write your cover letter here..."
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="whyInterested"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "0.5rem",
              }}
            >
              Why are you interested in this internship? *
            </label>
            <textarea
              id="whyInterested"
              name="whyInterested"
              value={formData.whyInterested}
              onChange={handleChange}
              required
              rows={3}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                resize: "vertical",
              }}
              placeholder="Explain why you're interested in this opportunity..."
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="relevantExperience"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "0.5rem",
              }}
            >
              Relevant Experience *
            </label>
            <textarea
              id="relevantExperience"
              name="relevantExperience"
              value={formData.relevantExperience}
              onChange={handleChange}
              required
              rows={3}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                resize: "vertical",
              }}
              placeholder="Describe your relevant experience..."
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="availability"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "0.5rem",
              }}
            >
              Availability *
            </label>
            <input
              type="text"
              id="availability"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
              }}
              placeholder="e.g., Full-time, Part-time, Start date..."
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="portfolioLinks"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "0.5rem",
              }}
            >
              Portfolio/Resume URL
            </label>
            <input
              type="url"
              id="portfolioLinks"
              name="portfolioLinks"
              value={formData.portfolioLinks}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
              }}
              placeholder="https://example.com/portfolio or resume"
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="expectedStipend"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "0.5rem",
              }}
            >
              Expected Stipend
            </label>
            <input
              type="text"
              id="expectedStipend"
              name="expectedStipend"
              value={formData.expectedStipend}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
              }}
              placeholder="e.g., $1000/month"
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="references"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "0.5rem",
              }}
            >
              References
            </label>
            <input
              type="text"
              id="references"
              name="references"
              value={formData.references}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
              }}
              placeholder="Any references..."
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              htmlFor="questionsForCompany"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "0.5rem",
              }}
            >
              Questions for Company
            </label>
            <textarea
              id="questionsForCompany"
              name="questionsForCompany"
              value={formData.questionsForCompany}
              onChange={handleChange}
              rows={2}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                resize: "vertical",
              }}
              placeholder="Any questions for the company..."
            />
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "0.625rem 1.25rem",
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.875rem",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "0.625rem 1.25rem",
                backgroundColor: isSubmitting ? "#9ca3af" : "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "0.875rem",
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InternshipApplicationModal;
