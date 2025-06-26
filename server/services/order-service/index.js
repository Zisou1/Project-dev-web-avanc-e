require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const orderRoutes = require('./routes/orderRoutes');
const { initializeDatabase } = require('../../shared/database');

const app = express();
const PORT = process.env.ORDER_SERVICE_PORT || 3003;

// Initialize database connection asynchronously
initializeDatabase().then(() => {
  console.log('🗄️ Database initialization completed');
}).catch((error) => {
  console.error('❌ Database initialization failed:', error);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'order-service'
  });
});

app.use('/api/orders', orderRoutes);


// Start server
app.listen(PORT, () => {
  console.log(`📦 Order Service is running on port ${PORT}`);
});

module.exports = app;
