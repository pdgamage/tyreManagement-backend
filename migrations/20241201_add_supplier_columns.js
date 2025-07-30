require("dotenv").config();
const { pool } = require("../config/db");

async function addSupplierColumns() {
  try {
    console.log("Adding supplier columns to requests table...");
    
    // Check if columns already exist
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'requests' 
      AND COLUMN_NAME IN ('supplierName', 'supplierPhone', 'supplierEmail')
    `, [process.env.DB_NAME]);
    
    if (columns.length > 0) {
      console.log("Supplier columns already exist, skipping migration");
      return;
    }
    
    // Add the new supplier columns one by one to avoid syntax issues
    try {
      await pool.query(`
        ALTER TABLE requests 
        ADD COLUMN supplierName VARCHAR(100) NULL
      `);
      console.log("Added supplierName column");
    } catch (error) {
      if (!error.message.includes("Duplicate column name")) {
        throw error;
      }
    }
    
    try {
      await pool.query(`
        ALTER TABLE requests 
        ADD COLUMN supplierPhone VARCHAR(20) NULL
      `);
      console.log("Added supplierPhone column");
    } catch (error) {
      if (!error.message.includes("Duplicate column name")) {
        throw error;
      }
    }
    
    try {
      await pool.query(`
        ALTER TABLE requests 
        ADD COLUMN supplierEmail VARCHAR(100) NULL
      `);
      console.log("Added supplierEmail column");
    } catch (error) {
      if (!error.message.includes("Duplicate column name")) {
        throw error;
      }
    }
    
    console.log("Successfully added supplier columns to requests table");
  } catch (error) {
    console.error("Error adding supplier columns:", error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  addSupplierColumns()
    .then(() => {
      console.log("Migration completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

module.exports = { addSupplierColumns };