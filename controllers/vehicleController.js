const Vehicle = require("../models/Vehicle");

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
    const { vehicleNumber, make, model, type, status, registeredBy } = req.body;

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

// Auto-suggest vehicle numbers based on search term
exports.searchVehicleNumbers = async (req, res) => {
  try {
    const { search } = req.query;
    
    if (!search || search.trim().length < 1) {
      return res.json([]);
    }

    const searchTerm = search.trim().toUpperCase();
    
    // Use Sequelize to search for vehicle numbers that contain the search term
    const vehicles = await Vehicle.findAll({
      attributes: ['vehicleNumber', 'make', 'model', 'type', 'department', 'costCentre'],
      where: {
        vehicleNumber: {
          [require('sequelize').Op.like]: `%${searchTerm}%`
        }
      },
      order: [['vehicleNumber', 'ASC']],
      limit: 10 // Limit to 10 suggestions
    });

    // Format the response to include vehicle details for better UX
    const suggestions = vehicles.map(vehicle => ({
      vehicleNumber: vehicle.vehicleNumber,
      make: vehicle.make,
      model: vehicle.model,
      type: vehicle.type,
      department: vehicle.department,
      costCentre: vehicle.costCentre,
      displayText: `${vehicle.vehicleNumber} - ${vehicle.make} ${vehicle.model}${vehicle.type ? ` (${vehicle.type})` : ''}`
    }));

    res.json(suggestions);
  } catch (error) {
    console.error("Error searching vehicle numbers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
