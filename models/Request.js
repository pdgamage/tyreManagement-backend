const pool = require("../config/db");

class Request {
  static async create(data) {
    // 1. Insert the request (without images)
    const [result] = await pool.query(
      `INSERT INTO requests (
        userId, vehicleId, vehicleNumber, quantity, tubesQuantity, tireSize, requestReason,
        requesterName, requesterEmail, requesterPhone, year, vehicleBrand, vehicleModel,
        userSection, lastReplacementDate, existingTireMake, tireSizeRequired, costCenter,
        presentKmReading, previousKmReading, tireWearPattern, comments, status, submittedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.userId, // <-- Add this
        data.vehicleId,
        data.vehicleNumber,
        data.quantity,
        data.tubesQuantity,
        data.tireSize,
        data.requestReason,
        data.requesterName,
        data.requesterEmail,
        data.requesterPhone,
        data.year,
        data.vehicleBrand,
        data.vehicleModel,
        data.userSection,
        data.lastReplacementDate,
        data.existingTireMake,
        data.tireSizeRequired,
        data.costCenter,
        data.presentKmReading,
        data.previousKmReading,
        data.tireWearPattern,
        data.comments,
        data.status || "pending",
        data.submittedAt || new Date(),
      ]
    );
    const requestId = result.insertId;

    // 2. Insert images into request_images table
    if (Array.isArray(data.images)) {
      for (let i = 0; i < data.images.length; i++) {
        const imagePath = data.images[i];
        await pool.query(
          "INSERT INTO request_images (requestId, imagePath, imageIndex) VALUES (?, ?, ?)",
          [requestId, imagePath, i]
        );
      }
    }

    return { id: requestId };
  }

  static async findAll() {
    const [rows] = await pool.query("SELECT * FROM requests");
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query("SELECT * FROM requests WHERE id = ?", [
      id,
    ]);
    return rows[0];
  }

  static async updateStatus(id, status) {
    await pool.query("UPDATE requests SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
  }

  static async findByUserId(userId) {
    const [rows] = await pool.query("SELECT * FROM requests WHERE userId = ?", [
      userId,
    ]);
    return rows;
  }

  static async updateApprovalStatus(id, role, { approved, notes }) {
    const now = new Date();
    const fields = {
      supervisor: {
        approvedField: "supervisor_approved",
        notesField: "supervisor_notes",
        timestampField: "supervisor_timestamp",
      },
      "technical-manager": {
        approvedField: "technical_manager_approved",
        notesField: "technical_manager_notes",
        timestampField: "technical_manager_timestamp",
      },
      engineer: {
        approvedField: "engineer_approved",
        notesField: "engineer_notes",
        timestampField: "engineer_timestamp",
      },
    };

    const roleFields = fields[role];
    if (!roleFields) {
      throw new Error("Invalid role");
    }

    const result = await pool.query(
      `UPDATE requests 
       SET ${roleFields.approvedField} = ?, 
           ${roleFields.notesField} = ?,
           ${roleFields.timestampField} = ?,
           status = CASE 
             WHEN ? = true AND supervisor_approved = true AND technical_manager_approved = true AND engineer_approved = true 
             THEN 'fully approved'
             WHEN ? = false 
             THEN 'rejected'
             ELSE status 
           END
       WHERE id = ?`,
      [approved, notes, now, approved, approved, id]
    );

    return result;
  }

  static async placeOrder(id) {
    const now = new Date();
    const result = await pool.query(
      `UPDATE requests 
       SET order_placed = true,
           order_timestamp = ?,
           status = 'order placed'
       WHERE id = ? 
         AND supervisor_approved = true 
         AND technical_manager_approved = true 
         AND engineer_approved = true`,
      [now, id]
    );

    return result;
  }
}

exports.getRequestsByUser = async (req, res) => {
  try {
    const requests = await Request.findByUserId(req.params.userId);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = Request;
