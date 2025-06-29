const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../server/.env') });

const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'zaki2king',
  database: process.env.DB_DATABASE || 'yumzo'
};

async function resetDatabase() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(DB_CONFIG);
    
    console.log('🗑️ Clearing existing data...');
    
    // Delete data in correct order (respecting foreign key constraints)
    await connection.execute('DELETE FROM order_items');
    await connection.execute('DELETE FROM menuItems');
    await connection.execute('DELETE FROM Deliverys');
    await connection.execute('DELETE FROM orders');
    await connection.execute('DELETE FROM items');
    await connection.execute('DELETE FROM menus');
    await connection.execute('DELETE FROM restaurants');
    await connection.execute('DELETE FROM users');
    
    console.log('✅ All existing data cleared');
    
    console.log('👤 Creating test users...');
    
    // Create test users with hashed passwords (bcrypt hash for "password123")
    const hashedPassword = '$2a$10$CwTycUXWue0Thq9StjUM0uBbRFxEZ8YUByZLLCrEeSoV6Q0OBTvOe';
    
    // Insert users
    await connection.execute(`
      INSERT INTO users (id, name, email, password, phone, role, isActive, createdAt, updatedAt) VALUES
      (1, 'John Delivery', 'delivery@test.com', ?, '1234567890', 'delivery', true, NOW(), NOW()),
      (2, 'Jane Restaurant', 'restaurant@test.com', ?, '1234567891', 'restaurant', true, NOW(), NOW()),
      (3, 'Bob Customer', 'customer@test.com', ?, '1234567892', 'customer', true, NOW(), NOW()),
      (4, 'Alice Delivery', 'delivery2@test.com', ?, '1234567893', 'delivery', true, NOW(), NOW()),
      (5, 'Tom Restaurant', 'restaurant2@test.com', ?, '1234567894', 'restaurant', true, NOW(), NOW())
    `, [hashedPassword, hashedPassword, hashedPassword, hashedPassword, hashedPassword]);
    
    console.log('🏪 Creating test restaurants...');
    
    // Insert restaurants
    await connection.execute(`
      INSERT INTO restaurants (id, user_id, name, kitchen_type, imageUrl, description, timeStart, timeEnd, address, createdAt, updatedAt) VALUES
      (1, 2, 'Pizza Paradise', 'Italian', '/uploads/pizza.jpg', 'Best Italian pizza in town', '10:00:00', '22:00:00', '123 Pizza Street', NOW(), NOW()),
      (2, 5, 'Burger Master', 'American', '/uploads/burger.jpg', 'Gourmet burgers and fries', '11:00:00', '23:00:00', '456 Burger Ave', NOW(), NOW())
    `);
    
    console.log('🍕 Creating test items...');
    
    // Insert items for restaurants
    await connection.execute(`
      INSERT INTO items (id, restaurant_id, name, price, status, imageUrl, description, createdAt, updatedAt) VALUES
      (1, 1, 'Margherita Pizza', 1200, true, '/uploads/margherita.jpg', 'Classic tomato and mozzarella pizza', NOW(), NOW()),
      (2, 1, 'Pepperoni Pizza', 1500, true, '/uploads/pepperoni.jpg', 'Pizza with spicy pepperoni', NOW(), NOW()),
      (3, 1, 'Caesar Salad', 800, true, '/uploads/caesar.jpg', 'Fresh Caesar salad with croutons', NOW(), NOW()),
      (4, 2, 'Classic Burger', 1000, true, '/uploads/classic-burger.jpg', 'Beef patty with lettuce and tomato', NOW(), NOW()),
      (5, 2, 'Cheese Fries', 600, true, '/uploads/cheese-fries.jpg', 'Crispy fries with melted cheese', NOW(), NOW()),
      (6, 2, 'Chicken Wings', 900, true, '/uploads/wings.jpg', 'Spicy buffalo chicken wings', NOW(), NOW())
    `);
    
    console.log('📋 Creating test menus...');
    
    // Insert menus
    await connection.execute(`
      INSERT INTO menus (id, restaurant_id, name, price, status, imageUrl, createdAt, updatedAt) VALUES
      (1, 1, 'Pizza Menu', 2000, true, '/uploads/pizza-menu.jpg', NOW(), NOW()),
      (2, 2, 'Burger Menu', 1800, true, '/uploads/burger-menu.jpg', NOW(), NOW())
    `);
    
    console.log('🔗 Creating menu-item relationships...');
    
    // Insert menu-item relationships
    await connection.execute(`
      INSERT INTO menuItems (menu_id, item_id, createdAt, updatedAt) VALUES
      (1, 1, NOW(), NOW()),
      (1, 2, NOW(), NOW()),
      (1, 3, NOW(), NOW()),
      (2, 4, NOW(), NOW()),
      (2, 5, NOW(), NOW()),
      (2, 6, NOW(), NOW())
    `);
    
    console.log('🛒 Creating test orders with items...');
    
    // Insert orders
    await connection.execute(`
      INSERT INTO orders (id, user_id, restaurant_id, status, timestamp, total_price, address, createdAt, updatedAt) VALUES
      (1, 3, 1, 'confirmed', NOW(), 20.00, '789 Customer Street', NOW(), NOW()),
      (2, 3, 2, 'confirmed', NOW(), 16.00, '321 Delivery Lane', NOW(), NOW()),
      (3, 3, 1, 'waiting for pickup', NOW(), 28.00, '555 Main Street', NOW(), NOW()),
      (4, 3, 2, 'confirmed', NOW(), 25.00, '777 Test Avenue', NOW(), NOW())
    `);
    
    console.log('📦 Creating order-item relationships...');
    
    // Insert order-item relationships (THIS IS THE KEY PART!)
    await connection.execute(`
      INSERT INTO order_items (order_id, item_id) VALUES
      (1, 1), (1, 3),
      (2, 4), (2, 5),
      (3, 1), (3, 2), (3, 3),
      (4, 4), (4, 6)
    `);
    
    console.log('🚚 Creating test deliveries...');
    
    // Insert deliveries for pickup orders
    await connection.execute(`
      INSERT INTO Deliverys (user_id, order_id, status, pickup_time, delivery_time, createdAt, updatedAt) VALUES
      (1, 3, true, NOW(), NULL, NOW(), NOW())
    `);
    
    console.log('✅ Database reset complete!');
    console.log('📊 Test data summary:');
    console.log('  - 5 users (2 delivery, 2 restaurant, 1 customer)');
    console.log('  - 2 restaurants (Pizza Paradise, Burger Master)');
    console.log('  - 6 items (3 pizza items, 3 burger items)');
    console.log('  - 2 menus with linked items');
    console.log('  - 4 orders with proper item relationships');
    console.log('  - 1 active delivery');
    console.log('');
    console.log('🔐 Test credentials:');
    console.log('  Delivery: delivery@test.com / password123');
    console.log('  Restaurant: restaurant@test.com / password123');
    console.log('  Customer: customer@test.com / password123');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log('🎉 Database reset completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database reset failed:', error);
      process.exit(1);
    });
}

module.exports = resetDatabase;