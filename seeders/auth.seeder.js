/**
 * Auth Seeder - Handles authentication and stores bearer token
 * 
 * This seeder runs first to authenticate with the backend API.
 * The bearer token is stored in the context for use by subsequent seeders.
 */

import config from '../config/environment.js';

export default async function authSeeder(httpClient, context) {
  console.log('\n[Auth Seeder] Starting authentication...');
  
  try {
    // Get the client ID from context (set by domain seeder)
    const clientId = context.get('clientId');
    
    if (!clientId) {
      throw new Error('Client ID not found in context. Domain seeder must run first.');
    }
    
    console.log(`[Auth Seeder] Using client ID: ${clientId}`);
    
    // Call authenticate endpoint with required body structure
    await httpClient.post(
      '/authenticate',
      {
        clientId: clientId,
        context: config.credentials.context,
        password: config.credentials.password,
        platform: config.credentials.platform,
        username: config.credentials.username
      },
      (response, context) => {
        // Extract bearer token from Authorization header
        if (response.headers.authorization) {
          const token = response.headers.authorization.replace('Bearer ', '');
          context.set('bearerToken', token);
        } else {
          throw new Error('Authorization header not found in response');
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
      throw new Error('Failed to extract bearer token from authentication response.');
    }
    
    console.log('[Auth Seeder] ✓ Authentication successful');
    
  } catch (error) {
    console.error('[Auth Seeder] ✗ Authentication failed:', error.message);
    throw error; // Re-throw to stop the seeding process
  }
}
