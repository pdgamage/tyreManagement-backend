const { pool } = require("../config/db");

const addSupplierColumns = async () => {
  try {
    console.log("Checking and adding supplier columns to requests table...");
    
    // Check if columns exist
    const [columns] = await pool.query("DESCRIBE requests");
    const existingColumns = columns.map(col => col.Field);
    
    const supplierColumns = [
      { name: 'supplierName', type: 'VARCHAR(100)' },
      { name: 'supplierPhone', type: 'VARCHAR(20)' },
      { name: 'supplierEmail', type: 'VARCHAR(100)' }
    ];
    
    for (const column of supplierColumns) {
      if (!existingColumns.includes(column.name)) {
        console.log(`Adding column: ${column.name}`);
        await pool.query(`ALTER TABLE requests ADD COLUMN ${column.name} ${column.type} NULL`);
        console.log(`✅ Added column: ${column.name}`);
      } else {
        console.log(`✅ Column already exists: ${column.name}`);
      }
    }
    
    console.log("Supplier columns migration completed successfully!");
    
  } catch (error) {
    console.error("Error adding supplier columns:", error.message);
    throw error;
  }
};

module.exports = { addSupplierColumns };