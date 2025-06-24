require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const restaurantRoutes = require('./routes/restaurantRoutes');
const errorHandler = require('./middleware/errorHandler');
const { initializeDatabase } = require('../../shared/database');

const app = express();
const PORT = process.env.RESTAURANT_SERVICE_PORT || 3005;
require('./models/Restaurant');


initializeDatabase().then(() => {
  console.log('🗄️ Database initialization completed');
}).catch((error) => {
  console.error('❌ Database initialization failed:', error);
});


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'restaurant-service',
  });
});

app.use('/api/restaurants', restaurantRoutes);


app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🍽️ Restaurant Service is running on port ${PORT}`);
});

module.exports = app;
