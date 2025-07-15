const { sequelize, pool } = require("../config/db");
const { DataTypes } = require("sequelize");

// Define the Sequelize model for auto table creation
const VehicleModel = sequelize.define(
  "Vehicle",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    registeredBy: { type: DataTypes.INTEGER, allowNull: false },
    vehicleNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    make: { type: DataTypes.STRING(50) },
    model: { type: DataTypes.STRING(50) },
    type: { type: DataTypes.STRING(50) },
    costCentre: { type: DataTypes.STRING(100) },
    department: { type: DataTypes.STRING(100) },
    status: { type: DataTypes.STRING(20) },
  },
  {
    tableName: "vehicles",
    timestamps: false,
  }
);

// Keep your existing class and methods, but use Sequelize for queries if you want
class Vehicle {
  static async findAll() {
    // Use Sequelize for consistency, or keep your pool.query if you prefer
    return await VehicleModel.findAll({ raw: true });
  }

  static async findById(id) {
    return await VehicleModel.findByPk(id, { raw: true });
  }

  static async create({
    vehicleNumber,
    make,
    model,
    type,
    costCentre,
    department,
    status,
    registeredBy,
  }) {
    const vehicle = await VehicleModel.create({
      vehicleNumber,
      make,
      model,
      type,
      costCentre,
      department,
      status,
      registeredBy,
    });
    return vehicle.get({ plain: true });
  }
}

module.exports = VehicleModel;
module.exports.VehicleModel = VehicleModel; // Export the Sequelize model for associations/sync
