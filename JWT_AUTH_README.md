# Yumzo Microservices - JWT Authentication Implementation

This is a microservices architecture for a food delivery platform with JWT authentication handled by the API Gateway.

## Project Structure

```
Project-dev-web-avanc-e/
├── README.md
├── package.json                     # Root package with development scripts
├── scripts/                         # Development and testing scripts
│   ├── start-dev.js                # Start API Gateway + Auth Service
│   └── test-auth.js                # JWT Authentication test suite
├── client/                          # Frontend (React/Vue/etc)
└── server/                          # Backend microservices
    ├── .env                        # Environment configuration
    ├── package.json                # Legacy server (can be removed)
    ├── services/                   # Microservices
    │   ├── api-gateway/            # Port 3000 - Entry point
    │   │   ├── package.json
    │   │   ├── index.js
    │   │   ├── middleware/
    │   │   │   ├── auth.js         # JWT verification
    │   │   │   ├── errorHandler.js
    │   │   │   └── logger.js
    │   │   └── config/
    │   │       └── services.js
    │   │
    │   ├── auth-service/           # Port 3001 - Authentication
    │   │   ├── package.json
    │   │   ├── index.js
    │   │   ├── controllers/
    │   │   │   └── authController.js
    │   │   ├── models/
    │   │   │   └── User.js
    │   │   ├── middleware/
    │   │   │   ├── errorHandler.js
    │   │   │   └── validation.js
    │   │   └── routes/
    │   │       └── authRoutes.js
    │   │
    │   └── [other-services]/       # Future services (user, restaurant, etc.)
    │
    └── shared/                     # Shared utilities across services
        ├── package.json
        ├── database/               # Database configuration
        │   ├── config.js          # Sequelize setup
        │   ├── connection.js      # Database connection
        │   └── index.js
        └── utils/                 # Shared utilities
            ├── constants.js       # Application constants
            ├── helpers.js         # Helper functions
            └── logger.js          # Logging utility
```

## JWT Authentication Flow

1. **Registration/Login**: Client → API Gateway → Auth Service → JWT issued
2. **Authenticated Requests**: Client → API Gateway (verifies JWT) → Target Service
3. **User Info**: Gateway extracts user data from JWT and forwards to services via headers

## Quick Start

### 1. Environment Setup

The environment configuration is located in `server/.env`. Update the JWT secrets:

```bash
# Navigate to server directory
cd server

# Update these values in .env:
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
```

### 2. Install Dependencies

```bash
# Install all service dependencies
npm run install:all
```

### 3. Start Services

```bash
# Start API Gateway and Auth Service in development mode
npm run dev
```

This will start:

- **API Gateway** on port 3000
- **Auth Service** on port 3001

### 4. Test JWT Authentication

```bash
# Run the authentication test suite from root directory
npm run test:auth

# Or run directly
node scripts/test-auth.js
```

This test will:

- ✅ Check service health
- ✅ Register a new user
- ✅ Test protected route access
- ✅ Verify invalid token rejection

## API Endpoints

### Public Routes (No Authentication)

```bash
# Health checks
GET /health                    # API Gateway health
GET /api/auth/health          # Auth Service health

# Authentication
POST /api/auth/register       # User registration
POST /api/auth/login          # User login
POST /api/auth/refresh        # Refresh access token
POST /api/auth/logout         # User logout
```

### Protected Routes (JWT Required)

```bash
# User management (when user-service is running)
GET /api/users/profile        # Get user profile
PUT /api/users/profile        # Update user profile

# Future services
GET /api/restaurants          # List restaurants
POST /api/orders             # Create order
GET /api/payments            # Payment history
```

## Testing the Authentication

### Manual Testing with curl

1. **Register a user**:

```bash
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "customer"
  }'
```

2. **Login** (if user exists):

```bash
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

3. **Access protected route**:

```bash
curl -X GET http://localhost:3000/api/users/profile \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Sample Response

Registration/Login response:

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "role": "customer"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Database Schema

The auth service uses this User model:

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('customer', 'restaurant', 'delivery', 'admin') DEFAULT 'customer',
  is_active BOOLEAN DEFAULT true,
  refresh_token TEXT,
  last_login_at DATETIME,
  email_verified_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
);
```

## JWT Token Details

- **Access Token**: Short-lived (15 minutes), contains user info
- **Refresh Token**: Long-lived (7 days), used to get new access tokens
- **Token Payload**:
  ```json
  {
    "id": 1,
    "email": "test@example.com",
    "role": "customer",
    "name": "Test User",
    "iat": 1640995200,
    "exp": 1640996100
  }
  ```

## Security Features

- ✅ JWT signature verification
- ✅ Token expiration checking
- ✅ Rate limiting on API Gateway
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation with Joi
- ✅ Password hashing with bcrypt
- ✅ Role-based access control ready

## Development Scripts

```bash
npm run dev              # Start API Gateway + Auth Service
npm run dev:gateway      # Start only API Gateway
npm run dev:auth         # Start only Auth Service
npm run install:all      # Install all service dependencies
node scripts/test-auth.js # Test JWT authentication
```

## Next Steps

1. ✅ **Completed**: JWT authentication with API Gateway
2. 🔄 **Next**: Implement User Service
3. 🔄 **Next**: Implement Restaurant Service
4. 🔄 **Next**: Implement Order Service
5. 🔄 **Next**: Add more comprehensive tests

## Troubleshooting

### Services won't start

- Check if ports 3000 and 3001 are available
- Verify database connection in `.env`
- Run `npm install` in each service directory

### JWT errors

- Verify `JWT_SECRET` in `.env` matches across services
- Check token format: `Authorization: Bearer <token>`
- Ensure token hasn't expired (15 min default)

### Database connection issues

- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database `yumzo` exists

## Architecture Benefits

1. **Centralized Authentication**: JWT verification in one place (API Gateway)
2. **Service Independence**: Other services don't need JWT logic
3. **Performance**: JWT verified once, not per service
4. **Security**: Single point for authentication controls
5. **Scalability**: Easy to add new services behind the gateway
