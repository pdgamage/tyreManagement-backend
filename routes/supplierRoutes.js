const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplierController");

// Get all suppliers
router.get("/", supplierController.getAllSuppliers);

// Get a single supplier
router.get("/:id", supplierController.getSupplierById);

// Create a new supplier
router.post("/", supplierController.createSupplier);

module.exports = router;
