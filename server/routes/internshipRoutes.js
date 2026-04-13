const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  postInternship,
  getAllInternships,
  getMyInternships
} = require("../controllers/internshipController");

const router = express.Router();

// Only verified companies can post internships
router.post(
  "/post",
  authMiddleware,
  roleMiddleware("company"),
  postInternship
);

// Students can view internships
router.get(
  "/all",
  authMiddleware,
  roleMiddleware("student"),
  getAllInternships
);

// Company views their own internships
router.get(
  "/company",
  authMiddleware,
  roleMiddleware("company"),
  getMyInternships
);

module.exports = router;
