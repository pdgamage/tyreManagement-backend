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

    // Alter status column
    try {
      await connection.query(
        "ALTER TABLE requests MODIFY COLUMN status VARCHAR(50);"
      );
      console.log(
        "Successfully altered 'requests' table: 'status' column is now VARCHAR(50)."
      );
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        console.log("Status column already altered.");
      } else {
        console.log("Status column alteration skipped:", error.message);
      }
    }

    // Add supplier columns
    const { addSupplierColumns } = require("../migrations/add_supplier_columns");
    await addSupplierColumns();

    connection.release();
  } catch (error) {
    console.error("Failed to alter database schema:", error);
    // Don't exit the process, just log the error
    console.log("Continuing without schema changes...");
  }
};

module.exports = { pool, sequelize, syncAndAlterDatabase };
