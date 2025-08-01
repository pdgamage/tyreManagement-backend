const Vehicle = require("../models/Vehicle");
const Request = require("../models/Request");
const RequestImage = require("../models/RequestImage");

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

// Auto-suggest vehicle numbers based on partial input
exports.suggestVehicleNumbers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 1) {
      return res.json([]);
    }

    // Search for vehicles where vehicleNumber contains the query (case-insensitive)
    const vehicles = await Vehicle.findAll({
      where: {
        vehicleNumber: {
          [require('sequelize').Op.like]: `%${query.trim()}%`
        }
      },
      attributes: ['id', 'vehicleNumber', 'make', 'model', 'type'],
      limit: 10, // Limit to 10 suggestions
      order: [['vehicleNumber', 'ASC']]
    });

    // Format the response to include relevant vehicle info
    const suggestions = vehicles.map(vehicle => ({
      id: vehicle.id,
      vehicleNumber: vehicle.vehicleNumber,
      make: vehicle.make,
      model: vehicle.model,
      type: vehicle.type,
      displayText: `${vehicle.vehicleNumber} - ${vehicle.make} ${vehicle.model}`
    }));

    res.json(suggestions);
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

    // Find all requests for this vehicle number
    const requests = await Request.findAll({
      where: {
        vehicleNumber: vehicleNumber
      },
      order: [['submittedAt', 'DESC']]
    });

    // Fetch images for each request
    const requestsWithImages = await Promise.all(
      requests.map(async (request) => {
        const images = await RequestImage.findAll({
          where: { requestId: request.id },
          order: [["imageIndex", "ASC"]],
        });
        const imageUrls = images.map((img) => img.imagePath);

        return {
          ...request.toJSON(),
          images: imageUrls,
        };
      })
    );

    res.json({
      vehicleNumber: vehicleNumber,
      totalRequests: requestsWithImages.length,
      requests: requestsWithImages
    });
  } catch (error) {
    console.error("Error fetching requests by vehicle number:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
