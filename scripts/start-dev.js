#!/usr/bin/env node

/**
 * Development startup script
 * Starts API Gateway and Auth Service concurrently
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });
const { spawn } = require('child_process');

const services = [
  {
    name: 'API Gateway',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(__dirname, '../server/services/api-gateway'),
    color: '\x1b[36m', // Cyan
    port: process.env.GATEWAY_PORT || 3000
  },
  {
    name: 'Auth Service',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(__dirname, '../server/services/auth-service'),
    color: '\x1b[33m', // Yellow
    port: process.env.AUTH_SERVICE_PORT || 3001
  },
  ,
  {
    name: 'order Service',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(__dirname, '../server/services/order-service'),
    color: '\x1b[32m', 
    port: process.env.ORDER_SERVICE_PORT || 3003
  },
  {
    name: 'Restaurant Service',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(__dirname, '../server/services/restaurant-service'),
    color: '\x1b[31m', 
    port: process.env.RESTAURANT_SERVICE_PORT || 3005
  },
  {
    name: 'Frontend',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(__dirname, '../client'), // Adjust path as needed
    color: '\x1b[35m', // Magenta
    port: process.env.FRONTEND_PORT || 3002
  },
  {
    name: 'Delivery Service',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(__dirname, '../server/services/delivery-service'), // Adjust path as needed
    color: '\x1b[34m', 
    port: process.env.DELIVERY_SERVICE_PORT || 3006
  },
  {
    name: 'Notifications Service',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(__dirname, '../server/services/notification-service'), 
    color: '\x1b[30m', 
    port: process.env.NOTIFICATION_SERVICE_PORT || 3008
  }
];

const reset = '\x1b[0m';

console.log('🚀 Starting Yumzo Microservices Development Environment\n');

// Check if environment file exists
const fs = require('fs');
const envPath = path.join(__dirname, '../server/.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found. Please create one based on .env.example');
  process.exit(1);
}

// Start each service
services.forEach((service, index) => {
  console.log(`${service.color}[${service.name}]${reset} Starting on port ${service.port}...`);
  
  const proc = spawn(service.command, service.args, {
    cwd: service.cwd,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true
  });

  // Handle stdout
  proc.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      console.log(`${service.color}[${service.name}]${reset} ${output}`);
    }
  });

  // Handle stderr
  proc.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      console.log(`${service.color}[${service.name}]${reset} ❌ ${output}`);
    }
  });

  // Handle process exit
  proc.on('close', (code) => {
    console.log(`${service.color}[${service.name}]${reset} Process exited with code ${code}`);
  });

  proc.on('error', (error) => {
    console.log(`${service.color}[${service.name}]${reset} ❌ Error: ${error.message}`);
  });
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down all services...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down all services...');
  process.exit(0);
});

// Keep the process alive
process.stdin.resume();
