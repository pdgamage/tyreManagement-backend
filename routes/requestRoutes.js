const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const requestController = require("../controllers/requestController");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    // Use Date.now() to make filename unique
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Create a new request (with file uploads)
router.post("/", upload.array("images", 7), requestController.createRequest);

// Create a new request (alternative route)
router.post("/requests", requestController.createRequest);

// Get all requests
router.get("/", requestController.getAllRequests);

// Get requests by user (more specific route first)
router.get("/user/:id", requestController.getRequestsByUser);

// Check vehicle request restrictions (more specific route first)
router.get("/vehicle/:vehicleNumber/restrictions", requestController.checkVehicleRestrictions);

// Update request status (more specific route first)
router.put("/:id/status", requestController.updateRequestStatus);

// Place order for an approved request (more specific route first)
router.post("/:id/place-order", requestController.placeOrder);

// Update request details (only for pending requests)
router.put("/:id", requestController.updateRequest);

// Get a single request
router.get("/:id", requestController.getRequestById);

// Delete a request
router.delete("/:id", requestController.deleteRequest);

module.exports = router;
