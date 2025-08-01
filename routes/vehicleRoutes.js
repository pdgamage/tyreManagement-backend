const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// Get all vehicles
router.get('/', vehicleController.getAllVehicles);

// Get all registered vehicle numbers (auto-suggest)
router.get('/numbers', vehicleController.getVehicleNumbers);

// Create a new vehicle
router.post('/', vehicleController.createVehicle);

// Get a single vehicle
router.get('/:id', vehicleController.getVehicleById);

module.exports = router;