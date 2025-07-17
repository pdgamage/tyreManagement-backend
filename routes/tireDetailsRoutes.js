const express = require('express');
const router = express.Router();
const tireDetailsController = require('../controllers/tireDetailsController');

// Get all tire details
router.get('/', tireDetailsController.getAllTireDetails);

// Get tire details by tire size
router.get('/size/:tireSize', tireDetailsController.getTireDetailsBySize);

// Create new tire details
router.post('/', tireDetailsController.createTireDetails);

module.exports = router;
