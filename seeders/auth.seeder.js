/**
 * Auth Seeder - Handles authentication and stores bearer token
 * 
 * This seeder runs first to authenticate with the backend API.
 * The bearer token is stored in the context for use by subsequent seeders.
 */

module.exports = async function authSeeder(httpClient, context) {
  console.log('\n[Auth Seeder] Starting authentication...');
  
  const config = require('../config/environment');
  
  try {
    // Call login endpoint
    // Adjust the endpoint path and request/response structure to match your API
    await httpClient.post(
      '/auth/login',
      {
        username: config.credentials.username,
        password: config.credentials.password
      },
      (response, context) => {
        // Callback to store the bearer token
        // Adjust this based on where your API returns the token
        
        // Option 1: Token in response body
        if (response.data.token) {
          context.set('bearerToken', response.data.token);
        }
        
        // Option 2: Token in response body with different key
        if (response.data.access_token) {
          context.set('bearerToken', response.data.access_token);
        }
        
        // Option 3: Token in Authorization header
        if (response.headers.authorization) {
          const token = response.headers.authorization.replace('Bearer ', '');
          context.set('bearerToken', token);
        }
        
        // Store any other useful data from the response
        if (response.data.user) {
          context.set('currentUser', response.data.user);
        }
        
        if (response.data.userId) {
          context.set('userId', response.data.userId);
        }
      }
    );
    
    // Verify token was stored
    if (!context.has('bearerToken')) {
      throw new Error('Failed to extract bearer token from login response. Please check the callback logic.');
    }
    
    console.log('[Auth Seeder] ✓ Authentication successful');
    
  } catch (error) {
    console.error('[Auth Seeder] ✗ Authentication failed:', error.message);
    throw error; // Re-throw to stop the seeding process
  }
};
