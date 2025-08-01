const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// Get all vehicles
router.get('/', vehicleController.getAllVehicles);

// Create a new vehicle
router.post('/', vehicleController.createVehicle);

// Auto-suggest vehicle numbers based on query
router.get('/suggest', vehicleController.suggestVehicleNumbers);

// Get all requests for a specific vehicle number
router.get('/requests/:vehicleNumber', vehicleController.getRequestsByVehicleNumber);

// Get a single vehicle
router.get('/:id', vehicleController.getVehicleById);

module.exports = router;