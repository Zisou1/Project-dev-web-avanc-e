require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const path = require('path');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');



// App setup
const app = express();
const server = http.createServer(app);
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 3008;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory connected clients
const connectedClients = {};       // { user_id: socketId }
const connectedRestaurants = {};   // { restaurant_id: socketId }

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`📡 New client connected: ${socket.id}`);

  socket.on('register', ({ user_id, restaurant_id }) => {
    console.log('📝 Registration request received:', { user_id, restaurant_id });
    
    if (user_id) {
      connectedClients[user_id] = socket.id;
      console.log(`✅ Registered client as User ${user_id} with socket ${socket.id}`);
      console.log('👥 All connected clients:', Object.keys(connectedClients));
    }
    
    if (restaurant_id) {
      connectedRestaurants[restaurant_id] = socket.id;
      console.log(`✅ Registered client as Restaurant ${restaurant_id} with socket ${socket.id}`);
      console.log('🏪 All connected restaurants:', Object.keys(connectedRestaurants));
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
    for (const [id, sock] of Object.entries(connectedClients)) {
      if (sock === socket.id) delete connectedClients[id];
    }
    for (const [id, sock] of Object.entries(connectedRestaurants)) {
      if (sock === socket.id) delete connectedRestaurants[id];
    }
  });
});

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'notification-service',
  });
});

// Notify user
app.post('/notifications', (req, res) => {
  const { user_id, message } = req.body;
  const socketId = connectedClients[user_id];

  if (socketId) {
    io.to(socketId).emit('user-notification', { message });
    return res.status(200).json({ message: '📨 Notification sent to user' });
  }

  res.status(404).json({ error: 'User not connected' });
});

// Notify restaurant
app.post('/notify/restaurant', (req, res) => {
  const { restaurant_id, message } = req.body;
  console.log('🔍 Notification request for restaurant_id:', restaurant_id);
  console.log('📋 Connected restaurants:', Object.keys(connectedRestaurants));
  console.log('🔗 Full connected restaurants:', connectedRestaurants);
  
  const socketId = connectedRestaurants[restaurant_id];

  if (socketId) {
    io.to(socketId).emit('restaurant-notification', { message });
    return res.status(200).json({ message: '📨 Notification sent to restaurant' });
  }

  res.status(404).json({ error: 'Restaurant not connected' });
});

// Start server
server.listen(PORT, () => {
  console.log(`🔔 Notification Service is running on port ${PORT}`);
});

app.get('/debug/restaurants', (req, res) => {
  res.json({ connectedRestaurants });
});

app.get('/debug/clients', (req, res) => {
  res.json({ 
    connectedClients,
    connectedRestaurants 
  });
});

module.exports = app;
