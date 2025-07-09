const { pool } = require("../config/db");

exports.getAllSuppliers = async (req, res) => {
  try {
    const [suppliers] = await pool.query("SELECT * FROM supplier ORDER BY name");
    console.log(`Fetched ${suppliers.length} suppliers`);
    if (suppliers.length > 0) {
      console.log('Sample supplier:', JSON.stringify(suppliers[0], null, 2));
    }
    res.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getSupplierById = async (req, res) => {
  try {
    const [suppliers] = await pool.query("SELECT * FROM supplier WHERE id = ?", [req.params.id]);
    if (suppliers.length === 0) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    res.json(suppliers[0]);
  } catch (error) {
    console.error("Error fetching supplier:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const { name, email, phone, formsfree_key, formspree_key } = req.body;

    // Accept either formsfree_key or formspree_key
    const key = formsfree_key || formspree_key;

    if (!name || !email || !key) {
      return res.status(400).json({ error: "Name, email, and Formspree key are required" });
    }

    // Try to insert with the existing column name first
    try {
      const [result] = await pool.query(
        "INSERT INTO supplier (name, email, phone, formsfree_key) VALUES (?, ?, ?, ?)",
        [name, email, phone, key]
      );

      const [newSupplier] = await pool.query("SELECT * FROM supplier WHERE id = ?", [result.insertId]);
      res.status(201).json(newSupplier[0]);
    } catch (insertError) {
      // If that fails, try with formspree_key column name
      console.log('Trying alternative column name formspree_key');
      const [result] = await pool.query(
        "INSERT INTO supplier (name, email, phone, formspree_key) VALUES (?, ?, ?, ?)",
        [name, email, phone, key]
      );

      const [newSupplier] = await pool.query("SELECT * FROM supplier WHERE id = ?", [result.insertId]);
      res.status(201).json(newSupplier[0]);
    }
  } catch (error) {
    console.error("Error creating supplier:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const { name, email, phone, formsfree_key, formspree_key } = req.body;

    // Accept either formsfree_key or formspree_key
    const key = formsfree_key || formspree_key;

    // Try to update with the existing column name first
    try {
      const [result] = await pool.query(
        "UPDATE supplier SET name = ?, email = ?, phone = ?, formsfree_key = ? WHERE id = ?",
        [name, email, phone, key, req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Supplier not found" });
      }

      const [updatedSupplier] = await pool.query("SELECT * FROM supplier WHERE id = ?", [req.params.id]);
      res.json(updatedSupplier[0]);
    } catch (updateError) {
      // If that fails, try with formspree_key column name
      console.log('Trying alternative column name formspree_key for update');
      const [result] = await pool.query(
        "UPDATE supplier SET name = ?, email = ?, phone = ?, formspree_key = ? WHERE id = ?",
        [name, email, phone, key, req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Supplier not found" });
      }

      const [updatedSupplier] = await pool.query("SELECT * FROM supplier WHERE id = ?", [req.params.id]);
      res.json(updatedSupplier[0]);
    }
  } catch (error) {
    console.error("Error updating supplier:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM supplier WHERE id = ?", [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
