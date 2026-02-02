/**
 * Environment configuration for the seeder
 * 
 * You can override these values using environment variables:
 * - API_BASE_URL: The base URL of your backend API
 * - ADMIN_USERNAME: Username for authentication
 * - ADMIN_PASSWORD: Password for authentication
 */

const environment =  {
  // Base URL for all API requests
  apiBaseUrl: process.env.API_BASE_URL || 'https://ictivity.test.rakoo.com/api',
  
  // Credentials for initial authentication
  credentials: {
    username: process.env.ADMIN_USERNAME || 'arjan+3@rakoo.com',
    password: process.env.ADMIN_PASSWORD || 'AZB_nej!dze1xdb2evg',
    context: process.env.AUTH_CONTEXT || 'admin',
    platform: process.env.AUTH_PLATFORM || 'web'
  },
  
  // Optional: Add any other configuration here
  timeout: process.env.REQUEST_TIMEOUT || 30000, // 30 seconds
  verbose: process.env.VERBOSE === 'true' || false
};

export default environment;