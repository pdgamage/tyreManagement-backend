const RequestImage = require("../models/RequestImage");
const { Request } = require("../models");
const { pool } = require("../config/db");
const { sendOrderEmail } = require("../utils/orderEmailService");
// const websocketService = require("../services/websocketService"); // Disabled
// const sseRoutes = require("../routes/sseRoutes"); // Disabled

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
      "vehicleBrand",
      "vehicleModel",
      "lastReplacementDate",
      "existingTireMake",
      "tireSizeRequired",
      "presentKmReading",
      "previousKmReading",
      "tireWearPattern",
      "userSection",
      "costCenter",
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

    // Fetch images for each request
    const requestsWithImages = await Promise.all(
      requests.map(async (request) => {
        const images = await RequestImage.findAll({
          where: { requestId: request.id },
          order: [["imageIndex", "ASC"]],
        });
        const imageUrls = images.map((img) => img.imagePath);
        return { ...request.toJSON(), images: imageUrls };
      })
    );

    res.json(requestsWithImages);
  } catch (error) {
    console.error("Error in getAllRequests:", error);
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
    const { status, notes, role, userId } = req.body;

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

    console.log(
      "Found request:",
      request.id,
      "current status:",
      request.status
    );
    console.log("Updating to status:", status, "with role:", req.body.role);

    request.status = status;

    // Save notes to the correct column
    if (
      status === "supervisor approved" ||
      (status === "rejected" && role === "supervisor")
    ) {
      request.supervisor_notes = notes;
      // Store the supervisor ID who made the decision
      if (userId) {
        request.supervisor_decision_by = userId;
      }
    }
    if (
      status === "technical-manager approved" ||
      (status === "rejected" && role === "technical-manager")
    ) {
      request.technical_manager_note = notes;
      // Store the technical manager ID who made the decision
      if (userId) {
        request.technical_manager_id = userId;
      }
      // If technical manager rejects, clear supervisor decision tracking
      if (status === "rejected" && role === "technical-manager") {
        request.supervisor_decision_by = null;
      }
    }
    if (
      status === "engineer approved" ||
      status === "complete" ||
      (status === "rejected" && role === "engineer")
    ) {
      request.engineer_note = notes;
      // Store the engineer ID who made the decision
      if (userId) {
        request.engineer_decision_by = userId;
      }
      // If engineer rejects, clear previous decision tracking
      if (status === "rejected" && role === "engineer") {
        request.supervisor_decision_by = null;
        request.technical_manager_id = null;
      }
    }
    if (
      status === "customer-officer approved" ||
      status === "order placed" ||
      (status === "rejected" && role === "customer-officer")
    ) {
      request.customer_officer_note = notes;
      // Store the customer officer ID who made the decision
      if (userId) {
        request.customer_officer_decision_by = userId;
      }
    }

    console.log("Attempting to save request with status:", status);
    console.log("Request data before save:", {
      id: request.id,
      status: request.status,
      supervisor_notes: request.supervisor_notes,
      technical_manager_note: request.technical_manager_note,
      engineer_note: request.engineer_note,
    });

    try {
      await request.save();
      console.log("Request saved successfully with Sequelize");
    } catch (sequelizeError) {
      console.log(
        "Sequelize save failed, trying raw SQL:",
        sequelizeError.message
      );

      // Fallback to raw SQL update
      let updateQuery = "UPDATE requests SET status = ?";
      let params = [status];

      if (
        status === "supervisor approved" ||
        (status === "rejected" && req.body.role === "supervisor")
      ) {
        updateQuery += ", supervisor_notes = ?";
        params.push(notes);
      }
      if (
        status === "technical-manager approved" ||
        (status === "rejected" &&
          (req.body.role === "technical-manager" ||
            req.body.role === "technical - manager"))
      ) {
        updateQuery += ", technical_manager_note = ?";
        params.push(notes);
      }
      if (
        status === "engineer approved" ||
        status === "complete" ||
        (status === "rejected" && req.body.role === "engineer")
      ) {
        updateQuery += ", engineer_note = ?";
        params.push(notes);
      }
      if (
        status === "customer-officer approved" ||
        status === "order placed" ||
        (status === "rejected" && req.body.role === "customer-officer")
      ) {
        updateQuery += ", customer_officer_note = ?";
        params.push(notes);
      }

      updateQuery += " WHERE id = ?";
      params.push(req.params.id);

      console.log("Executing raw SQL:", updateQuery, params);
      await pool.query(updateQuery, params);
      console.log("Raw SQL update successful");
    }

    // Fetch the updated request
    const updatedRequest = await Request.findByPk(req.params.id);

    // Real-time updates disabled - using polling only
    // websocketService.broadcastRequestUpdate(updatedRequest, "updated");

    // SSE disabled due to Railway connection issues
    // sseRoutes.broadcastUpdate({
    //   type: "REQUEST_UPDATE",
    //   action: "updated",
    //   request: updatedRequest,
    //   timestamp: new Date().toISOString(),
    // });

    res.json({
      message: "Request status updated successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating request status:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      sql: error.sql,
    });
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
      sql: error.sql,
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

    // Fetch images for each request
    const requestsWithImages = await Promise.all(
      requests.map(async (request) => {
        const images = await RequestImage.findAll({
          where: { requestId: request.id },
          order: [["imageIndex", "ASC"]],
        });
        const imageUrls = images.map((img) => img.imagePath);
        return { ...request.toJSON(), images: imageUrls };
      })
    );

    res.json(requestsWithImages);
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

    // Debug: Log request data to check if new fields are present
    console.log("Request data for email:", {
      id: request.id,
      vehicleNumber: request.vehicleNumber,
      deliveryOfficeName: request.deliveryOfficeName,
      deliveryStreetName: request.deliveryStreetName,
      deliveryTown: request.deliveryTown,
      totalPrice: request.totalPrice,
      warrantyDistance: request.warrantyDistance,
      tireWearIndicatorAppeared: request.tireWearIndicatorAppeared,
    });

    // Check if request is complete (ready for order)
    if (request.status !== "complete") {
      return res.status(400).json({
        error: "Request must be complete before placing order",
        currentStatus: request.status,
      });
    }

    // Get supplier details
    const [suppliers] = await pool.query(
      "SELECT * FROM supplier WHERE id = ?",
      [supplierId]
    );
    if (suppliers.length === 0) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    const supplier = suppliers[0];

    // Validate supplier has FormsFree key
    if (!supplier.formsfree_key) {
      return res.status(400).json({
        error: "Supplier does not have a valid FormsFree key configured",
      });
    }

    // Send order email to supplier
    let emailResult;
    try {
      emailResult = await sendOrderEmail(supplier, request, orderNotes);
      console.log("Formspree email result:", emailResult);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Log full error object for debugging
      if (emailError.response) {
        console.error("Formspree response:", emailError.response.data);
      }
      return res.status(500).json({
        message: "Failed to send order email",
        error: emailError.message,
        details: emailError.response ? emailError.response.data : undefined,
      });
    }

    // Update request status to "order placed"
    // Try different update strategies based on available columns
    try {
      // First try with all columns
      await pool.query(
        "UPDATE requests SET status = ?, order_placed = true, order_timestamp = NOW() WHERE id = ?",
        ["order placed", id]
      );
      console.log("Updated request with all columns");
    } catch (error) {
      console.log("Full update failed, trying status only:", error.message);
      try {
        // If that fails, try just updating status
        await pool.query("UPDATE requests SET status = ? WHERE id = ?", [
          "order placed",
          id,
        ]);
        console.log("Updated request status only");
      } catch (statusError) {
        console.log(
          "Status update also failed, trying with enum check:",
          statusError.message
        );
        // If status update fails, it might be an enum issue, try with a valid enum value
        await pool.query(
          "UPDATE requests SET status = ? WHERE id = ?",
          ["complete", id] // Use 'complete' as fallback since 'order placed' might not be in enum
        );
        console.log("Updated request status to complete as fallback");
      }
    }

    console.log("Order placed successfully:", emailResult);

    res.json({
      message: "Order placed successfully",
      supplier: {
        id: supplier.id,
        name: supplier.name,
        email: supplier.email,
      },
      emailResult: emailResult,
      orderNotes: orderNotes,
    });
  } catch (err) {
    console.error("Error placing order:", err);

    // Check if this is just a database error but email was sent
    if (
      err.message &&
      err.message.includes("Data truncated") &&
      typeof emailResult !== "undefined"
    ) {
      // Email was sent successfully, return success despite database error
      console.log("Email sent successfully despite database error");
      res.json({
        message: "Order placed successfully (email sent)",
        supplier: {
          id: supplier.id,
          name: supplier.name,
          email: supplier.email,
        },
        emailResult: emailResult,
        orderNotes: orderNotes,
        warning:
          "Database update had issues but order email was sent successfully",
      });
    } else {
      res.status(500).json({
        message: "Error placing order",
        error: err.message,
      });
    }
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Request.destroy({ where: { id } });
    if (result === 0) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
