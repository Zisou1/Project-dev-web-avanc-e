# Yumzo Food Delivery Platform

A full-stack food delivery platform built with microservices architecture, featuring React frontend and Node.js backend with JWT authentication.

## 🚀 Quick Start Guide

Follow these steps to get the project running on your local machine:

### Prerequisites

Make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MySQL** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Project-dev-web-avanc-e
```

### 2. Install Dependencies

Install all dependencies for both client and server:

```bash
# Install root dependencies
npm install

# Install all project dependencies (client + server)
npm run install:all
```

This will install dependencies for:

- Root project
- Client (React frontend)
- API Gateway service
- Auth service
- Shared utilities

### 3. Environment Configuration

#### Create Server Environment File

1. Copy the environment template:

   ```bash
   cp server/.env.example server/.env
   ```

2. Update the `server/.env` file with your configuration:

   ```bash
   # Database Configuration
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=yumzo
   DB_USERNAME=root
   DB_PASSWORD=your_mysql_password

   # JWT Configuration (CRITICAL - Change these!)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d

   # Service Ports
   GATEWAY_PORT=3000
   AUTH_SERVICE_PORT=3001

   # Client Configuration
   CLIENT_URL=http://localhost:5173

   # Environment
   NODE_ENV=development
   LOG_LEVEL=INFO
   ```

#### Client Environment

The client already has a `.env` file with:

```bash
VITE_API_URL=http://localhost:3001
```

### 4. Database Setup

1. **Install and start MySQL** (if not already running)

2. **Create the database and user:**

   ```sql
   CREATE DATABASE yumzo;
   CREATE USER 'yumzo_user'@'localhost' IDENTIFIED BY 'yumzo_password';
   GRANT ALL PRIVILEGES ON yumzo.* TO 'yumzo_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

   Or use the root user by updating your `server/.env` file with your MySQL root password.

### 5. Start the Development Environment

#### Option A: Start everything at once (recommended)

```bash
npm run dev
```

This starts both the API Gateway and Auth Service concurrently.

#### Option B: Start services individually

Start the backend services:

```bash
# Start API Gateway (port 3000)
npm run dev:gateway

# In another terminal, start Auth Service (port 3001)
npm run dev:auth
```

Start the frontend:

```bash
# In another terminal, start React client (port 5173)
npm run dev:client
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **Auth Service**: http://localhost:3001

### 7. Test the Setup

Test the authentication system:

```bash
npm run test:server
```

## 📁 Project Structure

```
Project-dev-web-avanc-e/
├── client/                  # React frontend (Vite + TailwindCSS)
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components (Auth, Client, Restaurant, etc.)
│   │   ├── context/        # React Context (Auth)
│   │   ├── services/       # API service functions
│   │   └── layout/         # Layout components
├── server/
│   ├── services/
│   │   ├── api-gateway/    # Main API Gateway (port 3000)
│   │   └── auth-service/   # Authentication service (port 3001)
│   └── shared/             # Shared utilities and database config
├── scripts/                # Development scripts
└── .env.example           # Environment template
```

## 🔧 Available Scripts

- `npm run dev` - Start API Gateway and Auth Service
- `npm run dev:client` - Start React frontend only
- `npm run dev:server` - Start backend services only
- `npm run dev:gateway` - Start API Gateway only
- `npm run dev:auth` - Start Auth Service only
- `npm run install:all` - Install all dependencies
- `npm run test` - Run all tests
- `npm run test:server` - Test backend authentication
- `npm run build` - Build for production

## 🔐 Authentication

The platform uses JWT authentication with the following user roles:

- **Client** - Regular users who order food
- **Restaurant** - Restaurant owners/managers
- **Livreur** - Delivery drivers
- **Admin** - Platform administrators

### Authentication Flow:

1. **Registration/Login**: Client → API Gateway → Auth Service → JWT issued
2. **Protected Requests**: Client → API Gateway (verifies JWT) → Target Service
3. **User Info**: Gateway extracts user data from JWT and forwards to services

## 🛠️ Development

- **Frontend**: React 19 with Vite, TailwindCSS, React Router
- **Backend**: Node.js microservices with Express
- **Database**: MySQL 8.0
- **Authentication**: JWT tokens
- **Architecture**: Microservices with API Gateway pattern

## 📝 Setup Checklist

### Before Starting:

- [ ] Install Node.js (v16+)
- [ ] Install MySQL (v8.0+)
- [ ] Clone the repository

### Environment Setup:

- [ ] Copy `server/.env.example` to `server/.env`
- [ ] Update database credentials in `server/.env`
- [ ] Change JWT secrets to secure values
- [ ] Verify client `.env` file exists

### Database Setup:

- [ ] Start MySQL service
- [ ] Create `yumzo` database
- [ ] Set up database user/permissions (optional)

### Dependencies:

- [ ] Run `npm install` in root
- [ ] Run `npm run install:all` for all services

### Testing Setup:

- [ ] Run `npm run dev` to start backend services
- [ ] Run `npm run dev:client` in another terminal for frontend
- [ ] Run `npm run test:server` to verify authentication works

## 🆘 Troubleshooting

### Common Issues:

1. **Port already in use**: Make sure ports 3000, 3001, and 5173 are available
2. **Database connection error**:
   - Ensure MySQL is running
   - Check credentials in `server/.env`
   - Verify database `yumzo` exists
3. **Dependencies issues**:
   - Try deleting `node_modules` and running `npm run install:all` again
   - Ensure Node.js version is v16+
4. **Environment variables**:
   - Check that `server/.env` file exists and has all required variables
   - Ensure JWT secrets are set and match across services
5. **Authentication errors**:
   - Verify `JWT_SECRET` in `.env` is set
   - Check token format: `Authorization: Bearer <token>`
   - Ensure token hasn't expired (15 min default)

### Getting Help:

If you encounter any issues:

1. Check the console output for error messages
2. Ensure all prerequisites are installed correctly
3. Verify all environment variables are properly configured
4. Make sure MySQL is running and accessible

## 📚 Additional Documentation

- **JWT Authentication Details**: See `JWT_AUTH_README.md`
- **Project Architecture**: See `PROJECT_STRUCTURE.md`
- **API Endpoints**: Available at http://localhost:3000/api when running

## 🔧 What `npm run install:all` Does

This convenience script automatically installs dependencies for all parts of the project:

1. **Client** (`/client/`) - React frontend with Vite, TailwindCSS, React Router, etc.
2. **API Gateway** (`/server/services/api-gateway/`) - Express server, middleware, etc.
3. **Auth Service** (`/server/services/auth-service/`) - Authentication service with JWT, Sequelize, etc.
4. **Shared utilities** (`/server/shared/`) - Database config, shared utilities across services

This saves you from having to manually `cd` into each directory and run `npm install` separately.
