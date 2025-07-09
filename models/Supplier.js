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

// Class for custom methods (if needed)
class Supplier {
  static async findAll() {
    const [suppliers] = await pool.query("SELECT * FROM supplier ORDER BY name");
    return suppliers;
  }

  static async findByPk(id) {
    const [suppliers] = await pool.query("SELECT * FROM supplier WHERE id = ?", [id]);
    return suppliers.length > 0 ? suppliers[0] : null;
  }

  static async create(data) {
    const [result] = await pool.query(
      "INSERT INTO supplier (name, email, phone, formsfree_key) VALUES (?, ?, ?, ?)",
      [data.name, data.email, data.phone, data.formsfree_key]
    );

    const [newSupplier] = await pool.query("SELECT * FROM supplier WHERE id = ?", [result.insertId]);
    return newSupplier[0];
  }

  static async update(id, data) {
    const [result] = await pool.query(
      "UPDATE supplier SET name = ?, email = ?, phone = ?, formsfree_key = ? WHERE id = ?",
      [data.name, data.email, data.phone, data.formsfree_key, id]
    );

    if (result.affectedRows === 0) {
      return null;
    }

    const [updatedSupplier] = await pool.query("SELECT * FROM supplier WHERE id = ?", [id]);
    return updatedSupplier[0];
  }

  static async delete(id) {
    const [result] = await pool.query("DELETE FROM supplier WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}

module.exports = SupplierModel;
module.exports.Supplier = Supplier;
module.exports.SupplierModel = SupplierModel;