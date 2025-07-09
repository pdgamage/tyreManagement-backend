const RequestImage = require("../models/RequestImage");
const { Request } = require("../models");
const { pool } = require("../config/db");
const { sendOrderEmail } = require("../utils/orderEmailService");

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


// New helper function for sending order confirmation
async function sendOrderConfirmation(req, res, request, supplier, orderNotes) {
  try {
    // Send order email to supplier
    const emailResult = await sendOrderEmail(supplier, request, orderNotes);

    // Update request status to "order placed"
    request.status = 'order placed';
    await request.save();

    console.log("Order placed successfully:", emailResult);

    res.json({
      message: "Order placed successfully",
      supplier: {
        id: supplier.id,
        name: supplier.name,
        email: supplier.email
      },
      emailResult: emailResult,
      orderNotes: orderNotes
    });
  } catch (err) {
    console.error("Error in sendOrderConfirmation:", err);
    res.status(500).json({
      message: "Failed to place order",
      error: err.message
    });
  }
}

exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, notes, supplierId, orderNotes } = req.body;

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
      "order placed",
    ];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Find the request by primary key
    const request = await Request.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    console.log("Found request:", request.id, "current status:", request.status);
    console.log("Updating to status:", status, "with role:", req.body.role);


    // If status is 'order placed', handle it as a special case
    if (status === 'order placed') {
      if (!supplierId) {
        return res.status(400).json({ error: "Supplier ID is required for placing an order" });
      }
      const [suppliers] = await pool.query("SELECT * FROM supplier WHERE id = ?", [supplierId]);
      if (suppliers.length === 0) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      const supplier = suppliers[0];
      return sendOrderConfirmation(req, res, request, supplier, orderNotes || '');
    }

    request.status = status;

    // Save notes to the correct column
    if (status === "supervisor approved" || (status === "rejected" && req.body.role === "supervisor")) {
      request.supervisor_notes = notes;
    }
    if (status === "technical-manager approved" || (status === "rejected" && (req.body.role === "technical-manager" || req.body.role === "technical - manager"))) {
      request.technical_manager_note = notes;
    }
    if (status === "engineer approved" || status === "complete" || (status === "rejected" && req.body.role === "engineer")) {
      request.engineer_note = notes;
    }

    await request.save();
    console.log("Request status updated successfully");

    const updatedRequest = await Request.findByPk(req.params.id);
    res.json({ message: "Request status updated successfully", request: updatedRequest });
  } catch (error) {
    console.error("Error updating request status:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      sql: error.sql
    });
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
      sql: error.sql
    });
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
    const { supplierId, orderNotes } = req.body;

    console.log(`Placing order for request ${id} with supplier ${supplierId}`);

    // Validate required fields
    if (!supplierId) {
      return res.status(400).json({ error: "Supplier ID is required" });
    }

    // Get the request details
    const request = await Request.findByPk(id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Check if request is complete (ready for order)
    if (request.status !== 'complete') {
      return res.status(400).json({
        error: "Request must be complete before placing order",
        currentStatus: request.status
      });
    }

    // Get supplier details
    const [suppliers] = await pool.query("SELECT * FROM supplier WHERE id = ?", [supplierId]);
    if (suppliers.length === 0) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    const supplier = suppliers[0];

    // Validate supplier has FormsFree key
    if (!supplier.formsfree_key) {
      return res.status(400).json({ error: "Supplier does not have a valid FormsFree key configured" });
    }

    // Delegate to the new helper function
    await sendOrderConfirmation(req, res, request, supplier, orderNotes);

  } catch (err) {
    console.error("Error placing order:", err);

    res.status(500).json({
      message: "Error placing order",
      error: err.message
    });
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
