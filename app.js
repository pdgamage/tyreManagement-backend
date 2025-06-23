const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const passport = require("./middleware/azureAuth");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));

// Routes
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.get(
  "/api/azure-protected",
  passport.authenticate("oauth-bearer", { session: false }),
  (req, res) => {
    res.json({ user: req.user });
  }
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

module.exports = app;
