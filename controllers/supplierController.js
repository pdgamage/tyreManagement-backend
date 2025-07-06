const { Supplier } = require("../models/Supplier");

exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.getAll();
    res.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
};

exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.getById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    res.json(supplier);
  } catch (error) {
    console.error("Error fetching supplier:", error);
    res.status(500).json({ error: "Failed to fetch supplier" });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const { name, email, phone, formsfree_key } = req.body;
    
    if (!name || !email || !formsfree_key) {
      return res.status(400).json({ error: "Name, email, and formsfree_key are required" });
    }

    const result = await Supplier.create({ name, email, phone, formsfree_key });
    res.status(201).json({ message: "Supplier created successfully", id: result.id });
  } catch (error) {
    console.error("Error creating supplier:", error);
    res.status(500).json({ error: "Failed to create supplier" });
  }
};
