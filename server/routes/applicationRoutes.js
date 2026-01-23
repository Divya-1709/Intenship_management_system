const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  applyInternship,
  getMyApplications,
  getApplicantsForCompany,
  updateApplicationStatus
} = require("../controllers/applicationController");

const router = express.Router();

/* ===========================
   STUDENT ROUTES
=========================== */

// Student applies for internship
router.post(
  "/apply",
  authMiddleware,
  roleMiddleware("student"),
  applyInternship
);

// Student views own applications
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("student"),
  getMyApplications
);

/* ===========================
   COMPANY ROUTES
=========================== */

// Company views applicants for its internships
router.get(
  "/company",
  authMiddleware,
  roleMiddleware("company"),
  getApplicantsForCompany
);

// Company updates application status
router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware("company"),
  updateApplicationStatus
);

module.exports = router;
