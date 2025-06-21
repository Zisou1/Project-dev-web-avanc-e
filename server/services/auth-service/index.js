require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const { initializeDatabase } = require('../../shared/database');

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 3001;

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
    service: 'auth-service'
  });
});

app.use('/api/auth', authRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🔐 Auth Service is running on port ${PORT}`);
});

module.exports = app;
