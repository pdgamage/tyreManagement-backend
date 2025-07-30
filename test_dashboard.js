const { pool } = require("./config/db");

async function testDashboard() {
  try {
    console.log("Testing Customer Officer Dashboard queries...");
    
    // Test total requests count
    const [totalRequestsResult] = await pool.query(
      "SELECT COUNT(*) as count FROM requests"
    );
    console.log("Total Requests:", totalRequestsResult[0].count);

    // Test pending requests count (ready for order)
    const [pendingRequestsResult] = await pool.query(
      `SELECT COUNT(*) as count FROM requests 
       WHERE status = 'complete'`
    );
    console.log("Ready for Order:", pendingRequestsResult[0].count);

    // Test place order count
    const [placeOrderCountResult] = await pool.query(
      `SELECT COUNT(*) as count FROM requests 
       WHERE status = 'order placed'`
    );
    console.log("Orders Placed:", placeOrderCountResult[0].count);

    // Test today's orders count
    const [todayOrdersResult] = await pool.query(
      `SELECT COUNT(*) as count FROM requests 
       WHERE status = 'order placed' 
       AND DATE(submittedAt) = CURDATE()`
    );
    console.log("Today's Orders:", todayOrdersResult[0].count);

    console.log("\n✅ Dashboard queries working correctly!");
    
  } catch (error) {
    console.error("❌ Error testing dashboard:", error.message);
  } finally {
    process.exit(0);
  }
}

testDashboard();