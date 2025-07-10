const { Server } = require("socket.io");

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // Store user connections
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: [
          "http://localhost:5173",
          "https://tyremanagement-frontend.vercel.app",
          "https://tyremanagement-frontend-production.up.railway.app",
          process.env.FRONTEND_URL,
          "*", // Allow all origins for testing
        ].filter(Boolean),
        methods: ["GET", "POST", "OPTIONS"],
        credentials: true,
      },
      transports: ["polling", "websocket"], // Try polling first, then upgrade to websocket
      pingTimeout: 30000,
      pingInterval: 10000,
      upgradeTimeout: 15000,
      allowEIO3: true,
      connectTimeout: 45000,
      path: "/socket.io/", // Default path
    });

    this.io.on("connection", (socket) => {
      console.log("🟢 User connected:", socket.id);

      // Send immediate ping to test connection
      socket.emit("ping", {
        message: "Connected to WebSocket server",
        timestamp: new Date().toISOString(),
      });

      // Setup ping interval to keep connection alive
      const pingInterval = setInterval(() => {
        if (socket.connected) {
          socket.emit("ping", { timestamp: new Date().toISOString() });
        } else {
          clearInterval(pingInterval);
        }
      }, 25000);

      // Handle user authentication/identification
      socket.on("authenticate", (userData) => {
        if (userData && userData.id) {
          this.connectedUsers.set(socket.id, userData);
          socket.join(`user_${userData.id}`); // Join user-specific room
          socket.join(`role_${userData.role}`); // Join role-specific room
          console.log(
            `🔑 User ${userData.id} (${userData.role}) authenticated`
          );

          // Send confirmation back to client
          socket.emit("authenticated", {
            success: true,
            message: `Authenticated as ${userData.role}`,
            userId: userData.id,
          });
        }
      });

      // Handle ping response
      socket.on("pong", (data) => {
        console.log(`📡 Received pong from ${socket.id}:`, data);
      });

      // Handle disconnection
      socket.on("disconnect", (reason) => {
        const userData = this.connectedUsers.get(socket.id);
        if (userData) {
          console.log(`🔴 User ${userData.id} disconnected: ${reason}`);
          this.connectedUsers.delete(socket.id);
        } else {
          console.log(`🔴 Anonymous user disconnected: ${reason}`);
        }
        clearInterval(pingInterval);
      });
    });

    return this.io;
  }

  // Broadcast request updates to all relevant users
  broadcastRequestUpdate(request, action = "updated") {
    if (!this.io) {
      console.log("❌ WebSocket not initialized, cannot broadcast");
      return;
    }

    const updateData = {
      type: "REQUEST_UPDATE",
      action, // 'created', 'updated', 'deleted'
      request,
      timestamp: new Date().toISOString(),
    };

    console.log(
      `🔥 Broadcasting ${action} for request ${request.id} to ${this.connectedUsers.size} connected users`
    );

    // Broadcast to all users (they'll filter on frontend based on their role)
    this.io.emit("requestUpdate", updateData);

    // Also broadcast to specific roles
    this.io.to("role_user").emit("requestUpdate", updateData);
    this.io.to("role_supervisor").emit("requestUpdate", updateData);
    this.io.to("role_technical-manager").emit("requestUpdate", updateData);
    this.io.to("role_engineer").emit("requestUpdate", updateData);

    console.log(
      `✅ Broadcasted ${action} for request ${request.id} - Status: ${request.status}`
    );
  }

  // Broadcast to specific user
  broadcastToUser(userId, eventName, data) {
    if (!this.io) return;
    this.io.to(`user_${userId}`).emit(eventName, data);
  }

  // Broadcast to specific role
  broadcastToRole(role, eventName, data) {
    if (!this.io) return;
    this.io.to(`role_${role}`).emit(eventName, data);
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get connected users by role
  getConnectedUsersByRole(role) {
    const users = Array.from(this.connectedUsers.values());
    return users.filter((user) => user.role === role);
  }
}

// Export singleton instance
module.exports = new WebSocketService();
