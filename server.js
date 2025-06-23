require("dotenv").config();
const app = require("./app");
const sequelize = require("./config/db");
require("./models"); // Loads all models and associations

const port = process.env.PORT || 5000;

// Test database connection
async function testDbConnection() {
  try {
    const connection = await sequelize.getConnection();
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

sequelize
  .sync({ alter: true }) // Use { force: true } only for development
  .then(() => {
    console.log("Database & tables synced!");
  })
  .catch((err) => {
    console.error("Unable to sync database:", err);
  });
