const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// Register a new vehicle
router.post('/register', vehicleController.registerVehicle);

// Get all registered vehicles
router.get('/', vehicleController.getAllVehicles);

// Search for vehicles by number for auto-suggestion
router.get('/search', vehicleController.searchVehicles);

module.exports = router;