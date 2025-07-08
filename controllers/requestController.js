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
    // Try to get requests with order_status column, fall back if it doesn't exist
    let requests;
    try {
      const [rows] = await pool.query(`
        SELECT *,
               COALESCE(order_status, 'pending') as order_status
        FROM requests
        ORDER BY submittedAt DESC
      `);
      requests = rows;
    } catch (error) {
      // order_status column doesn't exist, use legacy approach
      console.log('order_status column not found, using legacy query');
      const [rows] = await pool.query(`
        SELECT *,
               CASE
                 WHEN status = 'order placed' OR order_placed = true THEN 'placed'
                 ELSE 'pending'
               END as order_status
        FROM requests
        ORDER BY submittedAt DESC
      `);
      requests = rows;
    }

    res.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
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
    const { status, notes } = req.body;

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

    console.log("Attempting to save request with status:", status);
    console.log("Request data before save:", {
      id: request.id,
      status: request.status,
      supervisor_notes: request.supervisor_notes,
      technical_manager_note: request.technical_manager_note,
      engineer_note: request.engineer_note
    });

    try {
      await request.save();
      console.log("Request saved successfully with Sequelize");
    } catch (sequelizeError) {
      console.log("Sequelize save failed, trying raw SQL:", sequelizeError.message);

      // Fallback to raw SQL update
      let updateQuery = "UPDATE requests SET status = ?";
      let params = [status];

      if (status === "supervisor approved" || (status === "rejected" && req.body.role === "supervisor")) {
        updateQuery += ", supervisor_notes = ?";
        params.push(notes);
      }
      if (status === "technical-manager approved" || (status === "rejected" && (req.body.role === "technical-manager" || req.body.role === "technical - manager"))) {
        updateQuery += ", technical_manager_note = ?";
        params.push(notes);
      }
      if (status === "engineer approved" || status === "complete" || (status === "rejected" && req.body.role === "engineer")) {
        updateQuery += ", engineer_note = ?";
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

    // Check if order has already been placed using order_status
    try {
      const [orderCheck] = await pool.query(
        "SELECT order_status FROM requests WHERE id = ?",
        [id]
      );

      if (orderCheck.length > 0 && orderCheck[0].order_status === 'placed') {
        return res.status(400).json({
          error: "Order has already been placed for this request",
          currentStatus: request.status,
          orderStatus: orderCheck[0].order_status
        });
      }
    } catch (error) {
      // order_status column might not exist yet, fall back to old checks
      console.log('order_status column check failed, using fallback checks');

      // Fallback: check old status and order_placed field
      if (request.status === 'order placed') {
        return res.status(400).json({
          error: "Order has already been placed for this request",
          currentStatus: request.status
        });
      }

      try {
        const [orderPlacedCheck] = await pool.query(
          "SELECT order_placed FROM requests WHERE id = ? AND order_placed = true",
          [id]
        );
        if (orderPlacedCheck.length > 0) {
          return res.status(400).json({
            error: "Order has already been placed for this request",
            currentStatus: request.status
          });
        }
      } catch (orderPlacedError) {
        console.log('order_placed column also not found, continuing...');
      }
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

    // Send order email to supplier
    let emailResult;
    try {
      emailResult = await sendOrderEmail(supplier, request, orderNotes);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      return res.status(500).json({
        message: "Failed to send order email",
        error: emailError.message
      });
    }

    // Update order_status to "placed" (keep main status as "complete")
    let updateSuccess = false;
    try {
      // First try with new order_status column
      await pool.query(
        "UPDATE requests SET order_status = ?, order_placed = true, order_timestamp = NOW() WHERE id = ?",
        ['placed', id]
      );
      console.log('Updated request with order_status and legacy fields');
      updateSuccess = true;
    } catch (error) {
      console.log('order_status update failed, trying legacy approach:', error.message);
      try {
        // Fallback: try with order_placed field only
        await pool.query(
          "UPDATE requests SET order_placed = true, order_timestamp = NOW() WHERE id = ?",
          [id]
        );
        console.log('Updated request with legacy order_placed field');
        updateSuccess = true;
      } catch (legacyError) {
        console.log('Legacy update also failed:', legacyError.message);
        // Last resort: just update status (old behavior)
        try {
          await pool.query(
            "UPDATE requests SET status = ? WHERE id = ?",
            ['order placed', id]
          );
          console.log('Updated request status as last resort');
          updateSuccess = true;
        } catch (statusError) {
          console.log('All update strategies failed:', statusError.message);
          throw new Error('Failed to update request order status');
        }
      }
    }

    // Verify the update was successful
    if (!updateSuccess) {
      throw new Error('Failed to update request order status');
    }

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
    console.error("Error placing order:", err);

    // Check if this is just a database error but email was sent
    if (err.message && err.message.includes('Data truncated') && typeof emailResult !== 'undefined') {
      // Email was sent successfully, return success despite database error
      console.log("Email sent successfully despite database error");
      res.json({
        message: "Order placed successfully (email sent)",
        supplier: {
          id: supplier.id,
          name: supplier.name,
          email: supplier.email
        },
        emailResult: emailResult,
        orderNotes: orderNotes,
        warning: "Database update had issues but order email was sent successfully"
      });
    } else {
      res.status(500).json({
        message: "Error placing order",
        error: err.message
      });
    }
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
