const Vehicle = require("../models/Vehicle");
const { Op } = require("sequelize");

// Register a new vehicle
exports.registerVehicle = async (req, res) => {
  try {
    const {
      vehicleNumber,
      make,
      model,
      type,
      costCentre,
      department,
      status,
      registeredBy,
    } = req.body;

    if (!vehicleNumber) {
      return res
        .status(400)
        .json({ success: false, error: "Vehicle number is required" });
    }

    const vehicle = await Vehicle.create({
      vehicleNumber,
      make,
      model,
      type,
      costCentre,
      department,
      status,
      registeredBy,
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
        res.status(400).json({ message: err.message });
  }
};

// Get all registered vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search for vehicles by number (for auto-suggestion)
exports.searchVehicles = async (req, res) => {
  const { term } = req.query;

  if (!term || term.length < 2) {
    return res.json([]);
  }

  try {
    const vehicles = await Vehicle.findAll({
      where: {
        vehicleNo: {
          [Op.like]: `${term}%`,
        },
      },
      attributes: ["vehicleNo"],
      limit: 10,
    });
    res.json(vehicles.map((v) => v.vehicleNo));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
