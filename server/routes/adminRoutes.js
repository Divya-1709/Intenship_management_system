const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getDashboardStats,
  getAllApplications,
  getAllInternshipsAdmin
} = require("../controllers/adminController");

const router = express.Router();

// Admin dashboard statistics
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("admin"),
  getDashboardStats
);

// View all applications
router.get(
  "/applications",
  authMiddleware,
  roleMiddleware("admin"),
  getAllApplications
);

// View all internships
router.get(
  "/internships",
  authMiddleware,
  roleMiddleware("admin"),
  getAllInternshipsAdmin
);

module.exports = router;
