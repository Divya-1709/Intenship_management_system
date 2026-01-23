const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  postInternship,
  getAllInternships
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

module.exports = router;
