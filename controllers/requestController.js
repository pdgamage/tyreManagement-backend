const Request = require("../models/Request");
const RequestImage = require("../models/RequestImage");
const { Request: RequestModel } = require("../models");
const { Supplier: SupplierClass } = require("../models/Supplier");
const OrderEmailService = require("../utils/orderEmailService");

exports.createRequest = async (req, res) => {
  try {
    const requestData = req.body;

    // Convert numeric fields from string to number
    requestData.vehicleId = Number(requestData.vehicleId);
    requestData.quantity = Number(requestData.quantity);
    requestData.tubesQuantity = Number(requestData.tubesQuantity);
    requestData.presentKmReading = Number(requestData.presentKmReading);
    requestData.previousKmReading = Number(requestData.previousKmReading);
    requestData.userId = Number(requestData.userId);

    // Validate required fields
    const requiredFields = [
      "userId",
      "vehicleId",
      "vehicleNumber",
      "quantity",
      "tubesQuantity",
      "tireSize",
      "requestReason",
      "requesterName",
      "requesterEmail",
      "requesterPhone",
      "year",
      "vehicleBrand",
      "vehicleModel",
      "userSection",
      "lastReplacementDate",
      "existingTireMake",
      "tireSizeRequired",
      "costCenter",
      "presentKmReading",
      "previousKmReading",
      "tireWearPattern",
    ];
    for (const field of requiredFields) {
      if (
        requestData[field] === undefined ||
        requestData[field] === null ||
        requestData[field] === ""
      ) {
        return res
          .status(400)
          .json({ error: `Missing required field: ${field}` });
      }
    }

    // 1. Create the request
    const result = await Request.create(requestData);

    // 2. Save image URLs in request_images table
    if (Array.isArray(requestData.images)) {
      for (let i = 0; i < requestData.images.length; i++) {
        const imageUrl = requestData.images[i];
        if (imageUrl) {
          await RequestImage.create({
            requestId: result.id,
            imagePath: imageUrl,
            imageIndex: i,
          });
        }
      }
    }

    const fullRequest = await Request.findByPk(result.id);
    res.status(201).json(fullRequest);
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
    // Fetch the request
    const request = await Request.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Fetch related images
    const images = await RequestImage.findAll({
      where: { requestId: req.params.id },
      order: [["imageIndex", "ASC"]],
    });

    // Map image paths to an array of URLs
    const imageUrls = images.map((img) => img.imagePath);

    // Add images to the response
    res.json({ ...request.toJSON(), images: imageUrls });
  } catch (error) {
    console.error("Error in getRequestById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, notes, role } = req.body;
    console.log('Update request status called with:', { id: req.params.id, status, notes, role });

    // Allow all valid statuses from your enum
    const allowedStatuses = [
      "pending",
      "supervisor approved",
      "technical-manager approved",
      "engineer approved",
      "customer-officer approved",
      "approved",
      "rejected",
      "complete",
    ];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Find the request by primary key
    const request = await Request.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    request.status = status;

    // Save notes to the correct column
    if (
      status === "supervisor approved" ||
      (status === "rejected" && req.body.role === "supervisor")
    ) {
      request.supervisor_notes = notes;
    }
    if (
      status === "technical-manager approved" ||
      (status === "rejected" && (req.body.role === "technical-manager" || req.body.role === "technical - manager"))
    ) {
      request.technical_manager_note = notes;
    }
    if (
      status === "engineer approved" ||
      status === "complete" ||
      (status === "rejected" && req.body.role === "engineer")
    ) {
      request.engineer_note = notes;
    }
    await request.save();
    console.log('Request updated successfully:', request.toJSON());
    res.json({ message: "Request status updated successfully", request });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

exports.getRequestsByUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const requests = await Request.findAll({
      where: { userId },
      order: [["submittedAt", "DESC"]],
    });
    res.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.placeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Request.placeOrder(id);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message:
          "Cannot place order. Request either doesn't exist or doesn't have all required approvals.",
      });
    }

    res.json({ message: "Order placed successfully" });
  } catch (err) {
    console.error("Error placing order:", err);
    res
      .status(500)
      .json({ message: "Error placing order", error: err.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await RequestModel.destroy({ where: { id } });
    if (result === 0) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.placeOrder = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { supplierId, orderNotes } = req.body;

    // Validate input
    if (!supplierId) {
      return res.status(400).json({ error: "Supplier ID is required" });
    }

    // Get the request
    const request = await RequestModel.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Check if request is complete
    if (request.status !== "complete") {
      return res.status(400).json({ error: "Only completed requests can have orders placed" });
    }

    // Get the supplier
    const supplier = await SupplierClass.getById(supplierId);
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    // Send order email to supplier
    await OrderEmailService.sendOrderToSupplier(supplier, request, {
      orderNotes: orderNotes || "",
      orderDate: new Date()
    });

    // Update request to mark order as placed
    request.order_placed = true;
    request.order_timestamp = new Date();
    request.status = "order placed";
    await request.save();

    res.json({
      message: "Order placed successfully",
      supplier: supplier.name,
      email: supplier.email
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Failed to place order", details: error.message });
  }
};
