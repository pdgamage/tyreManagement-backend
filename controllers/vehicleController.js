const Vehicle = require("../models/Vehicle");

// Get all registered vehicle numbers for auto-suggest
exports.getVehicleNumbers = async (req, res) => {
  try {
    // Optionally, filter only active/registered vehicles if there is a status field
    const vehicles = await Vehicle.findAll({
      attributes: ['vehicleNumber'],
      where: { status: 'registered' }, // adjust if status value differs, or remove if not needed
      order: [['vehicleNumber', 'ASC']]
    });
    const vehicleNumbers = vehicles.map(v => v.vehicleNumber);
    res.json(vehicleNumbers);
  } catch (error) {
    console.error('Error fetching vehicle numbers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll();
    res.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createVehicle = async (req, res) => {
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
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        error: "A vehicle with this number already exists",
      });
    }
    console.error("Error creating vehicle:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    res.json(vehicle);
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
