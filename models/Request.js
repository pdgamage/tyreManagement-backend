const { sequelize, pool } = require("../config/db");
const { DataTypes } = require("sequelize");

const RequestModel = sequelize.define(
  "Request",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    vehicleId: { type: DataTypes.INTEGER, allowNull: false },
    vehicleNumber: { type: DataTypes.STRING(50), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    tubesQuantity: { type: DataTypes.INTEGER, allowNull: false },
    tireSize: { type: DataTypes.STRING(50), allowNull: false },
    requestReason: { type: DataTypes.TEXT, allowNull: false },
    requesterName: { type: DataTypes.STRING(100), allowNull: false },
    requesterEmail: { type: DataTypes.STRING(100), allowNull: false },
    requesterPhone: { type: DataTypes.STRING(20), allowNull: false },
    year: { type: DataTypes.STRING(4), allowNull: false },
    vehicleBrand: { type: DataTypes.STRING(50), allowNull: false },
    vehicleModel: { type: DataTypes.STRING(50), allowNull: false },
    userSection: { type: DataTypes.STRING(100), allowNull: false },
    lastReplacementDate: { type: DataTypes.DATEONLY, allowNull: false },
    existingTireMake: { type: DataTypes.STRING(100), allowNull: false },
    tireSizeRequired: { type: DataTypes.STRING(50), allowNull: false },
    costCenter: { type: DataTypes.STRING(50), allowNull: false },
    presentKmReading: { type: DataTypes.INTEGER, allowNull: false },
    previousKmReading: { type: DataTypes.INTEGER, allowNull: false },
    tireWearPattern: { type: DataTypes.STRING(100), allowNull: false },
    comments: { type: DataTypes.TEXT },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "supervisor approved",
        "technical-manager approved",
        " engineer approved",
        "customer-officer approved",
        "approved",
        "rejected",
        "complete"
      ),
      defaultValue: "pending",
    },
    submittedAt: { type: DataTypes.DATE, allowNull: false },
    supervisor_notes: { type: DataTypes.TEXT },
    technical_manager_note: { type: DataTypes.TEXT },
    engineer_note: { type: DataTypes.TEXT },
    supervisorId: {
      type: DataTypes.INTEGER,
      allowNull: false, // or true if you want it optional
      references: {
        model: "users", // table name in your DB (usually lowercase plural)
        key: "id",
      },
    },
  },
  {
    tableName: "requests",
    timestamps: false,
  }
);

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
        data.userId,
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
    try {
      console.log("Looking for request with id:", id);
      const [rows] = await pool.query("SELECT * FROM requests WHERE id = ?", [
        id,
      ]);
      console.log("Query result:", rows);
      return rows[0];
    } catch (err) {
      console.error("Error in findById:", err);
      throw err;
    }
  }

  static async updateStatus(id, status) {
    await pool.query("UPDATE requests SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
  }

  static async findByUserId(userId) {
    return await Request.findAll({ where: { userId } });
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

module.exports = RequestModel;
module.exports.RequestModel = RequestModel;
