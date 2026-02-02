/**
 * Users List Seeder - Fetch all users from the system
 * 
 * Uses the /v2/users/search endpoint to retrieve a list of all users.
 * Stores the users in context for selection in the interactive menu.
 */

import type { SeederFunction, User } from '../types/index.js';

const usersListSeeder: SeederFunction = async (httpClient, context) => {
  console.log('\n[Users List] Fetching users...');
  
  try {
    // Use the search endpoint with empty criteria to get all users
    const searchRequest = {
      criteria: []
    };
    
    // Make authenticated POST request to search for users
    await httpClient.post(
      '/v2/users/search?page=0&size=100',
      searchRequest,
      (response, context) => {
        const usersPage = response.data;
        const users: User[] = usersPage.content || [];
        
        console.log(`\n[Users List] Found ${users.length} user(s)`);
        
        // Store users in context
        context.set('usersList', users);
        context.set('usersCount', users.length);
      }
    );
    
    if (!context.has('usersList')) {
      throw new Error('Failed to extract users from response');
    }
    
    console.log('[Users List] ✓ Successfully retrieved users');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Users List] ✗ Error fetching users:', errorMessage);
    throw error;
  }
};

export default usersListSeeder;
