const Vehicle = require("../models/Vehicle");
const Request = require("../models/Request");
const Supplier = require("../models/Supplier");

exports.searchVehicleWithRequests = async (req, res) => {
  try {
    const { vehicleNumber } = req.query;

    if (!vehicleNumber) {
      return res.status(400).json({
        success: false,
        error: "Vehicle number is required for search"
      });
    }

    // First find the vehicle
    const vehicle = await Vehicle.findOne({
      where: { vehicleNumber: vehicleNumber }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: "No vehicle found with this number"
      });
    }

    // Find related requests
    const requests = await Request.findAll({
      where: { vehicleId: vehicle.id },
      include: [{
        model: Supplier,
        attributes: ['name', 'email', 'phone', 'address']
      }]
    });

    res.json({
      success: true,
      data: {
        vehicle,
        requests: requests.map(request => ({
          ...request.toJSON(),
          supplier: request.Supplier ? request.Supplier.toJSON() : null
        }))
      }
    });
  } catch (error) {
    console.error("Error searching vehicle and requests:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.getVehicleSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.json({ success: true, data: [] });
    }

    const vehicles = await Vehicle.findAll({
      where: {
        vehicleNumber: {
          [Op.like]: `%${query}%`
        }
      },
      limit: 10,
      attributes: ['vehicleNumber', 'make', 'model']
    });

    res.json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    console.error("Error fetching vehicle suggestions:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
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
