/**
 * Environment configuration for the seeder
 * 
 * You can override these values using environment variables:
 * - API_BASE_URL: The base URL of your backend API
 * - ADMIN_USERNAME: Username for authentication
 * - ADMIN_PASSWORD: Password for authentication
 */

module.exports = {
  // Base URL for all API requests
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
  
  // Credentials for initial authentication
  credentials: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123'
  },
  
  // Optional: Add any other configuration here
  timeout: process.env.REQUEST_TIMEOUT || 30000, // 30 seconds
  verbose: process.env.VERBOSE === 'true' || false
};
