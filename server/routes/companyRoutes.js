const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  registerCompany,
  verifyCompany,
  getAllCompanies
} = require("../controllers/companyController");

const router = express.Router();

// Company submits details
router.post(
  "/register",
  authMiddleware,
  roleMiddleware("company"),
  registerCompany
);

// Admin verifies company
router.put(
  "/verify/:id",
  authMiddleware,
  roleMiddleware("admin"),
  verifyCompany
);

// Admin views all companies
router.get(
  "/all",
  authMiddleware,
  roleMiddleware("admin"),
  getAllCompanies
);

module.exports = router;
