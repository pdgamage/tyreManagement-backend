const Supplier = require('../models/Supplier');

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single supplier
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new supplier
exports.createSupplier = async (req, res) => {
  try {
    const newSupplier = await Supplier.create(req.body);
    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create supplier' });
  }
};

// Update a supplier
exports.updateSupplier = async (req, res) => {
  try {
    const updatedSupplier = await Supplier.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });
    res.json(updatedSupplier);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update supplier' });
  }
};

// Delete a supplier
exports.deleteSupplier = async (req, res) => {
  try {
    await Supplier.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
};