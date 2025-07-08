const { pool } = require('./config/db');

async function applyOrderStatusMigration() {
  try {
    console.log('Applying order_status migration...');
    
    // Check if order_status column already exists
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'requests' 
      AND COLUMN_NAME = 'order_status'
    `);
    
    if (columns.length > 0) {
      console.log('order_status column already exists, skipping migration...');
      return;
    }
    
    // Add order_status column
    console.log('Adding order_status column...');
    await pool.query(`
      ALTER TABLE requests 
      ADD COLUMN order_status ENUM('pending', 'placed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending'
    `);
    console.log('✓ Added order_status column');
    
    // Update existing records where order was already placed
    console.log('Updating existing records...');
    const [updateResult] = await pool.query(`
      UPDATE requests 
      SET order_status = 'placed' 
      WHERE status = 'order placed' OR order_placed = true
    `);
    console.log(`✓ Updated ${updateResult.affectedRows} existing records`);
    
    console.log('Order status migration completed successfully!');
    
  } catch (error) {
    console.error('Error applying order status migration:', error);
  } finally {
    process.exit(0);
  }
}

applyOrderStatusMigration();
