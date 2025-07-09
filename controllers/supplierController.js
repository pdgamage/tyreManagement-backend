const { pool } = require("../config/db");
const { sendOrderEmail } = require("../utils/orderEmailService");

exports.getAllSuppliers = async (req, res) => {
  try {
    const [suppliers] = await pool.query("SELECT * FROM supplier ORDER BY name");
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
    const { name, email, phone, formsfree_key } = req.body;
    
    if (!name || !email || !formsfree_key) {
      return res.status(400).json({ error: "Name, email, and formsfree_key are required" });
    }

    const [result] = await pool.query(
      "INSERT INTO supplier (name, email, phone, formsfree_key) VALUES (?, ?, ?, ?)",
      [name, email, phone, formsfree_key]
    );

    const [newSupplier] = await pool.query("SELECT * FROM supplier WHERE id = ?", [result.insertId]);
    res.status(201).json(newSupplier[0]);
  } catch (error) {
    console.error("Error creating supplier:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const { name, email, phone, formsfree_key } = req.body;
    
    const [result] = await pool.query(
      "UPDATE supplier SET name = ?, email = ?, phone = ?, formsfree_key = ? WHERE id = ?",
      [name, email, phone, formsfree_key, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    const [updatedSupplier] = await pool.query("SELECT * FROM supplier WHERE id = ?", [req.params.id]);
    res.json(updatedSupplier[0]);
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

// Place order with selected supplier
exports.placeOrder = async (req, res) => {
  try {
    const { supplierId, requestId, orderNotes } = req.body;

    console.log(`📦 Placing order - Supplier: ${supplierId}, Request: ${requestId}`);

    // Validate input
    if (!supplierId || !requestId) {
      return res.status(400).json({
        success: false,
        message: 'Supplier ID and Request ID are required'
      });
    }

    // Get supplier details
    const [suppliers] = await pool.query(
      'SELECT id, name, email, phone, formsfree_key FROM supplier WHERE id = ?',
      [supplierId]
    );

    if (suppliers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    const supplier = suppliers[0];

    // Get request details
    const [requests] = await pool.query(
      'SELECT * FROM requests WHERE id = ?',
      [requestId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = requests[0];

    // Check if request is complete
    if (request.status !== 'complete') {
      return res.status(400).json({
        success: false,
        message: 'Only complete requests can have orders placed'
      });
    }

    // Check if order already placed
    if (request.order_placed === 1) {
      return res.status(400).json({
        success: false,
        message: 'Order has already been placed for this request'
      });
    }

    // Send email to supplier
    const emailResult = await sendOrderEmail(supplier, request, orderNotes);

    // Update request with order status
    await pool.query(
      'UPDATE requests SET order_placed = true, order_timestamp = NOW() WHERE id = ?',
      [requestId]
    );

    console.log('✅ Order placed successfully');

    res.json({
      success: true,
      message: 'Order placed successfully',
      supplier: supplier.name,
      email: supplier.email,
      emailResult: emailResult
    });

  } catch (error) {
    console.error('❌ Error placing order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place order',
      error: error.message
    });
  }
};
