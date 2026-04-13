const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { getRecommendations } = require("../controllers/matchController");

const router = express.Router();

// GET /api/match/recommendations
// Returns ranked, scored internship matches for the logged-in student
router.get(
  "/recommendations",
  authMiddleware,
  roleMiddleware("student"),
  getRecommendations
);

module.exports = router;
