require("dotenv").config();
const app = require("./app");
const pool = require("./config/db");
const requestRoutes = require("./routes/requestRoutes");

const port = process.env.PORT || 5000;

// Test database connection
async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Successfully connected to the database");
    connection.release();
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

// Middleware for routes
app.use("/api", requestRoutes);

// Start server
app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);
  await testDbConnection();
});
