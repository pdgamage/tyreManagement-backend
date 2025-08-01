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

// Auto-suggest vehicle numbers based on partial input
exports.getVehicleNumberSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 1) {
      return res.json([]);
    }

    // Search for vehicle numbers that contain the query string (case-insensitive)
    const [vehicles] = await pool.query(
      `SELECT DISTINCT vehicleNumber, make, model, type 
       FROM vehicles 
       WHERE vehicleNumber LIKE ? 
       ORDER BY vehicleNumber 
       LIMIT 10`,
      [`%${query}%`]
    );

    res.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicle suggestions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all requests for a specific vehicle number
exports.getRequestsByVehicleNumber = async (req, res) => {
  try {
    const { vehicleNumber } = req.params;
    
    if (!vehicleNumber) {
      return res.status(400).json({ error: "Vehicle number is required" });
    }

    // Get all requests for the specified vehicle number
    const [requests] = await pool.query(
      `SELECT r.*, 
              v.make as vehicleMake, 
              v.model as vehicleModel, 
              v.type as vehicleType
       FROM requests r
       LEFT JOIN vehicles v ON r.vehicleNumber = v.vehicleNumber
       WHERE r.vehicleNumber = ?
       ORDER BY r.submittedAt DESC`,
      [vehicleNumber]
    );

    // Fetch images for each request
    const RequestImage = require("../models/RequestImage");
    const requestsWithImages = await Promise.all(
      requests.map(async (request) => {
        const images = await RequestImage.findAll({
          where: { requestId: request.id },
          order: [["imageIndex", "ASC"]],
        });
        const imageUrls = images.map((img) => img.imagePath);

        return {
          ...request,
          images: imageUrls,
        };
      })
    );

    res.json({
      vehicleNumber,
      totalRequests: requestsWithImages.length,
      requests: requestsWithImages,
    });
  } catch (error) {
    console.error("Error fetching requests by vehicle number:", error);
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
