const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// Get all vehicles
router.get('/', vehicleController.getAllVehicles);

// Auto-suggest vehicle numbers for search
router.get('/search/numbers', vehicleController.searchVehicleNumbers);

// Get all unique vehicle numbers
router.get('/numbers/all', vehicleController.getAllVehicleNumbers);

// Create a new vehicle
router.post('/', vehicleController.createVehicle);

// Get a single vehicle
router.get('/:id', vehicleController.getVehicleById);

module.exports = router;