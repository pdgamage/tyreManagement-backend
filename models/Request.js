const { sequelize } = require("../config/db");
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
        "engineer approved",
        "customer-officer approved",
        "approved",
        "rejected",
        "complete"
      ),
      defaultValue: "pending",
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "requests",
    timestamps: false,
  }
);

module.exports = RequestModel;
module.exports.RequestModel = RequestModel;
