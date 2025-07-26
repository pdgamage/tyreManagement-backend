require("dotenv").config();
const app = require("./app");
const { sequelize, pool } = require("./config/db"); // Correct import
require("./models"); // Loads all models and associations
// const requestRoutes = require("./routes/requestRoutes"); // Removed - already imported in app.js
// const vehicleRoutes = require("./routes/vehicleRoutes"); // Removed - already imported in app.js
// const sseRoutes = require("./routes/sseRoutes"); // Disabled
// const websocketService = require("./services/websocketService"); // Disabled
const http = require("http");

const port = process.env.PORT || 5000;

// Import models so they are registered
require("./models/User");
require("./models/Vehicle");
require("./models/Request");
require("./models/RequestImage");
require("./models/TireDetails");
require("./models/Supplier");

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

// Routes are already mounted in app.js, no need to mount them again here
// app.use("/api", requestRoutes); // Removed - already mounted in app.js
// app.use("/api", vehicleRoutes); // Removed - already mounted in app.js
// app.use("/api/sse", sseRoutes); // Disabled

// Create HTTP server
const server = http.createServer(app);

// WebSocket disabled for Railway compatibility
// websocketService.initialize(server);

// Start server
server.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`WebSocket server initialized`);
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
