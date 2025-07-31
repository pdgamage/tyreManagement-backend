const Vehicle = require("../models/Vehicle");
const { pool } = require("../config/db");

exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll();
    res.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Auto-suggest vehicle numbers for search
exports.searchVehicleNumbers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 1) {
      return res.json([]);
    }

    // Search for vehicle numbers that contain the query string (case-insensitive)
    const [vehicles] = await pool.query(
      `SELECT DISTINCT vehicleNumber, make, model, type, department, costCentre 
       FROM vehicles 
       WHERE vehicleNumber LIKE ? 
       ORDER BY vehicleNumber ASC 
       LIMIT 10`,
      [`%${query}%`]
    );

    res.json(vehicles);
  } catch (error) {
    console.error("Error searching vehicle numbers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all unique vehicle numbers from both vehicles and requests tables
exports.getAllVehicleNumbers = async (req, res) => {
  try {
    const [vehicleNumbers] = await pool.query(
      `SELECT DISTINCT vehicleNumber, make, model, type, department, costCentre 
       FROM vehicles 
       UNION 
       SELECT DISTINCT vehicleNumber, vehicleBrand as make, vehicleModel as model, 
              NULL as type, userSection as department, costCenter as costCentre 
       FROM requests 
       ORDER BY vehicleNumber ASC`
    );

    res.json(vehicleNumbers);
  } catch (error) {
    console.error("Error fetching all vehicle numbers:", error);
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
