const { pool } = require("../config/db");

exports.getCustomerOfficerDashboard = async (req, res) => {
  try {
    console.log("Fetching customer officer dashboard data...");

    // Get total requests count
    const [totalRequestsResult] = await pool.query(
      "SELECT COUNT(*) as count FROM requests"
    );
    const totalRequests = totalRequestsResult[0].count;

    // Get pending requests count (requests ready for customer officer to place orders)
    const [pendingRequestsResult] = await pool.query(
      `SELECT COUNT(*) as count FROM requests 
       WHERE status = 'complete'`
    );
    const pendingRequests = pendingRequestsResult[0].count;

    // Get place order count (orders that have been placed by customer officer)
    const [placeOrderCountResult] = await pool.query(
      `SELECT COUNT(*) as count FROM requests 
       WHERE status = 'order placed'`
    );
    const placeOrderCount = placeOrderCountResult[0].count;

    // Get today's orders count
    const [todayOrdersResult] = await pool.query(
      `SELECT COUNT(*) as count FROM requests 
       WHERE status = 'order placed' 
       AND DATE(submittedAt) = CURDATE()`
    );
    const todayOrders = todayOrdersResult[0].count;

    const dashboardData = {
      cards: [
        {
          title: "Total Requests",
          count: totalRequests,
          icon: "📋",
          color: "blue",
          description: "All tire requests in system"
        },
        {
          title: "Ready for Order",
          count: pendingRequests,
          icon: "⏳",
          color: "orange",
          description: "Requests ready to place orders"
        },
        {
          title: "Orders Placed",
          count: placeOrderCount,
          icon: "📦",
          color: "green",
          description: "Total orders placed with suppliers"
        },
        {
          title: "Today's Orders",
          count: todayOrders,
          icon: "🕒",
          color: "purple",
          description: "Orders placed today"
        }
      ],
      summary: {
        totalRequests,
        pendingRequests,
        placeOrderCount,
        todayOrders
      }
    };

    console.log("Customer Officer Dashboard data:", dashboardData);
    res.json(dashboardData);

  } catch (error) {
    console.error("Error fetching customer officer dashboard data:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: "Failed to fetch dashboard data"
    });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const { role } = req.query;

    if (role === 'customer-officer') {
      return exports.getCustomerOfficerDashboard(req, res);
    }

    // Default dashboard for other roles
    const [totalRequestsResult] = await pool.query(
      "SELECT COUNT(*) as count FROM requests"
    );
    const totalRequests = totalRequestsResult[0].count;

    const [pendingRequestsResult] = await pool.query(
      `SELECT COUNT(*) as count FROM requests 
       WHERE status NOT IN ('order placed', 'complete', 'rejected')`
    );
    const pendingRequests = pendingRequestsResult[0].count;

    const [completedRequestsResult] = await pool.query(
      `SELECT COUNT(*) as count FROM requests 
       WHERE status IN ('order placed', 'complete')`
    );
    const completedRequests = completedRequestsResult[0].count;

    const [rejectedRequestsResult] = await pool.query(
      `SELECT COUNT(*) as count FROM requests 
       WHERE status LIKE '%rejected%'`
    );
    const rejectedRequests = rejectedRequestsResult[0].count;

    res.json({
      totalRequests,
      pendingRequests,
      completedRequests,
      rejectedRequests
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: "Failed to fetch dashboard stats"
    });
  }
};