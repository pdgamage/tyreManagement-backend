require("dotenv").config();
const mysql = require("mysql2/promise");
const { Sequelize } = require("sequelize");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  }
);

const syncAndAlterDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to the database for schema alteration.");

    // Check vehicles table for cost_centre and department columns
    const [vehiclesColumns] = await connection.query(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'vehicles' AND COLUMN_NAME IN ('cost_centre', 'department')",
      [process.env.DB_NAME]
    );

    const hasColumns = {
      cost_centre: vehiclesColumns.some(col => col.COLUMN_NAME === 'cost_centre'),
      department: vehiclesColumns.some(col => col.COLUMN_NAME === 'department')
    };

    if (!hasColumns.cost_centre || !hasColumns.department) {
      // Add missing columns
      if (!hasColumns.cost_centre) {
        await connection.query("ALTER TABLE vehicles ADD COLUMN cost_centre VARCHAR(50);");
        console.log("Added cost_centre column to vehicles table");
      }
      if (!hasColumns.department) {
        await connection.query("ALTER TABLE vehicles ADD COLUMN department VARCHAR(50);");
        console.log("Added department column to vehicles table");
      }

      // Update existing records with user data
      await connection.query(`
        UPDATE vehicles v 
        JOIN users u ON v.registered_by = u.id 
        SET v.cost_centre = u.cost_centre, 
            v.department = u.department 
        WHERE v.cost_centre IS NULL OR v.department IS NULL;
      `);
      console.log("Updated existing vehicles with cost_centre and department data");
    }

    // Original requests table check
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'requests'",
      [process.env.DB_NAME]
    );

    if (tables.length > 0) {
      const [columns] = await connection.query(
        "SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'requests' AND COLUMN_NAME = 'status'",
        [process.env.DB_NAME]
      );

      if (columns.length > 0) {
        const column = columns[0];
        if (column.DATA_TYPE !== "varchar" || column.CHARACTER_MAXIMUM_LENGTH < 50) {
          await connection.query("ALTER TABLE requests MODIFY COLUMN status VARCHAR(50);");
          console.log("Successfully altered 'requests' table: 'status' column is now VARCHAR(50).");
        }
      }
    }

    connection.release();
  } catch (error) {
    console.error("Failed to alter database schema:", error);
    console.log("Continuing with Sequelize sync...");
  }
};

module.exports = { pool, sequelize, syncAndAlterDatabase };
