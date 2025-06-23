const Request = require("../models/Request");
const Vehicle = require("../models/Vehicle");

exports.createRequest = async (req, res) => {
  try {
    const requestData = req.body;
    // req.files is an array of files
    const files = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];
    requestData.images = files;

    // Convert numeric fields from string to number
    requestData.vehicleId = Number(requestData.vehicleId);
    requestData.quantity = Number(requestData.quantity);
    requestData.tubesQuantity = Number(requestData.tubesQuantity);
    requestData.presentKmReading = Number(requestData.presentKmReading);
    requestData.previousKmReading = Number(requestData.previousKmReading);
    requestData.userId = Number(requestData.userId);

    // Validate required fields
    const requiredFields = [
      "userId", "vehicleId", "vehicleNumber", "quantity", "tubesQuantity", "tireSize",
      "requestReason", "requesterName", "requesterEmail", "requesterPhone", "year",
      "vehicleBrand", "vehicleModel", "userSection", "lastReplacementDate",
      "existingTireMake", "tireSizeRequired", "costCenter", "presentKmReading",
      "previousKmReading", "tireWearPattern"
    ];
    for (const field of requiredFields) {
      if (
        requestData[field] === undefined ||
        requestData[field] === null ||
        requestData[field] === ""
      ) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    const result = await Request.create(requestData);
    res.status(201).json({ requestId: result.id });
  } catch (err) {
    console.error("Error creating tire request:", err);
    res.status(500).json({ error: "Failed to create tire request" });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.findAll();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json(request);
  } catch (error) {
    console.error("Error fetching request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Allow all valid statuses from your enum
    const allowedStatuses = [
      "pending",
      "supervisor approved",
      "technical-manager approved",
      "engineer approved",
      "customer-officer approved",
      "approved",
      "rejected",
    ];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    await Request.updateStatus(req.params.id, status);
    res.json({ message: "Request status updated successfully" });
  } catch (error) {
    console.error("Error updating request status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getRequestsByUser = async (req, res) => {
  try {
    const requests = await Request.findByUserId(req.params.userId);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.placeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Request.placeOrder(id);
    
    if (result.affectedRows === 0) {
      return res.status(400).json({ 
        message: "Cannot place order. Request either doesn't exist or doesn't have all required approvals." 
      });
    }
    
    res.json({ message: "Order placed successfully" });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ message: "Error placing order", error: err.message });
  }
};
