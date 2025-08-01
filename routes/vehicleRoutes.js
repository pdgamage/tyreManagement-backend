const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// Get all vehicles
router.get('/', vehicleController.getAllVehicles);

// Auto-suggest vehicle numbers
router.get('/suggestions', vehicleController.getVehicleNumberSuggestions);

// Get requests by vehicle number
router.get('/:vehicleNumber/requests', vehicleController.getRequestsByVehicleNumber);

// Create a new vehicle
router.post('/', vehicleController.createVehicle);

// Get a single vehicle
router.get('/:id', vehicleController.getVehicleById);

module.exports = router;