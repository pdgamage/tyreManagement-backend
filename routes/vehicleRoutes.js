const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// Get vehicle suggestions for autocomplete
router.get('/suggestions', vehicleController.getVehicleSuggestions);

// Search vehicle with its requests
router.get('/search', vehicleController.searchVehicleWithRequests);

// Get all vehicles
router.get('/', vehicleController.getAllVehicles);

// Create a new vehicle
router.post('/', vehicleController.createVehicle);

// Get a single vehicle
router.get('/:id', vehicleController.getVehicleById);

module.exports = router;