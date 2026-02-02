/**
 * Environment configuration for the seeder
 * 
 * Required environment variables (MUST be set in .env):
 * - ADMIN_USERNAME: Username for authentication
 * - ADMIN_PASSWORD: Password for authentication
 * 
 * Optional environment variables (have defaults):
 * - API_BASE_URL: The base URL of your backend API
 * - AUTH_CONTEXT: Authentication context
 * - AUTH_PLATFORM: Platform identifier
 * - REQUEST_TIMEOUT: Request timeout in milliseconds
 * - VERBOSE: Enable verbose logging
 * - REJECT_UNAUTHORIZED: SSL certificate validation
 */

import type { SeederConfig } from '../types/index.js';

// Validate required credentials are present
const requiredCredentials = ['ADMIN_USERNAME', 'ADMIN_PASSWORD'];
const missingCredentials = requiredCredentials.filter(envVar => !process.env[envVar]);

if (missingCredentials.length > 0) {
  throw new Error(
    `Missing required credentials: ${missingCredentials.join(', ')}\n` +
    'Please set username and password in your .env file.'
  );
}

const environment: SeederConfig = {
  // Base URL for all API requests
  apiBaseUrl: process.env.API_BASE_URL || 'https://academy.dev.rakoo.com:3000/api',
  
  // Credentials for initial authentication (required from .env)
  credentials: {
    username: process.env.ADMIN_USERNAME!,
    password: process.env.ADMIN_PASSWORD!,
    context: process.env.AUTH_CONTEXT || 'admin',
    platform: process.env.AUTH_PLATFORM || 'web'
  },
  
  // Optional configuration with sensible defaults
  timeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10), // 30 seconds
  verbose: process.env.VERBOSE === 'true' || false,
  
  // SSL certificate validation (set to false for local development with self-signed certs)
  rejectUnauthorized: process.env.REJECT_UNAUTHORIZED !== 'false'
};

export default environment;
