const { sequelize, pool } = require("../config/db");
const { DataTypes } = require("sequelize");

// Sequelize model for auto table creation
const SupplierModel = sequelize.define(
  "Supplier",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false },
    phone: { type: DataTypes.STRING(20) },
    formsfree_key: { type: DataTypes.STRING(255), allowNull: false },
  },
  {
    tableName: "supplier",
    timestamps: false,
  }
);

// Class for custom methods
class Supplier {
  static async getAll() {
    try {
      const [rows] = await pool.query("SELECT * FROM supplier ORDER BY name");
      return rows;
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.query("SELECT * FROM supplier WHERE id = ?", [id]);
      return rows[0] || null;
    } catch (error) {
      console.error("Error fetching supplier by ID:", error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const [result] = await pool.query(
        "INSERT INTO supplier (name, email, phone, formsfree_key) VALUES (?, ?, ?, ?)",
        [data.name, data.email, data.phone, data.formsfree_key]
      );
      return { id: result.insertId };
    } catch (error) {
      console.error("Error creating supplier:", error);
      throw error;
    }
  }
}

module.exports = SupplierModel;
module.exports.Supplier = Supplier;
module.exports.SupplierModel = SupplierModel;
