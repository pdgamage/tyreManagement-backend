require("dotenv").config();
const app = require("./app");
const { sequelize, pool } = require("./config/db"); // Correct import
require("./models"); // Loads all models and associations
const requestRoutes = require("./routes/requestRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");

const port = process.env.PORT || 5000;

// Import models so they are registered
require("./models/User");
require("./models/Vehicle");
require("./models/Request");
require("./models/RequestImage");

// Test database connection
async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log("MySQL pool connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the MySQL pool:", error);
    process.exit(1);
  }
}

// Middleware for routes
app.use("/api", requestRoutes);
app.use("/api", vehicleRoutes);

// Start server
app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);
  await testDbConnection();
});

// Sync models
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database & tables synced!");
  })
  .catch((err) => {
    console.error("Unable to sync database:", err);
  });
