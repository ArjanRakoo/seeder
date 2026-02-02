/**
 * Domain Seeder - Fetches client ID from the API
 * 
 * This seeder runs first (before authentication) to retrieve the client ID
 * from the /domain/client endpoint. The client ID is stored in the context
 * for use by subsequent seeders.
 */

import type { SeederFunction } from '../types/index.js';

const domainSeeder: SeederFunction = async (httpClient, context) => {
  console.log('\n[Domain Seeder] Fetching client ID...');
  
  try {
    // Call the domain/client endpoint to get the client ID
    await httpClient.get(
      '/domain/client',
      {},
      (response, context) => {
        // Extract client ID from response
        if (response.data && response.data.id) {
          context.set('clientId', response.data.id);
        } else {
          throw new Error('Client ID not found in response');
        }
      }
    );
    
    // Verify client ID was stored
    if (!context.has('clientId')) {
      throw new Error('Failed to extract client ID from response');
    }
    
    console.log('[Domain Seeder] ✓ Client ID retrieved successfully');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Domain Seeder] ✗ Failed to fetch client ID:', errorMessage);
    throw error; // Re-throw to stop the seeding process
  }
};

export default domainSeeder;
