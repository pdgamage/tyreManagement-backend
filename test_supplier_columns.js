const { pool } = require("./config/db");

async function testSupplierColumns() {
  try {
    console.log("Testing supplier columns in requests table...");
    
    // Test if columns exist by describing the table
    const [columns] = await pool.query("DESCRIBE requests");
    console.log("Requests table columns:");
    columns.forEach(col => {
      if (col.Field.toLowerCase().includes('supplier')) {
        console.log(`✅ Found: ${col.Field} - ${col.Type} - ${col.Null}`);
      }
    });
    
    // Check if supplier columns exist
    const supplierColumns = columns.filter(col => 
      ['supplierName', 'supplierPhone', 'supplierEmail'].includes(col.Field)
    );
    
    if (supplierColumns.length === 0) {
      console.log("❌ No supplier columns found in requests table!");
      console.log("Available columns:", columns.map(c => c.Field).join(', '));
    } else {
      console.log(`✅ Found ${supplierColumns.length}/3 supplier columns`);
    }
    
    // Test a simple update to see if it works
    console.log("\nTesting UPDATE query...");
    try {
      await pool.query(
        `UPDATE requests SET 
         supplierName = ?, 
         supplierPhone = ?, 
         supplierEmail = ? 
         WHERE id = 999999`,
        ["Test Supplier", "1234567890", "test@supplier.com"]
      );
      console.log("✅ UPDATE query syntax is correct");
    } catch (updateError) {
      console.log("❌ UPDATE query failed:", updateError.message);
    }
    
  } catch (error) {
    console.error("Error testing supplier columns:", error.message);
  } finally {
    process.exit(0);
  }
}

testSupplierColumns();