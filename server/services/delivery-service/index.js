require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const deliveryRoutes = require('./routes/deliveryRoutes');
const { initializeDatabase } = require('../../shared/database');

const app = express();
const PORT = process.env.DELIVERY_SERVICE_PORT || 3006;

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

app.use('/api/delivery', deliveryRoutes);


// Start server
app.listen(PORT, () => {
  console.log(`📦 Delivery Service is running on port ${PORT}`);
});

module.exports = app;
