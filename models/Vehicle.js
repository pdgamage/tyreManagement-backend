const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Define the Sequelize model for auto table creation
const VehicleModel = sequelize.define(
  "Vehicle",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vehicleNumber: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    make: { type: DataTypes.STRING(50) },
    model: { type: DataTypes.STRING(50) },
    year: { type: DataTypes.INTEGER },
    tireSize: { type: DataTypes.STRING(50) },
    department: { type: DataTypes.STRING(100) },
    status: { type: DataTypes.STRING(20) },
    registeredBy: { type: DataTypes.INTEGER, allowNull: false },
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
    year,
    tireSize,
    department,
    status,
    registeredBy,
  }) {
    const vehicle = await VehicleModel.create({
      vehicleNumber,
      make,
      model,
      year,
      tireSize,
      department,
      status,
      registeredBy,
    });
    return vehicle.get({ plain: true });
  }
}

module.exports = Vehicle;
module.exports.VehicleModel = VehicleModel; // Export the Sequelize model for associations/sync
