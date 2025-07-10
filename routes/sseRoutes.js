const express = require('express');
const router = express.Router();

// Store active SSE connections
const sseConnections = new Map();

// SSE endpoint for real-time updates
router.get('/events', (req, res) => {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Generate unique connection ID
  const connectionId = Date.now() + Math.random();
  
  // Store connection
  sseConnections.set(connectionId, res);
  
  console.log(`SSE client connected: ${connectionId}`);
  
  // Send initial connection message
  res.write(`data: ${JSON.stringify({
    type: 'CONNECTED',
    message: 'SSE connection established',
    timestamp: new Date().toISOString()
  })}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    console.log(`SSE client disconnected: ${connectionId}`);
    sseConnections.delete(connectionId);
  });

  req.on('aborted', () => {
    console.log(`SSE client aborted: ${connectionId}`);
    sseConnections.delete(connectionId);
  });
});

// Function to broadcast updates to all connected clients
function broadcastUpdate(data) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  
  sseConnections.forEach((res, connectionId) => {
    try {
      res.write(message);
    } catch (error) {
      console.error(`Error sending SSE message to ${connectionId}:`, error);
      sseConnections.delete(connectionId);
    }
  });
  
  console.log(`Broadcasted update to ${sseConnections.size} clients`);
}

// Export the broadcast function
router.broadcastUpdate = broadcastUpdate;

module.exports = router;
