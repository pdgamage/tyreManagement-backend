const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// Get all vehicles
router.get('/', vehicleController.getAllVehicles);

// Create a new vehicle
router.post('/', vehicleController.createVehicle);

// Get a single vehicle
router.get('/:id', vehicleController.getVehicleById);

// Get all vehicles for a specific user
router.get('/user/:userId', vehicleController.getVehiclesByUserId);

module.exports = router;