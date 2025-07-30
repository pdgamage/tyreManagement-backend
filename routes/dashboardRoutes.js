const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

// Get customer officer dashboard data
router.get("/customer-officer", dashboardController.getCustomerOfficerDashboard);

// Get general dashboard stats (with role query parameter)
router.get("/stats", dashboardController.getDashboardStats);

module.exports = router;