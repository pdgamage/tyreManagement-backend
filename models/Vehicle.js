const pool = require("../config/db");

class Vehicle {
  static async findAll() {
    const [rows] = await pool.query("SELECT * FROM vehicles");
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query("SELECT * FROM vehicles WHERE id = ?", [
      id,
    ]);
    return rows[0];
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
    const [result] = await pool.query(
      "INSERT INTO vehicles (vehicleNumber, make, model, year, tireSize, department, status, registeredBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        vehicleNumber,
        make,
        model,
        year,
        tireSize,
        department,
        status,
        registeredBy,
      ]
    );
    return { id: result.insertId, vehicleNumber };
  }
}

module.exports = Vehicle;
