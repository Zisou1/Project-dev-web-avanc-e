# Yumzo Food Delivery Platform

A full-stack food delivery platform built with React frontend and Node.js microservices backend.

## 🏗️ Project Structure

```
yumzo-food-delivery-platform/
├── 📁 client/                          # React Frontend
│   ├── package.json
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── layout/
│   └── public/
│
├── 📁 server/                          # Backend Microservices
│   ├── .env                           # Backend environment variables
│   ├── package.json                   # Backend orchestration scripts
│   │
│   ├── 📁 services/                   # Individual Microservices
│   │   ├── api-gateway/               # Port 3000 - Main entry point
│   │   ├── auth-service/              # Port 3001 - Authentication
│   │   ├── user-service/              # Port 3004 - User management
│   │   ├── restaurant-service/        # Port 3005 - Restaurant data
│   │   ├── order-service/             # Port 3003 - Order processing
│   │   ├── payment-service/           # Port 3002 - Payment handling
│   │   ├── delivery-service/          # Port 3006 - Delivery tracking
│   │   ├── location-service/          # Port 3007 - Location services
│   │   ├── notification-service/      # Port 3008 - Notifications
│   │   └── analytics-service/         # Port 3009 - Analytics
│   │
│   └── 📁 shared/                     # Shared Backend Code
│       ├── database/                  # Database configuration
│       ├── middleware/                # Common middleware
│       └── utils/                     # Utility functions
│
├── 📁 scripts/                        # Development Scripts
│   ├── start-dev.js                  # Start development environment
│   └── test-auth.js                  # Test authentication system
│
├── package.json                      # Root project management
├── docker-compose.yml                # Container orchestration
└── README.md                         # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

### 1. Clone and Setup

```bash
git clone <repository-url>
cd yumzo-food-delivery-platform

# Install all dependencies (client + server)
npm run install:all
```

### 2. Environment Configuration

Update the backend environment variables:

```bash
cd server
cp .env.example .env  # Edit with your database credentials
```

### 3. Database Setup

Make sure MySQL is running and create the database:

```sql
CREATE DATABASE yumzo;
```

### 4. Start Development

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:client    # React app on port 5173
npm run dev:server    # Backend services on ports 3000-3009
```

## 🔐 Authentication System

The platform uses JWT authentication with the API Gateway handling verification:

### Flow:

1. **Registration/Login**: Client → API Gateway → Auth Service → JWT issued
2. **Protected Requests**: Client → API Gateway (verifies JWT) → Target Service
3. **User Info**: Gateway extracts user data from JWT and forwards to services

### Test Authentication:

```bash
npm run test:server
```

## 📦 Package Management

### Root Level (`/`)

- **Purpose**: Orchestrates the entire project (client + server)
- **Scripts**: Development workflow, testing, building
- **Dependencies**: Development tools (concurrently, testing utilities)

### Client Level (`/client/`)

- **Purpose**: React frontend application
- **Scripts**: Frontend development, building, testing
- **Dependencies**: React, Vite, UI libraries

### Server Level (`/server/`)

- **Purpose**: Backend microservices orchestration
- **Scripts**: Start/stop all services, run backend tests
- **Dependencies**: Service coordination tools

### Service Level (`/server/services/*/`)

- **Purpose**: Individual microservice functionality
- **Scripts**: Service-specific start/test/build
- **Dependencies**: Service-specific packages (Express, JWT, etc.)

## 🛠️ Available Scripts

### Root Level Commands:

```bash
npm run dev              # Start full development environment
npm run dev:client       # Start only React frontend
npm run dev:server       # Start only backend services
npm run install:all      # Install all dependencies
npm run test             # Run all tests
npm run build            # Build for production
```

### Backend Commands:

```bash
cd server
npm run dev              # Start all backend services
npm run dev:gateway      # Start only API Gateway
npm run dev:auth         # Start only Auth Service
npm run install:all      # Install all service dependencies
npm run test             # Test backend services
```

### Individual Service Commands:

```bash
cd server/services/api-gateway
npm run dev              # Start this service in development
npm start                # Start this service in production
```

## 🏛️ Architecture

### Frontend (Client)

- **React 18** with Vite
- **Component-based** architecture
- **Role-based** routing (Customer, Restaurant, Delivery, Admin)

### Backend (Server)

- **Microservices** architecture
- **API Gateway** with JWT authentication
- **Shared database** with service-specific tables
- **Service-to-service** communication via HTTP

### Key Benefits:

- ✅ **Separation of Concerns**: Each service has a single responsibility
- ✅ **Scalability**: Services can be scaled independently
- ✅ **Security**: Centralized authentication at API Gateway
- ✅ **Maintainability**: Clear service boundaries and shared utilities

## 🔧 Development Workflow

1. **Start Development**: `npm run dev`
2. **Make Changes**: Edit files in respective directories
3. **Test**: `npm run test:server` for backend, visit frontend URL for frontend
4. **Commit**: Git workflow as usual
5. **Deploy**: Use production scripts

## 📝 Environment Variables

Located in `server/.env`:

```env
# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=yumzo
DB_USERNAME=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m

# Service Ports
GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
# ... other service ports
```

## 🧪 Testing

```bash
# Test authentication system
npm run test:server

# Test individual services
cd server/services/auth-service && npm test

# Test frontend
npm run test:client
```

## 🚀 Production Deployment

```bash
# Build frontend
npm run build

# Start production servers
npm run start:prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes in appropriate directories
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions about:

- **Frontend**: Check `client/README.md`
- **Backend**: Check `server/README.md`
- **Authentication**: Check `JWT_AUTH_README.md`
- **Overall Architecture**: This README
