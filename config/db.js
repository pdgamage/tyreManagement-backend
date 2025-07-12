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

    await connection.query(
      "ALTER TABLE requests MODIFY COLUMN status VARCHAR(50);"
    );
    console.log(
      "Successfully altered 'requests' table: 'status' column is now VARCHAR(50)."
    );

    connection.release();
  } catch (error) {
    if (error.code === "ER_DUP_FIELDNAME") {
      console.log("Schema already altered.");
    } else {
      console.error("Failed to alter database schema:", error);
      process.exit(1);
    }
  }
};

module.exports = { pool, sequelize, syncAndAlterDatabase };
