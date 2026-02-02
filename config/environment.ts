/**
 * Environment configuration for the seeder
 * 
 * You can override these values using environment variables:
 * - API_BASE_URL: The base URL of your backend API
 * - ADMIN_USERNAME: Username for authentication
 * - ADMIN_PASSWORD: Password for authentication
 */

import type { SeederConfig } from '../types/index.js';

const environment: SeederConfig = {
  // Base URL for all API requests
  apiBaseUrl: process.env.API_BASE_URL || 'https://academy.dev.rakoo.com:3000/api',
  
  // Credentials for initial authentication
  credentials: {
    username: process.env.ADMIN_USERNAME || 'superadmin@rakoo.com',
    password: process.env.ADMIN_PASSWORD || 'password',
    context: process.env.AUTH_CONTEXT || 'admin',
    platform: process.env.AUTH_PLATFORM || 'web'
  },
  
  // Optional: Add any other configuration here
  timeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10), // 30 seconds
  verbose: process.env.VERBOSE === 'true' || false,
  
  // SSL certificate validation (set to false for local development with self-signed certs)
  rejectUnauthorized: process.env.REJECT_UNAUTHORIZED !== 'false'
};

export default environment;
