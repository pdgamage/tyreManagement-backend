const { TireDetails } = require("../models/TireDetails");

// Get all tire details
exports.getAllTireDetails = async (req, res) => {
  try {
    const tireDetails = await TireDetails.findAll();
    res.json(tireDetails);
  } catch (err) {
    console.error("Error fetching tire details:", err);
    res.status(500).json({ error: "Failed to fetch tire details" });
  }
};

// Get tire details by tire size
exports.getTireDetailsBySize = async (req, res) => {
  try {
    const { tireSize } = req.params;
    const tireDetail = await TireDetails.findByTireSize(tireSize);
    
    if (!tireDetail) {
      return res.status(404).json({ error: "Tire details not found for this size" });
    }
    
    res.json(tireDetail);
  } catch (err) {
    console.error("Error fetching tire details by size:", err);
    res.status(500).json({ error: "Failed to fetch tire details" });
  }
};

// Create new tire details
exports.createTireDetails = async (req, res) => {
  try {
    const { tire_size, tire_brand, total_price, warranty_distance } = req.body;

    if (!tire_size || !tire_brand || !total_price || !warranty_distance) {
      return res.status(400).json({ 
        error: "All fields are required: tire_size, tire_brand, total_price, warranty_distance" 
      });
    }

    const tireDetail = await TireDetails.create({
      tire_size,
      tire_brand,
      total_price,
      warranty_distance,
    });

    res.status(201).json(tireDetail);
  } catch (err) {
    console.error("Error creating tire details:", err);
    res.status(500).json({ error: "Failed to create tire details" });
  }
};
